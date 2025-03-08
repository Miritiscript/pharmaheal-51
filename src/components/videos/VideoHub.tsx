
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import VideoRow from './VideoRow';
import VideoPlayer from './VideoPlayer';
import { Video, VideoCategory, mockCategories } from '@/data/mockVideos';

const VideoHub: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    // Simulate loading of data
    const loadMockData = () => {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setCategories(mockCategories);
        setIsLoading(false);
      }, 1000);
    };
    
    loadMockData();
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

  return (
    <div className="page-container px-4">
      {selectedVideo ? (
        <VideoPlayer 
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
