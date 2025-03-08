
import React from 'react';
import { Video } from '@/data/mockVideos';
import { Message } from '@/components/chatbot/types';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface SearchResultsProps {
  results: {
    videos: Video[];
    chatMessages: Message[];
  };
  onVideoClick?: (video: Video) => void;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onVideoClick,
  onClose 
}) => {
  const navigate = useNavigate();
  const hasResults = results.videos.length > 0 || results.chatMessages.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No results found. Try a different search term.
      </div>
    );
  }

  const handleVideoClick = (video: Video) => {
    if (onVideoClick) {
      onVideoClick(video);
    } else {
      navigate(`/videos?category=${video.category.toLowerCase().replace(/\s+/g, '-')}`);
    }
    onClose();
  };

  return (
    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      {results.videos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Videos</h3>
          <div className="grid gap-2">
            {results.videos.slice(0, 5).map((video) => (
              <Card 
                key={video.id} 
                className="p-2 cursor-pointer transition-all hover:bg-accent flex items-center gap-2"
                onClick={() => handleVideoClick(video)}
              >
                <div 
                  className="w-16 h-9 rounded bg-muted flex-shrink-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${video.thumbnail})` }}
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{video.category}</p>
                </div>
              </Card>
            ))}
            {results.videos.length > 5 && (
              <div className="text-center text-sm text-primary cursor-pointer hover:underline mt-1">
                + {results.videos.length - 5} more videos
              </div>
            )}
          </div>
        </div>
      )}

      {results.chatMessages.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Chat History</h3>
          <div className="grid gap-2">
            {results.chatMessages.slice(0, 3).map((message) => (
              <Card 
                key={message.id} 
                className="p-2 cursor-pointer transition-all hover:bg-accent"
                onClick={() => {
                  navigate('/chatbot');
                  onClose();
                }}
              >
                <p className="text-sm line-clamp-2">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
