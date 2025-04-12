
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
      img.onload = () => console.log(`Preloaded fallback image: ${src}`);
      img.onerror = () => console.warn(`Failed to preload fallback image: ${src}`);
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
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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
