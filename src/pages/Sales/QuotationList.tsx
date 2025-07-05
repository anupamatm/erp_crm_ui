import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tag, Space, Card, Select, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Quotation, QuotationService, QuotationStatus } from '../../services/QuotationService';

const { Title } = Typography;
const { Option } = Select;

export const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  const statusColors: Record<QuotationStatus, string> = {
    draft: 'default',
    sent: 'blue',
    accepted: 'green',
    rejected: 'red',
    expired: 'orange',
  };

  const fetchQuotations = async (page: number = 1, status?: QuotationStatus) => {
    try {
      setLoading(true);
      const data = await QuotationService.getQuotations(page, pagination.pageSize, status);
      setQuotations(data.docs || []);
      setPagination({
        ...pagination,
        total: data.totalDocs || 0,
        current: data.page || 1,
      });
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(1, statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter]);

  const handleTableChange = (pagination: any) => {
    fetchQuotations(pagination.current, statusFilter === 'all' ? undefined : statusFilter);
  };

  const handleStatusFilter = (value: QuotationStatus | 'all') => {
    setStatusFilter(value);
  };

  const columns = [
    {
      title: 'Quote #',
      dataIndex: 'quoteNumber',
      key: 'quoteNumber',
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'total',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: QuotationStatus) => (
        <Tag color={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Quotation) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/sales/quotations/${record._id}`)}
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/sales/quotations/${record._id}/edit`)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id!)}
          />
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await QuotationService.deleteQuotation(id);
        fetchQuotations(pagination.current, statusFilter === 'all' ? undefined : statusFilter);
      } catch (error) {
        console.error('Failed to delete quotation:', error);
      }
    }
  };

  return (
    <div className="quotation-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Quotations</Title>
        <div>
          <Select
            defaultValue="all"
            style={{ width: 150, marginRight: 16 }}
            onChange={handleStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="draft">Draft</Option>
            <Option value="sent">Sent</Option>
            <Option value="accepted">Accepted</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="expired">Expired</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/sales/quotations/new')}
          >
            New Quotation
          </Button>
        </div>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

// Export is now at the component declaration
