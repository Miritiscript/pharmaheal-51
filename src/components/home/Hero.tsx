
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { MessageSquareText, Play } from 'lucide-react';
import PharmacyImagesGrid from './PharmacyImagesGrid';
import PharmacyHeroImage from './PharmacyHeroImage';

const Hero: React.FC = () => {
  return (
    <section className="pt-24 pb-16 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/31e5d199-ecbb-43d5-a341-037d83220873.png" 
                alt="PharmaHeal Logo" 
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                <span className="gradient-text">PharmaHeal</span>
              </h1>
            </div>
            <p className="text-lg mb-8 text-muted-foreground max-w-xl">
              PharmaHeal combines AI assistance, educational videos, and reliable 
              medication information to empower your health decisions and improve your wellness journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="vibrant">
                <Link to="/chatbot" className="flex items-center">
                  <MessageSquareText className="mr-2" />
                  Ask AI Assistant
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/videos" className="flex items-center">
                  <Play className="mr-2" />
                  Explore Videos
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full animate-slide-up">
            <PharmacyHeroImage />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
