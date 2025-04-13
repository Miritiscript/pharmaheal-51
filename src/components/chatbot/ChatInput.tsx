
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import SuggestedPrompt from './SuggestedPrompt';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { commonDiseases, normalizeDiseaseInput } from '@/data/diseasesList';

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
    // Check if browser supports speech recognition
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
      try {
        // First try to check permissions using the Permissions API
        if ('permissions' in navigator) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log('Microphone permission status:', permissionStatus.state);
            
            const updatePermissionState = () => {
              console.log('Microphone permission changed to:', permissionStatus.state);
              setPermissionDenied(permissionStatus.state === 'denied');
              setMicrophoneAvailable(permissionStatus.state === 'granted');
            };
            
            permissionStatus.onchange = updatePermissionState;
            updatePermissionState();
            
            // If permission is prompt, we should also check getUserMedia
            if (permissionStatus.state === 'prompt') {
              await tryGetUserMedia();
            }
          } catch (err) {
            console.error('Error checking microphone permission:', err);
            await tryGetUserMedia();
          }
        } else {
          // Fallback to getUserMedia if Permissions API is not available
          await tryGetUserMedia();
        }
      } catch (error) {
        console.error('Error during microphone check:', error);
        setMicrophoneAvailable(false);
        setPermissionDenied(true);
      }
    };
    
    const tryGetUserMedia = async () => {
      try {
        console.log('Attempting to get user media...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access granted');
        
        // List available audio devices
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          console.log('Available audio input devices:', audioInputs);
        } catch (err) {
          console.error('Error enumerating devices:', err);
        }
        
        // Important: Stop the tracks when done to release the microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAvailable(false);
        
        if (error instanceof DOMException) {
          setPermissionDenied(true);
          
          if (error.name === 'NotAllowedError') {
            console.error('Microphone access denied by user or system');
            toast.error("Microphone access was denied. Please ensure your browser has permission to use the microphone.", {
              duration: 5000,
            });
            
            // Show browser-specific instructions
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
          } else if (error.name === 'NotFoundError') {
            console.error('No microphone found on this device');
            toast.error("No microphone found on this device. Please connect a microphone and try again.", {
              duration: 5000,
            });
          } else {
            toast.error(`Microphone error: ${error.name}. Please check your device settings.`, {
              duration: 5000,
            });
          }
        } else {
          toast.error("Could not access microphone. Please check your device settings.", {
            duration: 5000,
          });
        }
      }
    };
    
    checkMicrophoneAccess();
  }, [uiToast]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (browserSupport) {
      const initializeSpeechRecognition = () => {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          
          if (SpeechRecognition) {
            // We don't start it here, just initialize the object
            recognitionRef.current = new SpeechRecognition();
            
            if (recognitionRef.current) {
              recognitionRef.current.continuous = true;
              recognitionRef.current.interimResults = true;
              recognitionRef.current.lang = 'en-US';
              console.log('Speech recognition initialized successfully');
            }
          }
        } catch (error) {
          console.error('Error initializing speech recognition:', error);
          toast.error("Could not initialize speech recognition", {
            duration: 3000,
          });
        }
      };
      
      initializeSpeechRecognition();
    }
    
    // Cleanup function
    return () => {
      stopListening();
    };
  }, [browserSupport]);
  
  // Handle suggestions based on input
  useEffect(() => {
    if (input.length > 1) {
      const normalizedInput = input.toLowerCase();
      const filtered = commonDiseases.filter(disease => 
        disease.toLowerCase().includes(normalizedInput)
      ).slice(0, 5);
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);
  
  // Handle clicks outside suggestion box
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
    
    // First verify we have microphone access
    try {
      console.log('Verifying microphone access before starting speech recognition');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAvailable(true);
      setPermissionDenied(false);
      
      // Important: Stop the tracks when done to release the microphone
      // We're only checking access here, speech recognition will get its own access
      stream.getTracks().forEach(track => track.stop());
      
      // Now that we've confirmed microphone access, set up speech recognition
      setUpSpeechRecognition();
      
    } catch (error) {
      console.error('Failed to get microphone access before speech recognition:', error);
      setPermissionDenied(true);
      toast.error("Please enable microphone access in your browser settings.", {
        duration: 5000,
      });
      uiToast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access in your browser settings to use voice input.",
        variant: "destructive",
      });
    }
  };
  
  const setUpSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Create a fresh recognition instance each time
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setTranscript('');
        
        toast.success("Listening... Speak now.", {
          duration: 3000,
        });
        uiToast({
          title: "Listening...",
          description: "Speak now. Voice input will automatically stop after you pause.",
        });
      };
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        console.log('Speech recognized:', transcriptText);
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          console.log('Final transcript:', transcriptText);
          setInput(transcriptText);
          stopListening();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionDenied(true);
          toast.error("Microphone access denied. Please check your browser settings.", {
            duration: 3000,
          });
          uiToast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings.",
            variant: "destructive",
          });
        } else {
          toast.error(`Speech recognition error: ${event.error}. Please try again.`, {
            duration: 3000,
          });
          uiToast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        }
        
        stopListening();
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      // Store the reference and start
      recognitionRef.current = recognition;
      recognition.start();
      
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
      setIsListening(false);
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
    
    // Normalize the input if it's a known medical term
    const normalizedInput = normalizeDiseaseInput(input);
    
    // Only use the normalized input if it's different from the original
    const finalInput = normalizedInput !== input ? normalizedInput : input;
    
    if (normalizedInput !== input) {
      console.log(`Normalized input from "${input}" to "${normalizedInput}"`);
    }
    
    onSendMessage(finalInput);
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
