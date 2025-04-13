
import * as React from 'react';
import { AlertCircle } from 'lucide-react';

interface ChatInputMessagesProps {
  browserSupport: boolean;
  permissionDenied: boolean;
}

const ChatInputMessages: React.FC<ChatInputMessagesProps> = ({ 
  browserSupport,
  permissionDenied
}) => {
  return (
    <>
      <div className="flex items-center mt-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>Not medical advice. Consult healthcare professionals for diagnoses and treatment.</span>
      </div>
      
      {!browserSupport && (
        <div className="mt-2 text-xs text-amber-500 dark:text-amber-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.</span>
        </div>
      )}
      
      {browserSupport && permissionDenied && (
        <div className="mt-2 text-xs text-amber-500 dark:text-amber-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>Microphone access is denied. Please enable it in your browser settings.</span>
        </div>
      )}
    </>
  );
};

export default ChatInputMessages;
