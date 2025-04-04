
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Route {
  path: string;
  label: string;
}

const routes: Route[] = [
  { path: '/', label: 'Home' },
  { path: '/chatbot', label: 'AI Assistant' },
  { path: '/videos', label: 'Videos' }
];

const PageNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Find current route index
  const currentIndex = routes.findIndex(route => route.path === location.pathname);
  
  // Determine previous and next routes
  const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
  const nextRoute = currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null;
  
  return (
    <div className="flex justify-between mt-6 mb-8">
      {prevRoute ? (
        <Button 
          variant="outline" 
          onClick={() => navigate(prevRoute.path)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{prevRoute.label}</span>
        </Button>
      ) : (
        <div></div> // Empty div to maintain layout with flexbox
      )}
      
      {nextRoute ? (
        <Button 
          variant="outline" 
          onClick={() => navigate(nextRoute.path)}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">{nextRoute.label}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <div></div> // Empty div to maintain layout with flexbox
      )}
    </div>
  );
};

export default PageNavigation;
