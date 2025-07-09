import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Card,
  Tabs,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

type ProductRequirement = {
  id: string;
  title: string;
  description: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  requestedBy?: string;
  assignedTo?: string;
  requestedDate?: string;
  targetRelease?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
};

// Priority & Status Tags
const getPriorityTag = (priority: string) => {
  const map = {
    low: <Tag color="blue">Low</Tag>,
    medium: <Tag color="green">Medium</Tag>,
    high: <Tag color="orange">High</Tag>,
    critical: <Tag color="red">Critical</Tag>,
  };
  return map[priority as keyof typeof map] || <Tag>{priority}</Tag>;
};

const getStatusTag = (status: string) => {
  const map = {
    pending: <Tag icon={<ClockCircleOutlined />} color="default">Pending</Tag>,
    'in-progress': <Tag icon={<ClockCircleOutlined />} color="processing">In Progress</Tag>,
    completed: <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>,
    rejected: <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>,
  };
  return map[status as keyof typeof map] || <Tag>{status}</Tag>;
};

const ProductRequirements: React.FC = () => {
  const [requirements, setRequirements] = useState<ProductRequirement[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const categories = ['UI/UX', 'New Feature', 'Enhancement', 'Bug Fix', 'Performance', 'Security', 'Integration'];

  useEffect(() => {
    const saved = localStorage.getItem('productRequirements');
    if (saved) {
      setRequirements(JSON.parse(saved));
    } else {
      const defaultData: ProductRequirement[] = [
        {
          id: 'REQ-001',
          title: 'Dark Mode Support',
          description: 'Add dark theme to improve UX',
          priority: 'high',
          status: 'in-progress',
          requestedBy: 'John',
          requestedDate: dayjs().format('YYYY-MM-DD'),
          targetRelease: dayjs().add(2, 'month').format('YYYY-MM-DD'),
          progress: 60,
          createdAt: dayjs().format(),
          updatedAt: dayjs().format(),
        },
        {
          id: 'REQ-1002',
          title: 'PDF Export Functionality',
          description: 'Enable exporting reports and invoices to PDF format.',
          priority: 'medium',
          status: 'pending',
          requestedBy: 'Sarah Johnson',
          assignedTo: 'Backend Team',
          requestedDate: '2025-06-10',
          targetRelease: '2025-09-01',
          progress: 0,
          createdAt: '2025-06-10',
          updatedAt: '2025-06-10',
        },
        {
          id: 'REQ-1003',
          title: 'Multi-Language Support',
          description: 'Support for English, Spanish, and French languages.',
          priority: 'critical',
          status: 'pending',
          requestedBy: 'Marketing Team',
          assignedTo: 'Frontend Team',
          requestedDate: '2025-06-15',
          targetRelease: '2025-08-31',
          progress: 0,
          createdAt: '2025-06-15',
          updatedAt: '2025-06-15',
        },
      ];
      setRequirements(defaultData);
      localStorage.setItem('productRequirements', JSON.stringify(defaultData));
    }
  }, []);

  const saveRequirements = (data: ProductRequirement[]) => {
    setRequirements(data);
    localStorage.setItem('productRequirements', JSON.stringify(data));
  };

  const handleEdit = (record: ProductRequirement) => {
    form.setFieldsValue({
      ...record,
      requestedDate: record.requestedDate ? dayjs(record.requestedDate) : null,
      targetRelease: record.targetRelease ? dayjs(record.targetRelease) : null,
    });
    setEditingId(record.id);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this?',
      okType: 'danger',
      onOk: () => {
        const filtered = requirements.filter(req => req.id !== id);
        saveRequirements(filtered);
        message.success('Deleted successfully');
      },
    });
  };

  const handleSubmit = (values: any) => {
    const newReq: ProductRequirement = {
      ...values,
      id: editingId || `REQ-${Date.now()}`,
      requestedDate: values.requestedDate?.format('YYYY-MM-DD'),
      targetRelease: values.targetRelease?.format('YYYY-MM-DD'),
      createdAt: editingId
        ? requirements.find(r => r.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      const updated = requirements.map(req => (req.id === editingId ? newReq : req));
      saveRequirements(updated);
      message.success('Requirement updated');
    } else {
      saveRequirements([...requirements, newReq]);
      message.success('Requirement added');
    }

    form.resetFields();
    setIsModalVisible(false);
    setEditingId(null);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (_: string, record: ProductRequirement) => (
        <div>
          <strong>{record.title}</strong>
          <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: getPriorityTag,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: getStatusTag,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      render: (val: number) => (val !== undefined ? `${val}%` : '-'),
    },
    {
      title: 'Actions',
      render: (_: any, record: ProductRequirement) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return requirements;
    return requirements.filter(r => r.status === activeTab);
  }, [requirements, activeTab]);

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>Product Requirements</Title>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => {
            form.resetFields();
            setEditingId(null);
            setIsModalVisible(true);
          }}>
            Add Requirement
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All" key="all" />
          <TabPane tab="Pending" key="pending" />
          <TabPane tab="In Progress" key="in-progress" />
          <TabPane tab="Completed" key="completed" />
          <TabPane tab="Rejected" key="rejected" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={isModalVisible}
        title={editingId ? 'Edit Requirement' : 'Add Requirement'}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Save"
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select category">
              {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item name="progress" label="Progress">
            <InputNumber min={0} max={100} formatter={val => `${val}%`} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="requestedDate" label="Requested Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="targetRelease" label="Target Release">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="requestedBy" label="Requested By">
            <Input />
          </Form.Item>

          <Form.Item name="assignedTo" label="Assigned To">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductRequirements;
