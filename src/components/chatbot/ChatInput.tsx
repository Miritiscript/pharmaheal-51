import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import SuggestedPrompt from './SuggestedPrompt';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
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
  const { toast: uiToast } = useToast();
  
  useEffect(() => {
    const checkSpeechSupport = () => {
      const speechSupported = 
        'SpeechRecognition' in window || 
        'webkitSpeechRecognition' in window;
      
      setBrowserSupport(speechSupported);
      
      if (!speechSupported) {
        console.log('Speech recognition not supported in this browser');
      } else {
        console.log('Speech recognition is supported');
      }
    };
    
    checkSpeechSupport();
  }, []);
  
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Microphone permission status:', permissionStatus.state);
          
          permissionStatus.onchange = () => {
            console.log('Microphone permission changed to:', permissionStatus.state);
            setPermissionDenied(permissionStatus.state === 'denied');
            setMicrophoneAvailable(permissionStatus.state === 'granted');
            
            if (permissionStatus.state === 'granted') {
              setPermissionDenied(false);
              setMicrophoneAvailable(true);
            } else if (permissionStatus.state === 'denied') {
              setPermissionDenied(true);
              setMicrophoneAvailable(false);
              toast.error("Microphone access denied. Please enable it in your browser settings.", {
                duration: 5000,
              });
            }
          };
          
          if (permissionStatus.state === 'granted') {
            setPermissionDenied(false);
            setMicrophoneAvailable(true);
          } else if (permissionStatus.state === 'denied') {
            setPermissionDenied(true);
            setMicrophoneAvailable(false);
          }
        } catch (err) {
          console.error('Error checking microphone permission:', err);
          tryGetUserMedia();
        }
      } else {
        tryGetUserMedia();
      }
    };
    
    const tryGetUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access granted');
        
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            console.log('Available audio input devices:', audioInputs);
          })
          .catch(err => {
            console.error('Error enumerating devices:', err);
          });
        
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAvailable(false);
        setPermissionDenied(true);
        
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          toast.error("Microphone access was denied. Please ensure your browser has permission to use the microphone.", {
            duration: 5000,
          });
          
          const browser = getBrowserName();
          let settingsInstructions = "Check your browser settings to enable microphone access.";
          
          if (browser === 'Chrome') {
            settingsInstructions = "Go to Chrome Settings > Privacy and Security > Site Settings > Microphone";
          } else if (browser === 'Firefox') {
            settingsInstructions = "Go to Firefox Preferences > Privacy & Security > Permissions > Microphone";
          } else if (browser === 'Safari') {
            settingsInstructions = "Go to Safari Preferences > Websites > Microphone";
          } else if (browser === 'Edge') {
            settingsInstructions = "Go to Edge Settings > Cookies and site permissions > Microphone";
          }
          
          uiToast({
            title: "Microphone Access Denied",
            description: `${settingsInstructions} to allow this site to use your microphone.`,
            variant: "destructive",
          });
        } else {
          toast.error("Could not access microphone. Please check your device settings.", {
            duration: 5000,
          });
        }
      }
    };
    
    checkMicrophoneAccess();
    
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
                toast.error("Microphone Access Denied. Please enable microphone access in your browser settings.", {
                  duration: 5000,
                });
              } else {
                toast.error(`Speech recognition error: ${event.error}`, {
                  duration: 3000,
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
        toast.error("Could not initialize speech recognition", {
          duration: 3000,
        });
      }
    }
    
    return () => {
      stopListening();
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [browserSupport]);
  
  useEffect(() => {
    if (input.length > 1) {
      const filtered = commonDiseases.filter(disease => 
        disease.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);
  
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
      toast.error("Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.", {
        duration: 5000,
      });
      uiToast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    if (permissionDenied) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access re-granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone access error:', error);
        toast.error("Please enable microphone access in your browser settings.", {
          duration: 5000,
        });
        uiToast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access in your browser settings to use voice input.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (recognitionRef.current) {
      try {
        setTranscript('');
        
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
          toast.error(`Speech recognition error: ${event.error}. Please try again.`, {
            duration: 3000,
          });
          uiToast({
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
        
        toast.success("Listening... Speak now.", {
          duration: 3000,
        });
        uiToast({
          title: "Listening...",
          description: "Speak now. Voice input will automatically stop after you pause.",
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast.error("Failed to start voice input. Please try again.", {
          duration: 3000,
        });
        uiToast({
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
      uiToast({
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

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else {
      browserName = "Unknown";
    }
    
    return browserName;
  };

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
            disabled={isLoading || (!browserSupport && !microphoneAvailable)}
            className={`p-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-secondary hover:bg-secondary/90'}`}
            variant="ghost"
            size="icon"
            aria-label={isListening ? "Stop recording" : "Start voice input"}
            type="button"
            title={!browserSupport ? "Voice input not supported in this browser" : permissionDenied ? "Microphone access denied" : "Click to use voice input"}
          >
            {isListening ? 
              <MicOff className="w-5 h-5 text-white" /> : 
              <Mic className={`w-5 h-5 ${!browserSupport || permissionDenied ? 'opacity-50' : ''}`} />
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
    </div>
  );
};

export default ChatInput;
