import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FileText, AlertCircle, LogIn } from 'lucide-react';

export const Login = () => {
  const auth = useAuth();

  useEffect(() => {
    // If user is already authenticated, this shouldn't render
    // but just in case, we can add additional logic here
    if (auth.isAuthenticated) {
      console.log('User is already authenticated');
    }
  }, [auth.isAuthenticated]);

  const handleLogin = () => {
    auth.signinRedirect();
  };

  // Show loading state while auth is initializing
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (auth.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="text-red-600" size={48} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {auth.error.message || 'An error occurred during authentication.'}
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo/Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <FileText className="text-white" size={48} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Paperplane
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Markdown Q&A Processor
        </p>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700 text-center">
            Upload markdown files to extract and process questions using OpenAI
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
        >
          <LogIn size={20} />
          Sign In with AWS
        </button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 text-center mt-6">
          You need to sign in to access the application
        </p>
      </div>
    </div>
  );
};
