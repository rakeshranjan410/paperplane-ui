import React, { useState } from 'react';
import { Question } from '../types';
import { SingleMultipleQuestion } from './questionTypes/SingleMultipleQuestion';
import { IntegerQuestion } from './questionTypes/IntegerQuestion';
import { MatrixMatchQuestion } from './questionTypes/MatrixMatchQuestion';
import { ComprehensionQuestion } from './questionTypes/ComprehensionQuestion';
import { Trash2, Edit2, Save, X } from 'lucide-react';

interface ViewQuestionCardProps {
  question: Question;
  onDelete?: (questionId: string) => Promise<void>;
  onUpdate?: (questionId: string, updatedQuestion: Question) => Promise<void>;
  showDelete?: boolean;
  showEdit?: boolean;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (questionId: string, selected: boolean) => void;
}

export const ViewQuestionCard: React.FC<ViewQuestionCardProps> = ({ 
  question, 
  onDelete,
  onUpdate,
  showDelete = false,
  showEdit = false,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  const handleDelete = async () => {
    if (!question._id || !onDelete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete Question ${question.questionNumber || question.id}?`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(question._id);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedQuestion(question);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedQuestion(question);
  };

  const handleSave = async () => {
    if (!question._id || !onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(question._id, editedQuestion);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestion = () => {
    const questionType = (isEditing ? editedQuestion : question).type || 'single';
    const currentQuestion = isEditing ? editedQuestion : question;
    
    switch (questionType) {
      case 'single':
      case 'multiple':
        return <SingleMultipleQuestion 
          question={currentQuestion} 
          showAnswers={true}
          isEditing={isEditing}
          onQuestionChange={setEditedQuestion}
        />;
      case 'integer':
        return <IntegerQuestion 
          question={currentQuestion} 
          showAnswers={true}
          isEditing={isEditing}
          onQuestionChange={setEditedQuestion}
        />;
      case 'matrix':
        return <MatrixMatchQuestion 
          question={currentQuestion} 
          showAnswers={true}
          isEditing={isEditing}
          onQuestionChange={setEditedQuestion}
        />;
      case 'comprehension':
        return <ComprehensionQuestion 
          question={currentQuestion} 
          showAnswers={true}
          isEditing={isEditing}
          onQuestionChange={setEditedQuestion}
        />;
      default:
        return <SingleMultipleQuestion 
          question={currentQuestion} 
          showAnswers={true}
          isEditing={isEditing}
          onQuestionChange={setEditedQuestion}
        />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-4 border transition-shadow ${
      isSelected ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-200 hover:shadow-lg'
    }`}>
      <div className="mb-4">
        <div className="flex items-start justify-between">
          {showCheckbox && question._id && onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(question._id!, e.target.checked)}
              className="mr-4 mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              title="Select question"
            />
          )}
          <div className="flex-1">
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
          <div className="flex items-center gap-3">
            {question.id && typeof question.id === 'string' && question.id.length > 20 && (
              <span className="text-xs text-gray-400 font-mono" title={question.id}>
                ID: {question.id.slice(0, 8)}...
              </span>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  title="Cancel editing"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                  }`}
                  title="Save changes"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                {showEdit && question._id && onUpdate && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                    title="Edit question"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
                {showDelete && question._id && onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDeleting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                    title="Delete question"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render appropriate question type */}
      {renderQuestion()}

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
