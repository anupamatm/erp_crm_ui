import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

export const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {}
});

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // For demo purposes, we'll use mock data and local storage
  // In production, replace with actual API calls
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      // Demo data
      const demoExpenses = [
        {
          id: '1',
          description: 'Office Supplies - Paper and Pens',
          amount: 45.50,
          category: 'Office Supplies',
          date: '2025-01-15T00:00:00.000Z',
          notes: 'Monthly office supply purchase'
        },
        {
          id: '2',
          description: 'Business Lunch with Client',
          amount: 125.00,
          category: 'Meals & Entertainment',
          date: '2025-01-20T00:00:00.000Z',
          notes: 'Lunch meeting with potential client'
        },
        {
          id: '3',
          description: 'Software License - Adobe Creative Suite',
          amount: 52.99,
          category: 'Software',
          date: '2025-01-25T00:00:00.000Z',
          notes: 'Monthly subscription renewal'
        },
        {
          id: '4',
          description: 'Software License - Adobe Creative Suite',
          amount: 52.99,
          category: 'Software',
          date: '2025-01-25T00:00:00.000Z',
          notes: 'Monthly subscription renewal'
        }
      ];
      setExpenses(demoExpenses);
      localStorage.setItem('expenses', JSON.stringify(demoExpenses));
    }
  }, []);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const updateExpense = (id: string, expense: Omit<Expense, 'id'>) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === id ? { ...expense, id } : exp
    );
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};