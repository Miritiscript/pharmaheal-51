
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import SuggestedPrompt from './SuggestedPrompt';
import { useToast } from '@/hooks/use-toast';
import { commonDiseases } from '@/data/diseasesList';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(false);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  
  // Check if browser supports speech recognition
  useEffect(() => {
    const speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setBrowserSupport(speechSupported);
    
    if (!speechSupported) {
      console.log('Speech recognition not supported in this browser');
    } else {
      console.log('Speech recognition is supported');
    }
  }, []);
  
  useEffect(() => {
    // Initialize and check for microphone
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access granted');
        // Stop tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAvailable(false);
        setPermissionDenied(true);
      }
    };
    
    checkMicrophoneAccess();
    
    // Initialize speech recognition
    if (browserSupport) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          
          if (recognitionRef.current) {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            
            recognitionRef.current.onresult = (event) => {
              const current = event.resultIndex;
              const result = event.results[current];
              const transcriptText = result[0].transcript;
              console.log('Speech recognized:', transcriptText);
              setTranscript(transcriptText);
              
              if (result.isFinal) {
                setInput(transcriptText);
                stopListening();
              }
            };
            
            recognitionRef.current.onerror = (event) => {
              console.error('Speech recognition error', event.error);
              
              if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setPermissionDenied(true);
                toast({
                  title: "Microphone Access Denied",
                  description: "Please enable microphone access in your browser settings to use voice input.",
                  variant: "destructive",
                });
              }
              
              stopListening();
            };
            
            recognitionRef.current.onend = () => {
              setIsListening(false);
              console.log('Speech recognition ended');
            };
          }
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    }
    
    // Clean up
    return () => {
      stopListening();
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [browserSupport, toast]);
  
  // Filter disease suggestions based on input
  useEffect(() => {
    if (input.length > 1) {
      const filtered = commonDiseases.filter(disease => 
        disease.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const startListening = async () => {
    console.log('Starting listening...');
    if (!browserSupport) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    // Request microphone access again if previously denied
    if (permissionDenied) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access re-granted');
        // Stop tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone access error:', error);
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access in your browser settings to use voice input.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (recognitionRef.current) {
      try {
        // Reset the transcript
        setTranscript('');
        
        // Ensure we create a fresh instance to avoid stale state issues
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          console.log('Speech recognized:', transcriptText);
          setTranscript(transcriptText);
          
          if (result.isFinal) {
            setInput(transcriptText);
            stopListening();
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
          stopListening();
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started');
        
        toast({
          title: "Listening...",
          description: "Speak now. Voice input will automatically stop after you pause.",
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Failed to start voice input",
          description: "There was an error starting the microphone. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  const stopListening = () => {
    console.log('Stopping listening...');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
    setIsListening(false);
  };
  
  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleSend = () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, indications, contraindications, herbal medicine alternatives, or food-based treatments.",
        variant: "destructive",
      });
      return;
    }
    
    onSendMessage(input);
    setInput('');
    setTranscript('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    setShowSuggestions(false);
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
        
        {/* Disease suggestions dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionBoxRef}
            className="absolute top-full left-0 right-0 bg-background dark:bg-slate-800 border border-border rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((disease, index) => (
              <div 
                key={index}
                className="px-4 py-2 hover:bg-accent cursor-pointer"
                onClick={() => handleSuggestionClick(disease)}
              >
                {disease}
              </div>
            ))}
          </div>
        )}
        
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
