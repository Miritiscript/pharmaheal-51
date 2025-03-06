import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Play, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[85vh] flex items-center justify-center pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-block">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium inline-flex items-center animate-pulse-subtle">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              AI-Powered Medical Information
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Your Personal <span className="gradient-text">Medical Assistant</span> at Your Fingertips
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
            Access reliable medical information, get drug recommendations, and learn about treatments through our AI assistant and educational videos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button 
              size="lg" 
              className="group"
              onClick={() => navigate('/chatbot')}
            >
              <MessageSquareText className="mr-2 h-5 w-5" />
              Ask Medical Questions
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/videos')}
            >
              <Play className="mr-2 h-5 w-5 text-primary" />
              Browse Educational Videos
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded text-xs font-medium">Note:</span> Information provided is not a substitute for professional medical advice.
          </p>
        </div>
        
        <div className="relative animate-fade-in">
          <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_70%)]"></div>
            <div className="relative glass-card p-8 m-6 shadow-xl animate-float">
              <div className="space-y-4">
                <div className="w-full h-4 bg-primary/20 rounded-full"></div>
                <div className="w-2/3 h-4 bg-primary/20 rounded-full"></div>
                <div className="w-5/6 h-4 bg-primary/20 rounded-full"></div>
                <div className="w-3/4 h-4 bg-primary/20 rounded-full"></div>
                <div className="flex justify-end mt-8">
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                    <MessageSquareText className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/3 -right-5 w-24 h-24 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 -left-5 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
