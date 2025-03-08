
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import VideoRow from './VideoRow';
import VideoPlayer from './VideoPlayer';
import { Video, VideoCategory, mockCategories } from '@/data/mockVideos';
import { fetchVideoCategories } from '@/services/youtubeService';
import VideoSkeleton from './VideoSkeleton';
import { toast } from 'sonner';

const VideoHub: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { theme } = useTheme();
  
  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await fetchVideoCategories();
        setCategories(fetchedCategories);
        toast.success("Videos loaded successfully");
      } catch (error) {
        console.error("Error loading videos:", error);
        // Fallback to mock data if API fails
        setCategories(mockCategories);
        toast.error("Couldn't load videos from YouTube, using cached data instead");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideos();
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

  return (
    <div className={`page-container px-4 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : ''}`}>
      {isLoading ? (
        <div className="space-y-8">
          <VideoSkeleton />
          <VideoSkeleton />
        </div>
      ) : selectedVideo ? (
        <VideoPlayer 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          relatedVideos={getRelatedVideos(selectedVideo)}
          onVideoClick={handleVideoClick}
        />
      ) : (
        <>
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pharma-600 to-healing-600 bg-clip-text text-transparent">Educational Video Hub</h1>
            </div>
            
            <div className="glass-card p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Educational note:</span> These videos provide general health information. Remember to consult with healthcare professionals for personalized advice.
              </p>
            </div>
            
            {categories.map((category) => (
              <div key={category.id} id={`category-${category.id}`} className="animate-slide-up">
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
