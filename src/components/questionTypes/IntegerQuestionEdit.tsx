import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { MathText } from '../MathText';
import { Hash } from 'lucide-react';

interface IntegerQuestionEditProps {
  question: Question;
  onAnswersChange: (answers: string[]) => void;
}

export const IntegerQuestionEdit: React.FC<IntegerQuestionEditProps> = ({ 
  question, 
  onAnswersChange 
}) => {
  const [answer, setAnswer] = useState<string>(
    question.answers && question.answers.length > 0 ? question.answers[0] : ''
  );
  const content = question.content || { text: question.description || '', images: [] };

  useEffect(() => {
    if (answer.trim()) {
      onAnswersChange([answer.trim()]);
    } else {
      onAnswersChange([]);
    }
  }, [answer, onAnswersChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers, decimal point, and negative sign
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setAnswer(value);
    }
  };

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
          <Hash size={14} />
          Integer/Numerical Type
        </span>
        <span className="text-xs text-gray-500 italic">
          Enter numerical answer
        </span>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        <MathText 
          text={content.text} 
          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
        />
      </div>

      {/* Content Images */}
      {content.images && content.images.length > 0 && (
        <div className="mb-4 space-y-2">
          {content.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`Question diagram ${idx + 1}`}
              className="max-w-full h-auto rounded border border-gray-200"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Failed to load image:', img);
                e.currentTarget.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      {/* Answer Input */}
      <div className="bg-gray-50 rounded-md p-4 border-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          Answer:
        </label>
        <input
          type="text"
          value={answer}
          onChange={handleInputChange}
          placeholder="Enter numerical value (e.g., 42 or 3.14)"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-purple-500 focus:outline-none text-lg font-mono"
        />
        {answer && (
          <div className="mt-2 text-sm text-green-600">
            ✓ Answer set: <span className="font-mono font-bold">{answer}</span>
          </div>
        )}
      </div>

      {!answer && (
        <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
          ⚠️ Please enter an answer before uploading
        </div>
      )}
    </div>
  );
};
