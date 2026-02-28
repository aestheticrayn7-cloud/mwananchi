const CACHE_NAME = 'mwananchi-v1';
const urlsToCache = [
  '/',
  '/app/page.tsx',
  '/app/globals.css',
];

// Install event
self.addEventListener('install', event => {
  console.log('[v0] Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[v0] Cache opened');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('[v0] Cache addAll failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[v0] Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[v0] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls (they handle offline differently)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache if network fails
        return caches.match(request).then(response => {
          if (response) {
            console.log('[v0] Serving from cache:', request.url);
            return response;
          }
          // Return a fallback response
          return new Response(
            JSON.stringify({ error: 'Offline - page not available' }),
            { status: 503, statusText: 'Service Unavailable' }
          );
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  console.log('[v0] Service Worker message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
