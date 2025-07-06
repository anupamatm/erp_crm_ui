// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  roles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { user, initialLoad, error } = useAuth();

  if (initialLoad) {
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

  // Debug log
  console.log('ProtectedRoute - User role:', user.role, 'Type:', typeof user.role, 'Required roles:', roles);
  
  // Check if user has one of the required roles. This is a simple, direct check.
  const userRole = String(user.role).toLowerCase().trim();
  const hasRequiredRole = roles.map(role => role.toLowerCase()).includes(userRole);

  if (!hasRequiredRole) {
    console.warn(`Access denied. User role: ${user.role}, Required roles: ${roles.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // If children are provided, render them, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;