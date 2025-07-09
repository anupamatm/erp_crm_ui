import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Card
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../lib/auth';// Adjust import path

const { Title } = Typography;

type ProductSuggestion = {
  id: string;
  productName: string;
  suggestedBy: string;
  reason: string;
  createdAt: string;
};

const ProductSuggestions: React.FC = () => {
  const { user } = useAuth(); // Get user from context
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const isAdmin = user?.role === 'admin';
  const isInventoryManager = user?.role === 'inventory-mgr';

  useEffect(() => {
    console.log(user);
    const saved = localStorage.getItem('productSuggestions');
    if (saved) {
      setSuggestions(JSON.parse(saved));
    }
  }, []);

  const saveSuggestions = (updated: ProductSuggestion[]) => {
    setSuggestions(updated);
    localStorage.setItem('productSuggestions', JSON.stringify(updated));
  };

  const handleAdd = (values: Omit<ProductSuggestion, 'id' | 'createdAt'>) => {
    const newSuggestion: ProductSuggestion = {
      ...values,
      id: `SG-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...suggestions, newSuggestion];
    saveSuggestions(updated);
    message.success('Suggestion added successfully');
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Suggested By',
      dataIndex: 'suggestedBy',
      key: 'suggestedBy',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="!mb-0">Product Suggestions</Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Add Suggestion
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={suggestions}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {isAdmin && (
        <Modal
          title="Add Product Suggestion"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          okText="Submit"
        >
          <Form layout="vertical" form={form} onFinish={handleAdd}>
            <Form.Item
              label="Product Name"
              name="productName"
              rules={[{ required: true, message: 'Enter product name' }]}
            >
              <Input placeholder="e.g., Wireless Mouse" />
            </Form.Item>

            <Form.Item
              label="Suggested By"
              name="suggestedBy"
              rules={[{ required: true, message: 'Enter your name' }]}
              initialValue={`${user?.name}`}
            >
              <Input placeholder="e.g., Alex John" disabled />
            </Form.Item>

            <Form.Item
              label="Reason"
              name="reason"
              rules={[{ required: true, message: 'Enter reason for suggestion' }]}
            >
              <Input.TextArea rows={4} placeholder="Why is this product needed?" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Card>
  );
};

export default ProductSuggestions;
