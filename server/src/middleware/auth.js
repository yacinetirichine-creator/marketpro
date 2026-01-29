// ============================================
// MARKET PRO API - Middleware d'authentification
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Vérifier le token JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Récupérer le token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé.'
      });
    }
    
    // Vérifier le blocage
    const lockStatus = user.checkLockout();
    if (lockStatus.locked) {
      return res.status(423).json({
        success: false,
        message: `Compte temporairement bloqué. Réessayez dans ${lockStatus.remainingMinutes} minutes.`
      });
    }
    
    // Attacher l'utilisateur à la requête
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification.'
    });
  }
};

// Vérifier le rôle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      // Logger l'accès refusé
      AuditLog.logEvent({
        eventType: 'SECURITY_PERMISSION_DENIED',
        severity: 'WARNING',
        user: req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: `Role ${req.user.role} tried to access ${roles.join(', ')} only resource`,
        request: {
          ip: req.ip,
          method: req.method,
          path: req.originalUrl
        },
        success: false
      });
      
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Permissions insuffisantes.'
      });
    }
    
    next();
  };
};

// Vérifier une permission spécifique
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié.'
      });
    }
    
    // Admin a toutes les permissions
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    if (!req.user.hasPermission(permission)) {
      AuditLog.logEvent({
        eventType: 'SECURITY_PERMISSION_DENIED',
        severity: 'WARNING',
        user: req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: `Missing permission: ${permission}`,
        request: {
          ip: req.ip,
          method: req.method,
          path: req.originalUrl
        },
        success: false
      });
      
      return res.status(403).json({
        success: false,
        message: `Permission requise: ${permission}`
      });
    }
    
    next();
  };
};

// Optionnel: authentifie si token présent, sinon continue
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Token invalide, on continue sans user
    next();
  }
};
