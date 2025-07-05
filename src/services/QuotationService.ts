import API from '../api/api';

// Custom error type that includes Axios response
export class ApiError extends Error {
  response?: any;
  
  constructor(message: string, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}

export interface QuotationItem {
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

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  _id?: string;
  customer: {
    _id: string;
    name: string;
    email?: string;
  };
  quoteNumber: string;
  status: QuotationStatus;
  validUntil: Date | string;
  items: QuotationItem[];
  terms?: string;
  notes?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  
  // Legacy fields for backward compatibility
  client?: string;
  number?: string;
  year?: string;
  currency?: string;
  date?: Date | string;
  expireDate?: Date | string;
  note?: string;
  taxValue?: number;
  
  // System fields
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class QuotationService {
  static async createQuotation(quotationData: Omit<Quotation, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      // Calculate totals
      const items = (quotationData.items || []).map(item => {
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
      
      // Transform the data to match the backend model
      const payload = {
        customer: {
          _id: quotationData.customer._id,
          name: quotationData.customer.name,
          email: quotationData.customer.email || ''
        },
        quoteNumber: quotationData.quoteNumber || `QT-${new Date().getTime()}`,
        validUntil: quotationData.validUntil,
        status: quotationData.status || 'draft',
        items,
        terms: quotationData.terms || '',
        notes: quotationData.notes || '',
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        
        // Legacy fields
        client: quotationData.customer.name,
        number: `QT-${new Date().getTime()}`,
        year: new Date().getFullYear().toString(),
        currency: 'USD',
        date: new Date(),
        expireDate: quotationData.validUntil,
        note: quotationData.notes || '',
        taxValue: parseFloat(taxAmount.toFixed(2))
      };

      console.log('Sending quotation data:', JSON.stringify(payload, null, 2));
      const response = await API.post('/api/quotations', payload);
      return response.data;
    } catch (err: any) {
      console.error('Error creating quotation:', err);
      if (err.response) {
        console.error('Response data:', JSON.stringify(err.response.data, null, 2));
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        
        // Log detailed validation errors if available
        if (err.response.data?.errorDetails) {
          console.error('Validation errors:', JSON.stringify(err.response.data.errorDetails, null, 2));
        }
        
        // Create a more descriptive error message
        if (err.response.data?.errors?.length) {
          const errorMessages = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
          err.message = `Validation failed:\n${errorMessages}`;
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Re-throw the error with more context
      throw new ApiError(err.message || 'Failed to create quotation', err.response);
    }
  }

  static async getQuotations(page: number = 1, limit: number = 10, status?: QuotationStatus) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await API.get(`/api/quotations?${params}`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching quotations:', err);
      throw err;
    }
  }

  static async getQuotationById(id: string) {
    try {
      const response = await API.get<Quotation>(`/api/quotations/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching quotation:', err);
      throw err;
    }
  }

  static async updateQuotation(id: string, quotation: Partial<Quotation>) {
    try {
      const response = await API.put<Quotation>(`/api/quotations/${id}`, quotation);
      return response.data;
    } catch (err: any) {
      console.error('Error updating quotation:', err);
      throw err;
    }
  }

  static async deleteQuotation(id: string) {
    try {
      await API.delete(`/api/quotations/${id}`);
    } catch (err: any) {
      console.error('Error deleting quotation:', err);
      throw err;
    }
  }

  static async convertToOrder(quotationId: string) {
    try {
      const response = await API.post(`/api/quotations/${quotationId}/convert-to-order`);
      return response.data;
    } catch (err: any) {
      console.error('Error converting quotation to order:', err);
      throw err;
    }
  }
}
