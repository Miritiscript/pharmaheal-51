
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

  const searchTerm = query.toLowerCase();

  // Search through videos
  if (data.videos) {
    data.videos.forEach(category => {
      const matchingVideos = category.videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) || 
        video.description.toLowerCase().includes(searchTerm) ||
        video.category.toLowerCase().includes(searchTerm)
      );
      results.videos = [...results.videos, ...matchingVideos];
    });
  }

  // Search through chat history
  if (data.chatHistory) {
    results.chatMessages = data.chatHistory.filter(message => 
      message.content.toLowerCase().includes(searchTerm)
    );
  }

  return results;
};

// Function to filter videos by category
export const filterVideosByCategory = (videos: VideoCategory[], categoryId: string): Video[] => {
  const category = videos.find(cat => cat.id === categoryId);
  return category ? category.videos : [];
};
