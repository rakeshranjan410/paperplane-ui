import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('Please select a markdown file (.md or .markdown)');
      return;
    }

    try {
      const content = await file.text();
      onFileSelect(content);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-12
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Upload size={48} className="text-gray-400" />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            Upload Markdown File
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Click to browse or drag and drop your .md file here
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
