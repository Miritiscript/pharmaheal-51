
import * as React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useMicrophoneAccess } from '@/hooks/useMicrophoneAccess';

interface VoiceRecognitionButtonProps {
  isLoading: boolean;
  onTranscriptChange: (transcript: string) => void;
  onTranscriptComplete: (finalTranscript: string) => void;
}

const VoiceRecognitionButton: React.FC<VoiceRecognitionButtonProps> = ({
  isLoading,
  onTranscriptChange,
  onTranscriptComplete
}) => {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const { toast: uiToast } = useToast();
  
  const { 
    browserSupport, 
    microphoneAvailable, 
    permissionDenied 
  } = useMicrophoneAccess();

  // Initialize speech recognition
  React.useEffect(() => {
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
  
  // Update parent component when transcript changes
  React.useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

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
      
      // Important: Stop the tracks when done to release the microphone
      // We're only checking access here, speech recognition will get its own access
      stream.getTracks().forEach(track => track.stop());
      
      // Now that we've confirmed microphone access, set up speech recognition
      setUpSpeechRecognition();
      
    } catch (error) {
      console.error('Failed to get microphone access before speech recognition:', error);
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
          onTranscriptComplete(transcriptText);
          stopListening();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
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

  return (
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
  );
};

export default VoiceRecognitionButton;
