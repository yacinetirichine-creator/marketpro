import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log l'erreur pour le monitoring
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.error('[ERROR BOUNDARY]', errorLog);

    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorLog);
    }
  }

  reportError = async (errorLog) => {
    try {
      // Placeholder pour l'envoi vers un service comme Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // });
      console.log('[ERROR BOUNDARY] Error reported:', errorLog.timestamp);
    } catch (e) {
      console.error('[ERROR BOUNDARY] Failed to report error:', e);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      // Si un composant de fallback personnalisé est fourni
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.handleReset}
          />
        );
      }

      // Interface d'erreur par défaut
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <AlertTriangle size={64} color="#ef4444" />
            </div>

            <h1 style={styles.title}>Une erreur est survenue</h1>

            <p style={styles.message}>
              Nous sommes désolés, une erreur inattendue s'est produite.
              Notre équipe technique a été notifiée.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={styles.errorDetails}>
                <div style={styles.errorHeader}>
                  <Bug size={16} />
                  <span>Détails de l'erreur (dev only)</span>
                </div>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div style={styles.actions}>
              <button
                onClick={this.handleReload}
                style={styles.primaryButton}
              >
                <RefreshCw size={18} />
                <span>Recharger la page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                style={styles.secondaryButton}
              >
                <Home size={18} />
                <span>Retour à l'accueil</span>
              </button>
            </div>

            <p style={styles.helpText}>
              Si le problème persiste, contactez le support technique à{' '}
              <a href="mailto:support@marketpro.fr" style={styles.link}>
                support@marketpro.fr
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  iconContainer: {
    marginBottom: '24px'
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  message: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px'
  },
  errorDetails: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px'
  },
  errorText: {
    color: '#fca5a5',
    fontSize: '13px',
    margin: '0 0 12px 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  stackTrace: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '11px',
    margin: 0,
    maxHeight: '150px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#00d4aa',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  helpText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    margin: 0
  },
  link: {
    color: '#00d4aa',
    textDecoration: 'none'
  }
};

export default ErrorBoundary;
