
import { YouTubeSearchResponse, convertYouTubeToVideos, VideoCategory } from "@/data/mockVideos";
import { fixYouTubeThumbnailUrl, getFallbackImage, LOCAL_FALLBACK_IMAGES } from "@/utils/imageUtils";
import { toast } from "sonner";

// YouTube API Key
const YOUTUBE_API_KEY = "AIzaSyDjdcmucq9fzu61rfTFbydWwNVuvpgfcXo";
const useYouTubeAPI = true; // Set to true to use real YouTube API

// YouTube API endpoints
const YOUTUBE_SEARCH_API = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

// Helper function to ensure thumbnail URLs always have a fallback
export const getThumbnailUrl = (videoId: string, remoteUrl?: string): string => {
  if (!videoId) {
    console.warn("Invalid video ID provided for thumbnail");
    return LOCAL_FALLBACK_IMAGES[0];
  }
  
  if (useYouTubeAPI && remoteUrl) {
    return remoteUrl;
  }
  
  // Get a local image using the videoId as a seed if remote URL fails
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

// Convert ISO 8601 duration to friendly format (PT1H30M15S to 1:30:15)
const formatDuration = (isoDuration: string): string => {
  try {
    // Simple format conversion for common ISO durations
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";
    
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  } catch (err) {
    console.error("Error formatting duration:", err);
    return "0:00";
  }
};

// Fetch videos from YouTube for a specific category
const fetchYouTubeVideosForCategory = async (categoryName: string, maxResults = 8): Promise<any[]> => {
  try {
    // Search for videos in the category
    const searchQuery = `${categoryName} health education`;
    const searchUrl = `${YOUTUBE_SEARCH_API}?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("YouTube API search error:", data);
      toast.error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
      throw new Error(data.error?.message || "Error fetching videos");
    }
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No results found for '${categoryName}'`);
      return [];
    }
    
    // Extract video IDs for details lookup
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    // Get video details for durations
    const detailsUrl = `${YOUTUBE_VIDEOS_API}?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
      console.error("YouTube API details error:", detailsData);
      throw new Error(detailsData.error?.message || "Error fetching video details");
    }
    
    // Create a map of video IDs to details
    const detailsMap = new Map();
    if (detailsData.items) {
      detailsData.items.forEach((item: any) => {
        detailsMap.set(item.id, {
          duration: formatDuration(item.contentDetails.duration),
          viewCount: item.statistics?.viewCount || "0"
        });
      });
    }
    
    // Combine search results with details
    return data.items.map((item: any) => {
      const videoId = item.id.videoId;
      const details = detailsMap.get(videoId) || { duration: "Preview", viewCount: "0" };
      
      return {
        ...item,
        contentDetails: {
          duration: details.duration
        },
        statistics: {
          viewCount: details.viewCount
        }
      };
    });
  } catch (error) {
    console.error(`Error fetching YouTube videos for '${categoryName}':`, error);
    toast.error(`Failed to load videos for ${categoryName}. Using fallbacks.`);
    return [];
  }
};

export const searchYouTubeVideos = async (query: string, maxResults = 8): Promise<YouTubeSearchResponse> => {
  try {
    if (useYouTubeAPI && YOUTUBE_API_KEY) {
      console.log("Using YouTube Data API to search for:", query);
      const searchUrl = `${YOUTUBE_SEARCH_API}?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Error searching videos");
      }
      
      return data;
    } else {
      console.log("Using mock data for search:", query);
      
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
    }
  } catch (error) {
    console.error("Error in YouTube search:", error);
    toast.error("Search failed. Using cached results.");
    
    // Fall back to mock data on error
    return {
      items: mockCategories
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
        }))
    };
  }
};

export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    if (useYouTubeAPI && YOUTUBE_API_KEY) {
      console.log("Using YouTube Data API to fetch video categories");
      toast.info("Loading videos from YouTube...");
      
      // Define the categories we want to fetch
      const categoriesToFetch = [
        { id: 'chronic', title: 'Chronic Disease Management' },
        { id: 'nutrition', title: 'Nutrition & Wellness' },
      ];
      
      // Fetch videos for each category in parallel
      const categoryPromises = categoriesToFetch.map(async category => {
        const youtubeVideos = await fetchYouTubeVideosForCategory(category.title, 8);
        
        // Convert YouTube response to our Video format
        const videos = youtubeVideos.map((item: any) => {
          const videoId = item.id.videoId;
          const thumbnailUrl = item.snippet.thumbnails?.high?.url || 
                              item.snippet.thumbnails?.medium?.url || 
                              item.snippet.thumbnails?.default?.url;
          
          return {
            id: videoId,
            videoId: videoId,
            title: item.snippet.title,
            thumbnail: thumbnailUrl || getThumbnailUrl(videoId),
            duration: item.contentDetails?.duration || "Preview",
            category: category.title,
            description: item.snippet.description || `Educational video about ${category.title.toLowerCase()}`,
          };
        });
        
        return {
          ...category,
          videos: videos
        };
      });
      
      // Wait for all category fetches to complete
      const loadedCategories = await Promise.all(categoryPromises);
      
      // Log success and return loaded categories
      console.log("Successfully loaded categories:", loadedCategories);
      
      // Check if we actually got videos
      const totalVideos = loadedCategories.reduce((sum, cat) => sum + cat.videos.length, 0);
      
      if (totalVideos > 0) {
        toast.success(`Loaded ${totalVideos} videos from YouTube`);
        return loadedCategories;
      } else {
        // If no videos were found, fall back to mock data
        console.warn("No videos found with YouTube API, using mock data");
        toast.warning("Could not load videos from YouTube. Using sample videos.");
        return mockCategories;
      }
    } else {
      console.log("Using mock video categories due to YouTube API being disabled");
      
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
    }
  } catch (error) {
    console.error("Failed to fetch video categories:", error);
    toast.error("Failed to load videos from YouTube. Using cached data.");
    
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

// Function to control whether to use the YouTube API
export const setUseYouTubeAPI = (useAPI: boolean) => {
  console.log(`YouTube API is now ${useAPI ? 'enabled' : 'disabled'}`);
};

// Import mock categories at the end to avoid circular dependencies
import { mockCategories } from "@/data/mockVideos";

