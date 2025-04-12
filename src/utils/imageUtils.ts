
// Define common fallback images
export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=480&q=80"
];

// Local uploaded images as additional fallbacks
export const LOCAL_FALLBACK_IMAGES = [
  "/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png",
  "/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png",
  "/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png",
  "/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png"
];

// YouTube specific fallbacks
export const YOUTUBE_FALLBACK_IMAGES = [
  "https://img.youtube.com/vi/default/hqdefault.jpg",
  "https://i.ytimg.com/vi/default/hqdefault.jpg"
];

// Function to preload images to ensure they're in browser cache
export const preloadImages = (imageSrcs: string[]): void => {
  imageSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => console.log(`Preloaded: ${src}`);
    img.onerror = () => console.warn(`Failed to preload: ${src}`);
  });
};

// Get a consistent fallback image based on a string key
export const getFallbackImage = (key: string): string => {
  // Use a hash of the key to select a consistent fallback image
  const hashCode = key.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hashCode) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
};

// Fix potentially broken YouTube thumbnail URLs
export const fixYouTubeThumbnailUrl = (videoId: string): string => {
  if (!videoId) {
    return getFallbackImage('default');
  }
  
  // Ensure we're using the correct format and HTTPS
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// General purpose URL fixer for any image URL
export const ensureSecureImageUrl = (url: string): string => {
  if (!url) {
    return getFallbackImage('default');
  }
  
  // If it's a relative URL, make it absolute
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it doesn't start with http or https, assume it's relative
  if (!url.startsWith('http')) {
    return `/${url}`;
  }
  
  // Ensure we're using HTTPS
  return url.replace('http:', 'https:');
};
