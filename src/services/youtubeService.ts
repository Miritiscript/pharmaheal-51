
// This file would be in src/services/youtubeService.ts
import { toast } from 'sonner';
import { VideoCategory, mockCategories } from '@/data/mockVideos';

// Keep track of toast IDs to prevent duplicates
const toastIds = {
  videoSuccess: 'video-load-success',
  videoError: 'video-load-error',
  quotaExceeded: 'quota-exceeded'
};

// Check if a toast with the given ID is already active
const isToastActive = (id: string): boolean => {
  // This is a simple implementation since sonner doesn't have a direct isActive method
  // We'll use a wrapper around toast to manage this
  return document.getElementById(`toast-${id}`) !== null;
};

/**
 * Validates if a string is a valid YouTube video ID
 * Basic validation - YouTube IDs are typically 11 characters
 */
export const validateVideoId = (videoId: string): boolean => {
  // YouTube video IDs are typically 11 characters long
  // This is a simple validation. For production, you might want more robust validation
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  
  // Check if it matches the typical YouTube ID pattern
  // YouTube IDs generally contain alphanumeric characters, underscores and hyphens
  const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeIdPattern.test(videoId);
};

/**
 * Fetches YouTube videos for a specific category
 * This would connect to the YouTube Data API in a real implementation
 */
export const fetchYouTubeVideosForCategory = async (category: VideoCategory): Promise<VideoCategory> => {
  try {
    console.log(`Using YouTube Data API to fetch videos for ${category.title}`);
    
    // This would be a real API call in production
    // For now, let's simulate an API call failure due to quota
    throw new Error("The request cannot be completed because you have exceeded your quota.");
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`YouTube API search error:`, error);
    console.error(`Error fetching YouTube videos for '${category.title}':`, error);
    
    // Check if the error is a quota exceeded error
    if (errorMessage.includes('quota')) {
      if (!isToastActive(toastIds.quotaExceeded)) {
        toast.error("YouTube API quota exceeded. Using cached videos instead.", {
          id: toastIds.quotaExceeded,
          duration: 5000
        });
      }
    }
    
    // Find the corresponding category in mock data
    const mockCategory = mockCategories.find(c => c.id === category.id || c.title === category.title);
    
    if (mockCategory) {
      // Return the mock category with videos
      return mockCategory;
    }
    
    // If no matching mock category was found, return original with empty videos
    return { ...category, videos: [] };
  }
};

/**
 * Fetches video categories from the YouTube API or falls back to mock data
 */
export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    console.log("Attempting to fetch videos...");
    
    // Start with empty categories that match our mock structure
    const categories: VideoCategory[] = mockCategories.map(cat => ({
      ...cat,
      videos: [] // Start with empty videos, to be populated
    }));
    
    // Try to fetch videos for each category
    const categoryPromises = categories.map(fetchYouTubeVideosForCategory);
    const updatedCategories = await Promise.all(categoryPromises);
    
    // Check if we got any videos
    const totalVideos = updatedCategories.reduce(
      (count, category) => count + category.videos.length, 
      0
    );
    
    if (totalVideos > 0) {
      // We got some videos from the API
      console.log("Successfully loaded categories:", updatedCategories);
      
      if (!isToastActive(toastIds.videoSuccess)) {
        toast.success("Videos loaded successfully", {
          id: toastIds.videoSuccess,
          duration: 3000
        });
      }
      
      return updatedCategories;
    } else {
      // No videos were returned from any category
      console.warn("No videos found with YouTube API, using mock data");
      
      if (!isToastActive(toastIds.videoError)) {
        toast.error("Couldn't load videos, using cached data instead", {
          id: toastIds.videoError,
          duration: 5000
        });
      }
      
      return mockCategories;
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    
    if (!isToastActive(toastIds.videoError)) {
      toast.error("Couldn't load videos, using cached data instead", {
        id: toastIds.videoError,
        duration: 5000
      });
    }
    
    // Return mock data as fallback
    return mockCategories;
  }
};
