
import * as React from 'react';
import SuggestedPrompt from '../SuggestedPrompt';

interface SuggestedPromptsListProps {
  prompts: string[];
  onPromptClick: (text: string) => void;
}

const SuggestedPromptsList: React.FC<SuggestedPromptsListProps> = ({ prompts, onPromptClick }) => {
  return (
    <div className="overflow-x-auto mb-4 pb-2 whitespace-nowrap flex space-x-2">
      {prompts.map((prompt, index) => (
        <SuggestedPrompt 
          key={index} 
          text={prompt} 
          onClick={onPromptClick} 
        />
      ))}
    </div>
  );
};

export default SuggestedPromptsList;
