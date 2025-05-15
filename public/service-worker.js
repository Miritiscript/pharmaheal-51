// Version for cache management
const CACHE_VERSION = 'pharmaheal-v12';
const IMAGE_CACHE_VERSION = 'pharmaheal-images-v12';

// Resources to cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/placeholder.svg',
  '/favicon.ico',
  '/og-image.png',
  '/logo-icon.png',
  '/logo-full.png'
];

// Fallback images to pre-cache
const FALLBACK_IMAGES = [
  '/placeholder.svg',
  '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
  '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
  '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
  '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    // Cache core assets
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('Opened cache for core files');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      // Cache fallback images separately
      return caches.open(IMAGE_CACHE_VERSION).then((cache) => {
        console.log('Pre-caching fallback images');
        return cache.addAll(FALLBACK_IMAGES);
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_VERSION &&
            cacheName !== IMAGE_CACHE_VERSION
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => {
  return (
    url.pathname.includes('/api/') || 
    url.hostname.includes('api.groq.com') ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('youtube.googleapis.com') ||
    url.hostname.includes('zmjjyoifprnkeitbklpa.supabase.co') ||
    url.pathname.includes('_supabase')
  );
};

// Helper to determine if a request is for an image
const isImageRequest = (url) => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
};

// Helper to determine if a request is for a static asset (CSS, JS)
const isStaticAsset = (url) => {
  return url.pathname.endsWith('.css') || 
         url.pathname.endsWith('.js') || 
         url.pathname.includes('assets/');
};

// Fetch event - network first for API, cache first for assets, stale-while-revalidate for everything else
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('zmjjyoifprnkeitbklpa.supabase.co')) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Don't cache API requests
  if (isApiRequest(url)) {
    return;
  }
  
  // For navigation requests (HTML documents), use network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the updated page
          const responseToCache = response.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response exists, serve index.html for SPA
            return caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // For images, use cache-first strategy
  if (isImageRequest(url)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Revalidate in background
          fetch(event.request).then(networkResponse => {
            caches.open(IMAGE_CACHE_VERSION).then(cache => {
              cache.put(event.request, networkResponse);
            });
          }).catch(err => console.log('Image revalidation failed:', err));
          
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Clone response before using it
            const responseToCache = response.clone();
            
            // Cache the fetched image
            caches.open(IMAGE_CACHE_VERSION).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return fallback image
            if (url.pathname.includes('lovable-uploads')) {
              return caches.match('/placeholder.svg');
            }
            return caches.match('/placeholder.svg');
          });
      })
    );
    return;
  }
  
  // For static assets (JS, CSS), use stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Create a promise to update cache in background
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Cache the updated asset
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(err => {
          console.warn('Failed to fetch asset:', err);
          // If network request fails and we have a cached version, return that
          if (cachedResponse) {
            return cachedResponse;
          }
          // Otherwise propagate the error
          throw err;
        });
        
        // Return cached response if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
  
  // Default strategy: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Cache the updated response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(err => {
          console.warn('Failed to fetch:', err);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw err;
        });
      
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
