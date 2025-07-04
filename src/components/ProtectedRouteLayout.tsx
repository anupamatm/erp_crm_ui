import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Layout from './Layout';
import { getNavigationForRole } from '../constants/navigation';

const ProtectedRouteLayout = () => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        Error: {typeof error === 'string' ? error : 'An error occurred'}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = getNavigationForRole(user.role);
  
  if (!navigation || navigation.length === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Layout navigation={navigation}>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRouteLayout;
