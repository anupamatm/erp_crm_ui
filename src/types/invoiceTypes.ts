import { Customer } from './customerTypes';
import { Product } from './productTypes';

export interface InvoiceItem {
  _id?: string;
  product: string | Product;
  productId?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  description?: string;
  total: number;
}

export interface Invoice {
  _id?: string;
  customer: string | Customer;
  invoiceNumber?: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  balance: number;
  amountPaid?: number;
  notes?: string;
  terms?: string;
  createdAt?: string;
  updatedAt?: string;
}
