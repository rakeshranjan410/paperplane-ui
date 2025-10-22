import { Question } from '../types';
import { API_BASE_URL } from '../config/environment';

export interface UploadResult {
  success: boolean;
  message: string;
  s3Url?: string;
  mongoId?: string;
}

/**
 * Upload question to S3 and MongoDB via backend API
 */
export async function uploadQuestionToDB(question: Question): Promise<UploadResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error uploading question:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to backend API. Make sure the backend server is running at ' + API_BASE_URL,
    };
  }
}

/**
 * Batch upload multiple questions via backend API
 */
export async function uploadMultipleQuestions(questions: Question[]): Promise<{
  successful: number;
  failed: number;
  results: UploadResult[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/upload-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions }),
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        successful: result.successful,
        failed: result.failed,
        results: result.results,
      };
    } else {
      return {
        successful: 0,
        failed: questions.length,
        results: questions.map(() => ({
          success: false,
          message: result.message || 'Batch upload failed',
        })),
      };
    }

  } catch (error) {
    console.error('Error uploading batch:', error);
    return {
      successful: 0,
      failed: questions.length,
      results: questions.map(() => ({
        success: false,
        message: 'Failed to connect to backend API. Make sure the backend server is running.',
      })),
    };
  }
}

export interface QuestionFilters {
  subject?: string;
  chapter?: string;
  section?: string;
}

/**
 * Fetch all questions from MongoDB via backend API with optional filtering
 */
export async function getAllQuestionsFromDB(filters?: QuestionFilters): Promise<{
  success: boolean;
  questions: Question[];
  error?: string;
}> {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters?.subject) {
      queryParams.append('subject', filters.subject);
    }
    if (filters?.chapter) {
      queryParams.append('chapter', filters.chapter);
    }
    if (filters?.section) {
      queryParams.append('section', filters.section);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/questions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        questions: result.questions,
      };
    } else {
      return {
        success: false,
        questions: [],
        error: result.message || 'Failed to fetch questions',
      };
    }

  } catch (error) {
    console.error('Error fetching questions:', error);
    return {
      success: false,
      questions: [],
      error: 'Failed to connect to backend API. Make sure the backend server is running.',
    };
  }
}

/**
 * Fetch filter options (unique subjects, chapters, sections)
 */
export async function getFilterOptions(): Promise<{
  success: boolean;
  options?: {
    subjects: string[];
    chapters: string[];
    sections: string[];
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/filter-options`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        options: result.options,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to fetch filter options',
      };
    }

  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      success: false,
      error: 'Failed to connect to backend API.',
    };
  }
}

/**
 * Create database indexes for optimized filtering
 */
export async function createDatabaseIndexes(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/create-indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error creating indexes:', error);
    return {
      success: false,
      message: 'Failed to connect to backend API.',
    };
  }
}

/**
 * Update a question in MongoDB by _id
 */
export async function updateQuestionInDB(mongoId: string, question: Question): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/${mongoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error updating question:', error);
    return {
      success: false,
      message: 'Failed to connect to backend API.',
    };
  }
}

/**
 * Delete a question from MongoDB by _id
 */
export async function deleteQuestionFromDB(mongoId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions/${mongoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error deleting question:', error);
    return {
      success: false,
      message: 'Failed to connect to backend API.',
    };
  }
}
