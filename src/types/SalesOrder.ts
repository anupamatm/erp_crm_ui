import { Address } from './common';

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'refunded' | 'failed';
export type PaymentTerms = 'due_on_receipt' | 'net_7' | 'net_15' | 'net_30' | 'net_60';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SalesOrder {
  _id?: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  deliveryDate?: string;
  terms?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentTerms: PaymentTerms;
  createdBy?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Removed the extra properties that were not part of the SalesOrder interface