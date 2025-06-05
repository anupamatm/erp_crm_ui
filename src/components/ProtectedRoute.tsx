// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  roles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
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

  // Debug log
  console.log('ProtectedRoute - User role:', user.role, 'Required roles:', roles);
  
  // Check if user has any of the required roles
  const hasRequiredRole = roles.some(requiredRole => {
    // Check for exact match first
    if (user.role === requiredRole) {
      return true;
    }
    
    // Check for role hierarchy (e.g., 'admin' can access 'admin' or 'admin_*')
    if (requiredRole.includes('_')) {
      // If required role is specific (e.g., 'sales_manager'), check exact match
      return user.role === requiredRole;
    } else {
      // If required role is general (e.g., 'sales'), check if user role starts with it
      return user.role.startsWith(requiredRole + '_') || user.role === requiredRole;
    }
  });

  if (!hasRequiredRole) {
    console.warn(`Access denied. User role: ${user.role}, Required roles: ${roles.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;