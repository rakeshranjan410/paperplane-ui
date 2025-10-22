# Markdown Q&A Processor

A modern React application that uses OpenAI's GPT-4 to process markdown files containing questions and extract them into structured JSON objects. Perfect for processing exam papers, quiz documents, or any Q&A content in markdown format.

## Features

✨ **Key Capabilities:**
- 📄 Upload markdown files with multiple choice questions
- 🤖 AI-powered extraction using OpenAI GPT-4
- 📊 Structured JSON output for each question
- 🎨 Beautiful, modern UI with Tailwind CSS
- 💾 Download extracted questions as JSON
- 🖼️ Support for images in questions
- ✏️ **LaTeX math rendering** - Beautiful mathematical equations using KaTeX
- 🗄️ **Database Integration** - Push questions to MongoDB with S3 image storage
- 🔄 **Rollback Mechanism** - Automatic rollback on upload failures
- 📦 **Batch Upload** - Upload all questions at once
- 📱 Responsive design

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **OpenAI API** - AI processing
- **KaTeX** - LaTeX math rendering
- **AWS S3** - Image storage
- **MongoDB** - Database for questions
- **Lucide React** - Beautiful icons

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

**Optional (for database features):**
- AWS Account with S3 access ([Sign up](https://aws.amazon.com/))
- MongoDB database ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - free tier available)

## Setup Instructions

### 1. Install Dependencies

```bash
cd markdown-qa-app
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Required
VITE_OPENAI_API_KEY=sk-your-api-key-here

# Optional - for database features
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
VITE_S3_BUCKET_NAME=your_s3_bucket_name
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
VITE_MONGODB_DATABASE=questions_db
VITE_MONGODB_COLLECTION=questions
```

📖 **For detailed database setup instructions**, see [DB_INTEGRATION.md](./DB_INTEGRATION.md)

### 3. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Usage

1. **Upload File**: Click the upload area or drag and drop a markdown file (.md or .markdown)
2. **Processing**: The app sends the markdown content to OpenAI for processing
3. **View Results**: Extracted questions appear as cards with:
   - Question number and description
   - All answer options
   - Images (if present)
   - LaTeX equations beautifully rendered
   - JSON preview (expandable)
4. **Save to Database**: (Optional) Click "Push to DB" to:
   - Upload images to S3 with unique hash names
   - Save question data to MongoDB
   - Automatic rollback if anything fails
5. **Download**: Click "Download JSON" to save all extracted questions

## Markdown Format

The app works best with markdown files formatted like this:

```markdown
1. What is the capital of France?
(1) London
(2) Paris
(3) Berlin
(4) Madrid

2. Which planet is closest to the Sun?
![](image-url-here.jpg)
(1) Venus
(2) Mercury
(3) Earth
(4) Mars
```

### LaTeX Math Support

The app fully supports LaTeX mathematical expressions! Use standard LaTeX syntax:

**Inline Math** (use single `$`):
```markdown
The equation $E = mc^2$ is famous.
The slope is $\frac{dy}{dx}$.
```

**Display Math** (use double `$$`):
```markdown
$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
```

**Example Question with Math**:
```markdown
7. What is the relationship between two temperature scales?
The conversion formula is $\frac{t_{A}-180}{100}=\frac{t_{B}}{150}$
(1) Option A
(2) Option B
```

All LaTeX expressions will be rendered beautifully using KaTeX, just like in a PDF!

## JSON Output Format

Each question is extracted as:

```json
{
  "id": 1,
  "description": "What is the capital of France?",
  "options": [
    "London",
    "Paris",
    "Berlin",
    "Madrid"
  ],
  "imageUrl": "optional-image-url"
}
```

## Project Structure

```
markdown-qa-app/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx      # File upload component
│   │   ├── QuestionCard.tsx    # Individual question display
│   │   ├── QuestionList.tsx    # List of all questions
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   ├── services/
│   │   └── openai.ts           # OpenAI API integration
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Important Notes

### Security Considerations

⚠️ **API Key Security**: This application uses `dangerouslyAllowBrowser: true` to call OpenAI directly from the browser. This is convenient for development but **NOT RECOMMENDED for production**.

**For Production:**
1. Create a backend API endpoint
2. Store the API key securely on the server
3. Have your frontend call your backend
4. Your backend calls OpenAI with the API key

Example backend endpoint (Node.js/Express):
```javascript
app.post('/api/process-markdown', async (req, res) => {
  const { content } = req.body;
  // Call OpenAI here with server-side API key
  // Return results to frontend
});
```

### API Costs

- Each markdown file processing uses OpenAI API tokens
- Costs depend on the length of your markdown file
- Monitor your usage at [OpenAI Platform](https://platform.openai.com/usage)

## Customization

### Change AI Model

Edit `src/services/openai.ts`:
```typescript
model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for lower cost
```

### Adjust Styling

Modify `tailwind.config.js` or component styles directly in the `.tsx` files.

### Custom Question Format

Update the system prompt in `src/services/openai.ts` to match your specific markdown format.

## Troubleshooting

### API Key Error
**Problem**: "OpenAI API key not found" warning
**Solution**: Ensure `.env` file exists with `VITE_OPENAI_API_KEY` set

### CORS Errors
**Problem**: CORS errors when calling OpenAI
**Solution**: This shouldn't happen with `dangerouslyAllowBrowser: true`, but if it does, consider setting up a backend proxy

### Build Errors
**Problem**: TypeScript or build errors
**Solution**: 
```bash
rm -rf node_modules
npm install
npm run build
```

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review OpenAI API documentation
3. Create an issue in the repository

---

**Made with ❤️ using React, TypeScript, and OpenAI**
