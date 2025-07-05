import React, { createContext, useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'loan';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteAccount: (id: string) => void;
  getAccountById: (id: string) => Account | undefined;
}

export const AccountContext = createContext<AccountContextType>({
  accounts: [],
  addAccount: () => {},
  updateAccount: () => {},
  deleteAccount: () => {},
  getAccountById: () => undefined
});

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      // Demo data
      const demoAccounts = [
        {
          id: '1',
          name: 'Business Checking',
          type: 'checking' as const,
          balance: 15000.00,
          currency: 'USD',
          description: 'Primary business checking account',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          name: 'Business Savings',
          type: 'savings' as const,
          balance: 50000.00,
          currency: 'USD',
          description: 'Emergency fund and savings',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '3',
          name: 'Corporate Credit Card',
          type: 'credit' as const,
          balance: -2500.00,
          currency: 'USD',
          description: 'Business expenses credit card',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      setAccounts(demoAccounts);
      localStorage.setItem('accounts', JSON.stringify(demoAccounts));
    }
  }, []);

  const addAccount = (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const updateAccount = (id: string, account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === id ? { 
        ...account, 
        id, 
        createdAt: acc.createdAt,
        updatedAt: new Date().toISOString() 
      } : acc
    );
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const deleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const getAccountById = (id: string) => {
    return accounts.find(acc => acc.id === id);
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById
    }}>
      {children}
    </AccountContext.Provider>
  );
};