import React, { useState, useEffect } from 'react';
import { Question, QuestionOption } from '../../types';
import { MathText } from '../MathText';
import { CheckCircle, Circle } from 'lucide-react';
import { getProxiedImageUrl } from '../../utils/imageProxy';

interface SingleMultipleQuestionEditProps {
  question: Question;
  onAnswersChange: (answers: string[]) => void;
}

export const SingleMultipleQuestionEdit: React.FC<SingleMultipleQuestionEditProps> = ({ 
  question, 
  onAnswersChange 
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(question.answers || []);
  const content = question.content || { text: question.description || '', images: [] };
  const options = question.options || [];
  const isSingleChoice = question.type === 'single';

  // Sync state with question.answers when question changes
  useEffect(() => {
    setSelectedAnswers(question.answers || []);
  }, [question.id, question.answers]);

  useEffect(() => {
    onAnswersChange(selectedAnswers);
  }, [selectedAnswers, onAnswersChange]);

  const handleOptionClick = (optionIndex: number) => {
    const optionId = String(optionIndex);
    if (isSingleChoice) {
      // Single choice - replace selection
      setSelectedAnswers([optionId]);
    } else {
      // Multiple choice - toggle selection
      setSelectedAnswers(prev => 
        prev.includes(optionId)
          ? prev.filter(ans => ans !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const isSelected = (optionIndex: number) => {
    return selectedAnswers.includes(String(optionIndex));
  };

  return (
    <div>
      {/* Question Content */}
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            {question.type === 'multiple' ? 'Multiple Correct' : 'Single Correct'}
          </span>
          <span className="text-xs text-gray-500 italic">
            {isSingleChoice ? 'Click to select answer' : 'Click to select multiple answers'}
          </span>
        </div>
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
              src={getProxiedImageUrl(img)}
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

      {/* Options */}
      {options.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Options {selectedAnswers.length > 0 && (
              <span className="text-green-600">({selectedAnswers.length} selected)</span>
            )}:
          </p>
          {options.map((option, index) => {
            const optionText = typeof option === 'string' ? option : (option as QuestionOption).text;
            const imageUrl = typeof option === 'object' ? (option as QuestionOption).image_url : undefined;
            const selected = isSelected(index);

            return (
              <div
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`rounded-md p-3 border-2 transition-all cursor-pointer ${
                  selected 
                    ? 'bg-green-50 border-green-500 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selected ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <Circle className="text-gray-400" size={20} />
                    )}
                  </div>
                  <span className="font-medium text-gray-700">({index + 1})</span>
                  <div className="flex-1">
                    <MathText text={optionText} className="inline text-gray-800" />
                    {imageUrl && (
                      <img
                        src={getProxiedImageUrl(imageUrl)}
                        alt={`Option ${index + 1}`}
                        className="mt-2 max-w-full h-auto rounded border border-gray-200"
                        crossOrigin="anonymous"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAnswers.length === 0 && (
        <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
          ⚠️ Please select at least one answer before uploading
        </div>
      )}
    </div>
  );
};
