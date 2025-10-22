import React, { useState } from 'react';
import { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { Download, Database, Loader2, CheckCircle } from 'lucide-react';
import { uploadMultipleQuestions } from '../services/uploadService';

interface QuestionListProps {
  questions: Question[];
}

type BatchUploadStatus = 'idle' | 'uploading' | 'completed';

export const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  const [batchStatus, setBatchStatus] = useState<BatchUploadStatus>('idle');
  const [batchMessage, setBatchMessage] = useState<string>('');

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchUpload = async () => {
    setBatchStatus('uploading');
    setBatchMessage('Uploading all questions to database...');

    try {
      const result = await uploadMultipleQuestions(questions);
      setBatchStatus('completed');
      setBatchMessage(
        `Upload completed! ${result.successful} successful, ${result.failed} failed.`
      );
    } catch (error) {
      setBatchStatus('completed');
      setBatchMessage(error instanceof Error ? error.message : 'Batch upload failed');
    }
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Extracted Questions ({questions.length})
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleBatchUpload}
              disabled={batchStatus === 'uploading'}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {batchStatus === 'uploading' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading All...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Push All to DB
                </>
              )}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              Download JSON
            </button>
          </div>
        </div>

        {batchMessage && (
          <div className={`
            p-4 rounded-lg border flex items-start gap-3
            ${batchStatus === 'uploading' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            ${batchStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          `}>
            {batchStatus === 'uploading' && <Loader2 className="animate-spin flex-shrink-0 mt-0.5" size={20} />}
            {batchStatus === 'completed' && <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />}
            <span>{batchMessage}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
};
