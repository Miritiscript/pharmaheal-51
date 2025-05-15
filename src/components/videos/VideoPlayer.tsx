import React, { useState, useEffect } from 'react';
import { ExternalLink, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Video } from '@/data/mockVideos';
import { useTheme } from 'next-themes';
import { validateVideoId } from '@/services/youtubeService';
import { 
  LOCAL_FALLBACK_IMAGES, 
  getBestYouTubeThumbnail,
  preloadImages 
} from '@/utils/imageUtils';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
  relatedVideos: Video[];
  onVideoClick: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose, relatedVideos, onVideoClick }) => {
  const { theme } = useTheme();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // Add client-side only rendering to fix SSR mismatch
  const [isClient, setIsClient] = useState(false);
  
  // Preload fallback images to ensure they're in cache
  useEffect(() => {
    preloadImages(LOCAL_FALLBACK_IMAGES);
    // Mark as client-side rendered
    setIsClient(true);
  }, []);
  
  const handleImageError = (videoId: string) => {
    console.warn(`Failed to load thumbnail for video: ${videoId}`);
    setFailedImages(prev => ({
      ...prev,
      [videoId]: true
    }));
  };
  
  // Function to get a fallback image based on video ID
  const getFallbackImage = (videoId: string) => {
    // Use local fallbacks
    const localIndex = Math.abs(videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) % LOCAL_FALLBACK_IMAGES.length);
    
    return LOCAL_FALLBACK_IMAGES[localIndex];
  };
  
  // Function to get the best possible thumbnail URL
  const getBestThumbnailUrl = (video: Video): string => {
    // If image already failed, use fallback
    if (failedImages[video.videoId]) {
      return getFallbackImage(video.videoId);
    }
    
    // If it's a YouTube video ID, try to get the best thumbnail
    if (validateVideoId(video.videoId)) {
      // Ensure we're using HTTPS
      return getBestYouTubeThumbnail(video.videoId);
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
      return LOCAL_FALLBACK_IMAGES[0];
    }
    
    // Otherwise use the provided thumbnail
    return video.thumbnail;
  };
  
  if (!video) return null;
  
  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="mb-8 animate-fade-in">
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-pharma-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
        <div className="p-4 lg:p-6">
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : ''
          }`}>{video.title}</h2>
          <p className="text-sm text-muted-foreground">
            {video.channelTitle || video.category} • {video.duration}
            {video.views && ` • ${parseInt(video.views).toLocaleString()} views`}
          </p>
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
                  src={getBestThumbnailUrl(relVideo)}
                  alt={`Thumbnail for ${relVideo.title}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={() => handleImageError(relVideo.videoId)}
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
                <p className="text-xs text-muted-foreground mt-1">{relVideo.channelTitle || relVideo.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
