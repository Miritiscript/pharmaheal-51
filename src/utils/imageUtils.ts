
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
  // Only preload local images
  const filteredSrcs = imageSrcs.filter(src => {
    // Only preload local images starting with "/" 
    return src.startsWith('/');
  });
  
  filteredSrcs.forEach(src => {
    const img = new Image();
    img.onload = () => console.log(`Preloaded: ${src}`);
    img.onerror = (e) => console.error(`Failed to preload local image: ${src}`, e);
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
  
  try {
    // Try to construct a valid YouTube thumbnail URL
    const ytThumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // Return the YouTube thumbnail URL first, with local fallback in the component's onError
    return ytThumbnailUrl;
  } catch (error) {
    console.error("Error creating YouTube thumbnail URL:", error);
    // Get a local fallback image as backup
    const hashCode = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hashCode) % LOCAL_FALLBACK_IMAGES.length;
    return LOCAL_FALLBACK_IMAGES[index];
  }
};

// General purpose URL fixer for any image URL
export const ensureSecureImageUrl = (url: string): string => {
  if (!url) {
    return FALLBACK_IMAGES[0];
  }
  
  // If it's a YouTube image URL
  if (url.includes('ytimg.com') || url.includes('youtube.com')) {
    return url; // YouTube URLs are already HTTPS
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
};

// Get the best thumbnail for a video ID based on available formats
export const getBestYouTubeThumbnail = (videoId: string): string => {
  if (!videoId || videoId === 'undefined' || videoId === 'null') {
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  // Try several thumbnail qualities in order
  const thumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // HD quality if available
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // High quality
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // Medium quality
    `https://img.youtube.com/vi/${videoId}/default.jpg` // Default quality
  ];
  
  // Return the highest quality URL - the component will handle fallback if it fails
  return thumbnailUrls[0];
};

