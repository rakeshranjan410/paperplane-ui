import { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { ViewQuestionCard } from '../components/ViewQuestionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllQuestionsFromDB, getFilterOptions, QuestionFilters, createDatabaseIndexes, deleteQuestionFromDB, updateQuestionInDB, deleteMultipleQuestionsFromDB } from '../services/uploadService';
import { AlertCircle, Database, Filter, RefreshCw, CheckCircle, Hash, Grid3x3, BookOpen, Trash2 } from 'lucide-react';

export const AllQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [filterOptions, setFilterOptions] = useState<{
    subjects: string[];
    chapters: string[];
    sections: string[];
  }>({ subjects: [], chapters: [], sections: [] });
  const [showFilters, setShowFilters] = useState(true);
  const [indexesCreated, setIndexesCreated] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<QuestionType | 'all'>('all');
  
  // Selection state for bulk delete
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    createIndexes();
  }, []);

  const createIndexes = async () => {
    const result = await createDatabaseIndexes();
    if (result.success) {
      setIndexesCreated(true);
      console.log('Database indexes created for optimized filtering');
    }
  };

  const fetchFilterOptions = async () => {
    const result = await getFilterOptions();
    if (result.success && result.options) {
      setFilterOptions(result.options);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setHasFetched(true);
    
    try {
      const result = await getAllQuestionsFromDB(filters);
      
      if (result.success) {
        setQuestions(result.questions);
      } else {
        setError(result.error || 'Failed to fetch questions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchClick = () => {
    fetchQuestions();
  };

  const handleUpdateQuestion = async (mongoId: string, updatedQuestion: Question) => {
    try {
      const result = await updateQuestionInDB(mongoId, updatedQuestion);
      
      if (result.success) {
        // Refetch questions after successful update
        await fetchQuestions();
      } else {
        throw new Error(result.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      throw error; // Re-throw to let ViewQuestionCard handle the error
    }
  };

  const handleDeleteQuestion = async (mongoId: string) => {
    try {
      const result = await deleteQuestionFromDB(mongoId);
      
      if (result.success) {
        // Refetch questions after successful deletion
        await fetchQuestions();
      } else {
        throw new Error(result.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error; // Re-throw to let ViewQuestionCard handle the error
    }
  };

  const handleSelectQuestion = (questionId: string, selected: boolean) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedQuestions.size === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedQuestions.size} selected question(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteMultipleQuestionsFromDB(Array.from(selectedQuestions));
      
      if (result.success) {
        // Clear selection and refetch questions
        setSelectedQuestions(new Set());
        await fetchQuestions();
        alert(`Successfully deleted ${result.deletedCount} question(s)`);
      } else {
        throw new Error(result.message || 'Failed to delete questions');
      }
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert('Failed to delete questions. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (filterType: keyof QuestionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.subject || filters.chapter || filters.section;

  // Helper functions for tabs
  const getQuestionsByType = (type: QuestionType | 'all') => {
    if (type === 'all') {
      return questions;
    }
    return questions.filter(q => q.type === type);
  };

  const sortByQuestionNumber = (questions: Question[]) => {
    return [...questions].sort((a, b) => {
      const numA = a.questionNumber || 0;
      const numB = b.questionNumber || 0;
      return numA - numB;
    });
  };

  const getTabQuestions = (type: QuestionType | 'all') => {
    return sortByQuestionNumber(getQuestionsByType(type));
  };

  const getQuestionCountByType = (type: QuestionType) => {
    return questions.filter(q => q.type === type).length;
  };

  const tabs = [
    { id: 'all' as const, label: 'All Questions', icon: Database, count: questions.length },
    { id: 'single' as const, label: 'Single Choice', icon: CheckCircle, count: getQuestionCountByType('single') },
    { id: 'multiple' as const, label: 'Multiple Choice', icon: CheckCircle, count: getQuestionCountByType('multiple') },
    { id: 'integer' as const, label: 'Integer/Numerical', icon: Hash, count: getQuestionCountByType('integer') },
    { id: 'matrix' as const, label: 'Matrix Match', icon: Grid3x3, count: getQuestionCountByType('matrix') },
    { id: 'comprehension' as const, label: 'Comprehension', icon: BookOpen, count: getQuestionCountByType('comprehension') },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            All Questions
          </h2>
          {hasFetched && (
            <p className="text-sm text-gray-600 mt-1">
              {questions.length} questions found
              {hasActiveFilters && (
                <> • <button onClick={clearFilters} className="text-blue-600 hover:underline">Clear filters</button></>
              )}
            </p>
          )}
        </div>
        {hasFetched && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter size={20} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {(!hasFetched || showFilters) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Filter Questions</h3>
            {indexesCreated && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-auto">
                ⚡ Indexed
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={filters.subject || ''}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {filterOptions.subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
              <select
                value={filters.chapter || ''}
                onChange={(e) => handleFilterChange('chapter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Chapters</option>
                {filterOptions.chapters.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={filters.section || ''}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {filterOptions.sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Fetch Button */}
          <div className="mt-6 flex justify-end gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Clear Filters
              </button>
            )}
            {hasFetched && selectedQuestions.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDeleting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Trash2 size={20} />
                {isDeleting ? `Deleting...` : `Delete All (${selectedQuestions.size})`}
              </button>
            )}
            <button
              onClick={handleFetchClick}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Fetch Questions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex items-start gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Questions</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner message="Fetching questions from database..." />
        </div>
      )}

      {/* Tabs and Questions - Only show after fetching */}
      {hasFetched && !isLoading && (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                        ${isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon size={18} />
                      {tab.label}
                      <span className={`
                        ml-2 px-2 py-0.5 text-xs rounded-full
                        ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                      `}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <Database className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-blue-900 font-semibold text-xl mb-2">
                {hasActiveFilters ? 'No Questions Match Filters' : 'No Questions Found'}
              </h3>
              <p className="text-blue-700">
                {hasActiveFilters 
                  ? 'Try adjusting your filters and fetch again.'
                  : 'No questions match the selected filters.'}
              </p>
            </div>
          ) : (
            <>
              {getTabQuestions(activeTab).length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Database className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-gray-700 font-semibold text-xl mb-2">
                    No {tabs.find(t => t.id === activeTab)?.label} Questions
                  </h3>
                  <p className="text-gray-600">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or switch to another tab.'
                      : 'No questions of this type in the database.'}
                  </p>
                </div>
              ) : (
                <>
                  {selectedQuestions.size > 0 && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-blue-600" size={20} />
                        <span className="text-blue-800 font-medium">
                          {selectedQuestions.size} question(s) selected
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedQuestions(new Set())}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {getTabQuestions(activeTab).map((question) => (
                      <ViewQuestionCard 
                        key={question.id} 
                        question={question}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                        showEdit={true}
                        showDelete={true}
                        showCheckbox={true}
                        isSelected={question._id ? selectedQuestions.has(question._id) : false}
                        onSelect={handleSelectQuestion}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
