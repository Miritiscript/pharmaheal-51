
import { YouTubeSearchResponse, convertYouTubeToVideos, VideoCategory, mockCategories } from "@/data/mockVideos";
import { fixYouTubeThumbnailUrl, getFallbackImage, LOCAL_FALLBACK_IMAGES } from "@/utils/imageUtils";
import { toast } from "sonner";

// Always use mock data since YouTube API has quota issues
const useYouTubeAPI = false;

// Helper function to ensure thumbnail URLs always use local images
export const getThumbnailUrl = (videoId: string): string => {
  if (!videoId) {
    console.warn("Invalid video ID provided for thumbnail");
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  // Get a local image using the videoId as a seed
  const hashCode = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hashCode) % LOCAL_FALLBACK_IMAGES.length;
  return LOCAL_FALLBACK_IMAGES[index];
};

// Validate videoId to ensure it's in the correct format
export const validateVideoId = (videoId: string): boolean => {
  // YouTube video IDs are typically 11 characters
  return Boolean(videoId && videoId.length >= 5 && videoId.length <= 20);
};

export const searchYouTubeVideos = async (query: string, maxResults = 8): Promise<YouTubeSearchResponse> => {
  console.log("Using mock data due to YouTube API quota issues");
  
  // Create a mock response based on query
  const mockItems = mockCategories
    .flatMap(cat => cat.videos)
    .filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) || 
      video.description?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxResults)
    .map(video => ({
      id: { videoId: video.videoId },
      snippet: {
        title: video.title,
        description: video.description || "",
        thumbnails: {
          high: { url: getThumbnailUrl(video.videoId) },
          medium: { url: getThumbnailUrl(video.videoId) }
        },
        channelTitle: "Health Channel",
        publishedAt: new Date().toISOString()
      }
    }));
  
  return { items: mockItems };
};

export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    console.log("Using mock video categories due to YouTube API quota issues");
    
    // We're going to use the mock data but ensure all thumbnails are local files
    const categoriesWithLocalImages = mockCategories.map(category => {
      return {
        ...category,
        videos: category.videos.map(video => {
          return {
            ...video,
            thumbnail: getThumbnailUrl(video.videoId)
          };
        })
      };
    });
    
    // Simulate a slight delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success("Demo videos loaded successfully");
    return categoriesWithLocalImages;
  } catch (error) {
    console.error("Failed to fetch video categories:", error);
    toast.error("Failed to load videos. Using cached data.");
    
    // Return mock data with local images on error
    return mockCategories.map(category => {
      return {
        ...category,
        videos: category.videos.map(video => {
          return {
            ...video,
            thumbnail: getThumbnailUrl(video.videoId)
          };
        })
      };
    });
  }
};

// Ensure export for control function
export const setUseYouTubeAPI = (useAPI: boolean) => {
  // This function is kept for backward compatibility but has no effect now
  console.log("YouTube API is disabled due to quota issues");
};
