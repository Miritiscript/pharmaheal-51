
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';

const Videos: React.FC = () => {
  const { theme } = useTheme();
  
  // Add an effect to preload the fallback images
  useEffect(() => {
    const preloadImages = [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = `${src}?auto=format&fit=crop&w=480&q=80`;
      
      img.onload = () => {
        console.log(`Preloaded fallback image: ${src}`);
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload fallback image: ${src}`);
        // Try without query parameters
        const plainImg = new Image();
        plainImg.src = src;
        plainImg.onerror = () => {
          console.error(`Still failed to load fallback image: ${src}`);
        };
      };
    });
    
    // Preload locally uploaded images as additional fallbacks
    const localImages = [
      "/lovable-uploads/c41cc21a-4229-44bd-8521-97ddbee2e097.png", // User uploaded image
      "/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png",
      "/lovable-uploads/98c1024c-5d0f-43e8-8737-0f8a1d3675e7.png",
      "/lovable-uploads/2d7a65c0-4a7b-4d75-bcb6-29dd9f040a7c.png"
    ];
    
    localImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.warn(`Failed to preload local image: ${src}`);
    });
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
