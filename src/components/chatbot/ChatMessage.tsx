
import React from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import PharmacyResponse from './PharmacyResponse';
import { Message } from './types';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const { theme } = useTheme();
  
  return (
    <div
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[90%] ${
          message.isUser
            ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl'
            : theme === 'dark' 
              ? 'bg-dark-surface border border-dark-border text-foreground rounded-t-xl rounded-br-xl' 
              : 'glass rounded-t-xl rounded-br-xl'
        } p-3 shadow-sm`}
      >
        <div className="flex items-start gap-2">
          {!message.isUser && (
            <Bot className="w-5 h-5 mt-1 text-primary shrink-0" />
          )}
          {message.isUser && (
            <User className="w-5 h-5 mt-1 text-white shrink-0" />
          )}
          <div className="w-full">
            {message.pharmacyData ? (
              <PharmacyResponse response={message.pharmacyData} />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            <span className="text-xs opacity-70 mt-1 block text-right">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
