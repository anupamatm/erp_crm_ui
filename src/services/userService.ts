// src/api/userApi.ts
import API from '../api/api';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userApi = {
  // Get all users with pagination
  getUsers: async (page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedResponse<any>> => {
    try {
      // Ensure page is at least 1
      const pageNumber = Math.max(1, page);
      
      console.log('API Request - Fetching users with params:', { 
        endpoint: '/api/userManagement/users',
        params: {
          page: pageNumber,
          limit,
          ...(search ? { search } : {})
        },
        timestamp: new Date().toISOString()
      });
      
      // Make sure to pass params as a query string
      const response = await API.get('/api/userManagement/users', {
        params: {
          page: pageNumber,
          limit,
          ...(search ? { search } : {})
        },
        paramsSerializer: params => {
          return Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&');
        }
      });
      
      console.log('API Response - Users:', {
        status: response.status,
        dataLength: response.data?.data?.length || response.data?.length || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit,
        total: response.data?.total,
        totalPages: response.data?.totalPages,
        timestamp: new Date().toISOString()
      });
      
      // Ensure the response has the expected structure
      if (response && response.data) {
        let users = [];
        let total = 0;
        
        // Handle case where the API returns data directly
        if (Array.isArray(response.data)) {
          users = response.data;
          total = users.length;
        } 
        // Handle case where the API returns a paginated response
        else if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
          total = response.data.total || users.length;
        }
        
        // Enforce the limit on the frontend as a fallback
        const limitedUsers = users.slice(0, limit);
        
        return {
          data: limitedUsers,
          total: total,
          page: response.data?.page || 1,
          limit: limit, // Always use the requested limit
          totalPages: Math.ceil(total / limit) || 1
        };
      }
      
      // Return empty result if no valid data
      return {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1
      };
    } catch (error) {
      console.error('Error in userService.getUsers:', error);
      throw error;
    }
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