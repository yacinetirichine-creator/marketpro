// ============================================
// MARKET PRO - PWA Service Worker Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';

// Configuration
const SW_URL = '/service-worker.js';
const UPDATE_CHECK_INTERVAL = 60 * 1000; // 1 minute

/**
 * Hook pour gérer l'état du Service Worker et les mises à jour PWA
 */
export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter l'événement d'installation PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Enregistrement du Service Worker
  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, {
        scope: '/'
      });

      setRegistration(reg);
      console.log('[PWA] Service Worker registered');

      // Vérifier les mises à jour
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New version available');
            setIsUpdateAvailable(true);
          }
        });
      });

      // Vérifier périodiquement les mises à jour
      setInterval(() => {
        reg.update();
      }, UPDATE_CHECK_INTERVAL);

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  // Appliquer la mise à jour
  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recharger après l'activation du nouveau SW
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, [registration]);

  // Installer l'application
  const installApp = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [installPrompt]);

  // Vider le cache
  const clearCache = useCallback(async () => {
    if (registration?.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('[PWA] Cache cleared');
    }
  }, [registration]);

  // Obtenir la version du SW
  const getVersion = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve(null);
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }, []);

  return {
    isOnline,
    isUpdateAvailable,
    isInstalled,
    canInstall: !!installPrompt,
    registration,
    applyUpdate,
    installApp,
    clearCache,
    getVersion
  };
};

/**
 * Hook pour le stockage offline (IndexedDB)
 */
export const useOfflineStorage = (storeName) => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open('MarketProOffline', 1);

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to open database');
      };

      request.onsuccess = () => {
        setDb(request.result);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        
        if (!database.objectStoreNames.contains('pendingOrders')) {
          database.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!database.objectStoreNames.contains('pendingStockMovements')) {
          database.createObjectStore('pendingStockMovements', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!database.objectStoreNames.contains('cachedProducts')) {
          database.createObjectStore('cachedProducts', { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains('cachedClients')) {
          database.createObjectStore('cachedClients', { keyPath: 'id' });
        }
      };
    };

    openDB();
  }, []);

  // Ajouter un élément
  const addItem = useCallback(async (item) => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName]);

  // Récupérer tous les éléments
  const getAllItems = useCallback(async () => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName]);

  // Supprimer un élément
  const deleteItem = useCallback(async (key) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, [db, storeName]);

  // Vider le store
  const clearStore = useCallback(async () => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, [db, storeName]);

  return {
    addItem,
    getAllItems,
    deleteItem,
    clearStore,
    isReady: !!db
  };
};

/**
 * Hook pour les notifications push
 */
export const usePushNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState(null);

  // Demander la permission
  const requestPermission = useCallback(async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // S'abonner aux notifications push
  const subscribe = useCallback(async (vapidPublicKey) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }, []);

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  // Envoyer une notification locale (pour test)
  const showNotification = useCallback(async (title, options = {}) => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  }, [permission, requestPermission]);

  return {
    permission,
    subscription,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification
  };
};

// Utility: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default useServiceWorker;
