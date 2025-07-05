// src/api.ts or similar (shared Axios instance)
import axios from 'axios';
// import { useAuth } from '../lib/auth';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5007',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request headers:', token);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      code: error.response?.data?.code
    });

    // Only handle 401 errors
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      // Handle different types of 401 errors
      switch(errorCode) {
        case 'TOKEN_EXPIRED':
        case 'INVALID_TOKEN':
        case 'NO_AUTH_HEADER':
          // These are actual authentication issues - log out and redirect
          console.error('Authentication required:', errorCode);
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
          
        case 'UNAUTHORIZED':
        default:
          // For permission issues, just reject with the error
          console.error('Permission denied:', error.response?.data?.message || 'Insufficient permissions');
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default API;