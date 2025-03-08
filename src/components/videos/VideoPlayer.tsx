
import React from 'react';
import { ExternalLink, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video } from '@/data/mockVideos';
import { useTheme } from 'next-themes';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
  relatedVideos: Video[];
  onVideoClick: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose, relatedVideos, onVideoClick }) => {
  const { theme } = useTheme();
  
  if (!video) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 group"
        onClick={onClose}
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" /> 
        Back to videos
      </Button>
      
      <div className={`glass-card overflow-hidden transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-900/80 border-gray-800/40' : ''
      }`}>
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
        <div className="p-4 lg:p-6">
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : ''
          }`}>{video.title}</h2>
          <p className="text-sm text-muted-foreground">{video.category} • {video.duration}</p>
          <div className="mt-4 text-sm">
            <p>{video.description || "This video provides educational information about health topics. Watch the full video on YouTube for complete information."}</p>
            <Button 
              className="flex items-center mt-4 bg-pharma-600 hover:bg-pharma-700 text-white transition-colors duration-300"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
            >
              Watch Full Video <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-healing-400' : 'text-pharma-600'
        }`}>You might also like</h3>
        <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar">
          {relatedVideos.slice(0, 4).map((relVideo) => (
            <div 
              key={relVideo.id}
              className={`glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex-shrink-0 w-64 ${
                theme === 'dark' ? 'bg-gray-900/80 border-gray-800/40' : ''
              }`}
              onClick={() => onVideoClick(relVideo)}
            >
              <div className="relative aspect-video">
                <img 
                  src={relVideo.thumbnail} 
                  alt={relVideo.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                  {relVideo.duration}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors duration-300">{relVideo.title}</h4>
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
