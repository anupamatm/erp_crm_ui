// src/lib/salesOrderService.ts
import API from '../api/api';

export interface SalesOrder {
  _id?: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    subTotal: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class SalesOrderService {
  static async createSalesOrder(order: SalesOrder) {
    try {
      const response = await API.post('/api/sales/orders', order);
      return response;
    } catch (err: any) {
      console.error('Error creating sales order:', err);
      throw err;
    }
  }

  static async getSalesOrders(page: number = 1, limit: number = 10) {
    try {
      const response = await API.get(`/api/sales/orders?page=${page}&limit=${limit}`);
      return response;
    } catch (err: any) {
      console.error('Error fetching sales orders:', err);
      throw err;
    }
  }

  static async getSalesOrderById(id: string) {
    try {
      console.log('Fetching order by ID:', id);
      const response = await API.get<SalesOrder>(`/api/sales/orders/${id}`);
      console.log('Order details response:', response);
      
      if (!response || !response.data) {
        throw new Error('No order data received');
      }
      
      return response;
    } catch (err: any) {
      console.error('Error fetching sales order:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  }

  static async updateSalesOrder(id: string, order: Partial<SalesOrder>) {
    try {
      console.log('Updating order:', id);
      console.log('Update data:', order);
      
      const response = await API.put<SalesOrder>(`/api/sales/orders/${id}`, order);
      console.log('Update response:', response);
      
      if (!response || !response.data) {
        throw new Error('No response data received');
      }
      
      return response;
    } catch (err: any) {
      console.error('Error updating sales order:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  }

  static async deleteSalesOrder(id: string) {
    try {
      const response = await API.delete(`/api/sales/orders/${id}`);
      return response;
    } catch (err: any) {
      console.error('Error deleting sales order:', err);
      throw err;
    }
  }

  static async getLastOrder(): Promise<SalesOrder | null> {
    try {
      const response = await API.get('/api/sales/orders/last');
      return response.data;
    } catch (error) {
      console.error('Error getting last order:', error);
      return null;
    }
  }
}