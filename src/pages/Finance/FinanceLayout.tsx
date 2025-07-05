import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

const FinanceLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/finance/accounts')) return 'accounts';
    if (path.includes('/finance/transactions')) return 'transactions';
    if (path.includes('/finance/expenses')) return 'expenses';
    if (path.includes('/finance/summary')) return 'summary';
    if (path.includes('/finance/reports')) return 'reports';
    return 'accounts';
  };
  
  const activeTab = getActiveTab();

  const handleTabClick = (tab: string) => {
    switch (tab) {
      case 'accounts':
        navigate('/finance/accounts');
        break;
      case 'transactions':
        navigate('/finance/transactions');
        break;
      case 'expenses':
        navigate('/finance/expenses');
        break;
      case 'summary':
        navigate('/finance/summary');
        break;
      case 'reports':
        navigate('/finance/expenses/reports');
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/finance/accounts/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
          <Button
            onClick={() => navigate('/finance/transactions/new')}
            className="mr-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button
            onClick={() => navigate('/finance/expenses/new')}
            variant="outlined"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <TabsList>
          <TabsTrigger 
            data-state={activeTab === 'accounts' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('accounts')}
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger 
            data-state={activeTab === 'transactions' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('transactions')}
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            data-state={activeTab === 'expenses' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('expenses')}
          >
            Expenses
          </TabsTrigger>
          {/* <TabsTrigger 
            data-state={activeTab === 'summary' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('summary')}
          >
            Summary
          </TabsTrigger> */}
          <TabsTrigger 
            data-state={activeTab === 'reports' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('reports')}
          >
            Reports
          </TabsTrigger>
        </TabsList>
      </div>

      <Outlet />
    </div>
  );
};

export default FinanceLayout;