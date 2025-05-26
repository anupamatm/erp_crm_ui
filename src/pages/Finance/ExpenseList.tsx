import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FinanceService from '../../services/FinanceService'; // Import types and services
import { Expense } from '../../types/Finance';

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const expensesData = await FinanceService.getAllExpenses();  // Using the API service
      setExpenses(expensesData);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await FinanceService.deleteExpense(id);  // Using the API service
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-4">Expense List</h2>
      <Link to="/finance/expenses/add" className="btn bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Add Expense
      </Link>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Description</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id} className="border-b">
              <td className="px-6 py-3 text-sm text-gray-700">{new Date(expense.date).toLocaleDateString()}</td>
              <td className="px-6 py-3 text-sm text-gray-700">${expense.amount}</td>
              <td className="px-6 py-3 text-sm text-gray-700">{expense.description}</td>
              <td className="px-6 py-3 text-sm text-gray-700">
                <button onClick={() => handleDelete(expense._id)} className="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
