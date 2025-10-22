import React from 'react';
import { Question } from '../../types';
import { MathText } from '../MathText';
import { Hash } from 'lucide-react';

interface IntegerQuestionProps {
  question: Question;
  showAnswers?: boolean;
  isEditing?: boolean;
  onQuestionChange?: (question: Question) => void;
}

export const IntegerQuestion: React.FC<IntegerQuestionProps> = ({ 
  question, 
  showAnswers = false,
  isEditing = false,
  onQuestionChange
}) => {
  const content = question.content || { text: question.description || '', images: [] };

  const handleContentChange = (newText: string) => {
    if (!onQuestionChange) return;
    onQuestionChange({
      ...question,
      content: { ...content, text: newText }
    });
  };

  const handleAnswerChange = (newAnswer: string) => {
    if (!onQuestionChange) return;
    onQuestionChange({
      ...question,
      answers: [newAnswer]
    });
  };

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
          <Hash size={14} />
          Integer/Numerical Type
        </span>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={content.text}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] font-mono text-sm"
            placeholder="Enter question text (supports LaTeX)"
          />
        ) : (
          <MathText 
            text={content.text} 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          />
        )}
      </div>

      {/* Content Images */}
      {content.images && content.images.length > 0 && (
        <div className="mb-4 space-y-2">
          {content.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`Question ${question.id} diagram ${idx + 1}`}
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

      {/* Answer Input Display */}
      <div className={`rounded-md p-4 border ${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <p className="text-sm font-semibold text-gray-600 mb-2">Answer:</p>
        {isEditing ? (
          <input
            type="text"
            value={question.answers?.[0] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full px-4 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
            placeholder="Enter numerical answer (e.g., 42 or 3.14)"
          />
        ) : showAnswers && question.answers && question.answers.length > 0 ? (
          <div className="bg-green-50 border border-green-300 rounded px-4 py-2">
            <span className="text-green-800 font-mono font-semibold text-lg">
              {question.answers[0]}
            </span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded px-4 py-2 text-gray-400">
            Enter numerical answer (integer or decimal)
          </div>
        )}
      </div>
    </div>
  );
};
