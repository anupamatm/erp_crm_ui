// services/CustomerService.ts
import API from '../api/api'; // updated import

interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

class CustomerService {
  static async getCustomers(page=1,limit=5) {
    const res = await API.get(`/api/customers?page=${page}&limit=${limit}`);
    return res.data;
  }

  static async addCustomer(customer: Customer) {
    const res = await API.post('/api/customers', customer);
    return res.data;
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
