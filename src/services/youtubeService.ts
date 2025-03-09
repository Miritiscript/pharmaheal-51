
import { YouTubeSearchResponse, convertYouTubeToVideos, VideoCategory, mockCategories } from "@/data/mockVideos";

const API_KEY = "AIzaSyDL6bYbpjR_wWP5c-a5ubI4yTPtwcL_EVs";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// Flag to control API usage - set to false by default to avoid quota issues
let useYouTubeAPI = false;

// Function to toggle API usage
export const setUseYouTubeAPI = (useAPI: boolean) => {
  useYouTubeAPI = useAPI;
};

export const searchYouTubeVideos = async (query: string, maxResults = 8): Promise<YouTubeSearchResponse> => {
  // If we're not using the API, return a mock response
  if (!useYouTubeAPI) {
    console.log("Using mock data instead of YouTube API to avoid quota issues");
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
            high: { url: video.thumbnail },
            medium: { url: video.thumbnail }
          },
          channelTitle: "Health Channel",
          publishedAt: new Date().toISOString()
        }
      }));
    
    return { items: mockItems };
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}&type=video&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      
      // If we hit quota limit, switch to mock data for future requests
      if (errorData.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
        console.warn("YouTube API quota exceeded, switching to mock data for future requests");
        useYouTubeAPI = false;
        return searchYouTubeVideos(query, maxResults); // Retry with mock data
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    
    // Always fall back to mock data on error
    console.warn("Falling back to mock data due to YouTube API error");
    useYouTubeAPI = false;
    return searchYouTubeVideos(query, maxResults); // Retry with mock data
  }
};

export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    // If we're not using the API, return mock categories directly
    if (!useYouTubeAPI) {
      console.log("Using mock video categories instead of YouTube API");
      return mockCategories;
    }
    
    // Fetch chronic disease management videos
    const diabetesResponse = await searchYouTubeVideos("diabetes management guide");
    const heartDiseaseResponse = await searchYouTubeVideos("heart disease prevention");
    
    // Fetch nutrition & wellness videos
    const nutritionResponse = await searchYouTubeVideos("healthy nutrition guide");
    const wellnessResponse = await searchYouTubeVideos("wellness tips health");
    
    // Combine results into categories
    const categories: VideoCategory[] = [
      {
        id: "chronic",
        title: "Chronic Disease Management",
        videos: [
          ...convertYouTubeToVideos(diabetesResponse.items, "Chronic Disease Management"),
          ...convertYouTubeToVideos(heartDiseaseResponse.items, "Chronic Disease Management"),
        ],
      },
      {
        id: "nutrition",
        title: "Nutrition & Wellness",
        videos: [
          ...convertYouTubeToVideos(nutritionResponse.items, "Nutrition & Wellness"),
          ...convertYouTubeToVideos(wellnessResponse.items, "Nutrition & Wellness"),
        ],
      },
    ];
    
    return categories;
  } catch (error) {
    console.error("Failed to fetch video categories:", error);
    console.warn("Falling back to mock categories due to error");
    
    // Always fall back to mock data on error
    return mockCategories;
  }
};
