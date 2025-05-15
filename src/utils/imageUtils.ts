
// Define common fallback images - stored locally to avoid Unsplash hotlink restrictions
export const FALLBACK_IMAGES = [
  "/favicon.ico",
  "/placeholder.svg",
  "/logo-icon.png"
];

// Local uploaded images as additional fallbacks
export const LOCAL_FALLBACK_IMAGES = [
  "/favicon.ico",
  "/placeholder.svg",
  "/logo-icon.png"
];

// YouTube specific fallbacks
export const YOUTUBE_FALLBACK_IMAGES = [
  "/favicon.ico",
  "/placeholder.svg",
  "/logo-icon.png"
];

// Function to safely load images with fallbacks
export const preloadImages = (imageSrcs: string[]): void => {
  // Only preload local images
  const filteredSrcs = imageSrcs.filter(src => {
    // Only preload local images starting with "/" 
    return src.startsWith('/');
  });
  
  filteredSrcs.forEach(src => {
    try {
      const img = new Image();
      img.onload = () => console.log(`Preloaded: ${src}`);
      img.onerror = (e) => {
        console.warn(`Failed to preload local image: ${src}`);
        // Don't treat this as a fatal error
      };
      img.src = src;
    } catch (err) {
      console.warn(`Error preloading image ${src}:`, err);
    }
  });
};

// Get a consistent fallback image based on a string key
export const getFallbackImage = (key: string): string => {
  try {
    // Use a hash of the key to select a consistent fallback image
    const hashCode = Array.from(key).reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use absolute value and modulo to get index
    const index = Math.abs(hashCode) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
  } catch (error) {
    // If any error during hash calculation, return the first fallback
    return FALLBACK_IMAGES[0];
  }
};

// Fix potentially broken YouTube thumbnail URLs
export const fixYouTubeThumbnailUrl = (videoId: string): string => {
  if (!videoId) {
    return FALLBACK_IMAGES[0];
  }
  
  try {
    // Try HTTPS first
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } catch (error) {
    // If that fails, fallback
    console.warn("Error creating YouTube thumbnail URL, using fallback");
    return LOCAL_FALLBACK_IMAGES[0];
  }
};

// General purpose URL fixer for any image URL
export const ensureSecureImageUrl = (url: string): string => {
  if (!url) {
    return FALLBACK_IMAGES[0];
  }
  
  try {
    // If it's a YouTube image URL, ensure HTTPS
    if (url.includes('ytimg.com') || url.includes('youtube.com')) {
      // Convert HTTP to HTTPS for YouTube URLs if needed
      if (url.startsWith('http:')) {
        return url.replace('http:', 'https:');
      }
      return url; // Already HTTPS
    }
    
    // If it's a local URL, make sure it starts correctly
    if (url.startsWith('/lovable-uploads')) {
      return url;
    }
    
    // If it's not a local URL and not YouTube, check if it's HTTPS
    if (!url.startsWith('/')) {
      // If it's HTTP, try to convert to HTTPS
      if (url.startsWith('http:')) {
        return url.replace('http:', 'https:');
      }
      
      // If we can't handle it, use a fallback
      if (!url.startsWith('https:')) {
        return FALLBACK_IMAGES[0];
      }
    }
    
    return url;
  } catch (error) {
    console.warn("Error in ensureSecureImageUrl:", error);
    return FALLBACK_IMAGES[0];
  }
};

// Get the best thumbnail for a video ID using multiple quality options with fallbacks
export const getBestYouTubeThumbnail = (videoId: string): string => {
  if (!videoId || videoId === 'undefined' || videoId === 'null') {
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  try {
    // Try HTTPS for YouTube thumbnails
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } catch (error) {
    console.warn("Error getting YouTube thumbnail:", error);
    return LOCAL_FALLBACK_IMAGES[0];
  }
};
