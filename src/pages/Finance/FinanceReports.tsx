import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Button, Box, Typography, IconButton, TextField } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { financeService } from '../../services/financeService';
import { format } from 'date-fns';
import { Transaction, TransactionType } from '../../types/Finance';

interface ReportData {
  date: string;
  income: number;
  expense: number;
}

const FinanceReports = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);

  const fetchReportData = async () => {
    try {
      if (!startDate || !endDate) return;
      
      const response = await financeService.getTransactions({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      setTransactions(response.data);
      
      // Process transactions into report data
      const processedData = Array.from({ length: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1 }, (_, i) => {
        const date = new Date(startDate.getTime() + i * 1000 * 60 * 60 * 24);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayTransactions = response.data.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr);
        
        return {
          date: dateStr,
          income: dayTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
          expense: dayTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
        };
      });
      
      setReportData(processedData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Financial Reports</Typography>
          <TextField
            type="date"
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(new Date(e.target.value))}
            sx={{ width: '120px' }}
          />
          <TextField
            type="date"
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(new Date(e.target.value))}
            sx={{ width: '120px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchReportData}
            startIcon={<CalendarIcon />}
          >
            Generate Report
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardHeader title="Daily Income Report" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reportData.map((item) => (
                    <Box key={item.date} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{format(new Date(item.date), 'MMM dd, yyyy')}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.income.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card>
              <CardHeader title="Daily Expense Report" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reportData.map((item) => (
                    <Box key={item.date} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{format(new Date(item.date), 'MMM dd, yyyy')}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.expense.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FinanceReports;
