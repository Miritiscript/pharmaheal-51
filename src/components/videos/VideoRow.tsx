
import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video, VideoCategory } from '@/data/mockVideos';

interface VideoRowProps {
  category: VideoCategory;
  onVideoClick: (video: Video) => void;
}

const VideoRow: React.FC<VideoRowProps> = ({ category, onVideoClick }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{category.title}</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          See all <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar">
        {category.videos.map((video) => (
          <div 
            key={video.id}
            className="glass-card overflow-hidden group cursor-pointer transition-all hover:shadow-md flex-shrink-0 w-64"
            onClick={() => onVideoClick(video)}
          >
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium line-clamp-2">{video.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRow;
