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
  console.log('ProtectedRoute - User object:', user);
  console.log('User role:', user.role, 'Type:', typeof user.role, 'Required roles:', roles);
  
  // Normalize role comparison
  const normalizeRole = (role: string): string => {
    return String(role || '').toLowerCase().trim();
  };
  
  const userRole = normalizeRole(user.role);
  const normalizedRoles = roles.map(role => normalizeRole(role));
  const hasRequiredRole = normalizedRoles.includes(userRole);

  console.log('Normalized user role:', userRole);
  console.log('Normalized required roles:', normalizedRoles);
  console.log('Has required role:', hasRequiredRole);

  if (!hasRequiredRole) {
    console.warn(`Access denied. User role: "${user.role}" (normalized: "${userRole}"), Required roles: [${roles.join(', ')}]`);
    console.warn('User object:', user);
    return <Navigate to="/unauthorized" replace />;
  }

  // If children are provided, render them, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;