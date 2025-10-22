#!/bin/bash

# Script to verify OIDC environment variables are set

echo "=== Checking OIDC Environment Variables ==="
echo ""

if [ ! -f .env ]; then
    echo "❌ ERROR: .env file does not exist!"
    echo "   Run: cp .env.example .env"
    exit 1
fi

echo "✅ .env file exists"
echo ""

# Check if variables are set (without revealing values)
echo "Checking for required variables in .env:"
echo ""

if grep -q "^VITE_OIDC_AUTHORITY=" .env && ! grep -q "^VITE_OIDC_AUTHORITY=.*{region}" .env; then
    echo "✅ VITE_OIDC_AUTHORITY is set"
else
    echo "❌ VITE_OIDC_AUTHORITY not set or has placeholder value"
fi

if grep -q "^VITE_OIDC_CLIENT_ID=" .env && ! grep -q "^VITE_OIDC_CLIENT_ID=your_client_id" .env; then
    echo "✅ VITE_OIDC_CLIENT_ID is set"
else
    echo "❌ VITE_OIDC_CLIENT_ID not set or has placeholder value"
fi

if grep -q "^VITE_OIDC_REDIRECT_URI=" .env; then
    echo "✅ VITE_OIDC_REDIRECT_URI is set"
else
    echo "❌ VITE_OIDC_REDIRECT_URI not set"
fi

if grep -q "^VITE_COGNITO_DOMAIN=" .env && ! grep -q "^VITE_COGNITO_DOMAIN=.*<your-domain>" .env; then
    echo "✅ VITE_COGNITO_DOMAIN is set"
else
    echo "❌ VITE_COGNITO_DOMAIN not set or has placeholder value"
fi

if grep -q "^VITE_OIDC_LOGOUT_URI=" .env; then
    echo "✅ VITE_OIDC_LOGOUT_URI is set"
else
    echo "❌ VITE_OIDC_LOGOUT_URI not set"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Edit .env file with your actual Cognito values"
echo "2. Restart dev server: npm run dev"
echo "3. Check browser console for loaded values"
