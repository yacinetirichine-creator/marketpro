// ============================================
// MARKET PRO API - Gestionnaire d'erreurs
// ============================================

const AuditLog = require('../models/AuditLog');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log l'erreur
  console.error('❌ Error:', err);
  
  // Logger en base de données pour les erreurs critiques
  if (err.statusCode >= 500 || !err.statusCode) {
    AuditLog.logEvent({
      eventType: 'SYSTEM_ERROR',
      severity: 'ERROR',
      user: req.user?._id,
      userEmail: req.user?.email,
      action: 'Server error',
      details: {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      request: {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        query: req.query
      },
      success: false,
      errorMessage: err.message
    }).catch(console.error);
  }
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: 'Erreur de validation',
      errors: messages
    };
  }
  
  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      statusCode: 400,
      message: `Ce ${field} existe déjà.`
    };
  }
  
  // Erreur CastError Mongoose (ID invalide)
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'Ressource non trouvée. ID invalide.'
    };
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token invalide.'
    };
  }
  
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expiré.'
    };
  }
  
  // Réponse
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
