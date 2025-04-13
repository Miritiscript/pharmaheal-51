
// This file would be in src/services/youtubeService.ts
import { toast } from 'sonner';
import { VideoCategory, mockCategories } from '@/data/mockVideos';

// Keep track of toast IDs to prevent duplicates
const toastIds = {
  videoSuccess: 'video-load-success',
  videoError: 'video-load-error'
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
 * Fetches video categories from the YouTube API or falls back to mock data
 */
export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    console.log("Attempting to fetch videos...");
    
    // In a real implementation, you would make an API call here
    // For now, we'll simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful API response with mock data
    // In production, you would replace this with actual API calls
    
    if (!isToastActive(toastIds.videoSuccess)) {
      // Use toast ID to prevent duplicates
      toast.success("Videos loaded successfully", {
        id: toastIds.videoSuccess,
        duration: 3000
      });
    }
    
    return mockCategories;
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
