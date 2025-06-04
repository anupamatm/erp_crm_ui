import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, X, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { useToast } from '../../components/ui/use-toast';
import { Skeleton } from '../../components/ui/skeleton';
// Custom debounce implementation with cancel method
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
};

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AccountsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce((search: string) => {
      setSearchTerm(search);
      setCurrentPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Update search term when input changes (debounced)
  useEffect(() => {
    debouncedFetch(searchInput);
    
    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchInput, debouncedFetch]);

  // Fetch accounts when pagination or search term changes
  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchTerm]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await financeService.getAccounts({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      });
      
      const { data, total } = response;
      console.log('API Response:', { data, total, currentPage, totalPages: Math.ceil(total / pageSize) });
      
      setAccounts(Array.isArray(data) ? data : []);
      
      // Update pagination state
      const totalCount = typeof total === 'number' ? total : 0;
      const calculatedPages = Math.ceil(totalCount / pageSize) || 1;
      
      setTotalItems(totalCount);
      setTotalPages(calculatedPages);
      
      // If current page is greater than total pages, reset to first page
      if (currentPage > calculatedPages && calculatedPages > 0) {
        setCurrentPage(1);
        return; // Will trigger another fetch with page=1
      }
      
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
      setTotalPages(1);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    // debouncedFetch is called in the effect that watches searchInput
  }, []);

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await financeService.deleteAccount(id);
        toast({
          title: 'Success',
          description: 'Account deleted successfully',
        });
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete account',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected accounts?`)) {
      try {
        await Promise.all(selectedRows.map(id => financeService.deleteAccount(id)));
        toast({
          title: 'Success',
          description: `${selectedRows.length} accounts deleted successfully`,
        });
        setSelectedRows([]);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting accounts:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete accounts',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(accounts.map(account => account._id));
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
      case 'Asset':
        return <Badge className="bg-blue-100 text-blue-800">Asset</Badge>;
      case 'Liability':
        return <Badge className="bg-red-100 text-red-800">Liability</Badge>;
      case 'Equity':
        return <Badge className="bg-green-100 text-green-800">Equity</Badge>;
      case 'Revenue':
        return <Badge className="bg-purple-100 text-purple-800">Revenue</Badge>;
      case 'Expense':
        return <Badge className="bg-yellow-100 text-yellow-800">Expense</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <Button onClick={() => navigate('/finance/accounts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search accounts..."
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  handleSearch(e as any);
                }
              }}
              style={{
                paddingLeft: '2rem',
                width: '100%',
                maxWidth: '400px'
              }}
            />
            {searchInput && (
              <X
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={handleClearSearch}
              />
            )}
          </div>
          <Button 
            type="button" 
            variant="outlined"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outlined"
            onClick={() => {
              setSearchInput('');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            disabled={!searchTerm && !searchInput}
          >
            Reset
          </Button>
          <Button type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-blue-700">{selectedRows.length} selected</span>
          </div>
          <div className="space-x-2">
            <Button
              variant="destructive"
              size="sm"
              className="hover:bg-red-100"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : accounts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No accounts found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/finance/accounts/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Account
            </Button>
          </div>
        ) : (
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.includes(account._id)}
                      onChange={() => toggleSelectRow(account._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {account.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{account.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(account.type)}</TableCell>
                  <TableCell className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(account.balance, account.currency)}
                  </TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full mr-2 ${account.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate(`/finance/accounts/${account._id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(account._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {accounts.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> accounts
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || loading}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <select
                value={pageSize}
                disabled={loading}
                onChange={() => {
                  setCurrentPage(1);
                  // If you want to make pageSize dynamic, you can add state for it
                  // setPageSize(Number(e.target.value));
                }}
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;
