// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  roles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, loading, error } = useAuth();

  if (loading && !['/login', '/signup'].includes(window.location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !['/login', '/signup'].includes(window.location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Authentication error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // **This is the magic**—render the child routes here
  return <Outlet />;
};
