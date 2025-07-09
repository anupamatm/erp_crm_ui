import React from 'react';
import { Table, Button, Space, Input, Row, Col, Card, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Search } = Input;

// Mock data - replace with actual API calls
const data = [
  {
    key: '1',
    sku: 'SKU001',
    name: 'Laptop',
    category: 'Electronics',
    stock: 45,
    price: 1200,
    status: 'In Stock',
  },
  {
    key: '2',
    sku: 'SKU002',
    name: 'Mouse',
    category: 'Accessories',
    stock: 120,
    price: 25,
    status: 'In Stock',
  },
  {
    key: '3',
    sku: 'SKU003',
    name: 'Keyboard',
    category: 'Accessories',
    stock: 5,
    price: 50,
    status: 'Low Stock',
  },
  {
    key: '4',
    sku: 'SKU004',
    name: 'Monitor',
    category: 'Electronics',
    stock: 0,
    price: 300,
    status: 'Out of Stock',
  },
];

const InventoryItems: React.FC = () => {
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: any, b: any) => a.stock - b.stock,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Low Stock') color = 'orange';
        if (status === 'Out of Stock') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'In Stock', value: 'In Stock' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Out of Stock', value: 'Out of Stock' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="link" 
            size="small"
            onClick={() => console.log('Edit item:', record.sku)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${record.name}?`)) {
                console.log('Delete item:', record.sku);
                // Add your delete logic here
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inventory Items</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add New Item
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Search items..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(value) => console.log(value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button icon={<FilterOutlined />}>
                Filters
              </Button>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 10 }} 
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default InventoryItems;
