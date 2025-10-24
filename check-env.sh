#!/bin/bash

# Script to verify local authentication environment variables are set

echo "=== Checking Local Authentication Environment Variables ==="
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

if grep -q "^VITE_OPENAI_API_KEY=" .env && ! grep -q "^VITE_OPENAI_API_KEY=your_openai_api_key_here" .env; then
    echo "✅ VITE_OPENAI_API_KEY is set"
else
    echo "❌ VITE_OPENAI_API_KEY not set or has placeholder value"
fi

if grep -q "^VITE_HOST_ENV=" .env; then
    echo "✅ VITE_HOST_ENV is set"
else
    echo "❌ VITE_HOST_ENV not set"
fi

if grep -q "^AUTH_USERNAME=" .env && ! grep -q "^AUTH_USERNAME=admin" .env; then
    echo "✅ AUTH_USERNAME is set (not default)"
else
    echo "⚠️  AUTH_USERNAME is using default value or not set"
fi

if grep -q "^AUTH_PASSWORD=" .env && ! grep -q "^AUTH_PASSWORD=your_secure_password_here" .env; then
    echo "✅ AUTH_PASSWORD is set"
else
    echo "❌ AUTH_PASSWORD not set or has placeholder value"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Set AUTH_USERNAME and AUTH_PASSWORD in .env"
echo "2. Set your OpenAI API key in VITE_OPENAI_API_KEY"
echo "3. Build the app: npm run build"
echo "4. Start the server: npm start (or npm run pm2:start)"
