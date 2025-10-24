# Development Mode Setup

## 🚀 Running in Development Mode

For development with hot-reload, you need to run **TWO servers**:

### Terminal 1: Express Server (Auth Endpoint)
```bash
cd paperplane-ui
node server.js
```
This runs on **port 3000** and provides:
- `/api/auth/login` endpoint
- Serves production build (if needed)

### Terminal 2: Vite Dev Server (Frontend)
```bash
cd paperplane-ui
npm run dev
```
This runs on **port 5173** (or 5174) and provides:
- Hot module reload
- Dev server with fast refresh
- **Proxies `/api` requests to port 3000**

## 🔐 Login Credentials

Check your `.env` file:
```bash
AUTH_USERNAME=admin
AUTH_PASSWORD=password
```

## ✅ Verification

1. Express server running: `curl http://localhost:3000/api/health`
2. Vite dev server: Open http://localhost:5173 in browser
3. Test login with credentials from `.env`

## 🔧 Troubleshooting

### "Failed to connect to server"
- Make sure Express server (Terminal 1) is running
- Check: `curl http://localhost:3000/api/auth/login`

### Vite proxy not working
- Restart Vite dev server (Ctrl+C then `npm run dev`)
- Verify `vite.config.ts` has proxy configuration

### Can't login
- Check credentials in `.env` match what you're entering
- Check browser console for errors
- Verify Express server logs show the request

## 📝 Quick Test

Test authentication from command line:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Should return:
```json
{
  "success": true,
  "username": "admin",
  "token": "..."
}
```
