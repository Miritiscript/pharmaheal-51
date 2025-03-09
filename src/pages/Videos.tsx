
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from '@/components/theme/ThemeProvider';

const Videos: React.FC = () => {
  const { theme } = useTheme();
  
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
