import React from 'react';
import { QuestionType } from '../types';
import { CheckCircle, Hash, Grid3x3, BookOpen, Sparkles } from 'lucide-react';

interface QuestionTypeSelectorProps {
  selectedType: QuestionType | 'auto';
  onTypeSelect: (type: QuestionType | 'auto') => void;
  onProceed: () => void;
  onCancel: () => void;
}

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  onProceed,
  onCancel,
}) => {
  const questionTypes: Array<{ value: QuestionType | 'auto'; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'auto',
      label: 'Auto-Detect',
      icon: <Sparkles size={24} />,
      description: 'Let AI detect question types from markdown headers'
    },
    {
      value: 'single',
      label: 'Single Choice',
      icon: <CheckCircle size={24} />,
      description: 'One correct answer per question'
    },
    {
      value: 'multiple',
      label: 'Multiple Choice',
      icon: <CheckCircle size={24} />,
      description: 'Multiple correct answers per question'
    },
    {
      value: 'integer',
      label: 'Integer/Numerical',
      icon: <Hash size={24} />,
      description: 'Numerical answer questions'
    },
    {
      value: 'matrix',
      label: 'Matrix Match',
      icon: <Grid3x3 size={24} />,
      description: 'Column A to Column B matching'
    },
    {
      value: 'comprehension',
      label: 'Comprehension',
      icon: <BookOpen size={24} />,
      description: 'Passage-based with sub-questions'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Question Type</h2>
        <p className="text-gray-600 mb-6">
          Choose the type of questions in your markdown file. This helps the AI extract questions accurately without guessing answers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {questionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeSelect(type.value)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${
                  selectedType === type.value ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    selectedType === type.value ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
                {selectedType === type.value && (
                  <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> The AI will extract question text and options only. 
            You'll select the correct answers manually in the UI after extraction.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onProceed}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Process Questions
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
