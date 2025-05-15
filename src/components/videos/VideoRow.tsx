import * as React from 'react';
import { useState, useEffect } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video, VideoCategory } from '@/data/mockVideos';
import { useTheme } from '@/components/theme/ThemeProvider';
import { validateVideoId } from '@/services/youtubeService';
import { 
  getBestYouTubeThumbnail,
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
  
  // Preload all locally available images to ensure they're in cache
  useEffect(() => {
    // Preload local fallbacks but don't make this operation block rendering
    try {
      preloadImages(LOCAL_FALLBACK_IMAGES);
    } catch (error) {
      console.warn("Error preloading images:", error);
    }
  }, []);
  
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
      // Use a local fallback image
      return "/logo-icon.png";
    }
    
    // If it's a YouTube video ID, try to get the best thumbnail
    if (validateVideoId(video.videoId)) {
      // If custom thumbnail is already a YouTube URL, use it
      if (video.thumbnail && (
          video.thumbnail.includes('ytimg.com') || 
          video.thumbnail.includes('youtube.com')
      )) {
        return video.thumbnail;
      }
      
      // Otherwise, generate a proper YouTube thumbnail URL
      try {
        return getBestYouTubeThumbnail(video.videoId);
      } catch (error) {
        console.warn("Error getting YouTube thumbnail:", error);
        return "/logo-icon.png";
      }
    }
    
    // If thumbnail doesn't start with https or http, it might be a relative path
    if (video.thumbnail && !video.thumbnail.startsWith('http')) {
      // Check if it's an absolute path
      if (video.thumbnail.startsWith('/')) {
        return video.thumbnail;
      }
      // Otherwise treat as a relative path
      return `/${video.thumbnail}`;
    }
    
    // If all else fails, use a local fallback
    if (!video.thumbnail) {
      return "/logo-icon.png";
    }
    
    // Otherwise use the provided thumbnail
    return video.thumbnail;
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
              <p className="text-xs text-muted-foreground mt-1">
                {video.channelTitle || video.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRow;
