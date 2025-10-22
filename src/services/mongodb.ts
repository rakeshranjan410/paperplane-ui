import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Question } from '../types';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB
 */
async function connectToMongo(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = import.meta.env.VITE_MONGODB_URI;
  const dbName = import.meta.env.VITE_MONGODB_DATABASE;

  if (!uri) {
    throw new Error('MongoDB URI is not configured. Please set VITE_MONGODB_URI in your .env file');
  }

  console.log('Connecting to MongoDB...');
  
  client = new MongoClient(uri);
  await client.connect();
  
  db = client.db(dbName);
  console.log('Connected to MongoDB successfully');
  
  return db;
}

/**
 * Get the questions collection
 */
async function getQuestionsCollection(): Promise<Collection> {
  const database = await connectToMongo();
  const collectionName = import.meta.env.VITE_MONGODB_COLLECTION || 'questions';
  return database.collection(collectionName);
}

/**
 * Extended Question type with MongoDB metadata
 */
export interface QuestionDocument extends Omit<Question, '_id'> {
  _id?: ObjectId;
  uploadedAt: Date;
  originalImageUrl?: string;
  s3ImageUrl?: string;
}

/**
 * Save question to MongoDB
 */
export async function saveQuestionToMongoDB(question: Question, s3ImageUrl?: string): Promise<string> {
  console.log('Saving question to MongoDB...');
  
  const collection = await getQuestionsCollection();
  
  const { _id, ...questionWithoutId } = question;
  
  const document: QuestionDocument = {
    ...questionWithoutId,
    uploadedAt: new Date(),
    originalImageUrl: question.imageUrl,
    s3ImageUrl: s3ImageUrl || question.imageUrl,
    imageUrl: s3ImageUrl || question.imageUrl, // Update imageUrl to S3 URL
  };

  const result = await collection.insertOne(document);
  
  console.log('Question saved to MongoDB with ID:', result.insertedId);
  
  return result.insertedId.toString();
}

/**
 * Delete question from MongoDB (used for rollback)
 */
export async function deleteQuestionFromMongoDB(documentId: string): Promise<void> {
  if (!documentId) {
    return;
  }

  console.log('Deleting question from MongoDB:', documentId);
  
  const collection = await getQuestionsCollection();
  await collection.deleteOne({ _id: new ObjectId(documentId) });
  
  console.log('Question deleted from MongoDB');
}

/**
 * Check if question already exists in MongoDB
 */
export async function questionExists(questionId: number): Promise<boolean> {
  const collection = await getQuestionsCollection();
  const count = await collection.countDocuments({ id: questionId });
  return count > 0;
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
