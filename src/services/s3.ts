import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import CryptoJS from 'crypto-js';

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

/**
 * Generate a unique hash name for an image based on its URL and timestamp
 */
export function generateImageHash(imageUrl: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const hash = CryptoJS.SHA256(`${imageUrl}-${timestamp}-${randomSuffix}`).toString();
  
  // Get file extension from URL or default to jpg
  const urlParts = imageUrl.split('?')[0].split('.');
  const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'jpg';
  
  return `questions/${hash}.${extension}`;
}

/**
 * Download image from URL and convert to buffer
 */
async function downloadImage(imageUrl: string): Promise<Uint8Array> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${imageUrl}: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Upload image to S3 bucket
 */
export async function uploadImageToS3(imageUrl: string): Promise<string> {
  if (!imageUrl) {
    throw new Error('No image URL provided');
  }

  console.log('Downloading image from:', imageUrl);
  const imageBuffer = await downloadImage(imageUrl);
  
  const key = generateImageHash(imageUrl);
  
  console.log('Uploading to S3 with key:', key);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg', // You can make this dynamic based on extension
    ACL: 'public-read', // Make sure your S3 bucket allows public-read ACL
  });

  await s3Client.send(command);
  
  // Return the S3 URL
  const s3Url = `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
  console.log('Image uploaded successfully to:', s3Url);
  
  return s3Url;
}

/**
 * Delete image from S3 bucket (used for rollback)
 */
export async function deleteImageFromS3(s3Key: string): Promise<void> {
  if (!s3Key) {
    return;
  }

  console.log('Deleting image from S3:', s3Key);
  
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
  console.log('Image deleted successfully from S3');
}

/**
 * Extract S3 key from S3 URL
 */
export function extractS3Key(s3Url: string): string {
  const url = new URL(s3Url);
  return url.pathname.substring(1); // Remove leading slash
}
