import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { DatePicker, Select, Card, Table, Button, message } from 'antd';
import api from '../../api/api';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SalesReport {
  id: string;
  date: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

interface SummaryStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

const Reports = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SalesReport[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // First, fetch invoices data
      const response = await api.get('/api/sales/invoices');
      
      console.log('Invoices API Response:', response);
      
      // Handle different response formats
      let invoices = [];
      if (Array.isArray(response.data)) {
        invoices = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        invoices = response.data.data;
      } else if (response.data && Array.isArray(response.data.invoices)) {
        invoices = response.data.invoices;
      }
      
      // Filter invoices by date range and status
      const filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = dayjs(invoice.issueDate || invoice.createdAt);
        const isInDateRange = invoiceDate.isAfter(dateRange[0]) && 
                            invoiceDate.isBefore(dateRange[1].add(1, 'day'));
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return isInDateRange && matchesStatus;
      });
      
      // Log a sample invoice to see its structure
      if (filteredInvoices.length > 0) {
        console.log('Sample invoice data:', filteredInvoices[0]);
        console.log('Invoice keys:', Object.keys(filteredInvoices[0]));
      }

      // Transform to report format
      const reportData = filteredInvoices.map((invoice: any) => {
        // Debug log for each invoice's amount fields
        const debugInfo = {
          id: invoice._id || invoice.id,
          subTotal: invoice.subTotal,
          total: invoice.total,
          totalAmount: invoice.totalAmount,
          amount: invoice.amount,
          items: invoice.items,
          calculatedTotal: invoice.items?.reduce((sum: number, item: any) => {
            const quantity = item.quantity || 1;
            const price = item.price || item.unitPrice || 0;
            return sum + (quantity * price);
          }, 0) || 0
        };
        console.log('Invoice debug:', debugInfo);

        // Calculate total from items if needed
        const calculatedTotal = invoice.items?.reduce((sum: number, item: any) => {
          const quantity = item.quantity || 1;
          const price = item.price || item.unitPrice || 0;
          return sum + (quantity * price);
        }, 0) || 0;

        return {
          id: invoice._id || invoice.id,
          date: invoice.issueDate || invoice.createdAt || invoice.date,
          invoiceNumber: invoice.invoiceNumber || invoice.number || `INV-${invoice._id?.substring(0, 8) || ''}`,
          customer: invoice.customer?.name || invoice.customerName || 'Unknown Customer',
          amount: invoice.subTotal || invoice.amount || calculatedTotal || 0,
          tax: invoice.taxAmount || invoice.tax || 0,
          total: invoice.totalAmount || invoice.total || 
                (invoice.subTotal || 0) + (invoice.taxAmount || 0) || 
                calculatedTotal || 0,
          status: invoice.status || 'pending',
          paymentMethod: invoice.paymentMethod || 'Unknown'
        };
      });
      
      setReportData(reportData);
      calculateSummary(reportData);
      
    } catch (error: any) {
      console.error('Error fetching sales report:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to load sales report';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      message.error(errorMessage);
      setReportData([]);
      calculateSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: SalesReport[]) => {
    const totalRevenue = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalOrders = data.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    setSummary({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate: 0, // This would come from your analytics
    });
  };

  const exportToExcel = async () => {
    if (reportData.length === 0) {
      message.warning('No data to export');
      return;
    }

    try {
      // Try dynamic import of xlsx
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      XLSX.writeFile(workbook, `Sales_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      
      // Fallback to CSV download if XLSX fails
      try {
        const headers = Object.keys(reportData[0]).join(',');
        const csvRows = reportData.map(row => 
          Object.values(row).map(field => 
            typeof field === 'string' && field.includes(',') ? `"${field}"` : field
          ).join(',')
        );
        
        const csvContent = [headers, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sales_Report_${dayjs().format('YYYY-MM-DD')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (csvError) {
        console.error('Error exporting to CSV:', csvError);
        message.error('Failed to export data. Please try again later.');
      }
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, statusFilter]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'paid' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'overdue' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Reports</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <RangePicker
            value={[dateRange[0], dateRange[1]]}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            className="w-full sm:w-64"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-40"
          >
            <Option value="all">All Status</Option>
            <Option value="paid">Paid</Option>
            <Option value="pending">Pending</Option>
            <Option value="overdue">Overdue</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <Button
            type="primary"
            icon={<Download size={16} className="mr-2" />}
            onClick={exportToExcel}
            className="flex items-center justify-center"
          >
            Export
          </Button>
          <Button
            icon={<RefreshCw size={16} className="mr-2" />}
            onClick={fetchReportData}
            loading={loading}
            className="flex items-center justify-center"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold">${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-600 mt-1">+12% from last period</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{summary.totalOrders}</p>
              <p className="text-xs text-green-600 mt-1">+5% from last period</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-semibold">${summary.averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">+8% from last period</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold">{summary.conversionRate}%</p>
              <p className="text-xs text-red-600 mt-1">-2% from last period</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={reportData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            className="w-full"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by Product */}
        <Card className="shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Sales by Product</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>Chart will be displayed here</p>
            </div>
          </div>
        </Card>

        {/* Sales by Category */}
        <Card className="shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Sales by Category</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>Chart will be displayed here</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports; 