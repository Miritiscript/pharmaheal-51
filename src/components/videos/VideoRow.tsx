
import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video, VideoCategory } from '@/data/mockVideos';
import { useTheme } from 'next-themes';

interface VideoRowProps {
  category: VideoCategory;
  onVideoClick: (video: Video) => void;
}

const VideoRow: React.FC<VideoRowProps> = ({ category, onVideoClick }) => {
  const { theme } = useTheme();
  
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
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
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
