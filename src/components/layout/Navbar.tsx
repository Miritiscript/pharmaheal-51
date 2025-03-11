import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowLeft } from 'lucide-react';
import SearchBar from '../search/SearchBar';
import { ThemeToggle } from '../theme/ThemeToggle';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const showBackButton = location.pathname !== '/';

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <nav className="fixed top-0 w-full z-50 shadow-md backdrop-blur-lg bg-background/80 dark:bg-dark-surface/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold gradient-text">
                PharmaHeal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/chatbot"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/chatbot')
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                AI Assistant
              </Link>
              <Link
                to="/videos"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/videos')
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Videos
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <SearchBar onSearch={handleSearch} />
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex items-center sm:hidden space-x-2">
            <SearchBar onSearch={handleSearch} minimal={true} />
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden absolute w-full bg-background/95 dark:bg-dark-surface/95 backdrop-blur-lg">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/')
                  ? 'border-accent text-accent-foreground bg-accent/10'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/chatbot"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/chatbot')
                  ? 'border-accent text-accent-foreground bg-accent/10'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
              onClick={closeMenu}
            >
              AI Assistant
            </Link>
            <Link
              to="/videos"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/videos')
                  ? 'border-accent text-accent-foreground bg-accent/10'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
              onClick={closeMenu}
            >
              Videos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
