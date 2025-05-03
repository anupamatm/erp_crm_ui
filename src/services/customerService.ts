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
  static async getCustomers(page = 1, limit = 5, search = '') {
    const res = await API.get(`/api/customers?page=${page}&limit=${limit}&search=${search}`);
    return res.data;
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
