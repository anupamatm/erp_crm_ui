import React, { createContext, useState, useEffect } from 'react';

interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference?: string;
  notes?: string;
  toAccountId?: string; // For transfers
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByAccount: (accountId: string) => Transaction[];
}

export const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  getTransactionsByAccount: () => []
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Demo data
      const demoTransactions = [
        {
          id: '1',
          accountId: '1',
          type: 'income' as const,
          amount: 5000.00,
          description: 'Client Payment - Project Alpha',
          category: 'Revenue',
          date: '2024-01-15T00:00:00.000Z',
          reference: 'INV-001',
          status: 'completed' as const,
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          accountId: '1',
          type: 'expense' as const,
          amount: 1200.00,
          description: 'Office Rent',
          category: 'Rent',
          date: '2024-01-01T00:00:00.000Z',
          reference: 'RENT-JAN',
          status: 'completed' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '3',
          accountId: '3',
          type: 'expense' as const,
          amount: 450.00,
          description: 'Marketing Campaign',
          category: 'Marketing',
          date: '2024-01-10T00:00:00.000Z',
          reference: 'MKT-001',
          status: 'completed' as const,
          createdAt: '2024-01-10T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z'
        }
      ];
      setTransactions(demoTransactions);
      localStorage.setItem('transactions', JSON.stringify(demoTransactions));
    }
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const updateTransaction = (id: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedTransactions = transactions.map(txn => 
      txn.id === id ? { 
        ...transaction, 
        id, 
        createdAt: txn.createdAt,
        updatedAt: new Date().toISOString() 
      } : txn
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(txn => txn.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const getTransactionsByAccount = (accountId: string) => {
    return transactions.filter(txn => txn.accountId === accountId || txn.toAccountId === accountId);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionsByAccount
    }}>
      {children}
    </TransactionContext.Provider>
  );
};