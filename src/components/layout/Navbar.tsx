
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, MessageSquare, PlayCircle, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import { searchContent } from '@/services/searchService';
import { fetchVideoCategories } from '@/services/youtubeService';
import { mockCategories } from '@/data/mockVideos';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ videos: [], chatMessages: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState(mockCategories);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load video categories for search
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchVideoCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading categories for search:", error);
        // Fall back to mock data
      }
    };
    
    loadCategories();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Get chat history from localStorage
      let chatHistory = [];
      try {
        const savedChats = localStorage.getItem('pharmacy-chat-history');
        if (savedChats) {
          const chats = JSON.parse(savedChats);
          if (chats.length > 0) {
            chatHistory = chats[0].messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
        }
      } catch (error) {
        console.error('Error loading chat history for search:', error);
      }

      const results = searchContent(query, {
        videos: categories,
        chatHistory: chatHistory
      });
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults({ videos: [], chatMessages: [] });
      setIsSearchOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" /> },
    { path: '/chatbot', label: 'AI Assistant', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
    { path: '/videos', label: 'Video Hub', icon: <PlayCircle className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2 glass shadow' : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-2"
            aria-label="PharmaHeal Home"
            onClick={closeMenu}
          >
            <span className="text-2xl font-bold gradient-text">PharmaHeal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  isActive(item.path)
                    ? 'bg-accent text-foreground'
                    : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="ml-2 flex items-center gap-2"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b">
                  <SearchBar 
                    onSearch={handleSearch} 
                    placeholder="Search videos, chat history..." 
                  />
                </div>
                {isSearchOpen && (
                  <SearchResults 
                    results={searchResults} 
                    onClose={() => setIsSearchOpen(false)} 
                  />
                )}
              </PopoverContent>
            </Popover>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center text-foreground"
            onClick={handleToggle}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-2 animate-fade-in">
            <div className="glass-card rounded-lg p-2 my-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-accent text-foreground'
                      : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                  }`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 p-2">
                <SearchBar 
                  onSearch={handleSearch} 
                  placeholder="Search videos, chat history..." 
                />
                {searchQuery && (
                  <div className="mt-2 max-h-60 overflow-y-auto bg-background rounded-md shadow-md">
                    <SearchResults 
                      results={searchResults} 
                      onClose={() => setSearchQuery('')} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
