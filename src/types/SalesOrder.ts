// src/types/SalesOrder.ts
export interface SalesOrderItem {
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
  }
  
  export interface SalesOrder {
    _id?: string;
    orderNumber: string;
    customer: {
      _id: string;
      name: string;
      email: string;
    };
    items: SalesOrderItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingCost: number;
    totalAmount: number;
    paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
    paymentTerms: 'immediate' | 'net15' | 'net30' | 'net60';
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    notes: string;
    status: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
  }