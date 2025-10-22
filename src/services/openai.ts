import OpenAI from 'openai';
import { v5 as uuidv5 } from 'uuid';
import { Question, QuestionType } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Namespace UUID for question IDs (can be any valid UUID)
const QUESTION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

if (!apiKey) {
  console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

/**
 * Extract metadata (subject, chapter, section) from markdown headers
 */
function extractMetadata(markdown: string): { subject?: string; chapter?: string; section?: string } {
  const metadata: { subject?: string; chapter?: string; section?: string } = {};
  
  // Match patterns like: ## Subject - Physics
  const subjectMatch = markdown.match(/^##\s*Subject\s*-\s*(.+)$/im);
  const chapterMatch = markdown.match(/^##\s*Chapter\s*-\s*(.+)$/im);
  const sectionMatch = markdown.match(/^##\s*Section\s*-\s*(.+)$/im);
  
  if (subjectMatch) metadata.subject = subjectMatch[1].trim();
  if (chapterMatch) metadata.chapter = chapterMatch[1].trim();
  if (sectionMatch) metadata.section = sectionMatch[1].trim();
  
  return metadata;
}

/**
 * Generate UUID v5 for a question based on its metadata
 */
function generateQuestionId(
  subject: string,
  chapter: string,
  section: string,
  type: string,
  questionNumber: number
): string {
  const idString = `${subject}-${chapter}-${section}-${type}-${questionNumber}`;
  return uuidv5(idString, QUESTION_NAMESPACE);
}

/**
 * Get type-specific prompt that doesn't extract answers
 */
function getPromptForType(questionType: QuestionType | 'auto'): string {
  const baseInstructions = `You are a helpful assistant that extracts questions from markdown content.

The markdown may have metadata headers at the top:
- ## Subject - [Subject Name]
- ## Chapter - [Chapter Name]  
- ## Section - [Section Name]

CRITICAL: DO NOT extract or guess answers. Leave the "answers" field as an empty array [].
The user will select answers manually in the UI after extraction.

Extract ALL images from markdown and put in appropriate images arrays.
Preserve mathematical formulas exactly as written (use $...$ format).
Return ONLY a valid JSON array, no additional text.`;

  if (questionType === 'single' || questionType === 'multiple') {
    return `${baseInstructions}

Extract SINGLE or MULTIPLE CHOICE questions with this structure:
{
  "id": number (question number from markdown),
  "type": "${questionType}",
  "content": { "text": "question text", "images": ["url1", "url2"] },
  "options": [
    { "text": "option text", "image_url": "url if any" }
  ],
  "answers": []  // ALWAYS EMPTY - user will select in UI
}

Extract question text and all options (1), (2), (3), (4).
Do NOT try to determine which option is correct.`;
  }

  if (questionType === 'integer') {
    return `${baseInstructions}

Extract INTEGER/NUMERICAL questions with this structure:
{
  "id": number (question number from markdown),
  "type": "integer",
  "content": { "text": "question text", "images": ["url1", "url2"] },
  "options": [],
  "answers": []  // ALWAYS EMPTY - user will enter in UI
}

Extract only the question text and any images.`;
  }

  if (questionType === 'matrix') {
    return `${baseInstructions}

Extract MATRIX MATCH questions with this structure:
{
  "id": number (question number from markdown),
  "type": "matrix",
  "content": { "text": "question text", "images": [] },
  "matrix_match": {
    "columnA": ["A. item 1", "B. item 2"],
    "columnB": ["P. item 1", "Q. item 2"],
    "map": {}  // ALWAYS EMPTY - user will map in UI
  }
}

Extract Column A items (A, B, C...) and Column B items (P, Q, R...).
Do NOT try to determine the correct mapping.`;
  }

  if (questionType === 'comprehension') {
    return `${baseInstructions}

Extract COMPREHENSION questions with this structure:

CRITICAL: Group all sub-questions under ONE comprehension passage!

Format in markdown:
## For Problems X-Y    ← This means ONE comprehension question
[Passage text here]
X. Sub-question 1...
Y. Sub-question 2...

Extract as ONE question:
{
  "id": X (first sub-question number),
  "type": "comprehension",
  "comprehension_passage": { 
    "text": "[Full passage text]", 
    "images": [] 
  },
  "sub_questions": [
    {
      "type": "single",
      "content": { "text": "Sub-question 1 text", "images": [] },
      "options": [{ "text": "option", "image_url": "" }],
      "answers": []
    },
    {
      "type": "single",
      "content": { "text": "Sub-question 2 text", "images": [] },
      "options": [{ "text": "option", "image_url": "" }],
      "answers": []
    }
  ]
}

IMPORTANT RULES:
1. "## For Problems 1-3" means questions 1, 2, 3 share the SAME passage
2. Create ONE comprehension object with id = first question number
3. Put ALL sub-questions (1, 2, 3) in the sub_questions array
4. The passage is the text between "## For Problems" and the first numbered question
5. Do NOT create separate comprehension objects for each sub-question
6. Each "## For Problems X-Y" section = ONE comprehension question

Example:
## For Problems 1-3
A car accelerates...

1. What is velocity?
2. What is acceleration?
3. What is distance?

Should extract as ONE question with id=1 and 3 sub-questions, NOT 3 separate questions.

Do NOT try to determine correct answers for sub-questions.`;
  }

  // Auto-detect mode
  return `${baseInstructions}

The markdown will have section headers indicating question type:
- "Single Correct Answer Type" or similar → type: "single"
- "Multiple Correct Answers Type" or similar → type: "multiple"  
- "Integer/Numerical Type" or similar → type: "integer"
- "Matrix Match Type" or similar → type: "matrix"
- "Linked Comprehension Type" or similar → type: "comprehension"

Extract each question with appropriate structure based on type detected.

For SINGLE/MULTIPLE/INTEGER types:
{
  "id": number,
  "type": "single" | "multiple" | "integer",
  "content": { "text": "question text", "images": [] },
  "options": [{ "text": "option text", "image_url": "" }],
  "answers": []  // ALWAYS EMPTY
}

For MATRIX MATCH type:
{
  "id": number,
  "type": "matrix",
  "content": { "text": "question text", "images": [] },
  "matrix_match": {
    "columnA": ["A. item 1"],
    "columnB": ["P. item 1"],
    "map": {}  // ALWAYS EMPTY
  }
}

For COMPREHENSION type:
CRITICAL: "## For Problems X-Y" means ONE comprehension question with multiple sub-questions!

{
  "id": X (first sub-question number),
  "type": "comprehension",
  "comprehension_passage": { "text": "passage", "images": [] },
  "sub_questions": [
    {
      "type": "single" | "multiple",
      "content": { "text": "sub-question 1", "images": [] },
      "options": [{ "text": "option", "image_url": "" }],
      "answers": []  // ALWAYS EMPTY
    },
    {
      "type": "single" | "multiple",
      "content": { "text": "sub-question 2", "images": [] },
      "options": [{ "text": "option", "image_url": "" }],
      "answers": []  // ALWAYS EMPTY
    }
  ]
}

RULES for comprehension:
- "## For Problems 1-3" = ONE question with id=1, containing 3 sub-questions
- Passage text is between "## For Problems" header and first numbered question
- Group ALL sub-questions under ONE comprehension object
- Do NOT create separate questions for each sub-question`;
}

export async function processMarkdownFile(
  markdownContent: string, 
  questionType: QuestionType | 'auto' = 'auto'
): Promise<Question[]> {
  try {
    // Extract metadata from markdown headers
    const metadata = extractMetadata(markdownContent);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',  // Updated to latest model with 128K context
      messages: [
        {
          role: 'system',
          content: getPromptForType(questionType)
        },
        {
          role: 'user',
          content: `Extract all questions from this markdown:\n\n${markdownContent}`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const questions: Question[] = JSON.parse(jsonMatch[0]);
    
    // Add metadata and generate UUIDs for each question
    return questions.map((q, index) => {
      // Store original question number
      const questionNumber = typeof q.id === 'number' ? q.id : (index + 1);
      
      // Generate UUID from metadata
      const uuid = generateQuestionId(
        metadata.subject || 'Unknown',
        metadata.chapter || 'Unknown',
        metadata.section || 'Unknown',
        q.type || 'single',
        questionNumber
      );
      
      // Backward compatibility: convert old format to new format
      if (q.description && !q.content) {
        return {
          ...q,
          id: uuid,
          questionNumber,
          subject: metadata.subject,
          chapter: metadata.chapter,
          section: metadata.section,
          type: q.type || 'single',
          content: {
            text: q.description,
            images: q.imageUrl ? [q.imageUrl] : []
          },
          options: q.options?.map(opt => ({
            text: typeof opt === 'string' ? opt : opt.text,
            image_url: typeof opt === 'object' ? opt.image_url : undefined
          }))
        };
      }
      
      // Add metadata and UUID to new format
      return {
        ...q,
        id: uuid,
        questionNumber,
        subject: metadata.subject,
        chapter: metadata.chapter,
        section: metadata.section,
      };
    });

  } catch (error) {
    console.error('Error processing markdown:', error);
    throw error;
  }
}
