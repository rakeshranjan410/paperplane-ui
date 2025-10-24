# Development Guide

## 🏗️ How to Run the Application

### Option 1: Development Mode (Recommended for Local Development)

**Two Terminal Approach:**

Terminal 1 - Start Backend Server:
```bash
# Make sure .env has AUTH_USERNAME and AUTH_PASSWORD
npm start
```
This runs the Express server on port 3000 with the auth endpoint.

Terminal 2 - Start Frontend Dev Server:
```bash
npm run dev
```
This runs Vite dev server on port 5173 with hot reload.

**Access:** http://localhost:5173

The Vite dev server will proxy `/api/*` requests to the backend at `http://localhost:3000`.

### Option 2: Production Mode (Same as EC2)

```bash
# 1. Build the app
npm run build

# 2. Start the server
npm start
```

**Access:** http://localhost:3000

This serves the built React app and handles `/api/auth/login` on the same port.

## 🔐 Setting Up Authentication

### 1. Configure .env

Create or edit `.env` file:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key

# Environment
VITE_HOST_ENV=local

# API URL (for questions/upload endpoints)
VITE_API_URL_PROD=http://13.210.218.219:4000

# Authentication Credentials
AUTH_USERNAME=admin
AUTH_PASSWORD=MySecurePassword123!
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Test Login

1. Start the app (see options above)
2. Open in browser
3. Enter your username and password
4. Click "Sign In"

## 🐛 Troubleshooting

### "Failed to connect to server" Error

**Development Mode:**
- ✅ Make sure backend is running: `npm start` in one terminal
- ✅ Frontend should be on port 5173: `npm run dev` in another terminal
- ✅ Check `.env` has `AUTH_USERNAME` and `AUTH_PASSWORD`

**Production Mode:**
- ✅ Make sure you built first: `npm run build`
- ✅ Start server: `npm start`
- ✅ Access at port 3000: `http://localhost:3000`

### "Invalid credentials" Error

- ✅ Check `.env` file has correct `AUTH_USERNAME` and `AUTH_PASSWORD`
- ✅ Restart the server after changing `.env`
- ✅ No extra spaces or quotes around values

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Changes Not Showing Up

**Development Mode:**
- Frontend changes: Auto-reload with Vite
- Backend changes: Restart `npm start` in Terminal 1

**Production Mode:**
- Rebuild: `npm run build`
- Restart: `npm start`

## 📦 Building for Production

```bash
# Build the optimized production bundle
npm run build

# Test the production build locally
npm start

# Deploy to EC2 (from EC2 instance)
./deploy.sh
```

## 🚀 Deployment to EC2

See `DEPLOY_LOCAL_AUTH.md` for complete EC2 deployment instructions.

Quick version:
```bash
# SSH to EC2
cd ~/paperplane-v3/paperplane-ui
git pull origin main

# Update .env with AUTH_USERNAME and AUTH_PASSWORD
nano .env

# Deploy
./deploy.sh
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key |
| `VITE_HOST_ENV` | Yes | `local` or `production` |
| `VITE_API_URL_PROD` | Yes | Backend API URL |
| `AUTH_USERNAME` | Yes | Login username |
| `AUTH_PASSWORD` | Yes | Login password |

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Test locally** using development mode
3. **Build** using `npm run build`
4. **Test production build** with `npm start`
5. **Commit & push** to GitHub
6. **Deploy to EC2** using `./deploy.sh`

## 🎯 Quick Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev          # Frontend (port 5173)
npm start            # Backend (port 3000) - run in separate terminal

# Production mode
npm run build        # Build
npm start            # Serve

# PM2 (Production)
npm run pm2:start    # Start with PM2
npm run pm2:restart  # Restart
npm run pm2:logs     # View logs
npm run pm2:stop     # Stop
```

## ⚙️ How It Works

### Development Mode
```
Browser → http://localhost:5173 → Vite Dev Server
                                       ↓
                    /api/auth/login → Proxy → http://localhost:3000 → Express Server
```

### Production Mode
```
Browser → http://localhost:3000 → Express Server
                                       ↓
                    /api/auth/login → Express handles auth
                    /*              → Serves built React app from /dist
```

## 🔐 Security Notes

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use strong passwords** - Don't use "password" or "admin"
3. **HTTPS in production** - Set up nginx with SSL on EC2
4. **Change default credentials** - Always customize `AUTH_USERNAME` and `AUTH_PASSWORD`

## 💡 Tips

- Use **development mode** for faster iteration (hot reload)
- Use **production mode** to test the actual deployment setup
- Always test login after changing auth credentials
- Check PM2 logs if login fails on EC2: `pm2 logs paperplane-ui`
