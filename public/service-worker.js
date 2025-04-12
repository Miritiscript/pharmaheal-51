
// Cache names
const CACHE_NAME = 'pharmaheal-v5';
const DATA_CACHE_NAME = 'pharmaheal-data-v5';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/lovable-uploads/logo.png',
  '/lovable-uploads/favicon.png'
];

// Check if we're in development mode
const isDev = self.location.hostname === 'localhost' || 
              self.location.hostname.includes('127.0.0.1') ||
              self.location.hostname.includes('.lovable.dev');

// Skip service worker activation in development mode
if (isDev) {
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  // Pass through all requests without caching in development
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
  
  console.log('Service Worker running in development mode - caching disabled');
} else {
  // Regular service worker behavior for production
  
  // Install event - caches static assets
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .then(() => self.skipWaiting())
    );
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
    
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  // Fetch event - network-first for images and assets
  self.addEventListener('fetch', (event) => {
    // Skip for browser extensions and chrome-extension requests
    if (
      !event.request.url.startsWith('http') || 
      event.request.url.includes('chrome-extension')
    ) {
      return;
    }

    const requestUrl = new URL(event.request.url);
    
    // Handle image requests - network first
    if (requestUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/) || 
        requestUrl.hostname.includes('unsplash.com') ||
        requestUrl.hostname.includes('ytimg.com') ||
        requestUrl.pathname.includes('lovable-uploads')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
      return;
    }

    // JS module handling - network-first for all JS files
    if (requestUrl.pathname.endsWith('.js') || requestUrl.pathname.includes('assets/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
      return;
    }

    // For API or data requests - network first with cache fallback
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('googleapis.com')) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const responseToCache = response.clone();
            
            caches.open(DATA_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
      return;
    }

    // For everything else - cache first with network fallback
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  });

  // Navigation fallback - return index.html for all navigation requests
  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/index.html');
        })
      );
    }
  });
}
