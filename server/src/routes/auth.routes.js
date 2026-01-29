// ============================================
// MARKET PRO API - Routes d'authentification
// ============================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// Permissions par rôle
const ROLE_PERMISSIONS = {
  ADMIN: ['*'],
  MANAGER: [
    'VIEW_DASHBOARD', 'VIEW_STOCKS', 'MANAGE_STOCKS',
    'VIEW_ORDERS', 'CREATE_ORDERS', 'VALIDATE_ORDERS',
    'VIEW_INVOICES', 'CREATE_INVOICES',
    'VIEW_PAYMENTS', 'PROCESS_PAYMENTS',
    'VIEW_CLIENTS', 'MANAGE_CLIENTS',
    'VIEW_SUPPLIERS', 'MANAGE_SUPPLIERS',
    'VIEW_WMS', 'MANAGE_WMS',
    'VIEW_PURCHASES', 'CREATE_PURCHASES',
    'VIEW_REPORTS', 'EXPORT_REPORTS',
    'VIEW_ANALYTICS', 'VIEW_SETTINGS'
  ],
  COMMERCIAL: [
    'VIEW_DASHBOARD', 'VIEW_STOCKS',
    'VIEW_ORDERS', 'CREATE_ORDERS',
    'VIEW_INVOICES', 'CREATE_INVOICES',
    'VIEW_CLIENTS', 'MANAGE_CLIENTS',
    'VIEW_REPORTS'
  ],
  CAISSIER: [
    'VIEW_DASHBOARD',
    'VIEW_ORDERS', 'CREATE_ORDERS',
    'VIEW_INVOICES',
    'VIEW_PAYMENTS', 'PROCESS_PAYMENTS',
    'VIEW_CLIENTS'
  ],
  MAGASINIER: [
    'VIEW_DASHBOARD', 'VIEW_STOCKS', 'MANAGE_STOCKS',
    'VIEW_ORDERS',
    'VIEW_WMS', 'MANAGE_WMS',
    'VIEW_SUPPLIERS'
  ],
  COMPTABLE: [
    'VIEW_DASHBOARD',
    'VIEW_INVOICES',
    'VIEW_PAYMENTS', 'PROCESS_PAYMENTS',
    'VIEW_PURCHASES',
    'VIEW_REPORTS', 'EXPORT_REPORTS',
    'VIEW_ANALYTICS'
  ],
  CLIENT: ['VIEW_PORTAL', 'VIEW_MY_ORDERS', 'VIEW_MY_INVOICES']
};

// Générer les tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate
], async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findByCredentials(email);
    
    if (!user) {
      // Logger tentative échouée
      await AuditLog.logEvent({
        eventType: 'AUTH_LOGIN_FAILED',
        severity: 'WARNING',
        userEmail: email,
        action: 'Login attempt - user not found',
        request: {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          method: req.method,
          path: req.originalUrl
        },
        success: false
      });
      
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
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
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      await AuditLog.logEvent({
        eventType: 'AUTH_LOGIN_FAILED',
        severity: 'WARNING',
        user: user._id,
        userEmail: email,
        action: `Login attempt - wrong password (attempt ${user.loginAttempts + 1})`,
        request: {
          ip: req.ip,
          userAgent: req.get('user-agent')
        },
        success: false
      });
      
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
        attemptsRemaining: Math.max(0, 5 - user.loginAttempts - 1)
      });
    }
    
    // Vérifier si compte actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez l\'administrateur.'
      });
    }
    
    // Reset tentatives de connexion
    await user.resetLoginAttempts();
    
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Sauvegarder le refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Logger la connexion réussie
    await AuditLog.logEvent({
      eventType: 'AUTH_LOGIN',
      severity: 'INFO',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'User logged in',
      request: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      },
      success: true
    });
    
    // Réponse
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: ROLE_PERMISSIONS[user.role] || [],
          avatar: user.avatar,
          preferences: user.preferences
        },
        accessToken,
        refreshToken: rememberMe ? refreshToken : undefined,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.'
    });
  }
});

// ============================================
// POST /api/auth/logout
// ============================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Supprimer le refresh token
    req.user.refreshToken = undefined;
    await req.user.save();
    
    // Logger la déconnexion
    await AuditLog.logEvent({
      eventType: 'AUTH_LOGOUT',
      severity: 'INFO',
      user: req.user._id,
      userEmail: req.user.email,
      action: 'User logged out',
      request: {
        ip: req.ip
      },
      success: true
    });
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion.'
    });
  }
});

// ============================================
// POST /api/auth/refresh
// ============================================
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis.'
      });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré.'
      });
    }
    
    // Générer de nouveaux tokens
    const tokens = generateTokens(user);
    
    // Mettre à jour le refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.'
    });
  }
});

// ============================================
// GET /api/auth/me
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: ROLE_PERMISSIONS[user.role] || [],
          avatar: user.avatar,
          phone: user.phone,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

// ============================================
// PUT /api/auth/password
// ============================================
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Minimum 8 caractères')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/[a-z]/).withMessage('Au moins une minuscule')
    .matches(/[0-9]/).withMessage('Au moins un chiffre')
    .matches(/[!@#$%^&*]/).withMessage('Au moins un caractère spécial'),
  validate
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id).select('+password');
    
    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect.'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    // Logger le changement
    await AuditLog.logEvent({
      eventType: 'AUTH_PASSWORD_CHANGE',
      severity: 'INFO',
      user: user._id,
      userEmail: user.email,
      action: 'Password changed',
      request: { ip: req.ip },
      success: true
    });
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe.'
    });
  }
});

module.exports = router;
