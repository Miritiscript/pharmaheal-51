
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';
import { preloadImages, LOCAL_FALLBACK_IMAGES } from '@/utils/imageUtils';

const Videos: React.FC = () => {
  const { theme } = useTheme();
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  // Add an effect to preload only local fallback images
  useEffect(() => {
    // Log that we're starting preload
    console.log("Starting image preload process");
    
    // Preload locally uploaded images as fallbacks
    try {
      // First mark as preloaded to prevent long waiting
      setImagesPreloaded(true);
      
      // Then actually preload the images in the background
      preloadImages(LOCAL_FALLBACK_IMAGES);
      console.log("Preload image request sent for:", LOCAL_FALLBACK_IMAGES);
      
      // Manually verify each image loads
      const verifyImages = LOCAL_FALLBACK_IMAGES.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Verified: ${src}`);
            resolve(src);
          };
          img.onerror = (e) => {
            console.error(`Failed to verify: ${src}`, e);
            reject(e);
          };
          img.src = src;
        });
      });
      
      Promise.allSettled(verifyImages)
        .then(results => {
          const succeeded = results.filter(r => r.status === 'fulfilled').length;
          console.log(`Preloaded ${succeeded} out of ${verifyImages.length} images`);
          
          if (succeeded === 0) {
            toast.error("Failed to preload image assets. Some videos may not display correctly.");
          }
        });
    } catch (error) {
      console.error("Image preloading error:", error);
      setImagesPreloaded(true);
    }
    
    // Handle unhandled promise rejections that might be related to image loading
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
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
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-950' : 'light bg-white'}`}>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        {imagesPreloaded ? (
          <VideoHub key="preloaded-video-hub" />
        ) : (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
