export type QuestionType = 'single' | 'multiple' | 'integer' | 'matrix' | 'comprehension';

export interface QuestionContent {
  text: string;
  images?: string[];
}

export interface QuestionOption {
  text: string;
  image_url?: string;
}

export interface MatrixMatch {
  columnA: string[];
  columnB: string[];
  map: Record<string, string[]>; // e.g., { "A": ["P", "Q"], "B": ["R"] }
}

export interface SubQuestion {
  _id?: string;
  type: 'single' | 'multiple';
  content: QuestionContent;
  options: QuestionOption[];
  answers: string[];
}

export interface Question {
  _id?: string;  // MongoDB document ID
  id: string;  // UUID v5 generated from subject-chapter-section-type-number
  questionNumber?: number;  // Original question number from markdown
  subject?: string;
  chapter?: string;
  section?: string;
  type: QuestionType;
  
  content: QuestionContent;
  options?: QuestionOption[];
  answers?: string[];
  
  // For matrix match type
  matrix_match?: MatrixMatch;
  
  // For comprehension type
  comprehension_passage?: QuestionContent;
  sub_questions?: SubQuestion[];
  
  // Metadata
  meta?: {
    year?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    source?: string;
  };

  // Legacy fields for backward compatibility
  description?: string;
  imageUrl?: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress?: string;
  error?: string;
}
