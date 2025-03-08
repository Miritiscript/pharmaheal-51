
import React from 'react';

const VideoSkeleton: React.FC = () => {
  return (
    <div className="mb-8 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-muted rounded w-48"></div>
        <div className="h-6 bg-muted rounded w-24"></div>
      </div>
      <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar">
        {Array.from({ length: 4 }).map((_, index) => (
          <div 
            key={index}
            className="glass-card overflow-hidden flex-shrink-0 w-64"
          >
            <div className="relative aspect-video bg-muted"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSkeleton;
