import React from 'react';
import { Question, QuestionOption } from '../../types';
import { MathText } from '../MathText';
import { CheckCircle } from 'lucide-react';

interface SingleMultipleQuestionProps {
  question: Question;
  showAnswers?: boolean;
  isEditing?: boolean;
  onQuestionChange?: (question: Question) => void;
}

export const SingleMultipleQuestion: React.FC<SingleMultipleQuestionProps> = ({ 
  question, 
  showAnswers = false,
  isEditing = false,
  onQuestionChange
}) => {
  const content = question.content || { text: question.description || '', images: question.imageUrl ? [question.imageUrl] : [] };
  const options = question.options || [];

  const isCorrectAnswer = (optionText: string) => {
    return question.answers?.some(ans => 
      ans.toLowerCase().includes(optionText.toLowerCase()) ||
      optionText.toLowerCase().includes(ans.toLowerCase())
    );
  };

  const handleContentChange = (newText: string) => {
    if (!onQuestionChange) return;
    onQuestionChange({
      ...question,
      content: { ...content, text: newText }
    });
  };

  const handleOptionChange = (index: number, newText: string) => {
    if (!onQuestionChange) return;
    const newOptions = [...options];
    if (typeof newOptions[index] === 'string') {
      (newOptions as any)[index] = newText;
    } else {
      newOptions[index] = { ...(newOptions[index] as QuestionOption), text: newText };
    }
    onQuestionChange({ ...question, options: newOptions });
  };

  return (
    <div>
      {/* Question Content */}
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            {question.type === 'multiple' ? 'Multiple Correct' : 'Single Correct'}
          </span>
        </div>
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

      {/* Options */}
      {options.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 mb-2">Options:</p>
          {options.map((option, index) => {
            const optionText = typeof option === 'string' ? option : (option as QuestionOption).text;
            const imageUrl = typeof option === 'object' ? (option as QuestionOption).image_url : undefined;
            const isCorrect = showAnswers && isCorrectAnswer(optionText);

            return (
              <div
                key={index}
                className={`rounded-md p-3 border transition-colors ${
                  isCorrect 
                    ? 'bg-green-50 border-green-300' 
                    : isEditing
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">({index + 1})</span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea
                        value={optionText}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px] font-mono text-sm"
                        placeholder={`Option ${index + 1} text (supports LaTeX)`}
                      />
                    ) : (
                      <MathText text={optionText} className="inline text-gray-800" />
                    )}
                    {imageUrl && (
                      <img 
                        src={imageUrl}
                        alt={`Option ${index + 1}`}
                        className="mt-2 max-w-full h-auto rounded border border-gray-200"
                        crossOrigin="anonymous"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                  </div>
                  {isCorrect && (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
