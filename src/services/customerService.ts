// services/CustomerService.ts
import API from '../api/api';

export interface Customer {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
  status: 'active' | 'inactive' | 'pending';
}

class CustomerService {
  static async getCustomers(page = 1, limit = 1000, search = '') {
    try {
      console.log('Fetching customers with params:', { page, limit, search });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Current auth token:', token ? 'Token exists' : 'No token found');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await API.get(`/api/customers?page=${page}&limit=${limit}&search=${search}`, { headers });
      console.log('Customers API response status:', res.status);
      console.log('Customers API response data:', res.data);
      
      return res.data;
    } catch (error: any) {
      console.error('Error in getCustomers:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // If unauthorized, redirect to login
        if (error.response.status === 401) {
          console.warn('Authentication required, redirecting to login...');
          // Store the current URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/login';
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Return empty array to prevent UI from breaking
      return { docs: [], total: 0, page: 1, limit };
    }
  }

  static async getCustomerById(id: string) {
    const res = await API.get(`/api/customers/${id}`);
    return res.data;
  }

  static async addCustomer(customer: Customer) {
    try {
      const res = await API.post('/api/customers', customer);
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error creating customer');
    }
  }

  static async updateCustomer(id: string, customer: Customer) {
    const res = await API.put(`/api/customers/${id}`, customer);
    return res.data;
  }

  static async deleteCustomer(id: string) {
    const res = await API.delete(`/api/customers/${id}`);
    return res.data;
  }
}

export default CustomerService;
