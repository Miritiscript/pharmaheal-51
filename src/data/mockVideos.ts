
import { fixYouTubeThumbnailUrl, getFallbackImage } from "@/utils/imageUtils";

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  description?: string;
  videoId: string;
}

export interface VideoCategory {
  id: string;
  title: string;
  videos: Video[];
}

// Fallback thumbnails for different categories
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=480&q=80"
];

// Get fallback image by category or index
export const getFallbackImageByCategory = (category: string): string => {
  const index = Math.abs(category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) % FALLBACK_IMAGES.length);
  
  return FALLBACK_IMAGES[index];
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
        thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '10:15',
        category: 'Chronic Disease Management',
        description: 'Learn about diabetes symptoms, causes, and effective management strategies for a healthier life.'
      },
      {
        id: 'chron2',
        videoId: 'chron2',
        title: 'Hypertension: The Silent Killer and How to Combat It',
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '08:45',
        category: 'Chronic Disease Management',
        description: 'Discover the dangers of high blood pressure and evidence-based approaches to manage it effectively.'
      },
      {
        id: 'chron3',
        videoId: 'chron3',
        title: 'Heart Health: Understanding Coronary Artery Disease',
        thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '12:30',
        category: 'Chronic Disease Management',
        description: 'A comprehensive guide to coronary artery disease, risk factors, and preventive measures.'
      },
      {
        id: 'chron4',
        videoId: 'chron4',
        title: 'Managing Asthma: Triggers, Treatment and Prevention',
        thumbnail: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
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
        thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '11:05',
        category: 'Nutrition & Wellness',
        description: 'Explore the health benefits of incorporating more plant-based foods into your diet.'
      },
      {
        id: 'nutr2',
        videoId: 'nutr2',
        title: 'Understanding Macronutrients: Protein, Carbs and Fat',
        thumbnail: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '14:25',
        category: 'Nutrition & Wellness',
        description: 'A deep dive into macronutrients and how to balance them for optimal health.'
      },
      {
        id: 'nutr3',
        videoId: 'nutr3',
        title: 'Mindful Eating: A Path to Better Health',
        thumbnail: 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        duration: '07:15',
        category: 'Nutrition & Wellness',
        description: 'Learn techniques for mindful eating to improve your relationship with food.'
      },
      {
        id: 'nutr4',
        videoId: 'nutr4',
        title: 'Superfoods: Separating Facts from Fiction',
        thumbnail: 'https://images.unsplash.com/photo-1563411547232-7e88f7e79296?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
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
    
    // Get a secure thumbnail URL
    let thumbnailUrl = '';
    
    // First try to get it from the API response
    if (video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url) {
      thumbnailUrl = (video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url)
        .replace('http:', 'https:'); // Always use HTTPS
    } 
    // If that fails, construct it from videoId
    else if (videoId) {
      thumbnailUrl = fixYouTubeThumbnailUrl(videoId);
    } 
    // If all else fails, use a category-based fallback
    else {
      thumbnailUrl = getFallbackImageByCategory(category);
    }
    
    return {
      id: videoId || `fallback-${Math.random().toString(36).substring(2, 9)}`,
      title: video.snippet.title,
      thumbnail: thumbnailUrl,
      duration: "Preview",
      category,
      description: video.snippet.description,
      videoId: videoId || "",
    };
  });
};
