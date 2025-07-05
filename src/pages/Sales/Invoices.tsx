import { useState, useEffect } from 'react';
import { PlusOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tag, Card, Input, Select, Space, Typography, Statistic, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../../api/api';

const { Title } = Typography;
const { Option } = Select;

interface Invoice {
  _id: string;
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
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const totalOutstanding = invoices
    .filter(i => ['sent', 'overdue', 'partially_paid'].includes(i.status))
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const overdue = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const dueIn7Days = invoices
    .filter(i => {
      const dueDate = new Date(i.dueDate);
      return (
        dueDate > today && 
        dueDate <= sevenDaysFromNow && 
        ['sent', 'partially_paid'].includes(i.status)
      );
    })
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const paidLast30Days = invoices
    .filter(i => {
      const paidDate = new Date(i.updatedAt || i.issueDate);
      return i.status === 'paid' && paidDate >= thirtyDaysAgo;
    })
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  setSummary({
    totalOutstanding,
    overdue,
    dueIn7Days,
    paidLast30Days
  });
};

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoices from API...');
      const response = await api.get('/api/sales/invoices');
      console.log('API Response:', response);
      
      // Check if response exists and has data
      if (response && response.data) {
        // The API returns an object with invoices array and pagination info
        const { invoices, total, pages, currentPage } = response.data;
        
        if (Array.isArray(invoices)) {
          console.log(`Found ${invoices.length} invoices (Page ${currentPage} of ${pages}, Total: ${total})`);
          setInvoices(invoices);
          calculateSummary(invoices);
          // You can also store pagination info if you want to implement pagination
          // setPagination({ total, pages, currentPage });          
        } else {
          console.warn('Invoices data is not an array:', response.data);
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
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (invoice.customer.email && invoice.customer.email.toLowerCase().includes(searchText.toLowerCase()));
      
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
      render: (_: any, record: Invoice) => (
        <Space size="middle">
          <Button 
            type="link" 
            danger
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this invoice?')) {
                try {
                  await api.delete(`/api/sales/invoices/${record._id}`);
                  message.success('Invoice deleted successfully');
                  fetchInvoices(); // Refresh the list
                } catch (error) {
                  console.error('Error deleting invoice:', error);
                  message.error('Failed to delete invoice');
                }
              }
            }}
          >
            Delete
          </Button>
          <Button 
            type="link" 
            onClick={() => navigate(`/sales/invoices/${record._id}/edit`)}
          >
            Edit
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