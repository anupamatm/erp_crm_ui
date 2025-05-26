import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FinanceService from '../../services/FinanceService';
import { Expense, Income, Payment } from '../../types/Finance';

const FinanceIndex: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Fetching data when the component mounts
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const expensesData = await FinanceService.getAllExpenses();
      const incomesData = await FinanceService.getAllIncomes();
      const paymentsData = await FinanceService.getAllPayments();

      setExpenses(expensesData);
      setIncomes(incomesData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    }
  };

  const totalAmount = (items: (Expense | Income | Payment)[]) =>
    items.reduce((total, item) => total + (item.amount || 0), 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Finance Dashboard</h1>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Expenses */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-500">${totalAmount(expenses).toFixed(2)}</p>
          <Link
            to="/finance/expenses"
            className="text-blue-500 hover:text-blue-700 mt-4 block"
          >
            View Detailed Expenses
          </Link>
        </div>

        {/* Total Incomes */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Total Incomes</h2>
          <p className="text-3xl font-bold text-green-500">${totalAmount(incomes).toFixed(2)}</p>
          <Link
            to="/finance/incomes"
            className="text-blue-500 hover:text-blue-700 mt-4 block"
          >
            View Detailed Incomes
          </Link>
        </div>

        {/* Total Payments */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Total Payments</h2>
          <p className="text-3xl font-bold text-yellow-500">${totalAmount(payments).toFixed(2)}</p>
          <Link
            to="/finance/payments"
            className="text-blue-500 hover:text-blue-700 mt-4 block"
          >
            View Detailed Payments
          </Link>
        </div>
      </div>

      {/* Action Links Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
          <Link
            to="/finance/expenses/add"
            className="text-blue-500 hover:text-blue-700"
          >
            Add a new expense
          </Link>
        </div>

        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Income</h2>
          <Link
            to="/finance/incomes/add"
            className="text-blue-500 hover:text-blue-700"
          >
            Add a new income
          </Link>
        </div>

        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
          <Link
            to="/finance/payments/add"
            className="text-blue-500 hover:text-blue-700"
          >
            Add a new payment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceIndex;
