import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { MathText } from '../MathText';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';

interface ComprehensionQuestionEditProps {
  question: Question;
  onAnswersChange: (answers: string[]) => void;
}

export const ComprehensionQuestionEdit: React.FC<ComprehensionQuestionEditProps> = ({ 
  question, 
  onAnswersChange 
}) => {
  const passage = question.comprehension_passage;
  const subQuestions = question.sub_questions || [];

  // Store answers for each sub-question
  const [subAnswers, setSubAnswers] = useState<Record<number, string[]>>(() => {
    const initial: Record<number, string[]> = {};
    subQuestions.forEach((subQ, idx) => {
      initial[idx] = subQ.answers || [];
    });
    return initial;
  });

  useEffect(() => {
    // Update the sub_questions array with answers
    subQuestions.forEach((_, idx) => {
      if (question.sub_questions && question.sub_questions[idx]) {
        question.sub_questions[idx].answers = subAnswers[idx] || [];
      }
    });
    
    // For validation, return summary of answered questions
    const answeredCount = Object.values(subAnswers).filter(ans => ans.length > 0).length;
    const summary = `${answeredCount}/${subQuestions.length} answered`;
    onAnswersChange(answeredCount === subQuestions.length ? [summary] : []);
  }, [subAnswers, subQuestions, question, onAnswersChange]);

  const handleSubQuestionAnswer = (subQIndex: number, optionText: string, isSingle: boolean) => {
    setSubAnswers(prev => {
      const current = prev[subQIndex] || [];
      
      if (isSingle) {
        // Single choice - replace
        return { ...prev, [subQIndex]: [optionText] };
      } else {
        // Multiple choice - toggle
        const updated = current.includes(optionText)
          ? current.filter(ans => ans !== optionText)
          : [...current, optionText];
        return { ...prev, [subQIndex]: updated };
      }
    });
  };

  const isSelected = (subQIndex: number, optionText: string) => {
    return (subAnswers[subQIndex] || []).includes(optionText);
  };

  const getAnsweredCount = () => {
    return Object.values(subAnswers).filter(answers => answers.length > 0).length;
  };

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
          <BookOpen size={14} />
          Linked Comprehension Type
        </span>
        <span className="text-xs text-gray-500 italic">
          Answer {subQuestions.length} questions based on passage
          {getAnsweredCount() > 0 && (
            <span className="text-green-600 ml-1">
              ({getAnsweredCount()}/{subQuestions.length} answered)
            </span>
          )}
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
        {subQuestions.map((subQ, subIdx) => {
          const isSingle = subQ.type === 'single';
          const hasAnswer = (subAnswers[subIdx] || []).length > 0;

          return (
            <div key={subIdx} className="bg-white rounded-lg p-5 border-2 border-gray-200">
              {/* Sub-question header */}
              <div className="flex items-start gap-2 mb-3">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                  Q{question.questionNumber}.{subIdx + 1}
                </span>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                  {isSingle ? 'Single Correct' : 'Multiple Correct'}
                </span>
                {hasAnswer && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                    ✓ Answered
                  </span>
                )}
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
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Options:
                </p>
                {subQ.options.map((option, optIdx) => {
                  const selected = isSelected(subIdx, option.text);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSubQuestionAnswer(subIdx, option.text, isSingle)}
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {!hasAnswer && (
                <div className="mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                  ⚠️ Please select answer(s) for this sub-question
                </div>
              )}
            </div>
          );
        })}
      </div>

      {getAnsweredCount() < subQuestions.length && (
        <div className="mt-4 text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
          ⚠️ Please answer all {subQuestions.length} sub-questions before uploading
        </div>
      )}
    </div>
  );
};
