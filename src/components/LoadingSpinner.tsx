import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      {message && (
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};
