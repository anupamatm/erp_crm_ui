import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  ShoppingOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  TagOutlined,
} from '@ant-design/icons';

const InventoryDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const stats = {
    totalItems: 1245,
    lowStockItems: 24,
    outOfStockItems: 8,
    categories: 15,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={stats.totalItems}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={stats.lowStockItems}
              prefix={<AlertOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={stats.outOfStockItems}
              prefix={<CheckCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.categories}
              prefix={<TagOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" className="h-full">
            <div className="text-gray-500">
              Recent inventory activities will be displayed here.
              {/* Add activity timeline or recent transactions here */}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="h-full">
            <div className="space-y-4">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Add New Item
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Update Stock
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Generate Report
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                View All Low Stock Items
              </button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryDashboard;
