
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from '@/components/theme/ThemeProvider';

const Videos: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add an effect to handle loading states without toast messages
  useEffect(() => {
    // Simulate a loading delay to ensure images have time to preload
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Handle global errors for YouTube API calls
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
          event.message.includes('googleapis') || 
          event.message.includes('Failed to fetch')
      )) {
        // Suppress repeated YouTube API errors
        event.preventDefault();
        console.warn('Suppressed YouTube API error:', event.message);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-950' : 'light bg-white'}`}>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        {isLoading ? (
          <div className="container mx-auto px-4 text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              <div className="flex justify-center mt-6">
                <div className="w-12 h-12 border-4 border-pharma-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Loading educational videos...</p>
            </div>
          </div>
        ) : (
          <VideoHub key="video-hub-component" />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
