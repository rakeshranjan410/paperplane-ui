#!/bin/bash

echo "🚀 Setting up Markdown Q&A Processor..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your OpenAI API key:"
    echo "   VITE_OPENAI_API_KEY=sk-your-api-key-here"
    echo ""
    echo "   Get your API key at: https://platform.openai.com/api-keys"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OpenAI API key (if not done already)"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Happy coding! 🎉"
