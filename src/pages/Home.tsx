import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { QuestionList } from '../components/QuestionList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { QuestionTypeSelector } from '../components/QuestionTypeSelector';
import { processMarkdownFile } from '../services/openai';
import { Question, ProcessingStatus, QuestionType } from '../types';
import { AlertCircle } from 'lucide-react';

export const Home = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
  });
  const [selectedType, setSelectedType] = useState<QuestionType | 'auto'>('auto');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  const handleFileSelect = async (content: string) => {
    // Store content and show type selector
    setMarkdownContent(content);
    setShowTypeSelector(true);
  };

  const handleProceedWithType = async () => {
    setStatus({ isProcessing: true, progress: 'Processing markdown file...' });
    setShowTypeSelector(false);
    setQuestions([]);

    try {
      const extractedQuestions = await processMarkdownFile(markdownContent, selectedType);
      setQuestions(extractedQuestions);
      setStatus({ isProcessing: false });
    } catch (error) {
      console.error('Processing error:', error);
      setStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to process file',
      });
    }
  };

  const handleCancelTypeSelection = () => {
    setShowTypeSelector(false);
    setMarkdownContent('');
    setSelectedType('auto');
  };

  const handleReset = () => {
    setQuestions([]);
    setStatus({ isProcessing: false });
    setShowTypeSelector(false);
    setMarkdownContent('');
    setSelectedType('auto');
  };

  return (
    <>
      {questions.length === 0 && !status.isProcessing && !showTypeSelector && (
        <FileUpload
          onFileSelect={handleFileSelect}
          disabled={status.isProcessing}
        />
      )}

      {showTypeSelector && (
        <QuestionTypeSelector
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          onProceed={handleProceedWithType}
          onCancel={handleCancelTypeSelection}
        />
      )}

      {status.isProcessing && (
        <LoadingSpinner message={status.progress} />
      )}

      {status.error && (
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-red-800 font-semibold mb-2">Error Processing File</h3>
              <p className="text-red-700">{status.error}</p>
              <button
                onClick={handleReset}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <>
          <div className="max-w-4xl mx-auto px-8 mb-4">
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Upload New File
            </button>
          </div>
          <QuestionList questions={questions} />
        </>
      )}
    </>
  );
};
