export type AccountType = 'Income' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
export type TransactionType = 'Income' | 'Expense' | 'Transfer';

// In types/Finance.ts
export interface Account {
  _id: string;
  name: string;
  type: AccountType;
  code?: string;
  description?: string;
  currency: string;
  initialBalance?: number;
  openingBalance?: number;
  currentBalance?: number;
  isActive: boolean;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
  ifscCode?: string;
  swiftCode?: string;
  taxId?: string;
  notes?: string;
  email?: string;
  website?: string;
  parentAccount?: string;
  transactions?: any[]; // Add this line
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
