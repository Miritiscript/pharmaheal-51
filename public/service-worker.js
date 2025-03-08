
// Cache names
const CACHE_NAME = 'pharmaheal-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // For API requests, try network first, then cache
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('generativelanguage.googleapis.com')) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Clone the response for caching and for the browser
            const responseToCache = response.clone();
            
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If network fails, try from cache
            return caches.match(event.request);
          })
      );
    } else {
      // For non-API requests, try cache first, then network (cache-first strategy)
      event.respondWith(
        caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache, fetch from network
            return fetch(event.request)
              .then((response) => {
                // Clone the response
                const responseToCache = response.clone();
                
                // Open the runtime cache and store the response
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
                
                return response;
              });
          })
      );
    }
  }
});
