# Local Authentication Setup

This application now uses local username/password authentication instead of AWS Cognito.

## Setup Instructions

### 1. Configure Environment Variables

Edit your `.env` file and set your login credentials:

```bash
# Local Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password_here
```

**Important:** Choose a strong password and keep these credentials secure.

### 2. Install Dependencies

```bash
npm install
```

This will install the `dotenv` package required for authentication.

### 3. Build and Deploy

```bash
npm run build
```

Then deploy using PM2:

```bash
./deploy.sh
```

Or manually start:

```bash
npm run pm2:start
```

## How It Works

### Frontend
- **Login Page**: Simple username/password form at `/`
- **Session Management**: Uses localStorage to maintain user session
- **Protected Routes**: All routes require authentication

### Backend
- **Authentication Endpoint**: `POST /api/auth/login`
- **Credentials**: Validated against `AUTH_USERNAME` and `AUTH_PASSWORD` from `.env`
- **Session Token**: Generated on successful login and stored in localStorage

## Security Notes

1. **HTTPS Required**: Always use HTTPS in production (set up nginx with SSL)
2. **Strong Passwords**: Use a strong, unique password
3. **Environment Variables**: Never commit `.env` to git
4. **Session Tokens**: Stored in browser localStorage (clear on logout)

## Logging In

1. Navigate to your application URL
2. Enter your username and password (from `.env`)
3. Click "Sign In"
4. You'll be redirected to the main application

## Logging Out

Click the "Sign Out" button in the header to logout and clear your session.

## Troubleshooting

### Login Fails
- Check that `.env` file has correct `AUTH_USERNAME` and `AUTH_PASSWORD`
- Ensure server is running: `pm2 status`
- Check server logs: `pm2 logs paperplane-ui`

### Can't Access App
- Make sure you're logged in
- Clear browser localStorage and try again
- Check browser console for errors

## Changing Credentials

1. Update `AUTH_USERNAME` and/or `AUTH_PASSWORD` in `.env`
2. Restart the server:
   ```bash
   pm2 restart paperplane-ui
   ```
3. Logout and login again with new credentials

## Development Mode

When running in dev mode with `npm run dev`:
1. Frontend runs on port 5173 (Vite)
2. Backend (auth endpoint) runs on port 3000
3. You may need to configure CORS or run both services

For development, it's recommended to use the production build:
```bash
npm run build
npm start
```
