import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { formatCurrency } from '../../lib/utils';

// Define our own FinanceSummary type that matches our needs
interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  accountBalances: AccountBalance[];
  recentTransactions: Transaction[];
}

interface AccountBalance {
  _id: string;
  accountName: string;
  balance: number;
  currency: string;
  accountId?: string; // For backward compatibility
}

interface Transaction {
  _id: string;
  type: 'Income' | 'Expense' | 'Transfer' | string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  date: string;
  accountId: string;
  accountName: string;
  categoryId?: string;
  category?: string;
  contactId?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Remove the duplicate FinanceSummary interface since we're using the type above

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FinanceDashboard = () => {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [summaryResponse, accountsResponse, transactionsResponse] = await Promise.all([
          financeService.getSummary(),
          financeService.getAccounts({ limit: 5 }),
          financeService.getTransactions({ limit: 10 })
        ]);
        
        const accounts = accountsResponse.data || [];
        
        // Sort transactions by date in descending order and take the first 5
        const recentTransactions = (transactionsResponse.data || [])
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        const transformedData: FinanceSummary = {
          totalIncome: summaryResponse.totalIncome || 0,
          totalExpenses: Math.abs(summaryResponse.totalExpenses || 0), // Ensure positive value for display
          netIncome: summaryResponse.netIncome || 0,
          accountBalances: accounts.map(account => ({
            _id: account._id,
            accountName: account.name,
            balance: account.currentBalance || 0,
            currency: account.currency || 'USD',
            accountId: account._id
          })),
          recentTransactions: recentTransactions.map(tx => ({
            ...tx,
            accountName: accounts.find(a => a._id === tx.accountId)?.name || 'Unknown Account',
            accountId: tx.accountId,
            // Ensure all required fields have default values
            type: tx.type || 'Expense',
            amount: tx.amount || 0,
            date: tx.date || new Date().toISOString(),
            category: tx.categoryId ? String(tx.categoryId) : 'Uncategorized',
            categoryId: tx.categoryId || '',
            description: tx.description || '',
            reference: tx.reference || '',
            currency: tx.currency || 'USD',
            attachments: tx.attachments || [],
            createdAt: tx.createdAt || new Date().toISOString(),
            updatedAt: tx.updatedAt || new Date().toISOString()
          }))
        };
        
        setSummary(transformedData);
      } catch (error) {
        console.error('Error fetching finance data:', error);
        setError('Failed to load finance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Calculate chart data from summary
  const incomeExpenseData = [
    { name: 'Income', value: summary?.totalIncome || 0 },
    { name: 'Expenses', value: summary?.totalExpenses || 0 },
  ];
  
  // Calculate total balance across all accounts
  const totalBalance = summary?.accountBalances.reduce(
    (sum, account) => sum + (account.balance || 0), 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/finance/transactions/new')}>
            New Transaction
          </Button>
          <Button variant="outlined" onClick={() => navigate('/finance/accounts')}>
            View All Accounts
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-4 text-red-500 rounded-lg bg-red-50">
            {error}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">+{formatCurrency(summary.totalIncome)} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">+{formatCurrency(summary.totalExpenses * 0.15)} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.netIncome >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(summary.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.netIncome >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Across {summary.accountBalances.length} accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', value: summary.totalIncome },
                  { name: 'Expenses', value: Math.abs(summary.totalExpenses) },
                ]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {summary ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.accountBalances}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="balance"
                    nameKey="accountName"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {summary?.accountBalances?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-gray-500">Loading...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outlined" onClick={() => navigate('/finance/transactions')}>
              View All Transactions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary?.recentTransactions?.length > 0 ? (
              summary?.recentTransactions?.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      transaction.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || 'No description'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.category && ` • ${transaction.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.accountName}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No recent transactions found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
