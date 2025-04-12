
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';
import { preloadImages, FALLBACK_IMAGES, LOCAL_FALLBACK_IMAGES } from '@/utils/imageUtils';

const Videos: React.FC = () => {
  const { theme } = useTheme();
  
  // Add an effect to preload all fallback images
  useEffect(() => {
    // Preload Unsplash fallbacks
    preloadImages(FALLBACK_IMAGES);
    
    // Preload locally uploaded images as additional fallbacks
    preloadImages(LOCAL_FALLBACK_IMAGES);
  }, []);
  
  // Add an error boundary effect
  useEffect(() => {
    // Handle unhandled promise rejections that might be related to image loading
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (event.reason?.toString().includes('thumbnail') || event.reason?.toString().includes('img')) {
        toast.error('Some video thumbnails failed to load. Using fallback images instead.');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Handle image load errors globally
    const handleImageError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        console.warn('Image load error:', event);
      }
    };
    
    window.addEventListener('error', handleImageError, true);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleImageError, true);
    };
  }, []);
  
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : 'light'}`}>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <VideoHub />
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
