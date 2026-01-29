// ============================================
// MARKET PRO - CONFIGURATION APPLICATION
// Configuration centralisée pour production
// ============================================

// Environnement
const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';
const IS_DEVELOPMENT = ENV === 'development';

// Configuration API
export const API_CONFIG = {
  // URL de base de l'API (à configurer selon l'environnement)
  BASE_URL: process.env.REACT_APP_API_URL || (IS_PRODUCTION 
    ? 'https://api.marketpro.fr' 
    : 'http://localhost:3001'),
  
  // Timeout des requêtes en ms
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Configuration de sécurité
export const SECURITY_CONFIG = {
  // Session
  SESSION_DURATION: IS_PRODUCTION ? 8 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 8h prod, 24h dev
  SESSION_EXTENSION: 30 * 60 * 1000, // 30 minutes d'extension
  SESSION_WARNING: 5 * 60 * 1000, // Avertissement 5 min avant expiration
  
  // Authentification
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // Tokens
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh si expire dans 5 min
  
  // CSRF
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  CSRF_COOKIE_NAME: 'csrf_token',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  
  // Audit
  AUDIT_LOG_RETENTION_DAYS: IS_PRODUCTION ? 90 : 7,
  AUDIT_LOG_MAX_ENTRIES: 10000
};

// Configuration de l'application
export const APP_CONFIG = {
  // Informations de base
  NAME: 'Market Pro',
  VERSION: '1.0.0',
  DESCRIPTION: 'ERP pour grossistes agroalimentaires',
  
  // Support
  SUPPORT_EMAIL: 'support@marketpro.fr',
  SUPPORT_PHONE: '+33 1 23 45 67 89',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  
  // Cache
  CACHE_DURATION: IS_PRODUCTION ? 5 * 60 * 1000 : 0, // 5 min en prod
  
  // Formats
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  CURRENCY: 'EUR',
  LOCALE: 'fr-FR',
  
  // Features flags
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    AUDIT_LOG: true,
    TWO_FACTOR_AUTH: false, // À activer en production
    BIOMETRIC_AUTH: false,
    OFFLINE_MODE: false
  }
};

// Configuration du stockage
export const STORAGE_CONFIG = {
  // Préfixe pour les clés localStorage
  PREFIX: 'marketpro_',
  
  // Clés de stockage
  KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    SESSION_DATA: 'session_data',
    PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    AUDIT_LOGS: 'audit_logs',
    CSRF_TOKEN: 'csrf_token'
  },
  
  // Durée de rétention (en jours)
  RETENTION: {
    AUTH_TOKEN: 1,
    USER_DATA: 1,
    SESSION_DATA: 1,
    PREFERENCES: 365,
    AUDIT_LOGS: IS_PRODUCTION ? 90 : 7
  }
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  // Durée d'affichage par défaut (ms)
  DEFAULT_DURATION: 5000,
  
  // Position
  POSITION: 'top-right',
  
  // Maximum de notifications simultanées
  MAX_VISIBLE: 5,
  
  // Types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }
};

// Configuration des modules
export const MODULES_CONFIG = {
  // Dashboard
  DASHBOARD: {
    REFRESH_INTERVAL: IS_PRODUCTION ? 30000 : 60000, // 30s prod, 60s dev
    CHARTS_ANIMATION: true
  },
  
  // Stock
  STOCK: {
    LOW_STOCK_THRESHOLD: 10,
    CRITICAL_STOCK_THRESHOLD: 5,
    AUTO_REORDER: true
  },
  
  // Commandes
  ORDERS: {
    AUTO_SAVE_INTERVAL: 30000, // 30 secondes
    MAX_ITEMS_PER_ORDER: 100
  },
  
  // Facturation
  INVOICES: {
    AUTO_NUMBER: true,
    PREFIX: 'FAC',
    DUE_DATE_DAYS: 30
  },
  
  // WMS
  WMS: {
    BARCODE_FORMAT: 'EAN13',
    LOCATION_FORMAT: 'AA-BB-CC', // Zone-Allée-Emplacement
    INVENTORY_ROTATION: 'FIFO' // FIFO, LIFO, FEFO
  }
};

// Exporter la configuration complète
export const CONFIG = {
  ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  API: API_CONFIG,
  SECURITY: SECURITY_CONFIG,
  APP: APP_CONFIG,
  STORAGE: STORAGE_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG,
  MODULES: MODULES_CONFIG
};

export default CONFIG;
