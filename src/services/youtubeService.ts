
import { YouTubeSearchResponse, convertYouTubeToVideos, VideoCategory, mockCategories } from "@/data/mockVideos";

const API_KEY = "AIzaSyDL6bYbpjR_wWP5c-a5ubI4yTPtwcL_EVs";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// Always try to use the API first
let useYouTubeAPI = true;

export const searchYouTubeVideos = async (query: string, maxResults = 8): Promise<YouTubeSearchResponse> => {
  if (!useYouTubeAPI) {
    console.log("Using mock data due to previous API errors");
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
    // Always try to use the API first
    if (useYouTubeAPI) {
      console.log("Attempting to fetch live YouTube data");
      
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
    } else {
      console.log("Using mock video categories due to previous API errors");
      return mockCategories;
    }
  } catch (error) {
    console.error("Failed to fetch video categories:", error);
    console.warn("Falling back to mock categories due to error");
    
    // Mark the API as unavailable for future requests
    useYouTubeAPI = false;
    
    // Return mock data on error
    return mockCategories;
  }
};

// Function is kept but is now internal only
export const setUseYouTubeAPI = (useAPI: boolean) => {
  useYouTubeAPI = useAPI;
};
