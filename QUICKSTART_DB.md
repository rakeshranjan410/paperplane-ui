# Quick Start: Database Features

Get S3 and MongoDB integration working in 10 minutes! ⚡

## Step 1: AWS S3 Setup (5 minutes)

### Create S3 Bucket
1. Go to [AWS Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter bucket name (e.g., `my-questions-images`)
4. Choose region (e.g., `us-east-1`)
5. **Uncheck** "Block all public access" (for public images)
6. Click "Create bucket"

### Get AWS Credentials
1. Go to [IAM Users](https://console.aws.amazon.com/iam/home#/users)
2. Click "Add user" → Enter name → Enable "Programmatic access"
3. Attach policy: `AmazonS3FullAccess`
4. **Save** Access Key ID and Secret Access Key

## Step 2: MongoDB Setup (3 minutes)

### MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free account → Create cluster (M0 Free tier)
3. Create database user:
   - Username: `admin`
   - Password: (generate or create strong password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all - development only)
5. Click "Connect" → "Connect your application"
6. Copy connection string:
   ```
   mongodb+srv://admin:PASSWORD@cluster.mongodb.net/
   ```

## Step 3: Configure Environment (2 minutes)

Edit `.env` file:

```env
# AWS S3
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
VITE_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_S3_BUCKET_NAME=my-questions-images

# MongoDB
VITE_MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster.mongodb.net/
VITE_MONGODB_DATABASE=questions_db
VITE_MONGODB_COLLECTION=questions
```

Replace:
- `AKIAIOSFODNN7EXAMPLE` with your AWS Access Key ID
- `wJalrXUtnFEMI...` with your AWS Secret Access Key
- `PASSWORD` with your MongoDB password
- `cluster.mongodb.net` with your actual cluster address

## Step 4: Restart & Test

```bash
# Restart dev server
npm run dev
```

## Step 5: Upload Questions

1. Upload your markdown file
2. Click **"Push to DB"** on any question
3. Watch it upload! ✨

### What Happens:
1. ✅ Image downloads from original URL
2. ✅ Uploads to S3 with unique hash name
3. ✅ Saves question to MongoDB with S3 URL
4. ✅ Shows "Upload Successful" in green

### If It Fails:
- ❌ Automatic rollback (deletes S3 image and MongoDB entry)
- ❌ Shows error message in red
- ❌ No duplicate or orphaned data!

## Verify It Worked

### Check S3
1. Go to S3 bucket in AWS Console
2. Look for `questions/` folder
3. See your image with hash name!

### Check MongoDB
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. See your question in `questions_db.questions`!

## Batch Upload (Bonus)

Click **"Push All to DB"** at the top to upload ALL questions at once!

## Troubleshooting

### S3 Error: "Access Denied"
- Check IAM user has S3 permissions
- Verify bucket name is correct

### MongoDB Error: "Authentication failed"
- Check username/password in connection string
- Ensure password is URL-encoded (use %40 for @, etc.)

### MongoDB Error: "IP not whitelisted"
- Add your IP to Network Access in Atlas
- Or use `0.0.0.0/0` for development

### Error: "Question already exists"
- Question ID is already in database
- This prevents duplicates!

## Security Warning ⚠️

**Current setup is for DEVELOPMENT only!**

For production:
- Move AWS/MongoDB credentials to backend server
- Never expose credentials in frontend
- Use environment variables on server
- Implement authentication

See [DB_INTEGRATION.md](./DB_INTEGRATION.md) for production setup.

---

**That's it! You're ready to use database features!** 🎉

Upload a question → Click "Push to DB" → Watch the magic happen! ✨
