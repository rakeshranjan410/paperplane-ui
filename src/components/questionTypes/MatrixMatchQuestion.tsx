import React from 'react';
import { Question } from '../../types';
import { MathText } from '../MathText';
import { Grid3x3 } from 'lucide-react';

interface MatrixMatchQuestionProps {
  question: Question;
  showAnswers?: boolean;
  isEditing?: boolean;
  onQuestionChange?: (question: Question) => void;
}

export const MatrixMatchQuestion: React.FC<MatrixMatchQuestionProps> = ({ 
  question, 
  showAnswers = false,
  isEditing: _isEditing = false,
  onQuestionChange: _onQuestionChange
}) => {
  const content = question.content || { text: '', images: [] };
  const matrix = question.matrix_match;

  if (!matrix) {
    return <div className="text-red-600">Invalid matrix match question</div>;
  }

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
          <Grid3x3 size={14} />
          Matrix Match Type
        </span>
      </div>

      {/* Question Content */}
      {content.text && (
        <div className="mb-4">
          <MathText 
            text={content.text} 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      )}

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
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          ))}
        </div>
      )}

      {/* Matrix Display */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Column A */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Column A</h4>
          <div className="space-y-2">
            {matrix.columnA.map((item, idx) => (
              <div key={idx} className="bg-white rounded p-2 border border-blue-100">
                <MathText text={item} className="text-gray-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Column B */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Column B</h4>
          <div className="space-y-2">
            {matrix.columnB.map((item, idx) => (
              <div key={idx} className="bg-white rounded p-2 border border-green-100">
                <MathText text={item} className="text-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correct Mapping (if showAnswers) */}
      {showAnswers && matrix.map && (
        <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-300">
          <h4 className="font-semibold text-green-900 mb-3">Correct Matches:</h4>
          <div className="space-y-2">
            {Object.entries(matrix.map).map(([key, values]) => (
              <div key={key} className="bg-white rounded p-3 border border-green-200">
                <span className="font-semibold text-blue-700">{key}</span>
                <span className="mx-2">→</span>
                <span className="font-semibold text-green-700">
                  {Array.isArray(values) ? values.join(', ') : values}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
