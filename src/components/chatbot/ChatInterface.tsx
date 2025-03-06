import React, { useState } from 'react';
import { Send, RefreshCw, Pill, AlertCircle, User, Bot } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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
      content: 'Hello! I\'m your AI medical assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${input}". While I can provide general information, remember that this isn't a substitute for professional medical advice.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
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
    "How to manage diabetes?",
    "Common symptoms of anxiety",
    "Natural remedies for headache",
    "Is my blood pressure normal?",
  ];

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Medical Assistant</h2>
        </div>
        <div className="flex items-center">
          <button
            className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            aria-label="Reset conversation"
            onClick={() => {
              setMessages([
                {
                  id: '1',
                  content: 'Hello! I\'m your AI medical assistant. How can I help you today?',
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-window">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.isUser
                  ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl'
                  : 'glass rounded-t-xl rounded-br-xl'
              } p-3 shadow-sm`}
            >
              <div className="flex items-start gap-2">
                {!message.isUser && (
                  <Bot className="w-5 h-5 mt-1 text-primary" />
                )}
                {message.isUser && (
                  <User className="w-5 h-5 mt-1 text-white" />
                )}
                <div>
                  <p className="text-sm">{message.content}</p>
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
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
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
            placeholder="Type your health question here..."
            className="w-full p-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2"
            variant="ghost"
            size="icon"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
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
