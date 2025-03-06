
import React from 'react';
import { Pill, RefreshCw } from 'lucide-react';

interface ChatHeaderProps {
  onReset: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => {
  return (
    <div className="p-4 border-b border-border flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Pill className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Pharmacy Assistant</h2>
      </div>
      <div className="flex items-center">
        <button
          className="p-2 text-muted-foreground hover:text-foreground rounded-full"
          aria-label="Reset conversation"
          onClick={onReset}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
