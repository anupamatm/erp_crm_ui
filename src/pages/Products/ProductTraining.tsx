import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Tag,
  DatePicker,
  Card,
  Upload
} from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  FilePdfOutlined, 
  FilePptOutlined,
  FileWordOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'video' | 'document' | 'presentation';
  category: string;
  uploadDate: string;
  status: 'active' | 'draft' | 'archived';
  description?: string;
  fileUrl?: string;
}

const ProductTraining: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const categories = [
    'Product Features',
    'Competitive Analysis',
    'Sales Techniques',
    'Pricing',
    'FAQs',
    'New Releases',
    'Troubleshooting'
  ];

  // Initialize with empty array and type it properly
  const [trainingMaterials, setTrainingMaterials] = useState<TrainingMaterial[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMaterials = localStorage.getItem('trainingMaterials');
    if (savedMaterials) {
      setTrainingMaterials(JSON.parse(savedMaterials));
    } else {
      // Set default data if nothing in localStorage
      const defaultMaterials: TrainingMaterial[] = [
        {
          id: '1',
          title: 'Product X Feature Walkthrough',
          type: 'video',
          category: 'Product Features',
          uploadDate: '2025-07-01',
          status: 'active',
          description: 'Detailed walkthrough of all the new features in Product X',
          fileUrl: 'https://example.com/videos/feature-walkthrough.mp4'
        },
        {
          id: '2',
          title: 'Competitor Comparison Guide',
          type: 'document',
          category: 'Competitive Analysis',
          uploadDate: '2025-06-28',
          status: 'active',
          description: 'Comprehensive comparison with our main competitors',
          fileUrl: 'https://example.com/documents/competitor-guide.pdf'
        },
        {
          id: '3',
          title: 'Handling Objections',
          type: 'presentation',
          category: 'Sales Techniques',
          uploadDate: '2025-06-20',
          status: 'draft',
          description: 'Strategies for handling common customer objections',
          fileUrl: 'https://example.com/presentations/objection-handling.pptx'
        }
      ];
      setTrainingMaterials(defaultMaterials);
      localStorage.setItem('trainingMaterials', JSON.stringify(defaultMaterials));
    }
  }, []);

  // Update localStorage whenever trainingMaterials changes
  useEffect(() => {
    if (trainingMaterials.length > 0) {
      localStorage.setItem('trainingMaterials', JSON.stringify(trainingMaterials));
    }
  }, [trainingMaterials]);

  // CRUD Operations
  const handleAddNew = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: TrainingMaterial) => {
    form.setFieldsValue({
      ...record,
      uploadDate: dayjs(record.uploadDate)
    });
    setEditingId(record.id);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newMaterials = trainingMaterials.filter(item => item.id !== id);
    setTrainingMaterials(newMaterials);
    message.success('Training material deleted successfully');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newMaterial = {
        ...values,
        uploadDate: values.uploadDate ? values.uploadDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        id: editingId || Date.now().toString(),
        status: values.status || 'draft'
      };

      if (editingId) {
        // Update existing
        const updatedMaterials = trainingMaterials.map(item => 
          item.id === editingId ? newMaterial : item
        );
        setTrainingMaterials(updatedMaterials);
        message.success('Training material updated successfully');
      } else {
        // Add new
        setTrainingMaterials([...trainingMaterials, newMaterial]);
        message.success('Training material added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircleOutlined className="text-red-500" />;
      case 'document':
        return <FilePdfOutlined className="text-blue-500" />;
      case 'presentation':
        return <FilePptOutlined className="text-orange-500" />;
      default:
        return <FileWordOutlined className="text-gray-500" />;
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: 'Active' },
      draft: { color: 'orange', text: 'Draft' },
      archived: { color: 'red', text: 'Archived' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TrainingMaterial) => (
        <Space>
          {getTypeIcon(record.type)}
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingMaterial) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">Product Training Materials</Title>
          <Text type="secondary">Manage training materials for sales teams</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddNew}
        >
          Add New Material
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={trainingMaterials} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Edit Training Material' : 'Add New Training Material'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            uploadDate: dayjs()
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select placeholder="Select type">
              <Option value="video">Video</Option>
              <Option value="document">Document</Option>
              <Option value="presentation">Presentation</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="fileUrl"
            label="File URL"
            rules={[{ required: true, message: 'Please enter a file URL' }]}
          >
            <Input placeholder="Enter file URL" />
          </Form.Item>

          <Form.Item
            name="uploadDate"
            label="Upload Date"
            rules={[{ required: true, message: 'Please select upload date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="draft">Draft</Option>
              <Option value="active">Active</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTraining;