
import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, ExternalLink, Filter, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  description?: string;
  videoId: string;
}

interface VideoCategory {
  id: string;
  title: string;
  videos: Video[];
}

const YOUTUBE_API_KEY = 'AIzaSyA7y_R8Bxyq-jxOvLdHC_g2foIi4kzWBVs';

const VideoRow: React.FC<{
  category: VideoCategory;
  onVideoClick: (video: Video) => void;
}> = ({ category, onVideoClick }) => {
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

const VideoPlayerSection: React.FC<{ 
  video: Video | null, 
  onClose: () => void,
  relatedVideos: Video[],
  onVideoClick: (video: Video) => void
}> = ({ video, onClose, relatedVideos, onVideoClick }) => {
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

interface SearchParams {
  category?: string;
}

const VideoHub: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Define our categories and search queries
        const categoryQueries = [
          { id: 'chronic', title: 'Chronic Disease Management', query: 'chronic disease management healthcare' },
          { id: 'nutrition', title: 'Nutrition & Wellness', query: 'nutrition wellness health' },
          { id: 'medications', title: 'Medication Information', query: 'medication information healthcare' },
        ];
        
        const categoriesData: VideoCategory[] = [];
        
        for (const category of categoryQueries) {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${category.query}&type=video&key=${YOUTUBE_API_KEY}`
          );
          
          if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Fetch video details to get duration
          const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
          const videoDetailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
          );
          
          if (!videoDetailsResponse.ok) {
            throw new Error(`YouTube API error: ${videoDetailsResponse.status}`);
          }
          
          const videoDetails = await videoDetailsResponse.json();
          
          // Map the videos with their details
          const videos: Video[] = data.items.map((item: any, index: number) => {
            const details = videoDetails.items[index];
            const duration = details?.contentDetails?.duration || 'PT0M0S';
            // Convert ISO 8601 duration to readable format
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            let hours = 0, minutes = 0, seconds = 0;
            
            if (match) {
              if (match[1]) hours = parseInt(match[1].replace('H', ''));
              if (match[2]) minutes = parseInt(match[2].replace('M', ''));
              if (match[3]) seconds = parseInt(match[3].replace('S', ''));
            }
            
            let formattedDuration = '';
            if (hours > 0) formattedDuration += `${hours}:`;
            formattedDuration += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            return {
              id: item.id.videoId,
              videoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.high.url,
              duration: formattedDuration,
              category: category.title,
              description: details?.snippet?.description || ''
            };
          });
          
          categoriesData.push({
            id: category.id,
            title: category.title,
            videos
          });
        }
        
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchYouTubeVideos();
  }, []);

  useEffect(() => {
    // If there's a category parameter, scroll to that section
    if (categoryParam && !isLoading) {
      const element = document.getElementById(`category-${categoryParam}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [categoryParam, isLoading]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRelatedVideos = (currentVideo: Video): Video[] => {
    // First get videos from the same category
    const sameCategoryVideos = categories
      .find(cat => cat.title === currentVideo.category)?.videos
      .filter(v => v.id !== currentVideo.id) || [];
    
    // Then get videos from other categories if needed
    const otherVideos = categories
      .flatMap(cat => cat.videos)
      .filter(v => v.id !== currentVideo.id && v.category !== currentVideo.category);
    
    // Combine them, prioritizing same category videos
    return [...sameCategoryVideos, ...otherVideos];
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading video library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md p-6 glass-card">
          <h2 className="text-xl font-bold mb-4 text-destructive">Unable to Load Videos</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      {selectedVideo ? (
        <VideoPlayerSection 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          relatedVideos={getRelatedVideos(selectedVideo)}
          onVideoClick={handleVideoClick}
        />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold">Educational Video Hub</h1>
            </div>
            
            <div className="glass-card p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Educational note:</span> These videos provide general health information. Remember to consult with healthcare professionals for personalized advice.
              </p>
            </div>
            
            {categories.map((category) => (
              <div key={category.id} id={`category-${category.id}`}>
                <VideoRow 
                  category={category} 
                  onVideoClick={handleVideoClick} 
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoHub;
