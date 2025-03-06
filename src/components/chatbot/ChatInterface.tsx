
import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Pill, AlertCircle, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { generatePharmacyResponse, type GeminiResponse } from '@/services/geminiService';
import PharmacyResponse from './PharmacyResponse';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  pharmacyData?: GeminiResponse;
}

const SuggestedPrompt: React.FC<{ text: string; onClick: (text: string) => void }> = ({ text, onClick }) => {
  return (
    <button
      className="py-2 px-4 bg-muted hover:bg-accent text-sm rounded-full transition-colors whitespace-nowrap"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI pharmacy assistant. Ask me about medications, side effects, drug interactions, or treatment options for specific conditions.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini API for pharmacy information
      const pharmacyResponse = await generatePharmacyResponse(input);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: pharmacyResponse.text,
        isUser: false,
        timestamp: new Date(),
        pharmacyData: pharmacyResponse,
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting pharmacy response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your AI pharmacy assistant. Ask me about medications, side effects, drug interactions, or treatment options for specific conditions.',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Pharmacy Assistant</h2>
        </div>
        <div className="flex items-center">
          <button
            className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            aria-label="Reset conversation"
            onClick={resetChat}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatWindowRef} id="chat-window">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] ${
                message.isUser
                  ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl'
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
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-t-xl rounded-br-xl p-3 shadow-sm max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">Searching medical database...</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ChatInterface;
