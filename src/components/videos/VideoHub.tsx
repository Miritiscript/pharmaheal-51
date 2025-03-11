
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import VideoRow from './VideoRow';
import VideoPlayer from './VideoPlayer';
import { Video, VideoCategory, mockCategories } from '@/data/mockVideos';
import { fetchVideoCategories } from '@/services/youtubeService';
import VideoSkeleton from './VideoSkeleton';
import { toast } from 'sonner';
import SearchBar from '../search/SearchBar';
import { searchContent } from '@/services/searchService';
import { Button } from '../ui/Button';
import { Filter } from 'lucide-react';

const VideoHub: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const location = useLocation();
  const { theme } = useTheme();
  
  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        // Always attempt to use live YouTube data first
        const fetchedCategories = await fetchVideoCategories();
        setCategories(fetchedCategories);
        setFilteredCategories(fetchedCategories);
        toast.success("Videos loaded successfully");
      } catch (error) {
        console.error("Error loading videos:", error);
        // Fallback to mock data already handled in service
        setCategories(mockCategories);
        setFilteredCategories(mockCategories);
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
      
      // Also set the filter to match the category param
      setActiveFilter(categoryParam);
      filterCategories(categoryParam);
    }
  }, [categoryParam, isLoading]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // Reset to show all categories or the active filter
      if (activeFilter) {
        filterCategories(activeFilter);
      } else {
        setFilteredCategories(categories);
      }
      return;
    }
    
    // Search through all videos
    const results = searchContent(query, { videos: categories }).videos;
    
    // Group search results by category
    const searchResultCategories: VideoCategory[] = [];
    
    categories.forEach(category => {
      const categoryVideos = results.filter(video => video.category === category.title);
      if (categoryVideos.length > 0) {
        searchResultCategories.push({
          ...category,
          videos: categoryVideos
        });
      }
    });
    
    setFilteredCategories(searchResultCategories);
  };

  const filterCategories = (filterId: string | null) => {
    setActiveFilter(filterId);
    
    if (!filterId) {
      setFilteredCategories(categories);
      return;
    }
    
    const filtered = categories.filter(category => category.id === filterId);
    setFilteredCategories(filtered);
  };

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

  const filterButtons = [
    { id: null, label: 'All' },
    ...categories.map(cat => ({ id: cat.id, label: cat.title }))
  ];

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
              
              <div className="w-full sm:w-auto">
                <SearchBar 
                  onSearch={handleSearch} 
                  placeholder="Search videos..." 
                  className="w-full sm:w-64"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              {/* Filter Buttons */}
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-2">
                  {filterButtons.map((filter) => (
                    <Button
                      key={filter.id || 'all'}
                      variant={activeFilter === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => filterCategories(filter.id)}
                      className="whitespace-nowrap"
                    >
                      {filter.id === null && <Filter className="w-4 h-4 mr-1" />}
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Educational note:</span> These videos provide general health information. Remember to consult with healthcare professionals for personalized advice.
              </p>
            </div>
            
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} id={`category-${category.id}`} className="animate-slide-up">
                  <VideoRow 
                    category={category} 
                    onVideoClick={handleVideoClick} 
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No videos found matching your search criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter(null);
                    setFilteredCategories(categories);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoHub;
