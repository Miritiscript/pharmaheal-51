
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatHeaderProps {
  onReset: () => void;
  apiStatus?: {
    gemini: string;
    groq: string;
  };
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset, apiStatus }) => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">PharmaHeal Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask about diseases, medications & treatments
          </p>
          
          {/* API Status Indicators */}
          {apiStatus && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              <div className="flex items-center">
                <span className="mr-1">Gemini:</span>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  apiStatus.gemini === 'active' ? 'bg-green-500' : 
                  apiStatus.gemini === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-1">Fallback:</span>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  apiStatus.groq === 'active' ? 'bg-green-500' : 
                  apiStatus.groq === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
              </div>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onReset}
          title="Start new chat"
          aria-label="Reset chat"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
