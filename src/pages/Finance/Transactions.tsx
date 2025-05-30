import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  date: string;
  type: 'Income' | 'Expense';
  account: {
    _id: string;
    name: string;
    type: string;
  };
  amount: number;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().slice(0, 10), // format to yyyy-mm-dd
    type: 'Income',
    account: '',
    amount: 0,
    description: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get('/finance/transactions', { params });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/finance/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      await api.post('/finance/transactions', newTransaction);
      setNewTransaction({
        date: new Date().toISOString().slice(0, 10),
        type: 'Income',
        account: '',
        amount: 0,
        description: ''
      });
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Date filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={fetchTransactions}>
          <Calendar className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* New Transaction Form */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create New Transaction</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
              <select
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <select
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                value={newTransaction.account}
                onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })
                }
              />
              <Input
                placeholder="Description (optional)"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
              <Button onClick={handleCreateTransaction}>Create Transaction</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground">No transactions found.</p>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction._id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {transaction.type}
                    <span className="ml-2 text-2xl font-bold">
                      {transaction.type === 'Income' ? '+' : '-'}
                      {transaction.amount.toLocaleString()}
                    </span>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{transaction.account.type}</Badge>
                    <span className="font-medium">{transaction.account.name}</span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Created by: {transaction.createdBy.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
