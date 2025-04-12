
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
    // Get the thumbnail URL from the API response
    let thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url;
    
    // Ensure we're using HTTPS for all thumbnails
    if (thumbnailUrl && thumbnailUrl.startsWith('http:')) {
      thumbnailUrl = thumbnailUrl.replace('http:', 'https:');
    }
    
    // If we don't have a thumbnail URL from the API, construct one
    if (!thumbnailUrl && video.id.videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${video.id.videoId}/hqdefault.jpg`;
    }
    
    return {
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: thumbnailUrl,
      duration: "Preview",
      category,
      description: video.snippet.description,
      videoId: video.id.videoId,
    };
  });
};
