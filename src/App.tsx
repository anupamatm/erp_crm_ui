import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Building2, Users, ShoppingCart, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { AuthProvider } from './lib/auth';
import { useAuth } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

const navigation = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Products', icon: ShoppingCart, path: '/products' },
  { name: 'Sales', icon: Building2, path: '/sales' },
  { name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

      {/* Protected layout with sidebar */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-100">
              <Sidebar navigation={navigation} />
              <main className="flex-1 overflow-auto p-8">
                <Outlet />
              </main>
            </div>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all route (optional) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;