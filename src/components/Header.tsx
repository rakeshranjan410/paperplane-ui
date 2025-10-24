import { FileText, Database, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Header = () => {
  const location = useLocation();
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout();
  };

  // Get user info
  const userName = auth.user?.username || 'User';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Paperplane
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload markdown files to extract and process questions using OpenAI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navigation Links */}
            <nav className="flex gap-3">
              <Link
                to="/"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
                  ${location.pathname === '/' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <FileText size={20} />
                Upload
              </Link>
              <Link
                to="/all-questions"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
                  ${location.pathname === '/all-questions' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <Database size={20} />
                All Questions
              </Link>
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 ml-6 pl-6 border-l border-gray-300">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
