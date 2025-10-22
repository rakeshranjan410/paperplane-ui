import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { MathText } from '../MathText';
import { Grid3x3, X } from 'lucide-react';

interface MatrixMatchQuestionEditProps {
  question: Question;
  onAnswersChange: (answers: string[]) => void;
}

export const MatrixMatchQuestionEdit: React.FC<MatrixMatchQuestionEditProps> = ({ 
  question, 
  onAnswersChange 
}) => {
  const content = question.content || { text: '', images: [] };
  const matrix = question.matrix_match;

  // Initialize mapping from existing data or empty
  const [mapping, setMapping] = useState<Record<string, string[]>>(() => {
    if (question.matrix_match?.map) {
      return question.matrix_match.map;
    }
    // Initialize empty mapping for each columnA item
    const initial: Record<string, string[]> = {};
    matrix?.columnA?.forEach(item => {
      const key = item.split('.')[0].trim().toUpperCase(); // Get "A", "B", etc.
      initial[key] = [];
    });
    return initial;
  });

  // Input state for each columnA item
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Update the question's matrix_match.map directly
    // We'll store the mapping in the question object itself
    if (question.matrix_match) {
      question.matrix_match.map = mapping;
    }
    // For validation, pass array of all mappings as strings
    const mappingStrings = Object.entries(mapping)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) => `${key}→${values.join(',')}`);
    onAnswersChange(mappingStrings);
  }, [mapping, question, onAnswersChange]);

  if (!matrix) {
    return <div className="text-red-600">Invalid matrix match question</div>;
  }

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddMapping = (key: string) => {
    const value = inputValues[key]?.trim().toUpperCase();
    if (!value) return;

    // Check if value is valid (exists in columnB)
    // Extract letters from columnB items (handles "P. Text" or just "P")
    const validValues = matrix.columnB.map(item => {
      const parts = item.split('.');
      return parts[0].trim().toUpperCase();
    });
    
    if (!validValues.includes(value)) {
      alert(`Invalid value! Use: ${validValues.join(', ')}`);
      return;
    }

    // Check if already mapped
    if (mapping[key]?.includes(value)) {
      alert(`${value} is already mapped to ${key}`);
      return;
    }

    setMapping(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), value]
    }));

    // Clear input
    setInputValues(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleRemoveMapping = (key: string, value: string) => {
    setMapping(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
    }));
  };

  const handleKeyPress = (key: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddMapping(key);
    }
  };

  const getTotalMappings = () => {
    return Object.values(mapping).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
    <div>
      {/* Question Type Badge */}
      <div className="flex items-start gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
          <Grid3x3 size={14} />
          Matrix Match Type
        </span>
        <span className="text-xs text-gray-500 italic">
          Map items from Column A to Column B
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
              alt={`Question diagram ${idx + 1}`}
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
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Column A</h4>
          <div className="space-y-2">
            {matrix.columnA.map((item, idx) => {
              const key = item.split('.')[0].trim().toUpperCase(); // Get "A", "B", etc.
              return (
                <div key={idx} className="bg-white rounded p-3 border border-blue-100">
                  <MathText text={item} className="text-gray-800 font-medium mb-2" />
                  
                  {/* Mapping input */}
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={inputValues[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(key, e)}
                      placeholder="P, Q, R..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:outline-none uppercase"
                      maxLength={1}
                    />
                    <button
                      onClick={() => handleAddMapping(key)}
                      className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Current mappings */}
                  {mapping[key] && mapping[key].length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-600">→</span>
                      {mapping[key].map((value, vIdx) => (
                        <span
                          key={vIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium"
                        >
                          {value}
                          <button
                            onClick={() => handleRemoveMapping(key, value)}
                            className="hover:text-green-900"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column B */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Column B</h4>
          <div className="space-y-2">
            {matrix.columnB.map((item, idx) => (
              <div key={idx} className="bg-white rounded p-3 border border-green-100">
                <MathText text={item} className="text-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mapping Summary */}
      <div className="mt-4 bg-gray-50 rounded-md p-3 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Current Mappings ({getTotalMappings()} total):
        </p>
        {Object.entries(mapping).map(([key, values]) => (
          values.length > 0 && (
            <div key={key} className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-blue-700">{key}</span> → 
              <span className="font-medium text-green-700 ml-1">{values.join(', ')}</span>
            </div>
          )
        ))}
        {getTotalMappings() === 0 && (
          <p className="text-sm text-gray-500 italic">No mappings added yet</p>
        )}
      </div>

      {getTotalMappings() === 0 && (
        <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
          ⚠️ Please add at least one mapping before uploading
        </div>
      )}
    </div>
  );
};
