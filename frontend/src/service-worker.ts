/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'e-suraksha-v3-fixed';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const SESSION_CACHE = `${CACHE_VERSION}-session`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/icon.svg',
  '/assets/generated/sos.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing v2...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
        // Continue installation even if some assets fail
        return Promise.resolve();
      });
    }).then(() => {
      console.log('[Service Worker] Skip waiting to activate immediately');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating v2...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('e-suraksha-') &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== SESSION_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/api/') || url.pathname.includes('?canisterId=')) {
    event.respondWith(
      networkFirstWithRetry(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Network unavailable. Request queued for retry.' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // Handle session data with special caching
  if (url.pathname.includes('/session') || request.headers.get('X-Session-Request')) {
    event.respondWith(
      caches.open(SESSION_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          return cache.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Session unavailable offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        });
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {
          // Ignore fetch errors for background updates
        });
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html').then((response) => {
            return response || new Response('Offline', { status: 503 });
          });
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Network-first strategy with retry logic
async function networkFirstWithRetry(request: Request, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(request);

      // Cache successful responses
      if (response.ok) {
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`[Service Worker] Fetch attempt ${i + 1} failed:`, error);

      // Exponential backoff
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  // Try to return cached response
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  throw lastError || new Error('Network request failed');
}

// Handle background sync for offline SOS alerts
self.addEventListener('sync', (event: any) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-sos-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// Sync offline queue
async function syncOfflineQueue(): Promise<void> {
  try {
    console.log('[Service Worker] Syncing offline queue...');
    // Notify all clients to process their offline queues
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_OFFLINE_QUEUE',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[Service Worker] Failed to sync offline queue:', error);
  }
}

// Handle push notifications (for future emergency alerts)
self.addEventListener('push', (event: any) => {
  console.log('[Service Worker] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'E-Suraksha Alert';
  const options = {
    body: data.body || 'New emergency alert',
    icon: '/assets/generated/icon.svg',
    badge: '/assets/generated/icon.svg',
    vibrate: [200, 100, 200],
    tag: 'emergency-alert',
    requireInteraction: true,
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Open new window if no existing window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'QUEUE_SOS_ALERT') {
    // Register background sync
    if ('sync' in self.registration) {
      (self.registration as any).sync.register('sync-sos-queue').catch((error: Error) => {
        console.error('[Service Worker] Failed to register sync:', error);
      });
    }
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('e-suraksha-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_SESSION') {
    // Cache session data for offline access
    const sessionData = event.data.sessionData;
    if (sessionData) {
      event.waitUntil(
        caches.open(SESSION_CACHE).then((cache) => {
          const response = new Response(JSON.stringify(sessionData), {
            headers: { 'Content-Type': 'application/json' }
          });
          return cache.put('/session-data', response);
        })
      );
    }
  }
});

// Export empty object to make this a module
export { };
