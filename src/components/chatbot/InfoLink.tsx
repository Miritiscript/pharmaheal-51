
import React from 'react';

interface InfoLinkProps {
  href: string;
  emoji: string;
  text: string;
}

const InfoLink: React.FC<InfoLinkProps> = ({ href, emoji, text }) => {
  return (
    <li>
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center hover:text-primary transition-colors"
      >
        {emoji} {text}
      </a>
    </li>
  );
};

export default InfoLink;
