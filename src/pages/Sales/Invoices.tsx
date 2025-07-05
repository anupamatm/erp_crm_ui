import { useState, useEffect } from 'react';
import { PlusOutlined, DownloadOutlined, ReloadOutlined, SearchOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tag, Card, Input, Select, Space, Typography, Statistic, message } from 'antd';
import api from '../../api/api';

const { Title } = Typography;
const { Option } = Select;

interface Invoice {
  _id: string;
  id?: string; // Optional for backward compatibility
  invoiceNumber: string;
  customer: {
    name: string;
    email?: string;
  };
  issueDate: string;
  dueDate: string;
  updatedAt?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  totalAmount: number;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Summary card values
  const [summary, setSummary] = useState({
    totalOutstanding: 0,
    overdue: 0,
    dueIn7Days: 0,
    paidLast30Days: 0
  });

  const calculateSummary = (invoices: Invoice[]) => {
    console.log('Calculating summary for invoices:', invoices);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Helper function to safely parse amount
    const parseAmount = (amount: any): number => {
      if (typeof amount === 'number') return amount;
      if (typeof amount === 'string') {
        // Remove any non-numeric characters except decimal point
        const num = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    let totalOutstanding = 0;
    let overdue = 0;
    let dueIn7Days = 0;
    let paidLast30Days = 0;

    invoices.forEach(invoice => {
      const amount = parseAmount(invoice.totalAmount);
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      // Total Outstanding
      if (['sent', 'overdue', 'partially_paid'].includes(invoice.status)) {
        totalOutstanding += amount;
      }
      
      // Overdue
      if (invoice.status === 'overdue') {
        overdue += amount;
      }
      
      // Due in 7 days
      if (dueDate > today && dueDate <= sevenDaysFromNow && 
          ['sent', 'partially_paid'].includes(invoice.status)) {
        dueIn7Days += amount;
      }
      
      // Paid in last 30 days
      if (invoice.status === 'paid') {
        const paidDate = new Date(invoice.updatedAt || invoice.issueDate);
        paidDate.setHours(0, 0, 0, 0);
        
        if (paidDate >= thirtyDaysAgo) {
          paidLast30Days += amount;
        }
      }
    });

    const result = {
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
      overdue: parseFloat(overdue.toFixed(2)),
      dueIn7Days: parseFloat(dueIn7Days.toFixed(2)),
      paidLast30Days: parseFloat(paidLast30Days.toFixed(2))
    };

    console.log('Calculated summary:', result);
    setSummary(result);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoices from API...');
      
      // Add pagination parameters to get all invoices
      const response = await api.get('/api/sales/invoices', {
        params: {
          page: 1,
          limit: 100, // Increase limit to get more invoices
          sort: '-createdAt' // Sort by newest first
        }
      });
      
      // Debug: Log the complete response structure
      console.group('API Response Details');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data keys:', Object.keys(response.data));
      
      // Check for pagination info
      if (response.data.pagination) {
        console.log('Pagination info:', response.data.pagination);
      }
      
      // Check if response exists and has data
      if (response && response.data) {
        let invoices = [];
        // Pagination variables (commented out until needed)
        // let total = 0;
        // let pages = 1;
        // let currentPage = 1;
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          console.log('Response is an array');
          invoices = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response has a data property that's an array
          console.log('Response has data array');
          invoices = response.data.data;
          console.log(`Found ${invoices.length} invoices in data array`);
        } else if (response.data.invoices && Array.isArray(response.data.invoices)) {
          // If response has an invoices property that's an array
          console.log('Response has invoices array');
          invoices = response.data.invoices;
          console.log(`Found ${invoices.length} invoices in invoices array`);
        } else if (response.data.docs && Array.isArray(response.data.docs)) {
          // If using MongoDB/Mongoose style response
          console.log('Response has docs array (MongoDB style)');
          invoices = response.data.docs;
          console.log(`Found ${invoices.length} invoices in docs array`);
        } else {
          console.warn('Unexpected response format. Available keys:', Object.keys(response.data));
        }
        
        console.log(`Processing ${invoices.length} invoices`);
        console.groupEnd(); // Close the API Response Details group
        
        if (invoices.length > 0) {
          console.log('First invoice sample:', JSON.stringify(invoices[0], null, 2));
          console.log('Invoice amounts:', invoices.map((inv: any) => ({
            id: inv._id,
            amount: inv.totalAmount,
            status: inv.status,
            dueDate: inv.dueDate
          })));
        }
        
        // Ensure we have valid data before updating state
        if (Array.isArray(invoices)) {
          setInvoices(invoices);
          calculateSummary(invoices);
        } else {
          console.warn('Invalid invoices data format:', invoices);
          setInvoices([]);
          calculateSummary([]);
        }
      } else {
        console.warn('Empty or invalid API response');
        setInvoices([]);
        calculateSummary([]);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.data?.message || 'Failed to load invoices';
      message.error(errorMessage);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInvoices();
  }, []);
  
  // Ensure invoices is always an array before filtering
  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter((invoice: Invoice) => {
    if (!invoice) return false;
    
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      (invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.customer?.name?.toLowerCase().includes(searchLower) ||
      (invoice.customer?.email && invoice.customer.email.toLowerCase().includes(searchLower)));
      
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter as Invoice['status'];
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'processing';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'default';
      case 'partially_paid':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/api/sales/invoices/${id}`);
        message.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        message.error('Failed to delete invoice');
      }
    }
  };

  const handleSendEmail = async (invoice: any) => {
    try {
      const response = await api.post(`/api/invoices/${invoice._id || invoice.id}/send-email`);
      message.success(response.data.message || 'Invoice sent successfully');
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      message.error(error.response?.data?.message || 'Failed to send invoice email');
    }
  };
  
  const columns: any[] = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record: Invoice) => (
        <a onClick={() => navigate(`/sales/invoices/${record._id}`)}>{text}</a>
      ),
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Invoice['status']) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: Invoice) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<MailOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => handleSendEmail(record)}
            title="Send via Email"
            style={{ padding: '4px 8px' }}
          />
          <Button 
            type="text" 
            onClick={() => navigate(`/sales/invoices/${record._id || record.id || ''}`)}
            style={{ padding: '4px 8px' }}
          >
            View
          </Button>
          <Button 
            type="text" 
            danger 
            onClick={() => handleDelete(record._id || record.id || '')}
            style={{ padding: '4px 8px' }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Invoices</Title>
        <div className="flex space-x-4">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchInvoices}
            loading={loading}
            className="mr-2"
          >
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />}>
            Export
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/sales/invoices/new')}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <Statistic
            title="Total Outstanding"
            value={summary.totalOutstanding.toFixed(2)}
            prefix="$"
          />
        </Card>
        <Card>
          <Statistic
            title="Overdue"
            value={summary.overdue.toFixed(2)}
            valueStyle={{ color: '#ff4d4f' }}
            prefix="$"
          />
        </Card>
        <Card>
          <Statistic
            title="Due in 7 Days"           
            valueStyle={{ color: '#faad14' }}
            value={summary.dueIn7Days.toFixed(2)}
            prefix="$"            
          />
        </Card>
        <Card>
          <Statistic
            title="Paid Last 30 Days"
            value={summary.paidLast30Days.toFixed(2)}
            valueStyle={{ color: '#52c41a' }}
            prefix="$"
          />
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search invoices..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="draft">Draft</Option>
              <Option value="sent">Sent</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="partially_paid">Partially Paid</Option>
            </Select>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredInvoices} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">No invoices found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchText || statusFilter !== 'all' 
                    ? 'No invoices match your search criteria' 
                    : 'Create your first invoice to get started'}
                </p>
                {!searchText && statusFilter === 'all' && (
                  <Button 
                    type="primary" 
                    className="mt-4"
                    onClick={() => navigate('/sales/invoices/new')}
                    icon={<PlusOutlined />}
                  >
                    Create Invoice
                  </Button>
                )}
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default Invoices; 