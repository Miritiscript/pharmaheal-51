
import React from 'react';

interface SuggestedPromptProps {
  text: string;
  onClick: (text: string) => void;
}

const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({ text, onClick }) => {
  return (
    <button
      className="py-2 px-4 bg-muted hover:bg-accent text-sm rounded-full transition-colors whitespace-nowrap"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  );
};

export default SuggestedPrompt;
