import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 font-semibold'
}) => {
  console.log('🔍 HighlightText:', { text, highlight, hasHighlight: !!highlight.trim() });
  
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  console.log('🔍 HighlightText regex:', { 
    highlight, 
    text, 
    regex: regex.toString(), 
    parts: parts.length,
    matches: parts.filter((part, index) => index % 2 === 1)
  });

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
