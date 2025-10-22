import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const renderTextWithMath = (input: string) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let key = 0;

    // Match both inline math $...$ and display math $$...$$
    const mathRegex = /\$\$([\s\S]+?)\$\$|\$(.+?)\$/g;
    let match;

    while ((match = mathRegex.exec(input)) !== null) {
      // Add text before the math
      if (match.index > lastIndex) {
        const textBefore = input.substring(lastIndex, match.index);
        parts.push(<span key={`text-${key++}`}>{textBefore}</span>);
      }

      // Render the math
      const mathContent = match[1] || match[2]; // match[1] for $$, match[2] for $
      const isDisplayMode = !!match[1]; // Display mode if $$...$$

      try {
        const html = katex.renderToString(mathContent, {
          displayMode: isDisplayMode,
          throwOnError: false,
          output: 'html',
        });

        parts.push(
          <span
            key={`math-${key++}`}
            dangerouslySetInnerHTML={{ __html: html }}
            className={isDisplayMode ? 'block my-2' : 'inline-block mx-1'}
          />
        );
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        // Fallback to showing the raw LaTeX
        parts.push(
          <span key={`error-${key++}`} className="text-red-600 font-mono">
            {match[0]}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < input.length) {
      parts.push(<span key={`text-${key++}`}>{input.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : [<span key="empty">{input}</span>];
  };

  return <div className={className}>{renderTextWithMath(text)}</div>;
};
