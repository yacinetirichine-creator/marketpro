// ============================================
// MARKET PRO - INTÉGRATION SENTRY
// Suivi des erreurs en production
// ============================================

import * as Sentry from '@sentry/react';

// Configuration Sentry
const SENTRY_CONFIG = {
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `marketpro@${process.env.REACT_APP_VERSION || '1.0.0'}`,

  // Taux d'échantillonnage (1.0 = 100%)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Replay pour les erreurs (captures d'écran)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Intégrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filtrage des erreurs
  beforeSend(event, hint) {
    const error = hint?.originalException;

    // Ignorer certaines erreurs
    if (error?.message) {
      // Erreurs réseau non critiques
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Load failed')) {
        return null;
      }

      // Erreurs de script tiers
      if (error.message.includes('Script error')) {
        return null;
      }

      // Erreurs d'extensions navigateur
      if (error.stack?.includes('chrome-extension://') ||
          error.stack?.includes('moz-extension://')) {
        return null;
      }
    }

    // Nettoyer les données sensibles
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }

    // Masquer les données sensibles dans les breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
          for (const key of Object.keys(breadcrumb.data)) {
            if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
              breadcrumb.data[key] = '[REDACTED]';
            }
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Filtrage des breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Ignorer les requêtes vers les analytics
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      const url = breadcrumb.data?.url || '';
      if (url.includes('google-analytics') ||
          url.includes('facebook') ||
          url.includes('hotjar')) {
        return null;
      }
    }

    return breadcrumb;
  },

  // Tags par défaut
  initialScope: {
    tags: {
      app: 'marketpro',
      module: 'frontend'
    }
  }
};

// Initialisation de Sentry
export const initSentry = () => {
  // Ne pas initialiser sans DSN ou en développement (sauf si forcé)
  if (!SENTRY_CONFIG.dsn) {
    console.info('[Sentry] DSN non configuré - Sentry désactivé');
    return false;
  }

  if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_SENTRY_FORCE !== 'true') {
    console.info('[Sentry] Environnement de développement - Sentry désactivé');
    return false;
  }

  try {
    Sentry.init(SENTRY_CONFIG);
    console.info('[Sentry] Initialisé avec succès');
    return true;
  } catch (error) {
    console.error('[Sentry] Erreur d\'initialisation:', error);
    return false;
  }
};

// Définir l'utilisateur courant
export const setUser = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username || `${user.firstName} ${user.lastName}`,
    role: user.role
  });
};

// Effacer l'utilisateur (logout)
export const clearUser = () => {
  Sentry.setUser(null);
};

// Ajouter un tag
export const setTag = (key, value) => {
  Sentry.setTag(key, value);
};

// Ajouter du contexte
export const setContext = (name, context) => {
  Sentry.setContext(name, context);
};

// Capturer une exception
export const captureException = (error, context = {}) => {
  return Sentry.captureException(error, {
    extra: context
  });
};

// Capturer un message
export const captureMessage = (message, level = 'info', context = {}) => {
  return Sentry.captureMessage(message, {
    level,
    extra: context
  });
};

// Ajouter un breadcrumb manuel
export const addBreadcrumb = (message, category = 'custom', data = {}, level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level
  });
};

// Wrapper pour les transactions de performance
export const startTransaction = (name, operation) => {
  return Sentry.startSpan({ name, op: operation }, () => {});
};

// Error Boundary avec Sentry
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// HOC pour wrapper les composants avec Sentry
export const withSentry = (Component, componentName) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error }) => (
      <div className="error-fallback">
        <h2>Une erreur est survenue</h2>
        <p>Nous avons été notifiés et travaillons à la résolution.</p>
        {process.env.NODE_ENV !== 'production' && (
          <details>
            <summary>Détails de l'erreur</summary>
            <pre>{error?.message}</pre>
          </details>
        )}
      </div>
    ),
    showDialog: process.env.NODE_ENV === 'production',
    dialogOptions: {
      title: 'Une erreur est survenue',
      subtitle: 'Notre équipe a été notifiée',
      subtitle2: 'Si vous souhaitez nous aider, décrivez ce qui s\'est passé ci-dessous.',
      labelName: 'Nom',
      labelEmail: 'Email',
      labelComments: 'Que s\'est-il passé ?',
      labelSubmit: 'Envoyer le rapport',
      labelClose: 'Fermer',
      successMessage: 'Merci pour votre rapport !'
    }
  });
};

// Profiler pour mesurer les performances des composants
export const SentryProfiler = Sentry.Profiler;

// Export de Sentry pour accès direct si nécessaire
export { Sentry };

export default {
  init: initSentry,
  setUser,
  clearUser,
  setTag,
  setContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
  ErrorBoundary: SentryErrorBoundary,
  withSentry,
  Profiler: SentryProfiler
};
