import React, { useState, useEffect } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video, VideoCategory } from '@/data/mockVideos';
import { useTheme } from 'next-themes';
import { getThumbnailUrl, validateVideoId } from '@/services/youtubeService';
import { 
  getFallbackImage, 
  FALLBACK_IMAGES, 
  LOCAL_FALLBACK_IMAGES, 
  preloadImages 
} from '@/utils/imageUtils';

interface VideoRowProps {
  category: VideoCategory;
  onVideoClick: (video: Video) => void;
}

const VideoRow: React.FC<VideoRowProps> = ({ category, onVideoClick }) => {
  const { theme } = useTheme();
  
  // Track which images have failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // Preload all fallback images to ensure they're in cache
  useEffect(() => {
    // Preload unsplash fallbacks
    preloadImages(FALLBACK_IMAGES);
    
    // Preload local fallbacks
    preloadImages(LOCAL_FALLBACK_IMAGES);
    
    // Preload for this category's videos
    const videoThumbnails = category.videos.map(video => video.thumbnail);
    preloadImages(videoThumbnails);
  }, [category]);
  
  const handleImageError = (videoId: string) => {
    console.warn(`Failed to load thumbnail for video: ${videoId}`);
    setFailedImages(prev => ({
      ...prev,
      [videoId]: true
    }));
  };
  
  // Function to get the best possible thumbnail URL
  const getBestThumbnailUrl = (video: Video): string => {
    // If image already failed, use fallback
    if (failedImages[video.videoId]) {
      // Try a local fallback first
      const localIndex = Math.abs(video.videoId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) % LOCAL_FALLBACK_IMAGES.length);
      
      return LOCAL_FALLBACK_IMAGES[localIndex];
    }
    
    // If thumbnail doesn't start with https or http, it might be a relative path
    if (!video.thumbnail.startsWith('http')) {
      // Check if it's an absolute path
      if (video.thumbnail.startsWith('/')) {
        return video.thumbnail;
      }
      // Otherwise treat as a relative path
      return `/${video.thumbnail}`;
    }
    
    // For YouTube videos, ensure we're using the proper URL format
    if (validateVideoId(video.videoId) && video.thumbnail.includes('youtube')) {
      return getThumbnailUrl(video.videoId);
    }
    
    // Ensure we're using HTTPS not HTTP
    return video.thumbnail.replace('http:', 'https:');
  };
  
  return (
    <div className="mb-8 transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-healing-400' : 'text-pharma-600'}`}>
          {category.title}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-primary group transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/10' : ''}`}
        >
          See all <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar">
        {category.videos.map((video) => (
          <div 
            key={video.id}
            className={`glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex-shrink-0 w-64 ${
              theme === 'dark' ? 'bg-gray-900/80 border-gray-800/40' : ''
            }`}
            onClick={() => onVideoClick(video)}
            aria-label={`Play ${video.title}`}
          >
            <div className="relative aspect-video">
              <img 
                src={getBestThumbnailUrl(video)}
                alt={`Thumbnail for ${video.title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => handleImageError(video.videoId)}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors duration-300">{video.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRow;
