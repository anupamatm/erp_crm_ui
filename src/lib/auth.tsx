import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from './api';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if token is valid and refresh if needed
  const checkToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setUser(null);
        setError(null);
        return false;
      }

      // Try to refresh token
      try {
        const response = await API.post('/api/auth/refresh');
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setError(null);
        return true;
      } catch (err: any) {
        console.error('Token refresh failed:', err);
        // If refresh fails, clear token and user
        localStorage.removeItem('token');
        setUser(null);
        setError('Authentication failed');
        return false;
      }
    } catch (err: any) {
      console.error('Error checking token:', err);
      localStorage.removeItem('token');
      setUser(null);
      setError('Authentication error');
      return false;
    }
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const isValid = await checkToken();
        if (!isValid) {
          // Try to sign in with stored credentials if available
          const storedEmail = localStorage.getItem('email');
          const storedPassword = localStorage.getItem('password');
          if (storedEmail && storedPassword) {
            try {
              await signIn(storedEmail, storedPassword);
            } catch (err) {
              console.error('Stored credentials failed:', err);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await API.post('/api/auth/signin', { email, password });
      
      if (!response.data?.token || !response.data?.user) {
        throw new Error('Invalid login response');
      }

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email); // Store email for auto-login
      localStorage.setItem('password', password); // Store password for auto-login
      
      setUser(response.data.user);
      setError(null);

      if (!response.data.user.id || !response.data.user.role) {
        throw new Error('Invalid user data');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Authentication error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await API.post('/api/auth/signup', { email, password, name });
      
      if (!response.data?.token || !response.data?.user) {
        throw new Error('Invalid signup response');
      }

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
      
      setUser(response.data.user);
      setError(null);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Authentication error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    setUser(null);
    setError(null);
    window.location.href = '/login';
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const response = await API.post('/api/auth/refresh');
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setError(null);
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      setError(err.response?.data?.message || 'Authentication error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
