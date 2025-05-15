
import { supabase } from "@/integrations/supabase/client";

/**
 * Array of local fallback images that can be used when external images fail to load
 */
export const LOCAL_FALLBACK_IMAGES = [
  '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
  '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
  '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
  '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png',
  '/logo-icon.png',
  '/placeholder.svg'
];

/**
 * Optimizes image loading by providing a reliable proxy to prevent CORS
 * and MIME type issues during deployment
 */
export const getProxiedImageUrl = async (imageUrl: string) => {
  try {
    // If we're in development, just return the original URL
    if (window.location.hostname === 'localhost') {
      return imageUrl;
    }

    // Check if the URL is already a data URL
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // Check for pre-cached static assets (for PWA)
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      return imageUrl;
    }

    // Use our Supabase Edge Function to proxy the image
    // This prevents CORS issues and ensures proper MIME types
    const { data, error } = await supabase.functions.invoke('asset-proxy', {
      body: { url: imageUrl }
    });

    if (error) {
      console.error('Error proxying image:', error);
      return imageUrl; // Fall back to direct URL if proxy fails
    }

    return data.proxyUrl || imageUrl;
  } catch (e) {
    console.error('Error in getProxiedImageUrl:', e);
    return imageUrl;
  }
};

/**
 * Gets a fallback image if the main image fails to load
 */
export const getFallbackImage = (category: string = 'default'): string => {
  const fallbacks: Record<string, string> = {
    'medicine': '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
    'disease': '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
    'pharmacy': '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
    'lab': '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png',
    'default': '/placeholder.svg'
  };
  
  return fallbacks[category] || fallbacks.default;
};

/**
 * Handles image loading errors by replacing with a fallback image
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, category: string = 'default'): void => {
  const img = event.currentTarget;
  console.log(`Image failed to load: ${img.src}, replacing with fallback`);
  img.src = getFallbackImage(category);
  img.onerror = null; // Prevent infinite loop if fallback also fails
};

/**
 * Gets the best quality YouTube thumbnail URL for a video ID
 */
export const getBestYouTubeThumbnail = (videoId: string): string => {
  if (!videoId) {
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  // Try to get the highest quality thumbnail
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Fixes common issues with YouTube thumbnail URLs
 */
export const fixYouTubeThumbnailUrl = (videoId: string): string => {
  if (!videoId) {
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  // Ensure we use HTTPS and get a reliable format
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Preloads images to ensure they're in the browser cache
 */
export const preloadImages = (imageUrls: string[]): void => {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return;
  }
  
  try {
    imageUrls.forEach(url => {
      if (typeof url === 'string') {
        const img = new Image();
        img.src = url;
      }
    });
  } catch (error) {
    console.warn("Error preloading images:", error);
  }
};
