
import { fixYouTubeThumbnailUrl, getFallbackImage, LOCAL_FALLBACK_IMAGES } from "@/utils/imageUtils";

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  description?: string;
  videoId: string;
  views?: string;
  channelTitle?: string;
}

export interface VideoCategory {
  id: string;
  title: string;
  videos: Video[];
}

// Get fallback image by category or index
export const getFallbackImageByCategory = (category: string): string => {
  const index = Math.abs(category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) % LOCAL_FALLBACK_IMAGES.length);
  
  return LOCAL_FALLBACK_IMAGES[index];
};

export const mockCategories: VideoCategory[] = [
  {
    id: 'chronic',
    title: 'Chronic Disease Management',
    videos: [
      {
        id: 'chron1',
        videoId: 'chron1',
        title: 'Understanding Diabetes: Symptoms, Causes and Management',
        thumbnail: '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png',
        duration: '10:15',
        category: 'Chronic Disease Management',
        description: 'Learn about diabetes symptoms, causes, and effective management strategies for a healthier life.'
      },
      {
        id: 'chron2',
        videoId: 'chron2',
        title: 'Hypertension: The Silent Killer and How to Combat It',
        thumbnail: '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
        duration: '08:45',
        category: 'Chronic Disease Management',
        description: 'Discover the dangers of high blood pressure and evidence-based approaches to manage it effectively.'
      },
      {
        id: 'chron3',
        videoId: 'chron3',
        title: 'Heart Health: Understanding Coronary Artery Disease',
        thumbnail: '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
        duration: '12:30',
        category: 'Chronic Disease Management',
        description: 'A comprehensive guide to coronary artery disease, risk factors, and preventive measures.'
      },
      {
        id: 'chron4',
        videoId: 'chron4',
        title: 'Managing Asthma: Triggers, Treatment and Prevention',
        thumbnail: '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
        duration: '09:20',
        category: 'Chronic Disease Management',
        description: 'Learn how to identify asthma triggers and develop an effective management plan.'
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Wellness',
    videos: [
      {
        id: 'nutr1',
        videoId: 'nutr1',
        title: 'The Power of Plant-Based Eating',
        thumbnail: '/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png',
        duration: '11:05',
        category: 'Nutrition & Wellness',
        description: 'Explore the health benefits of incorporating more plant-based foods into your diet.'
      },
      {
        id: 'nutr2',
        videoId: 'nutr2',
        title: 'Understanding Macronutrients: Protein, Carbs and Fat',
        thumbnail: '/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png',
        duration: '14:25',
        category: 'Nutrition & Wellness',
        description: 'A deep dive into macronutrients and how to balance them for optimal health.'
      },
      {
        id: 'nutr3',
        videoId: 'nutr3',
        title: 'Mindful Eating: A Path to Better Health',
        thumbnail: '/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png',
        duration: '07:15',
        category: 'Nutrition & Wellness',
        description: 'Learn techniques for mindful eating to improve your relationship with food.'
      },
      {
        id: 'nutr4',
        videoId: 'nutr4',
        title: 'Superfoods: Separating Facts from Fiction',
        thumbnail: '/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png',
        duration: '13:40',
        category: 'Nutrition & Wellness',
        description: 'An evidence-based look at superfoods and their actual health benefits.'
      }
    ]
  }
];

// YouTube API types
export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

// Convert YouTube API response to our Video type with improved thumbnail handling
export const convertYouTubeToVideos = (
  youtubeVideos: YouTubeVideo[], 
  category: string
): Video[] => {
  return youtubeVideos.map((video) => {
    // Ensure videoId is valid
    const videoId = video.id.videoId;
    if (!videoId) {
      console.warn("Missing videoId in YouTube response");
    }
    
    // Get the best thumbnail URL
    const thumbnailUrl = video.snippet.thumbnails?.high?.url || 
                         video.snippet.thumbnails?.medium?.url ||
                         fixYouTubeThumbnailUrl(videoId);
    
    return {
      id: videoId || `fallback-${Math.random().toString(36).substring(2, 9)}`,
      title: video.snippet.title,
      thumbnail: thumbnailUrl,
      duration: video.contentDetails?.duration || "Preview",
      category,
      description: video.snippet.description,
      videoId: videoId || "",
      views: video.statistics?.viewCount,
      channelTitle: video.snippet.channelTitle
    };
  });
};

