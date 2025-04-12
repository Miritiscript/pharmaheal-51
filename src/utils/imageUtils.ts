
// Define common fallback images - stored locally to avoid Unsplash hotlink restrictions
export const FALLBACK_IMAGES = [
  "/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png",
  "/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png",
  "/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png",
  "/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png"
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
  "/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png",
  "/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png"
];

// Function to safely load images with fallbacks
export const preloadImages = (imageSrcs: string[]): void => {
  // Only preload images that are local or absolutely essential
  const filteredSrcs = imageSrcs.filter(src => {
    // Only preload local images starting with "/" or essential ones
    return src.startsWith('/') || src.includes('lovable-uploads');
  });
  
  filteredSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
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
    return FALLBACK_IMAGES[0];
  }
  
  // Try multiple YouTube thumbnail formats to maximize compatibility
  const formats = [
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
  ];
  
  // Use a hash to select a consistent format for this video
  const hashCode = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hashCode) % formats.length;
  
  // Return a YouTube URL format that might work better
  return formats[index];
};

// General purpose URL fixer for any image URL
export const ensureSecureImageUrl = (url: string): string => {
  if (!url) {
    return FALLBACK_IMAGES[0];
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

// Get the best thumbnail for a video ID based on available formats
export const getBestYouTubeThumbnail = (videoId: string): string => {
  if (!videoId || videoId === 'undefined' || videoId === 'null') {
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  // Try proxied or alternative format
  return fixYouTubeThumbnailUrl(videoId);
};
