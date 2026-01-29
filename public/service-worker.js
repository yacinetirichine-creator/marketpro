// ============================================
// MARKET PRO - Service Worker (PWA)
// ============================================

const CACHE_NAME = 'marketpro-v1.0.0';
const STATIC_CACHE = 'marketpro-static-v1';
const DYNAMIC_CACHE = 'marketpro-dynamic-v1';
const API_CACHE = 'marketpro-api-v1';

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/static/js/main.js',
  '/static/css/main.css'
];

// Routes API à mettre en cache
const API_ROUTES = [
  '/api/products',
  '/api/clients',
  '/api/dashboard/kpis'
];

// ============================================
// INSTALLATION
// ============================================
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/offline.html'))
          .catch(err => {
            console.warn('[ServiceWorker] Some assets failed to cache:', err);
          });
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVATION
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('marketpro-') && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[ServiceWorker] Removing old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH STRATEGIES
// ============================================

// Cache First (pour assets statiques)
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
};

// Network First (pour API)
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

// Stale While Revalidate (pour données semi-dynamiques)
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || networkPromise;
};

// ============================================
// FETCH EVENT HANDLER
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorer les extensions de navigateur et URLs externes
  if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api')) {
    return;
  }
  
  // Stratégie pour les requêtes API
  if (url.pathname.startsWith('/api')) {
    // Endpoints critiques: Network First
    if (url.pathname.includes('/auth') || url.pathname.includes('/orders')) {
      event.respondWith(networkFirst(request));
      return;
    }
    
    // Données de référence: Stale While Revalidate
    if (url.pathname.includes('/products') || url.pathname.includes('/clients')) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
    
    // Autres API: Network First
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Assets statiques: Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Navigation: Network First avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          
          // Fallback to offline page
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;
          
          return caches.match('/');
        })
    );
    return;
  }
  
  // Default: Network First
  event.respondWith(networkFirst(request));
});

// ============================================
// SYNC EVENTS (Background Sync)
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
  
  if (event.tag === 'sync-stock-movements') {
    event.waitUntil(syncStockMovements());
  }
});

// Synchroniser les commandes en attente
const syncPendingOrders = async () => {
  try {
    const db = await openIndexedDB();
    const pendingOrders = await getAllFromStore(db, 'pendingOrders');
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${order.token}`
          },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'pendingOrders', order.id);
          console.log('[ServiceWorker] Order synced:', order.id);
        }
      } catch (err) {
        console.error('[ServiceWorker] Failed to sync order:', err);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync orders failed:', error);
  }
};

// Synchroniser les mouvements de stock
const syncStockMovements = async () => {
  try {
    const db = await openIndexedDB();
    const pendingMovements = await getAllFromStore(db, 'pendingStockMovements');
    
    for (const movement of pendingMovements) {
      try {
        const response = await fetch('/api/stocks/movements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${movement.token}`
          },
          body: JSON.stringify(movement.data)
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'pendingStockMovements', movement.id);
          console.log('[ServiceWorker] Stock movement synced:', movement.id);
        }
      } catch (err) {
        console.error('[ServiceWorker] Failed to sync stock movement:', err);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync stock movements failed:', error);
  }
};

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let data = { title: 'Market Pro', body: 'Nouvelle notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'marketpro-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      ...data.data
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((windowClients) => {
        // Chercher une fenêtre existante
        for (const client of windowClients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================
// MESSAGE HANDLER
// ============================================
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(names => 
          Promise.all(names.map(name => caches.delete(name)))
        )
      );
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE).then(cache => 
          cache.addAll(event.data.urls)
        )
      );
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
  }
});

// ============================================
// IndexedDB Helpers
// ============================================
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MarketProOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingStockMovements')) {
        db.createObjectStore('pendingStockMovements', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('cachedProducts')) {
        db.createObjectStore('cachedProducts', { keyPath: 'id' });
      }
    };
  });
};

const getAllFromStore = (db, storeName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const deleteFromStore = (db, storeName, key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

console.log('[ServiceWorker] Script loaded');
