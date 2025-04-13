
import * as React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AutocompleteSuggestions from './AutocompleteSuggestions';
import VoiceRecognitionButton from './VoiceRecognitionButton';

interface InputFieldProps {
  input: string;
  transcript: string;
  isListening: boolean;
  isLoading: boolean;
  filteredSuggestions: string[];
  showSuggestions: boolean;
  onInputChange: (value: string) => void;
  onSuggestionClick: (text: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onTranscriptChange: (transcript: string) => void;
  onTranscriptComplete: (finalTranscript: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  input,
  transcript,
  isListening,
  isLoading,
  filteredSuggestions,
  showSuggestions,
  onInputChange,
  onSuggestionClick,
  onKeyPress,
  onSend,
  onTranscriptChange,
  onTranscriptComplete
}) => {
  return (
    <div className="relative">
      {transcript && isListening && (
        <div className="absolute -top-10 left-0 right-0 bg-background dark:bg-dark-surface p-2 rounded-lg border border-border text-sm animate-pulse">
          {transcript}...
        </div>
      )}
      
      <textarea
        id="chat-input"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder={isListening ? "Listening..." : "Ask about medications, side effects, or treatments..."}
        className="w-full p-3 pr-24 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
        rows={1}
        disabled={isLoading}
      />
      
      <AutocompleteSuggestions
        suggestions={filteredSuggestions}
        visible={showSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
      
      <div className="absolute right-2 top-2 flex space-x-1">
        <VoiceRecognitionButton
          isLoading={isLoading}
          onTranscriptChange={onTranscriptChange}
          onTranscriptComplete={onTranscriptComplete}
        />
        
        <Button
          onClick={onSend}
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
  );
};

export default InputField;
