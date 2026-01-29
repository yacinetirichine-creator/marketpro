// ============================================
// MARKET PRO API - Modèle Audit Log
// ============================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Event type
  eventType: {
    type: String,
    required: true,
    enum: [
      // Auth
      'AUTH_LOGIN',
      'AUTH_LOGOUT',
      'AUTH_LOGIN_FAILED',
      'AUTH_PASSWORD_CHANGE',
      'AUTH_PASSWORD_RESET',
      'AUTH_2FA_ENABLED',
      'AUTH_2FA_DISABLED',
      
      // Data
      'DATA_CREATE',
      'DATA_UPDATE',
      'DATA_DELETE',
      'DATA_EXPORT',
      'DATA_IMPORT',
      
      // Security
      'SECURITY_PERMISSION_DENIED',
      'SECURITY_RATE_LIMIT',
      'SECURITY_SUSPICIOUS',
      'SECURITY_TOKEN_REFRESH',
      
      // System
      'SYSTEM_ERROR',
      'SYSTEM_CONFIG_CHANGE',
      'SYSTEM_BACKUP',
      'SYSTEM_RESTORE'
    ]
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    default: 'INFO'
  },
  
  // User
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: String,
  userEmail: String,
  userRole: String,
  
  // Resource
  resource: String, // ex: 'orders', 'invoices'
  resourceId: String,
  
  // Action details
  action: String,
  details: mongoose.Schema.Types.Mixed,
  previousData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,
  
  // Request info
  request: {
    ip: String,
    userAgent: String,
    method: String,
    path: String,
    query: mongoose.Schema.Types.Mixed
  },
  
  // Success/Error
  success: { type: Boolean, default: true },
  errorMessage: String,
  errorStack: String
  
}, {
  timestamps: true
});

// Index
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1 });

// TTL - Supprimer après 90 jours
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Statiques
auditLogSchema.statics.logEvent = function(data) {
  return this.create(data);
};

auditLogSchema.statics.getByUser = function(userId, limit = 100) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

auditLogSchema.statics.getByResource = function(resource, resourceId) {
  return this.find({ resource, resourceId })
    .sort({ createdAt: -1 });
};

auditLogSchema.statics.getSecurityEvents = function(startDate, endDate) {
  return this.find({
    eventType: { $regex: /^SECURITY_/ },
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
