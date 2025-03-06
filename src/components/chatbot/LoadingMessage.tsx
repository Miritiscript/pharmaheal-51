
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="glass rounded-t-xl rounded-br-xl p-3 shadow-sm max-w-[80%]">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">Searching medical database...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
