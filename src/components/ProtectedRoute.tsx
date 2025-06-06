// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  roles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
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
  console.log('ProtectedRoute - User role:', user.role, 'Type:', typeof user.role, 'Required roles:', roles);
  
  // Check if user has any of the required roles
  const hasRequiredRole = roles.some(requiredRole => {
    // Normalize both roles to lowercase for case-insensitive comparison
    const userRole = String(user.role).toLowerCase().trim();
    const normalizedRequiredRole = String(requiredRole).toLowerCase().trim();
    
    console.log(`Checking role: ${userRole} against required: ${normalizedRequiredRole}`);
    
    // Check for exact match first
    if (userRole === normalizedRequiredRole) {
      console.log('Exact role match found');
      return true;
    }
    
    // Check for role hierarchy (e.g., 'admin' can access 'admin' or 'admin_*')
    if (normalizedRequiredRole.includes('_')) {
      // If required role is specific (e.g., 'sales_manager'), check exact match
      const match = userRole === normalizedRequiredRole;
      if (match) console.log('Exact role with underscore match found');
      return match;
    } else {
      // If required role is general (e.g., 'sales'), check if user role starts with it
      const match = userRole.startsWith(normalizedRequiredRole + '_') || userRole === normalizedRequiredRole;
      if (match) console.log('Partial role match found');
      return match;
    }
  });

  if (!hasRequiredRole) {
    console.warn(`Access denied. User role: ${user.role}, Required roles: ${roles.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // If children are provided, render them, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;