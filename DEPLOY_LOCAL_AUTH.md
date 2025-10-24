# Quick Deployment Guide - Local Authentication

## ✅ What Changed

- ❌ **Removed**: AWS Cognito authentication
- ✅ **Added**: Simple username/password login
- ✅ **Backend**: Login endpoint at `/api/auth/login`
- ✅ **Credentials**: Stored in `.env` file

## 🚀 Deploy to EC2

### Step 1: Update `.env` on Your Local Machine

Edit `/Users/rakeshranjan/paperplane-v3/paperplane-ui/.env` and add:

```bash
# Authentication Credentials
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password
```

**Important:** Choose a strong password!

### Step 2: Deploy to EC2

SSH into your EC2 instance and run:

```bash
cd ~/paperplane-v3/paperplane-ui

# Pull latest changes
git pull origin main

# Update .env with your credentials
nano .env
# Add these lines:
# AUTH_USERNAME=admin
# AUTH_PASSWORD=your_secure_password

# Install new dependencies
npm install

# Build and deploy
./deploy.sh
```

### Step 3: Access Your Application

Open your browser and navigate to:
```
http://YOUR_EC2_IP:3000
```

You should see the new login page!

## 🔐 Login

- **Username**: Whatever you set as `AUTH_USERNAME` in `.env`
- **Password**: Whatever you set as `AUTH_PASSWORD` in `.env`

## 📋 Complete EC2 Deployment Commands

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Navigate to project
cd ~/paperplane-v3/paperplane-ui

# Pull latest code
git pull origin main

# Edit .env (add AUTH_USERNAME and AUTH_PASSWORD)
nano .env

# Install dependencies (includes dotenv)
npm install

# Deploy
./deploy.sh

# Check status
pm2 status
pm2 logs paperplane-ui
```

## 🛠️ Troubleshooting

### Login Page Not Loading
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs paperplane-ui

# Restart if needed
pm2 restart paperplane-ui
```

### Login Fails
```bash
# Check .env has correct credentials
cat .env | grep AUTH_

# Restart server to reload .env
pm2 restart paperplane-ui
```

### "Invalid credentials" Error
- Verify `AUTH_USERNAME` and `AUTH_PASSWORD` in `.env`
- Make sure there are no extra spaces or quotes
- Restart PM2: `pm2 restart paperplane-ui`

## 🔒 Security Notes

1. **Use Strong Password**: Don't use "admin" or "password"
2. **HTTPS Recommended**: Set up nginx with SSL for production
3. **Protect .env**: Never commit `.env` to git (already in .gitignore)
4. **AWS Security Group**: Only allow port 3000 from trusted IPs if possible

## 📝 Example .env File

```bash
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Environment
VITE_HOST_ENV=production

# API URL
VITE_API_URL_PROD=http://13.210.218.219:4000

# Authentication Credentials
AUTH_USERNAME=admin
AUTH_PASSWORD=MySecurePassword123!
```

## ✨ New Features

- ✅ Beautiful login form with username/password fields
- ✅ Error messages for invalid credentials
- ✅ Loading states during login
- ✅ Session persistence (stays logged in)
- ✅ Logout functionality in header
- ✅ No external dependencies (AWS Cognito removed)

## 🎉 You're Done!

Your application now uses simple local authentication. No more AWS Cognito configuration needed!
