
import React from 'react';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/components/theme/ThemeProvider';
import PageNavigation from '@/components/navigation/PageNavigation';

const Index: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : 'light'}`}>
      <Navbar />
      <main className="flex-1 z-10">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageNavigation />
        </div>
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
