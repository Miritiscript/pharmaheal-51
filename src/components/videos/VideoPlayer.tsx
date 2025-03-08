
import React from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video } from '@/data/mockVideos';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
  relatedVideos: Video[];
  onVideoClick: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose, relatedVideos, onVideoClick }) => {
  if (!video) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={onClose}
      >
        &larr; Back to videos
      </Button>
      
      <div className="glass-card overflow-hidden">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&start=0&end=60`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
          <p className="text-sm text-muted-foreground">{video.category} • {video.duration}</p>
          <div className="mt-4 text-sm">
            <p>{video.description || "This video provides educational information about health topics. Watch the full video on YouTube for complete information."}</p>
            <Button 
              className="flex items-center mt-4"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
            >
              Watch Full Video <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">You might also like</h3>
        <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar">
          {relatedVideos.slice(0, 4).map((relVideo) => (
            <div 
              key={relVideo.id}
              className="glass-card overflow-hidden group cursor-pointer transition-all hover:shadow-md flex-shrink-0 w-64"
              onClick={() => onVideoClick(relVideo)}
            >
              <div className="relative aspect-video">
                <img 
                  src={relVideo.thumbnail} 
                  alt={relVideo.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                  {relVideo.duration}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium line-clamp-2">{relVideo.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{relVideo.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
