// ============================================
// MARKET PRO - PWA Components
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  X, 
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';

// ============================================
// OFFLINE INDICATOR
// ============================================
export const OfflineIndicator = () => {
  const { isOnline } = useServiceWorker();
  const [show, setShow] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Montrer brièvement qu'on est de retour en ligne
      setTimeout(() => {
        setShow(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '12px',
        background: isOnline 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={20} />
          <span>Connexion rétablie</span>
        </>
      ) : (
        <>
          <WifiOff size={20} />
          <span>Mode hors ligne - Certaines fonctionnalités sont limitées</span>
        </>
      )}
    </div>
  );
};

// ============================================
// UPDATE NOTIFICATION
// ============================================
export const UpdateNotification = () => {
  const { isUpdateAvailable, applyUpdate } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px 20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
        maxWidth: '400px'
      }}
    >
      <RefreshCw size={24} className="animate-spin-slow" />
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>
          Mise à jour disponible
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Une nouvelle version est disponible
        </p>
      </div>
      <button
        onClick={applyUpdate}
        style={{
          padding: '8px 16px',
          background: 'white',
          color: '#2563eb',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Mettre à jour
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ============================================
// INSTALL PROMPT
// ============================================
export const InstallPrompt = ({ onDismiss }) => {
  const { canInstall, installApp, isInstalled } = useServiceWorker();
  const [installing, setInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Vérifier si déjà dismissé dans cette session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!canInstall || isInstalled || dismissed) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installApp();
    setInstalling(false);
    if (success && onDismiss) {
      onDismiss();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        padding: '20px',
        borderRadius: '16px',
        background: '#1e293b',
        border: '1px solid #334155',
        color: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        maxWidth: '350px'
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Smartphone size={28} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
          Installer Market Pro
        </h4>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '15px', lineHeight: 1.5 }}>
          Installez l'application pour un accès rapide et une utilisation hors ligne
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: installing ? 'not-allowed' : 'pointer',
              opacity: installing ? 0.7 : 1
            }}
          >
            <Download size={18} />
            {installing ? 'Installation...' : 'Installer'}
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Plus tard
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ============================================
// SYNC STATUS INDICATOR
// ============================================
export const SyncStatusIndicator = ({ pendingCount = 0, syncing = false }) => {
  if (pendingCount === 0 && !syncing) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '8px',
        background: syncing ? '#fef3c7' : '#fee2e2',
        color: syncing ? '#92400e' : '#991b1b',
        fontSize: '0.875rem',
        fontWeight: 500
      }}
    >
      {syncing ? (
        <>
          <RefreshCw size={16} className="animate-spin" />
          <span>Synchronisation en cours...</span>
        </>
      ) : (
        <>
          <AlertTriangle size={16} />
          <span>{pendingCount} modification(s) en attente</span>
        </>
      )}
    </div>
  );
};

// ============================================
// INSTALLATION SUCCESS
// ============================================
export const InstallationSuccess = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          animation: 'scaleIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <CheckCircle size={40} color="white" />
        </div>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>
          Installation réussie !
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '25px' }}>
          Market Pro a été ajouté à votre écran d'accueil
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Compris
        </button>
      </div>
    </div>
  );
};

// ============================================
// CSS Animations (à ajouter dans globals.css)
// ============================================
const styles = `
@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-spin-slow {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default {
  OfflineIndicator,
  UpdateNotification,
  InstallPrompt,
  SyncStatusIndicator,
  InstallationSuccess
};
