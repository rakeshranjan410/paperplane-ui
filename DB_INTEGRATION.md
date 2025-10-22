# Database Integration Guide

This guide covers the S3 and MongoDB integration features added to the Markdown Q&A Processor.

## 🎯 Features

- **S3 Image Upload**: Automatically uploads question images to AWS S3 with unique hash-based filenames
- **MongoDB Storage**: Saves question data to MongoDB with S3 image URLs
- **Rollback Mechanism**: Automatically rolls back changes if any step fails
- **Batch Upload**: Upload all questions at once with a single click
- **Duplicate Prevention**: Checks for existing questions before uploading

## 📋 Prerequisites

### AWS S3 Setup

1. **Create an S3 Bucket**
   - Log in to AWS Console
   - Navigate to S3 service
   - Create a new bucket (e.g., `my-questions-bucket`)
   - Enable public access for uploaded images (or use signed URLs in production)
   - Note your bucket name and region

2. **Create IAM User with S3 Access**
   - Navigate to IAM > Users > Add user
   - Enable programmatic access
   - Attach policy: `AmazonS3FullAccess` (or create a custom policy)
   - Save the Access Key ID and Secret Access Key

3. **Configure S3 Bucket Policy** (Optional - for public access)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
       }
     ]
   }
   ```

### MongoDB Setup

1. **Create a MongoDB Database**
   - Option 1: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
   - Option 2: Self-hosted MongoDB instance

2. **MongoDB Atlas Setup** (Recommended)
   - Create a free account at MongoDB Atlas
   - Create a new cluster
   - Create a database user (username & password)
   - Whitelist your IP address (or use 0.0.0.0/0 for development)
   - Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

3. **Create Database and Collection**
   - Database name: `questions_db` (or your choice)
   - Collection name: `questions` (or your choice)

## ⚙️ Configuration

### 1. Update Environment Variables

Edit your `.env` file:

```env
# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# AWS S3 Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
VITE_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_S3_BUCKET_NAME=my-questions-bucket

# MongoDB Configuration
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
VITE_MONGODB_DATABASE=questions_db
VITE_MONGODB_COLLECTION=questions
```

### 2. Install Dependencies

The required packages should already be installed:

```bash
npm install
```

New dependencies added:
- `@aws-sdk/client-s3` - AWS S3 client
- `mongodb` - MongoDB driver
- `crypto-js` - For generating unique image hashes

## 🚀 Usage

### Individual Question Upload

1. Upload and parse your markdown file
2. Review the extracted questions
3. Click **"Push to DB"** on any question card
4. Watch the upload progress:
   - Uploading... (blue) - Currently processing
   - Upload Successful (green) - Completed successfully
   - Upload Failed (red) - Error occurred with rollback

### Batch Upload

1. Upload and parse your markdown file
2. Click **"Push All to DB"** at the top of the question list
3. All questions will be uploaded sequentially
4. View the summary: "X successful, Y failed"

## 🔄 How It Works

### Upload Process

1. **Check for Duplicates**: Verifies the question doesn't already exist in MongoDB
2. **Upload Image to S3**: 
   - Downloads the image from the original URL
   - Generates a unique hash-based filename
   - Uploads to S3 bucket
   - Returns the S3 URL
3. **Save to MongoDB**:
   - Updates the question JSON with the S3 image URL
   - Saves to MongoDB with metadata (upload timestamp, etc.)

### Rollback Mechanism

If any step fails:
1. **MongoDB rollback**: Deletes the inserted document (if created)
2. **S3 rollback**: Deletes the uploaded image (if uploaded)
3. **Error message**: Shows detailed error with rollback confirmation

This ensures no orphaned data or duplicates.

## 📊 Data Structure

### MongoDB Document Schema

```typescript
{
  _id: ObjectId("..."),
  id: 1,                              // Question number
  description: "Question text...",    // Question description
  options: ["Option 1", "Option 2"], // Answer options
  imageUrl: "https://bucket.s3....", // Updated S3 URL
  originalImageUrl: "https://cdn...", // Original image URL
  s3ImageUrl: "https://bucket.s3...", // S3 URL (same as imageUrl)
  uploadedAt: ISODate("2025-10-21...") // Upload timestamp
}
```

### S3 File Structure

```
s3://your-bucket-name/
└── questions/
    ├── a1b2c3d4e5f6...hash1.jpg
    ├── f6e5d4c3b2a1...hash2.jpg
    └── ...
```

Each image gets a unique SHA-256 hash name to prevent collisions.

## 🛡️ Security Considerations

### ⚠️ Important for Production

**Current Setup**: The app uses environment variables directly in the browser (client-side). This is **NOT SECURE** for production.

**Recommended Production Setup**:

1. **Create a Backend API**:
   ```javascript
   // backend/routes/questions.js
   app.post('/api/upload-question', async (req, res) => {
     const { question } = req.body;
     // Use server-side AWS/MongoDB credentials
     const result = await uploadQuestionToDB(question);
     res.json(result);
   });
   ```

2. **Move Credentials to Backend**:
   - Store AWS and MongoDB credentials on the server
   - Never expose them to the frontend
   - Use environment variables on the server

3. **Update Frontend**:
   ```typescript
   // Frontend calls backend API instead of direct S3/MongoDB
   const result = await fetch('/api/upload-question', {
     method: 'POST',
     body: JSON.stringify({ question }),
   });
   ```

### Best Practices

- ✅ Use IAM roles with minimum required permissions
- ✅ Enable MFA for AWS and MongoDB Atlas accounts
- ✅ Rotate credentials regularly
- ✅ Use signed URLs for private S3 objects
- ✅ Implement rate limiting on your backend
- ✅ Add authentication/authorization
- ✅ Never commit `.env` file to version control

## 🧪 Testing

### Test S3 Upload

1. Ensure `.env` is configured correctly
2. Upload a markdown file with images
3. Click "Push to DB" on a question
4. Check your S3 bucket for the uploaded image
5. Verify the image is accessible via the S3 URL

### Test MongoDB Save

1. After successful upload, check MongoDB:
   ```javascript
   // MongoDB Compass or Shell
   db.questions.find().pretty()
   ```
2. Verify the document has the correct structure
3. Check that `imageUrl` points to S3

### Test Rollback

1. Temporarily break your MongoDB connection (wrong URI)
2. Try to upload a question
3. Verify the S3 image is deleted (rollback worked)
4. Fix the connection and retry

## 🐛 Troubleshooting

### S3 Upload Fails

**Error**: "Access Denied"
- **Solution**: Check IAM user permissions and S3 bucket policy

**Error**: "Bucket not found"
- **Solution**: Verify `VITE_S3_BUCKET_NAME` is correct

**Error**: "Image download failed"
- **Solution**: Check if the original image URL is accessible

### MongoDB Save Fails

**Error**: "Connection refused"
- **Solution**: Check MongoDB URI and whitelist your IP in Atlas

**Error**: "Authentication failed"
- **Solution**: Verify username/password in MongoDB URI

**Error**: "Question already exists"
- **Solution**: The question ID is already in the database

### Rollback Issues

**Error**: "Rollback failed"
- **Solution**: Check console for details. May need manual cleanup

## 📈 Monitoring

### Check Upload Statistics

Open browser console to see detailed logs:
```
Starting OpenAI request...
✓ Image uploaded to S3: https://...
✓ Question saved to MongoDB with ID: ...
```

### MongoDB Queries

```javascript
// Count total questions
db.questions.countDocuments()

// Find questions uploaded today
db.questions.find({
  uploadedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})

// Find questions with S3 images
db.questions.find({ s3ImageUrl: { $exists: true } })
```

## 🎨 Customization

### Change S3 Folder Structure

Edit `src/services/s3.ts`:
```typescript
return `custom-folder/${hash}.${extension}`; // Instead of questions/
```

### Change Image Hash Algorithm

Edit `src/services/s3.ts`:
```typescript
const hash = CryptoJS.SHA512(`${imageUrl}...`).toString(); // Use SHA-512
```

### Add Custom Metadata

Edit `src/services/mongodb.ts`:
```typescript
const document: QuestionDocument = {
  ...question,
  uploadedAt: new Date(),
  uploadedBy: 'username', // Add user info
  tags: ['physics', 'thermodynamics'], // Add tags
  // ... other custom fields
};
```

## 📚 API Reference

### `uploadQuestionToDB(question: Question): Promise<UploadResult>`

Uploads a single question to S3 and MongoDB with rollback.

**Returns**:
```typescript
{
  success: boolean,
  message: string,
  s3Url?: string,
  mongoId?: string
}
```

### `uploadMultipleQuestions(questions: Question[]): Promise<BatchResult>`

Uploads multiple questions sequentially.

**Returns**:
```typescript
{
  successful: number,
  failed: number,
  results: UploadResult[]
}
```

---

**Need Help?** Check the browser console for detailed error messages and logs.

**Found a Bug?** Please report it with the full error message and steps to reproduce.
