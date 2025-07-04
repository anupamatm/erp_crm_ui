import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

const FinanceLayout = () => {
  const [value, setValue] = useState('accounts');
  const navigate = useNavigate();

  const handleChange = (newValue: string) => {
    setValue(newValue);
    switch (newValue) {
      case 'accounts':
        navigate('/finance/accounts');
        break;
      case 'transactions':
        navigate('/finance/transactions');
        break;
      case 'summary':
        navigate('/finance/summary');
        break;
      case 'reports':
        navigate('/finance/reports');
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/finance/accounts/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
          <Button
            onClick={() => navigate('/finance/transactions/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <TabsList>
          <TabsTrigger onClick={() => handleChange('accounts')}>
            Accounts
          </TabsTrigger>
          <TabsTrigger onClick={() => handleChange('transactions')}>
            Transactions
          </TabsTrigger>
          <TabsTrigger onClick={() => handleChange('summary')}>
            Summary
          </TabsTrigger>
          <TabsTrigger onClick={() => handleChange('reports')}>
            Reports
          </TabsTrigger>
        </TabsList>
      </div>

      <Outlet />
    </div>
  );
};

export default FinanceLayout;
