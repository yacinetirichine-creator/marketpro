// ============================================
// MARKET PRO - SYSTÈME D'AUDIT & LOGS
// Traçabilité complète des actions
// ============================================

import { securityService } from './security';

// Types d'événements d'audit
export const AUDIT_EVENTS = {
  // Authentification
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  
  // Navigation
  PAGE_ACCESS: 'PAGE_ACCESS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Données - Création
  CLIENT_CREATED: 'CLIENT_CREATED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  ORDER_CREATED: 'ORDER_CREATED',
  INVOICE_CREATED: 'INVOICE_CREATED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  USER_CREATED: 'USER_CREATED',
  
  // Données - Modification
  CLIENT_UPDATED: 'CLIENT_UPDATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  INVOICE_UPDATED: 'INVOICE_UPDATED',
  STOCK_UPDATED: 'STOCK_UPDATED',
  USER_UPDATED: 'USER_UPDATED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  
  // Données - Suppression
  CLIENT_DELETED: 'CLIENT_DELETED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  ORDER_DELETED: 'ORDER_DELETED',
  USER_DELETED: 'USER_DELETED',
  
  // Actions métier
  ORDER_VALIDATED: 'ORDER_VALIDATED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PAYMENT_VALIDATED: 'PAYMENT_VALIDATED',
  STOCK_MOVEMENT: 'STOCK_MOVEMENT',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  
  // Sécurité
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_ACCESS_ATTEMPT: 'INVALID_ACCESS_ATTEMPT',
};

// Niveaux de sévérité
export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Configuration
const AUDIT_CONFIG = {
  STORAGE_KEY: 'market_pro_audit_logs',
  MAX_LOGS: 1000,
  RETENTION_DAYS: 90,
  SYNC_INTERVAL: 60000, // 1 minute
};

// ============================================
// SERVICE D'AUDIT
// ============================================
class AuditService {
  constructor() {
    this.logs = [];
    this.pendingSync = [];
    this.initialized = false;
  }

  // Initialiser le service
  init() {
    if (this.initialized) return;
    
    this.loadLogs();
    this.cleanOldLogs();
    this.startSyncInterval();
    this.initialized = true;
  }

  // Charger les logs depuis le stockage
  loadLogs() {
    try {
      const stored = localStorage.getItem(AUDIT_CONFIG.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      this.logs = [];
    }
  }

  // Sauvegarder les logs
  saveLogs() {
    try {
      // Limiter le nombre de logs
      if (this.logs.length > AUDIT_CONFIG.MAX_LOGS) {
        this.logs = this.logs.slice(-AUDIT_CONFIG.MAX_LOGS);
      }
      localStorage.setItem(AUDIT_CONFIG.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving audit logs:', error);
    }
  }

  // Nettoyer les anciens logs
  cleanOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUDIT_CONFIG.RETENTION_DAYS);
    
    this.logs = this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate > cutoffDate;
    });
    
    this.saveLogs();
  }

  // Démarrer la synchronisation périodique
  startSyncInterval() {
    setInterval(() => {
      this.syncToServer();
    }, AUDIT_CONFIG.SYNC_INTERVAL);
  }

  // Synchroniser avec le serveur (à implémenter avec un vrai backend)
  async syncToServer() {
    if (this.pendingSync.length === 0) return;
    
    try {
      // En production, envoyer au serveur
      // await api.post('/audit/sync', this.pendingSync);
      
      // Pour l'instant, on simule
      console.log('[Audit] Syncing', this.pendingSync.length, 'logs to server');
      this.pendingSync = [];
    } catch (error) {
      console.error('Error syncing audit logs:', error);
    }
  }

  // ============================================
  // MÉTHODES PUBLIQUES
  // ============================================

  /**
   * Enregistrer un événement d'audit
   */
  log(event, data = {}, severity = SEVERITY.INFO) {
    const logEntry = {
      id: securityService.generateUUID(),
      timestamp: new Date().toISOString(),
      event,
      severity,
      data: this.sanitizeData(data),
      metadata: this.collectMetadata(),
    };

    // Ajouter aux logs locaux
    this.logs.push(logEntry);
    this.pendingSync.push(logEntry);
    
    // Sauvegarder
    this.saveLogs();

    // Log console en développement
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }

    // Alertes pour événements critiques
    if (severity === SEVERITY.CRITICAL) {
      this.handleCriticalEvent(logEntry);
    }

    return logEntry;
  }

  /**
   * Raccourcis pour les différents niveaux de sévérité
   */
  info(event, data = {}) {
    return this.log(event, data, SEVERITY.INFO);
  }

  warning(event, data = {}) {
    return this.log(event, data, SEVERITY.WARNING);
  }

  error(event, data = {}) {
    return this.log(event, data, SEVERITY.ERROR);
  }

  critical(event, data = {}) {
    return this.log(event, data, SEVERITY.CRITICAL);
  }

  /**
   * Enregistrer une action utilisateur
   */
  logUserAction(userId, action, details = {}) {
    return this.log(action, {
      userId,
      ...details,
    });
  }

  /**
   * Enregistrer une modification de données
   */
  logDataChange(entityType, entityId, changes, userId) {
    return this.log(`${entityType.toUpperCase()}_UPDATED`, {
      entityType,
      entityId,
      changes: this.diffChanges(changes),
      userId,
    });
  }

  /**
   * Enregistrer un accès à des données sensibles
   */
  logSensitiveAccess(resource, userId, reason) {
    return this.warning('SENSITIVE_DATA_ACCESS', {
      resource,
      userId,
      reason,
    });
  }

  /**
   * Récupérer les logs avec filtres
   */
  getLogs(filters = {}) {
    let result = [...this.logs];

    // Filtrer par événement
    if (filters.event) {
      result = result.filter(log => log.event === filters.event);
    }

    // Filtrer par sévérité
    if (filters.severity) {
      result = result.filter(log => log.severity === filters.severity);
    }

    // Filtrer par utilisateur
    if (filters.userId) {
      result = result.filter(log => log.data?.userId === filters.userId);
    }

    // Filtrer par date
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      result = result.filter(log => new Date(log.timestamp) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      result = result.filter(log => new Date(log.timestamp) <= end);
    }

    // Filtrer par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log => 
        log.event.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.data).toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0;
      result = result.slice(offset, offset + filters.limit);
    }

    // Tri
    if (filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return result;
  }

  /**
   * Statistiques des logs
   */
  getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: this.logs.length,
      today: this.logs.filter(l => new Date(l.timestamp) >= today).length,
      thisWeek: this.logs.filter(l => new Date(l.timestamp) >= weekAgo).length,
      bySeverity: {
        info: this.logs.filter(l => l.severity === SEVERITY.INFO).length,
        warning: this.logs.filter(l => l.severity === SEVERITY.WARNING).length,
        error: this.logs.filter(l => l.severity === SEVERITY.ERROR).length,
        critical: this.logs.filter(l => l.severity === SEVERITY.CRITICAL).length,
      },
      topEvents: this.getTopEvents(),
    };
  }

  /**
   * Exporter les logs
   */
  exportLogs(format = 'json', filters = {}) {
    const logs = this.getLogs(filters);

    if (format === 'csv') {
      return this.exportToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Effacer les logs (admin seulement)
   */
  clearLogs() {
    this.logs = [];
    this.pendingSync = [];
    this.saveLogs();
    this.log('AUDIT_LOGS_CLEARED', {}, SEVERITY.WARNING);
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  sanitizeData(data) {
    // Supprimer les données sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // Masquer les emails partiellement
    if (sanitized.email) {
      sanitized.email = securityService.maskEmail(sanitized.email);
    }

    return sanitized;
  }

  collectMetadata() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      url: window.location.pathname,
    };
  }

  diffChanges(changes) {
    if (!changes.before || !changes.after) return changes;

    const diff = {};
    Object.keys(changes.after).forEach(key => {
      if (changes.before[key] !== changes.after[key]) {
        diff[key] = {
          from: changes.before[key],
          to: changes.after[key],
        };
      }
    });
    return diff;
  }

  logToConsole(entry) {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    };

    console.log(
      `%c[Audit] ${entry.event}`,
      `color: ${colors[entry.severity] || '#64748b'}; font-weight: bold;`,
      entry.data
    );
  }

  handleCriticalEvent(entry) {
    // Notifications pour événements critiques
    // En production, envoyer une alerte par email/SMS
    console.warn('[CRITICAL ALERT]', entry);
  }

  getTopEvents() {
    const eventCounts = {};
    this.logs.forEach(log => {
      eventCounts[log.event] = (eventCounts[log.event] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
  }

  exportToCSV(logs) {
    const headers = ['ID', 'Timestamp', 'Event', 'Severity', 'User', 'Details'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.event,
      log.severity,
      log.data?.userId || '-',
      JSON.stringify(log.data),
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

// Instance singleton
export const auditService = new AuditService();

// Initialiser au chargement
if (typeof window !== 'undefined') {
  auditService.init();
}

// ============================================
// HOOK REACT POUR L'AUDIT
// ============================================
export const useAudit = () => {
  return {
    log: auditService.log.bind(auditService),
    info: auditService.info.bind(auditService),
    warning: auditService.warning.bind(auditService),
    error: auditService.error.bind(auditService),
    critical: auditService.critical.bind(auditService),
    logUserAction: auditService.logUserAction.bind(auditService),
    logDataChange: auditService.logDataChange.bind(auditService),
    getLogs: auditService.getLogs.bind(auditService),
    getStats: auditService.getStats.bind(auditService),
    exportLogs: auditService.exportLogs.bind(auditService),
  };
};

export default auditService;
