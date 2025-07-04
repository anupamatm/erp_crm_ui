import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Download, Filter, ChevronDown, ChevronUp, X, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { useToast } from '../../components/ui/use-toast';

interface Transaction {
  _id: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer';
  amount: number;
  description: string;
  account: {
    _id: string;
    name: string;
  };
  toAccount?: {
    _id: string;
    name: string;
  };
  category?: {
    _id: string;
    name: string;
  };
  reference?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

const TransactionsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    account: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ _id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
  }, [currentPage, searchTerm, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await financeService.getTransactions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        ...filters,
      });
      setTransactions(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await financeService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await financeService.getTransactionCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      account: '',
      category: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await financeService.deleteTransaction(id);
        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
        });
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete transaction',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected transactions?`)) {
      try {
        await Promise.all(selectedRows.map(id => financeService.deleteTransaction(id)));
        toast({
          title: 'Success',
          description: `${selectedRows.length} transactions deleted successfully`,
        });
        setSelectedRows([]);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete transactions',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(transactions.map(t => t._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Income':
        return <Badge className="bg-green-100 text-green-800">Income</Badge>;
      case 'Expense':
        return <Badge className="bg-red-100 text-red-800">Expense</Badge>;
      case 'Transfer':
        return <Badge className="bg-blue-100 text-blue-800">Transfer</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const amount = Math.abs(transaction.amount);
    const formatted = formatCurrency(amount);
    
    if (transaction.type === 'Income') {
      return <span className="text-green-600">+{formatted}</span>;
    } else if (transaction.type === 'Expense') {
      return <span className="text-red-600">-{formatted}</span>;
    } else {
      // For transfers, show the amount with a neutral color
      return <span>{formatted}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Manage your financial transactions
          </p>
        </div>
        <Button onClick={() => navigate('/finance/transactions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Filters
            </Button>
            <Button type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Account</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={filters.account}
                  onChange={(e) => handleFilterChange('account', e.target.value)}
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-blue-700">{selectedRows.length} selected</span>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/finance/transactions/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedRows.includes(transaction._id)}
                        onChange={() => toggleSelectRow(transaction._id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'Income' ? (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        ) : transaction.type === 'Expense' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-blue-500" />
                        )}
                        {getTypeBadge(transaction.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.description || 'No description'}
                        </span>
                        {transaction.category && (
                          <span className="text-xs text-muted-foreground">
                            {transaction.category.name}
                          </span>
                        )}
                        {transaction.reference && (
                          <span className="text-xs text-muted-foreground">
                            Ref: {transaction.reference}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{transaction.account.name}</span>
                        {transaction.toAccount && (
                          <span className="text-xs text-muted-foreground">
                            → {transaction.toAccount.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {getAmountDisplay(transaction)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/finance/transactions/${transaction._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(transaction._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
