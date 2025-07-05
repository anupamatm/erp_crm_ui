import { API } from '../lib/api';

export interface InvoiceItem {
  product: {
    _id: string;
    name: string;
    price: number;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subTotal: number;
  description?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  issueDate: Date | string;
  dueDate: Date | string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  paymentHistory?: {
    date: Date | string;
    amount: number;
    method: string;
    reference?: string;
  }[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

class InvoiceService {
  static async createInvoice(invoiceData: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log('Creating invoice with data:', invoiceData);
      
      // Calculate totals
      const items = (invoiceData.items || []).map(item => {
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const discount = item.discount || 0;
        const tax = item.tax || 0;
        const subTotal = quantity * unitPrice;
        
        return {
          product: {
            _id: item.product?._id || '',
            name: item.product?.name || 'Unnamed Product',
            price: unitPrice,
            description: item.product?.description || ''
          },
          quantity,
          unitPrice,
          discount,
          tax,
          subTotal
        };
      });
      
      // Calculate grand totals
      const subtotal = items.reduce((sum, item) => sum + item.subTotal, 0);
      const discountAmount = items.reduce((sum, item) => {
        return sum + (item.subTotal * (item.discount / 100));
      }, 0);
      const taxAmount = items.reduce((sum, item) => {
        const itemTotal = item.subTotal * (1 - (item.discount / 100));
        return sum + (itemTotal * (item.tax / 100));
      }, 0);
      const totalAmount = subtotal - discountAmount + taxAmount;

      // Prepare the payload
      const payload = {
        ...invoiceData,
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: invoiceData.status || 'draft',
        invoiceNumber: invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      console.log('Sending payload to server:', payload);
      console.log('API Base URL:', API.defaults.baseURL);
      
      try {
        const response = await API.post('/api/sales/invoices', payload);
        console.log('Invoice created successfully:', response.data);
        return response.data;
      } catch (apiError: any) {
        console.error('API Error details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          headers: apiError.response?.headers,
          config: {
            url: apiError.config?.url,
            method: apiError.config?.method,
            data: apiError.config?.data,
            headers: apiError.config?.headers
          }
        });
        throw apiError;
      }
    } catch (error: any) {
      console.error('Error in createInvoice:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  static async getInvoices(page: number = 1, limit: number = 10, status?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await API.get(`/api/sales/invoices?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  static async getInvoiceById(id: string) {
    try {
      const response = await API.get(`/api/sales/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  static async updateInvoice(id: string, invoice: Partial<Invoice>) {
    try {
      const response = await API.put(`/api/sales/invoices/${id}`, invoice);
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  static async deleteInvoice(id: string) {
    try {
      await API.delete(`/api/sales/invoices/${id}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
}

export default InvoiceService;
