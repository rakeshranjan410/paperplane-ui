# Quick Start Guide

Get up and running in 3 minutes! ⚡

## Step 1: Setup (One Time)

```bash
cd markdown-qa-app
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
npm install
cp .env.example .env
```

## Step 2: Add Your OpenAI API Key

Edit `.env` file:
```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

🔑 **Get API Key:** https://platform.openai.com/api-keys

## Step 3: Run

```bash
npm run dev
```

Open: **http://localhost:3000**

## How to Use

1. **Upload** a markdown file with questions
2. **Wait** for AI processing (few seconds)
3. **View** extracted questions as beautiful cards
4. **Download** JSON output

## Example Markdown Format

```markdown
1. What is React?
(1) A library
(2) A framework
(3) A language
(4) An IDE

2. Who created React?
(1) Google
(2) Facebook
(3) Microsoft
(4) Amazon
```

## That's It! 🎉

Your app will extract each question into JSON:

```json
{
  "id": 1,
  "description": "What is React?",
  "options": ["A library", "A framework", "A language", "An IDE"]
}
```

## Need Help?

- Check the full [README.md](./README.md)
- Review [OpenAI API Docs](https://platform.openai.com/docs)
- Check console for errors

## Production Warning ⚠️

This setup calls OpenAI directly from the browser (development only). 

For production, create a backend API to securely handle OpenAI calls.
