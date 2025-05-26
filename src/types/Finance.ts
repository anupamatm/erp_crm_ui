// erp-crm-frontend/src/types/Finance.ts

// Expense type
export interface Expense {
    _id: string;
    date: string;  // e.g., '2025-03-01'
    amount: number;
    description: string;
  }
  
  // Income type
  export interface Income {
    _id: string;
    date: string;  // e.g., '2025-03-01'
    amount: number;
    source: string;  // e.g., 'Product Sale'
  }
  
  // Payment type
  export interface Payment {
    _id: string;
    date: string;  // e.g., '2025-03-01'
    amount: number;
    method: string;  // e.g., 'Credit Card', 'Cash', etc.
  }
  