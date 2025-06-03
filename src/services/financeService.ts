import API from '../api/api';
import { Account, AccountType, Transaction, TransactionType, FinancialSummary, FinancialReport } from '../types/Finance';

const api = API;

export const financeService = {
  // Accounts
  getAccounts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: Account[]; total: number }> => {
    try {
      console.log('Fetching accounts with params:', params);
      const response = await api.get('/api/finance/accounts', { params });
      console.log('Raw API Response:', response);
      
      // The response might be in different formats, so we need to handle both:
      // 1. Direct array response: { data: Account[] }
      // 2. Paginated response: { data: { items: Account[], total: number } }
      // 3. Direct array in data: { data: { data: Account[] } }
      
      let accounts: Account[] = [];
      let total = 0;
      
      if (Array.isArray(response.data)) {
        accounts = response.data;
        total = response.data.length;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        accounts = response.data.items;
        total = response.data.total || 0;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        accounts = response.data.data;
        total = response.data.total || response.data.data.length;
      } else if (response.data?.data && !Array.isArray(response.data.data)) {
        // Handle case where data is not an array
        console.error('Invalid accounts data format:', response.data);
        throw new Error('Invalid accounts data format received from server');
      }
      
      console.log('Processed accounts:', { accounts, total });
      return { data: accounts, total };
    } catch (error) {
      console.error('Error in getAccounts:', error);
      throw error;
    }
  },

  getAccount: async (id: string): Promise<Account> => {
    const response = await api.get(`/api/finance/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: {
    name: string;
    type: AccountType;
    code?: string;
    description?: string;
    currency?: string;
    parentAccount?: string;
    initialBalance?: number;
    openingBalance?: number;
    currentBalance?: number;
    isActive?: boolean;
    accountNumber?: string;
    bankName?: string;
    branch?: string;
    ifscCode?: string;
    swiftCode?: string;
    taxId?: string;
    notes?: string;
    email?: string;
    website?: string;
  }): Promise<Account> => {
    const response = await api.post('/api/finance/accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await api.put(`/api/finance/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/api/finance/accounts/${id}`);
  },

  // Transactions
  getTransactions: async (params: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    type?: TransactionType;
    categoryId?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<{ data: Transaction[]; total: number }> => {
    const response = await api.get('/api/finance/transactions', { params });
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/finance/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: {
    date: string;
    type: TransactionType;
    amount: number;
    accountId: string;
    toAccountId?: string; // For transfers
    description?: string;
    reference?: string;
    categoryId?: string;
    contactId?: string;
    attachments?: File[];
  }): Promise<Transaction> => {
    const formData = new FormData();
    formData.append('date', data.date);
    formData.append('type', data.type);
    formData.append('amount', data.amount.toString());
    formData.append('accountId', data.accountId);
    if (data.toAccountId) formData.append('toAccountId', data.toAccountId);
    if (data.description) formData.append('description', data.description);
    if (data.reference) formData.append('reference', data.reference);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.contactId) formData.append('contactId', data.contactId);
    if (data.attachments) {
      data.attachments.forEach((file: File) => {
        formData.append('attachments', file);
      });
    }
    const response = await api.post('/api/finance/transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/api/finance/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/api/finance/transactions/${id}`);
  },

  // Financial Summary
  getSummary: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<FinancialSummary> => {
    const response = await api.get('/api/finance/summary', { params });
    return response.data;
  },

  // Reports
  getReports: async (): Promise<FinancialReport[]> => {
    const response = await api.get('/api/finance/reports');
    return response.data;
  },

  generateReport: async (reportType: string, params: {
    startDate: string;
    endDate: string;
    [key: string]: any;
  }): Promise<FinancialReport> => {
    const response = await api.post(`/api/finance/reports/${reportType}`, params);
    return response.data;
  },

  // Categories
  getTransactionCategories: async (type?: TransactionType): Promise<Array<{
    _id: string;
    name: string;
    type: TransactionType;
  }>> => {
    const response = await api.get('/api/finance/transaction-categories', {
      params: { type },
    });
    return response.data;
  },
};
