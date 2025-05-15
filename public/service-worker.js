// Cache names
const CACHE_NAME = 'pharmaheal-v10';
const DATA_CACHE_NAME = 'pharmaheal-data-v10';
const IMAGE_CACHE_NAME = 'pharmaheal-images-v10';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Use the UUIDs of the uploaded images
  '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
  '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png', 
  '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
  '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png'
];

// Local fallback images to pre-cache
const fallbackImages = [
  '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png',
  '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
  '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
  '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png'
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
    // Skip non-GET requests and browser extensions
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension://')) {
      return;
    }
    
    const requestUrl = new URL(event.request.url);
    
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
                
                // If no cache hit, return a random fallback image
                return caches.open(IMAGE_CACHE_NAME)
                  .then(cache => {
                    const fallbackUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                    return cache.match(new Request(fallbackUrl));
                  })
                  .then(fallbackResponse => {
                    if (fallbackResponse) {
                      return fallbackResponse;
                    }
                    
                    // Last resort - return a response with placeholder text
                    return new Response('Image not available', {
                      status: 404,
                      headers: {'Content-Type': 'text/plain'}
                    });
                  });
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
                  // Only cache same-origin or CORS-enabled responses
                  if (response.url.startsWith(self.location.origin) || 
                      response.headers.get('Access-Control-Allow-Origin')) {
                    cache.put(event.request, responseToCache).catch(err => {
                      console.warn('Cache put error:', err);
                    });
                  }
                } catch (err) {
                  console.warn('Cache error:', err);
                }
              })
              .catch(err => {
                console.warn('Cache open error:', err);
              });
              
            return response;
          })
          .catch(() => {
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no cache hit, return a fallback from IMAGE_CACHE
                return caches.open(IMAGE_CACHE_NAME)
                  .then(cache => {
                    // Get a random fallback image
                    const fallbackUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                    return cache.match(new Request(fallbackUrl));
                  })
                  .then(fallbackResponse => {
                    if (fallbackResponse) {
                      return fallbackResponse;
                    }
                    
                    // Last resort - try to fetch the first fallback directly
                    return fetch(fallbackImages[0])
                      .catch(() => {
                        return new Response('Failed to load image', {
                          status: 404,
                          headers: {'Content-Type': 'text/plain'}
                        });
                      });
                  });
              });
          })
      );
      return;
    }

    // For JS and assets - network first
    if (requestUrl.pathname.endsWith('.js') || requestUrl.pathname.includes('assets/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.warn('Cache put error for JS/assets:', err);
                  });
                } catch (err) {
                  console.warn('Cache error for JS/assets:', err);
                }
              })
              .catch(err => {
                console.warn('Cache open error for JS/assets:', err);
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
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const responseToCache = response.clone();
            
            caches.open(DATA_CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.warn('Cache put error for API:', err);
                  });
                } catch (err) {
                  console.warn('Cache error for API:', err);
                }
              })
              .catch(err => {
                console.warn('Cache open error for API:', err);
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
                  try {
                    cache.put(event.request, responseToCache).catch(err => {
                      console.warn('Cache put error for other resources:', err);
                    });
                  } catch (err) {
                    console.warn('Cache error for other resources:', err);
                  }
                })
                .catch(err => {
                  console.warn('Cache open error for other resources:', err);
                });
                
              return response;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // Return a default offline page or message
              return new Response('You are offline and this resource is not cached.', {
                status: 503,
                headers: {'Content-Type': 'text/plain'}
              });
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
