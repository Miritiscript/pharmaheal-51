
import { Video, VideoCategory } from "@/data/mockVideos";
import { Message } from "@/components/chatbot/types";

// Unified search function that can search across different data types
export const searchContent = (query: string, data: {
  videos?: VideoCategory[],
  chatHistory?: Message[]
}) => {
  const results: {
    videos: Video[],
    chatMessages: Message[]
  } = {
    videos: [],
    chatMessages: []
  };

  if (!query.trim()) {
    return results;
  }

  // Normalize search term (lowercase, trim whitespace)
  const searchTerm = query.toLowerCase().trim();
  
  // Split into keywords for more effective searching
  const keywords = searchTerm.split(/\s+/).filter(Boolean);

  // Search through videos
  if (data.videos) {
    data.videos.forEach(category => {
      const matchingVideos = category.videos.filter(video => {
        // Check title, description and category
        const titleMatch = video.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = video.description?.toLowerCase().includes(searchTerm);
        const categoryMatch = video.category.toLowerCase().includes(searchTerm);
        
        // Try keywords matching if direct phrase match fails
        const keywordMatch = keywords.length > 1 && keywords.some(keyword => 
          video.title.toLowerCase().includes(keyword) || 
          (video.description?.toLowerCase().includes(keyword) || false) ||
          video.category.toLowerCase().includes(keyword)
        );
        
        return titleMatch || descriptionMatch || categoryMatch || keywordMatch;
      });
      
      results.videos = [...results.videos, ...matchingVideos];
    });
  }

  // Search through chat history
  if (data.chatHistory) {
    results.chatMessages = data.chatHistory.filter(message => 
      message.content.toLowerCase().includes(searchTerm) ||
      (keywords.length > 1 && keywords.some(keyword => 
        message.content.toLowerCase().includes(keyword)
      ))
    );
  }
  
  // Remove duplicates from results (by id)
  results.videos = [...new Map(results.videos.map(v => [v.id, v])).values()];

  return results;
};

// Function to filter videos by category
export const filterVideosByCategory = (videos: VideoCategory[], categoryId: string): Video[] => {
  const category = videos.find(cat => cat.id === categoryId);
  return category ? category.videos : [];
};

// Search videos by text
export const searchVideosByText = (videos: VideoCategory[], query: string): VideoCategory[] => {
  if (!query.trim()) {
    return videos;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Create filtered categories containing only matching videos
  return videos.map(category => {
    const matchingVideos = category.videos.filter(video => 
      video.title.toLowerCase().includes(searchTerm) || 
      video.description?.toLowerCase().includes(searchTerm) ||
      video.category.toLowerCase().includes(searchTerm)
    );
    
    return {
      ...category,
      videos: matchingVideos
    };
  }).filter(category => category.videos.length > 0); // Only return categories with matches
};
