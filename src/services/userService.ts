// src/api/userApi.ts
import API from '../api/api';

export const userApi = {
  // Get all users
  getUsers: async () => {
    const response = await API.get('/api/userManagement/users');
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await API.post('/api/userManagement/users', userData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await API.get(`/api/userManagement/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: any) => {
    const response = await API.put(`/api/userManagement/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await API.delete(`/api/userManagement/users/${id}`);
    return response.data;
  },

  // Change user role
  changeUserRole: async (id: string, role: string) => {
    const response = await API.put(`/api/userManagement/users/${id}/role`, { role });
    return response.data;
  },

  
};