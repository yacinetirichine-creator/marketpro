// ============================================
// MARKET PRO - SYSTÈME DE LOGGING CENTRALISÉ
// Logging structuré avec support Sentry
// ============================================

import * as Sentry from '@sentry/react';

// Niveaux de log
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
};

// Configuration par environnement
const getConfig = () => ({
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production' || process.env.REACT_APP_DEBUG === 'true',
  enableSentry: process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN,
  enableRemote: process.env.REACT_APP_REMOTE_LOGGING === 'true',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT || '/api/logs',
  appName: 'MarketPro',
  version: process.env.REACT_APP_VERSION || '1.0.0'
});

// Ordre des niveaux pour filtrage
const levelOrder = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4
};

// Formatage du timestamp ISO
const getTimestamp = () => new Date().toISOString();

// Sérialisation sécurisée des données
const safeStringify = (obj, maxDepth = 5) => {
  const seen = new WeakSet();

  const stringify = (value, depth) => {
    if (depth > maxDepth) return '[MAX_DEPTH]';

    if (value === null) return null;
    if (value === undefined) return undefined;

    if (typeof value === 'function') return '[Function]';
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    if (typeof value === 'object') {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);

      if (Array.isArray(value)) {
        return value.map(item => stringify(item, depth + 1));
      }

      const result = {};
      for (const key of Object.keys(value)) {
        // Masque les données sensibles
        if (['password', 'token', 'secret', 'key', 'authorization'].some(s =>
          key.toLowerCase().includes(s)
        )) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = stringify(value[key], depth + 1);
        }
      }
      return result;
    }

    return value;
  };

  try {
    return JSON.stringify(stringify(obj, 0));
  } catch {
    return '[STRINGIFY_ERROR]';
  }
};

// Classe Logger principale
class Logger {
  constructor() {
    this.config = getConfig();
    this.context = {};
    this.buffer = [];
    this.bufferSize = 50;
    this.flushInterval = null;

    // Démarrer le flush automatique en production
    if (this.config.enableRemote) {
      this.startAutoFlush();
    }
  }

  // Définir le contexte global (user, session, etc.)
  setContext(context) {
    this.context = { ...this.context, ...context };

    // Mettre à jour Sentry aussi
    if (this.config.enableSentry && context.user) {
      Sentry.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.username
      });
    }
  }

  // Effacer le contexte (logout)
  clearContext() {
    this.context = {};
    if (this.config.enableSentry) {
      Sentry.setUser(null);
    }
  }

  // Vérifier si le niveau doit être loggé
  shouldLog(level) {
    return levelOrder[level] >= levelOrder[this.config.minLevel];
  }

  // Créer l'entrée de log
  createLogEntry(level, message, data = {}, error = null) {
    const entry = {
      timestamp: getTimestamp(),
      level,
      message,
      app: this.config.appName,
      version: this.config.version,
      environment: process.env.NODE_ENV,
      ...this.context
    };

    if (Object.keys(data).length > 0) {
      entry.data = data;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    // Ajouter les infos navigateur en production
    if (typeof window !== 'undefined') {
      entry.browser = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      };
    }

    return entry;
  }

  // Log vers console
  logToConsole(level, entry) {
    if (!this.config.enableConsole) return;

    const styles = {
      [LogLevel.DEBUG]: 'color: #6b7280',
      [LogLevel.INFO]: 'color: #3b82f6',
      [LogLevel.WARN]: 'color: #f59e0b',
      [LogLevel.ERROR]: 'color: #ef4444',
      [LogLevel.FATAL]: 'color: #dc2626; font-weight: bold'
    };

    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, styles[level], entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, styles[level], entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, styles[level], entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`%c${prefix}`, styles[level], entry.message, entry.error || entry.data || '');
        break;
      default:
        console.log(prefix, entry.message, entry.data || '');
    }
  }

  // Log vers Sentry
  logToSentry(level, entry) {
    if (!this.config.enableSentry) return;

    const sentryLevel = {
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warning',
      [LogLevel.ERROR]: 'error',
      [LogLevel.FATAL]: 'fatal'
    };

    if (entry.error) {
      Sentry.captureException(entry.error, {
        level: sentryLevel[level],
        extra: entry.data,
        tags: {
          app: entry.app,
          version: entry.version
        }
      });
    } else if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      Sentry.captureMessage(entry.message, {
        level: sentryLevel[level],
        extra: entry.data,
        tags: {
          app: entry.app,
          version: entry.version
        }
      });
    } else {
      Sentry.addBreadcrumb({
        message: entry.message,
        level: sentryLevel[level],
        data: entry.data
      });
    }
  }

  // Ajouter au buffer pour envoi remote
  addToBuffer(entry) {
    if (!this.config.enableRemote) return;

    this.buffer.push(entry);

    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  // Envoyer les logs au serveur
  async flush() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: safeStringify(logsToSend)
      });
    } catch (error) {
      // Remettre dans le buffer en cas d'échec
      this.buffer = [...logsToSend, ...this.buffer].slice(-this.bufferSize * 2);
      console.error('[Logger] Failed to flush logs:', error);
    }
  }

  // Démarrer le flush automatique
  startAutoFlush() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush toutes les 30 secondes
  }

  // Arrêter le flush automatique
  stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  // Méthode principale de logging
  log(level, message, data = {}, error = null) {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data, error);

    this.logToConsole(level, entry);
    this.logToSentry(level, entry);
    this.addToBuffer(entry);

    return entry;
  }

  // Méthodes de convenance
  debug(message, data = {}) {
    return this.log(LogLevel.DEBUG, message, data);
  }

  info(message, data = {}) {
    return this.log(LogLevel.INFO, message, data);
  }

  warn(message, data = {}) {
    return this.log(LogLevel.WARN, message, data);
  }

  error(message, errorOrData = {}, data = {}) {
    if (errorOrData instanceof Error) {
      return this.log(LogLevel.ERROR, message, data, errorOrData);
    }
    return this.log(LogLevel.ERROR, message, errorOrData);
  }

  fatal(message, errorOrData = {}, data = {}) {
    if (errorOrData instanceof Error) {
      return this.log(LogLevel.FATAL, message, data, errorOrData);
    }
    return this.log(LogLevel.FATAL, message, errorOrData);
  }

  // Logger pour les actions utilisateur
  action(action, details = {}) {
    return this.info(`User action: ${action}`, { action, ...details });
  }

  // Logger pour les métriques de performance
  performance(metric, value, unit = 'ms') {
    return this.debug(`Performance: ${metric}`, { metric, value, unit });
  }

  // Logger pour les requêtes API
  api(method, url, status, duration) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    return this.log(level, `API ${method} ${url}`, {
      method,
      url,
      status,
      duration: `${duration}ms`
    });
  }

  // Logger pour les événements de sécurité
  security(event, details = {}) {
    return this.warn(`Security: ${event}`, { securityEvent: event, ...details });
  }

  // Créer un logger enfant avec contexte additionnel
  child(additionalContext) {
    const childLogger = Object.create(this);
    childLogger.context = { ...this.context, ...additionalContext };
    return childLogger;
  }
}

// Instance singleton
const logger = new Logger();

// Capturer les erreurs non gérées
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.fatal('Unhandled error', event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.fatal('Unhandled promise rejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  });
}

// Flush avant fermeture de page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush();
  });
}

export default logger;
export { Logger, LogLevel };
