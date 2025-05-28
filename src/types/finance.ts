export type AccountType = 'Income' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
export type TransactionType = 'Income' | 'Expense' | 'Transfer';

export interface Account {
  _id: string;
  name: string;
  type: AccountType;
  code?: string;
  description?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  parentAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  accountId: string;
  categoryId?: string;
  contactId?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCategory {
  _id: string;
  name: string;
  type: TransactionType;
  description?: string;
  isDefault: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  accountBalances: {
    accountId: string;
    accountName: string;
    balance: number;
    currency: string;
  }[];
  recentTransactions: Transaction[];
}

export interface FinancialReport {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  data: any; // Report-specific data structure
  generatedAt: string;
}
