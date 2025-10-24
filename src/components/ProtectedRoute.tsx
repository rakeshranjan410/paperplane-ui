import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Login } from '../pages/Login';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps the application and ensures user is authenticated before showing content.
 * Shows:
 * - Loading spinner while checking authentication
 * - Login page if not authenticated
 * - Protected content if authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useAuth();

  // Show loading state while auth is initializing
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!auth.isAuthenticated) {
    return <Login />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};
