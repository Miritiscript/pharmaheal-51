
// Cache names
const CACHE_NAME = 'pharmaheal-v11';
const DATA_CACHE_NAME = 'pharmaheal-data-v11';
const IMAGE_CACHE_NAME = 'pharmaheal-images-v11';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-icon.png',
  '/logo-full.png'
];

// Local fallback images to pre-cache
const fallbackImages = [
  '/logo-icon.png',
  '/logo-full.png',
  '/favicon.ico'
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
    event.respondWith(fetch(event.request).catch(() => {
      console.log('Fetch failed for:', event.request.url);
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    }));
  });
  
  console.log('Service Worker running in development mode - caching disabled');
} else {
  // Regular service worker behavior for production
  
  // Install event - caches static assets and fallback images
  self.addEventListener('install', (event) => {
    event.waitUntil(
      Promise.all([
        // Cache core files
        caches.open(CACHE_NAME)
          .then((cache) => {
            console.log('Opened cache for core files');
            return Promise.allSettled(
              urlsToCache.map(url => 
                cache.add(url).catch(err => {
                  console.warn(`Failed to cache ${url}: ${err.message}`);
                  return null;
                })
              )
            );
          }),
        
        // Cache fallback images separately
        caches.open(IMAGE_CACHE_NAME)
          .then((cache) => {
            console.log('Pre-caching fallback images');
            return Promise.allSettled(
              fallbackImages.map(url => 
                cache.add(url).catch(err => {
                  console.warn(`Failed to cache fallback image ${url}: ${err.message}`);
                  return null;
                })
              )
            );
          })
      ])
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Service worker install failed:', err);
      })
    );
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME, IMAGE_CACHE_NAME];
    
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

  // Fetch event handler - with improved handling for YouTube content
  self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests and browser extensions
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension://')) {
      return;
    }
    
    // For YouTube API requests - network only, don't cache
    if (requestUrl.href.includes('googleapis.com/youtube')) {
      event.respondWith(
        fetch(event.request)
          .catch(error => {
            console.error('YouTube API fetch failed:', error);
            return new Response(JSON.stringify({ 
              error: { message: 'Failed to connect to YouTube API' } 
            }), {
              status: 503,
              headers: {'Content-Type': 'application/json'}
            });
          })
      );
      return;
    }
    
    // For YouTube thumbnail images - network with cache fallback
    if (requestUrl.href.includes('ytimg.com') || 
        (requestUrl.href.includes('youtube.com') && !requestUrl.href.includes('embed'))) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the YouTube image
            caches.open(IMAGE_CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.warn('YouTube image cache error:', err);
                  });
                } catch (err) {
                  console.warn('YouTube image cache error:', err);
                }
              });
              
            return response;
          })
          .catch(() => {
            // If network fails, try cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no cache hit, return a fallback image
                return caches.match('/logo-icon.png');
              });
          })
      );
      return;
    }
    
    // For image requests - network first with cache fallback
    if (requestUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/) || 
        requestUrl.pathname.includes('lovable-uploads')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(IMAGE_CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.warn('Cache put error:', err);
                  });
                } catch (err) {
                  console.warn('Cache error:', err);
                }
              });
              
            return response;
          })
          .catch(() => {
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no cache hit, return logo-icon.png
                return caches.match('/logo-icon.png');
              });
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
                  try {
                    cache.put(event.request, responseToCache).catch(err => {
                      console.warn('Cache put error for other resources:', err);
                    });
                  } catch (err) {
                    console.warn('Cache error for other resources:', err);
                  }
                });
                
              return response;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // Return a default offline page or message
              if (requestUrl.pathname === '/') {
                return caches.match('/index.html');
              }
              return new Response('You are offline and this resource is not cached.', {
                status: 503,
                headers: {'Content-Type': 'text/plain'}
              });
            });
        })
    );
  });
}
