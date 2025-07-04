import { API } from '../lib/api';

// Types
export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  notes?: string;
  invoiceNumber: string;
  invoiceId: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  order: {
    _id: string;
    orderNumber: string;
  };
  status: string;
  amount: number;
  amountPaid: number;
  paymentStatus: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
  dueDate: string;
}

const customerApi = {
  // Profile
  getProfile: (): Promise<{ data: CustomerProfile }> => 
    API.get('/customer-portal/profile'),
  
  updateProfile: (data: Partial<CustomerProfile>): Promise<{ data: CustomerProfile }> => 
    API.put('/customer-portal/profile', data),
  
  // Orders
  getOrders: (): Promise<{ data: Order[] }> => 
    API.get('/customer-portal/orders'),
    
  getOrder: (orderId: string): Promise<{ data: Order }> => 
    API.get(`/customer-portal/orders/${orderId}`),
  
  // Invoices
  getInvoices: (): Promise<{ data: Invoice[] }> => 
    API.get('/customer-portal/invoices'),
    
  getInvoice: (invoiceId: string): Promise<{ data: Invoice }> => 
    API.get(`/customer-portal/invoices/${invoiceId}`),
  
  // Payments
  getPaymentHistory: (): Promise<{ data: Payment[] }> => 
    API.get('/customer-portal/payments'),
};

export default customerApi;
