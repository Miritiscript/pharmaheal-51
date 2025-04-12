
import React, { useState } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video, VideoCategory } from '@/data/mockVideos';
import { useTheme } from 'next-themes';

// Array of fallback images from Unsplash for different categories
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=480&q=80"
];

interface VideoRowProps {
  category: VideoCategory;
  onVideoClick: (video: Video) => void;
}

const VideoRow: React.FC<VideoRowProps> = ({ category, onVideoClick }) => {
  const { theme } = useTheme();
  
  // Track which images have failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  const handleImageError = (videoId: string) => {
    setFailedImages(prev => ({
      ...prev,
      [videoId]: true
    }));
    console.warn(`Failed to load thumbnail for video: ${videoId}`);
  };
  
  // Function to get a fallback image based on video ID
  const getFallbackImage = (videoId: string) => {
    // Use a hash of the videoId to select a consistent fallback image
    const hashCode = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use absolute value and modulo to get index
    const index = Math.abs(hashCode) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
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
                src={failedImages[video.videoId] 
                  ? getFallbackImage(video.videoId) 
                  : video.thumbnail.replace('http:', 'https:')}
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
