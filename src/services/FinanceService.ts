// erp-crm-frontend/src/services/financeService.ts
import API from '../api/api';
import { Expense, Income, Payment } from '../types/Finance';

class FinanceService {
  // Get all expenses
  static async getAllExpenses() {
    try {
      const response = await API.get('/api/expenses');
      return response.data.expenses;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching expenses');
    }
  }

  // Create a new expense
  static async createExpense(expense: Omit<Expense, '_id'>) {
    try {
      const response = await API.post('/api/expenses', expense);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating expense');
    }
  }

  // Delete an expense
  static async deleteExpense(id: string) {
    try {
      await API.delete(`/api/expenses/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting expense');
    }
  }

  // Get all incomes
  static async getAllIncomes() {
    try {
      const response = await API.get('/api/incomes');
      return response.data.incomes;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching incomes');
    }
  }

  // Create a new income
  static async createIncome(income: Omit<Income, '_id'>) {
    try {
      const response = await API.post('/api/incomes', income);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating income');
    }
  }

  // Delete an income
  static async deleteIncome(id: string) {
    try {
      await API.delete(`/api/incomes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting income');
    }
  }

  // Get all payments
  static async getAllPayments() {
    try {
      const response = await API.get('/api/payments');
      return response.data.payments;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching payments');
    }
  }

  // Create a new payment
  static async createPayment(payment: Omit<Payment, '_id'>) {
    try {
      const response = await API.post('/api/payments', payment);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating payment');
    }
  }

  // Delete a payment
  static async deletePayment(id: string) {
    try {
      await API.delete(`/api/payments/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting payment');
    }
  }
}

export default FinanceService;
