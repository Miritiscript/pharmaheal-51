
import React, { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import SuggestedPrompt from './SuggestedPrompt';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    // Focus the input after setting the suggestion
    setTimeout(() => {
      document.getElementById('chat-input')?.focus();
    }, 0);
  };

  const suggestedPrompts = [
    "What are the side effects of ibuprofen?",
    "Best treatments for migraine",
    "Drug interactions with warfarin",
    "Herbal remedies for anxiety",
    "Foods to avoid with high blood pressure",
  ];

  return (
    <div className="p-4 border-t border-border">
      <div className="overflow-x-auto mb-4 pb-2 whitespace-nowrap flex space-x-2">
        {suggestedPrompts.map((prompt, index) => (
          <SuggestedPrompt 
            key={index} 
            text={prompt} 
            onClick={handleSuggestionClick} 
          />
        ))}
      </div>
      <div className="relative">
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about medications, side effects, or treatments..."
          className="w-full p-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
          rows={1}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 p-2"
          variant="ghost"
          size="icon"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </div>
      <div className="flex items-center mt-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>Not medical advice. Consult healthcare professionals for diagnoses and treatment.</span>
      </div>
    </div>
  );
};

export default ChatInput;
