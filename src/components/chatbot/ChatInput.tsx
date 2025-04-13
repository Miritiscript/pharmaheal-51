
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMicrophoneAccess } from '@/hooks/useMicrophoneAccess';
import { commonDiseases, normalizeDiseaseInput } from '@/data/diseasesList';
import SuggestedPromptsList from './input/SuggestedPromptsList';
import InputField from './input/InputField';
import ChatInputMessages from './input/ChatInputMessages';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const [transcript, setTranscript] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const { toast: uiToast } = useToast();
  
  const { 
    browserSupport, 
    permissionDenied,
    microphoneAvailable 
  } = useMicrophoneAccess();
  
  // Handle suggestions based on input
  React.useEffect(() => {
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

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript);
    setIsListening(true);
  };

  const handleTranscriptComplete = (finalTranscript: string) => {
    setInput(finalTranscript);
    setIsListening(false);
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
      <SuggestedPromptsList 
        prompts={suggestedPrompts}
        onPromptClick={handleSuggestionClick}
      />
      
      <InputField
        input={input}
        transcript={transcript}
        isListening={isListening}
        isLoading={isLoading}
        filteredSuggestions={filteredSuggestions}
        showSuggestions={showSuggestions}
        onInputChange={setInput}
        onSuggestionClick={handleSuggestionClick}
        onKeyPress={handleKeyPress}
        onSend={handleSend}
        onTranscriptChange={handleTranscriptChange}
        onTranscriptComplete={handleTranscriptComplete}
      />
      
      <ChatInputMessages
        browserSupport={browserSupport}
        permissionDenied={permissionDenied}
      />
    </div>
  );
};

export default ChatInput;
