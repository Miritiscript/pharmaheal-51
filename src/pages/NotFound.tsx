
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-background dark' : 'bg-background light'}`}>
      <div className="text-center p-8 rounded-xl glass-card">
        <h1 className="text-5xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-foreground mb-6">Oops! Page not found</p>
        <a href="/" className="text-secondary hover:text-secondary/80 underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
