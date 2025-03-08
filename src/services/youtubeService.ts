
import { YouTubeSearchResponse, convertYouTubeToVideos, VideoCategory } from "@/data/mockVideos";

const API_KEY = "AIzaSyDL6bYbpjR_wWP5c-a5ubI4yTPtwcL_EVs";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export const searchYouTubeVideos = async (query: string, maxResults = 8): Promise<YouTubeSearchResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}&type=video&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw new Error(`Error fetching YouTube videos: ${error}`);
  }
};

export const fetchVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
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
    throw new Error(`Failed to fetch video categories: ${error}`);
  }
};
