import React, { useState } from 'react';
import { Question } from '../types';
import { uploadQuestionToDB } from '../services/uploadService';
import { SingleMultipleQuestionEdit } from './questionTypes/SingleMultipleQuestionEdit';
import { IntegerQuestionEdit } from './questionTypes/IntegerQuestionEdit';
import { MatrixMatchQuestionEdit } from './questionTypes/MatrixMatchQuestionEdit';
import { ComprehensionQuestionEdit } from './questionTypes/ComprehensionQuestionEdit';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>(question.answers || []);

  const handleAnswersChange = (newAnswers: string[]) => {
    setAnswers(newAnswers);
  };

  const handlePushToDB = async () => {
    // Validate that answers are provided
    if (!answers || answers.length === 0) {
      setUploadStatus('error');
      setUploadMessage('Please select/enter answer(s) before uploading');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading to database...');

    try {
      // Create question with answers
      const questionWithAnswers = {
        ...question,
        answers: answers
      };

      const result = await uploadQuestionToDB(questionWithAnswers);
      
      if (result.success) {
        setUploadStatus('success');
        setUploadMessage(result.message);
      } else {
        setUploadStatus('error');
        setUploadMessage(result.message);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const getButtonContent = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Uploading...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle size={18} />
            <span>Upload Successful</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={18} />
            <span>Upload Failed</span>
          </>
        );
      default:
        return (
          <>
            <Database size={18} />
            <span>Push to DB</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'bg-blue-500 cursor-wait';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const renderQuestion = () => {
    const questionType = question.type || 'single';
    
    switch (questionType) {
      case 'single':
      case 'multiple':
        return <SingleMultipleQuestionEdit question={question} onAnswersChange={handleAnswersChange} />;
      case 'integer':
        return <IntegerQuestionEdit question={question} onAnswersChange={handleAnswersChange} />;
      case 'matrix':
        return <MatrixMatchQuestionEdit question={question} onAnswersChange={handleAnswersChange} />;
      case 'comprehension':
        return <ComprehensionQuestionEdit question={question} onAnswersChange={handleAnswersChange} />;
      default:
        return <SingleMultipleQuestionEdit question={question} onAnswersChange={handleAnswersChange} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Question {question.questionNumber || question.id}
            </h3>
            {(question.subject || question.chapter || question.section) && (
              <div className="mt-1 text-xs text-gray-500">
                {question.subject && <span className="mr-2">📚 {question.subject}</span>}
                {question.chapter && <span className="mr-2">📖 {question.chapter}</span>}
                {question.section && <span>📑 {question.section}</span>}
              </div>
            )}
          </div>
          {question.id && typeof question.id === 'string' && question.id.length > 20 && (
            <span className="text-xs text-gray-400 font-mono" title={question.id}>
              ID: {question.id.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* Render appropriate question type */}
      {renderQuestion()}

      {/* Push to DB Button */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={handlePushToDB}
          disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
            text-white font-semibold transition-all
            disabled:opacity-70 disabled:cursor-not-allowed
            ${getButtonStyles()}
          `}
        >
          {getButtonContent()}
        </button>
        
        {uploadMessage && (
          <div className={`
            text-sm p-3 rounded-md
            ${uploadStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ''}
            ${uploadStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
            ${uploadStatus === 'uploading' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
          `}>
            {uploadMessage}
          </div>
        )}
      </div>

      {/* JSON Preview */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
          View JSON
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-xs">
          {JSON.stringify(question, null, 2)}
        </pre>
      </details>
    </div>
  );
};
