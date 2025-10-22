import React from 'react';
import { Question, SubQuestion } from '../../types';
import { MathText } from '../MathText';
import { BookOpen, CheckCircle } from 'lucide-react';

interface ComprehensionQuestionProps {
  question: Question;
  showAnswers?: boolean;
  isEditing?: boolean;
  onQuestionChange?: (question: Question) => void;
}

export const ComprehensionQuestion: React.FC<ComprehensionQuestionProps> = ({ 
  question, 
  showAnswers = false,
  isEditing: _isEditing = false,
  onQuestionChange: _onQuestionChange
}) => {
  const passage = question.comprehension_passage;
  const subQuestions = question.sub_questions || [];

  const isCorrectAnswer = (subQ: SubQuestion, optionText: string) => {
    return subQ.answers?.some(ans => 
      ans.toLowerCase().includes(optionText.toLowerCase()) ||
      optionText.toLowerCase().includes(ans.toLowerCase())
    );
  };

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
          <BookOpen size={14} />
          Linked Comprehension Type
        </span>
      </div>

      {/* Passage */}
      {passage && (
        <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-400 mb-6">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Passage:
          </h4>
          <MathText 
            text={passage.text} 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          />
          
          {/* Passage Images */}
          {passage.images && passage.images.length > 0 && (
            <div className="mt-4 space-y-2">
              {passage.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Passage diagram ${idx + 1}`}
                  className="max-w-full h-auto rounded border border-amber-200"
                  crossOrigin="anonymous"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub Questions */}
      <div className="space-y-6">
        <h4 className="font-semibold text-gray-800 text-sm">
          Questions based on the passage:
        </h4>
        {subQuestions.map((subQ, subIdx) => (
          <div key={subIdx} className="bg-white rounded-lg p-5 border-2 border-gray-200">
            {/* Sub-question header */}
            <div className="flex items-start gap-2 mb-3">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                Q{question.id}.{subIdx + 1}
              </span>
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                {subQ.type === 'multiple' ? 'Multiple Correct' : 'Single Correct'}
              </span>
            </div>

            {/* Sub-question content */}
            <div className="mb-4">
              <MathText 
                text={subQ.content.text} 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              />
            </div>

            {/* Sub-question images */}
            {subQ.content.images && subQ.content.images.length > 0 && (
              <div className="mb-4 space-y-2">
                {subQ.content.images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`Sub-question ${subIdx + 1} diagram ${idx + 1}`}
                    className="max-w-full h-auto rounded border border-gray-200"
                    crossOrigin="anonymous"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ))}
              </div>
            )}

            {/* Sub-question options */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 mb-2">Options:</p>
              {subQ.options.map((option, optIdx) => {
                const isCorrect = showAnswers && isCorrectAnswer(subQ, option.text);

                return (
                  <div
                    key={optIdx}
                    className={`rounded-md p-3 border transition-colors ${
                      isCorrect 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700">({optIdx + 1})</span>
                      <div className="flex-1">
                        <MathText text={option.text} className="inline text-gray-800" />
                        {option.image_url && (
                          <img 
                            src={option.image_url}
                            alt={`Option ${optIdx + 1}`}
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
          </div>
        ))}
      </div>
    </div>
  );
};
