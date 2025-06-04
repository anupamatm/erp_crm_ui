import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Typography, TextField, Box } from '@mui/material';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { financeService } from '../../services/financeService';
import { Transaction, FinancialSummary } from '../../types/Finance';

interface TransactionData {
  date: string;
  income: number;
  expense: number;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

const Summary = () => {
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0
  });
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchSummary();
    fetchTransactionData();
  }, []);

  const fetchSummary = async () => {
    try {
      if (!startDate || !endDate) return;
      
      const response = await financeService.getSummary({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      setSummary(response);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchTransactionData = async () => {
    try {
      if (!startDate || !endDate) return;
      
      const response = await financeService.getTransactions({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      // Group transactions by date
      const grouped = response.data.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'Income') {
          acc[date].income += transaction.amount;
        } else {
          acc[date].expense += transaction.amount;
        }
        return acc;
      }, {});

      // Convert to array for chart
      const data = Object.entries(grouped).map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense
      }));

      setTransactionData(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Financial Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            sx={{ width: '120px' }}
          />
          <TextField
            type="date"
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            sx={{ width: '120px' }}
          />
          <Button
            variant="contained"
            onClick={() => {
              fetchSummary();
              fetchTransactionData();
            }}
          >
            Update
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        <Card>
          <CardHeader title="Total Income" />
          <CardContent>
            <Typography variant="h4" component="div">
              {summary.totalIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Total Expenses" />
          <CardContent>
            <Typography variant="h4" component="div">
              {summary.totalExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Balance" />
          <CardContent>
            <Typography variant="h4" component="div">
              {summary.netIncome > 0 ? '+' : ''}{summary.netIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="Income vs Expenses" />
        <CardContent>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#4ade80" name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Summary;
