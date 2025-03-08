
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoHub from '@/components/videos/VideoHub';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Videos: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-background text-foreground'}`}>
      <Navbar />
      <div className="fixed top-24 right-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <main className="flex-1 pt-24 pb-16">
        <VideoHub />
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
