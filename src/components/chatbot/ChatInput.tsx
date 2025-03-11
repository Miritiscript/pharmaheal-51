
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import SuggestedPrompt from './SuggestedPrompt';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
  // Check if browser supports speech recognition
  const browserSupportsSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  // Using a ref for the recognition instance to maintain it between renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition
    if (browserSupportsSpeech) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);
          
          if (result.isFinal) {
            setInput(transcriptText);
            stopListening();
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          toast({
            title: "Voice Input Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
          stopListening();
        };
      }
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        stopListening();
      }
    };
  }, []);
  
  const startListening = () => {
    if (!browserSupportsSpeech) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please try a different browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
    setIsListening(false);
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
    setTranscript('');
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
        {transcript && isListening && (
          <div className="absolute -top-10 left-0 right-0 bg-background dark:bg-dark-surface p-2 rounded-lg border border-border text-sm animate-pulse">
            {transcript}...
          </div>
        )}
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isListening ? "Listening..." : "Ask about medications, side effects, or treatments..."}
          className="w-full p-3 pr-24 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute right-2 top-2 flex space-x-1">
          <Button
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-secondary hover:bg-secondary/90'}`}
            variant="ghost"
            size="icon"
            aria-label={isListening ? "Stop recording" : "Start voice input"}
            type="button"
          >
            {isListening ? 
              <MicOff className="w-5 h-5 text-white" /> : 
              <Mic className="w-5 h-5" />
            }
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2"
            variant="ghost"
            size="icon"
            aria-label="Send message"
            type="button"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>Not medical advice. Consult healthcare professionals for diagnoses and treatment.</span>
      </div>
    </div>
  );
};

export default ChatInput;
