import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Select, 
  Switch, 
  Row, 
  Col, 
  Typography,
  Spin
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import constants from '../../../../src/config/constants';
const { API_BASE_URL, TOKEN_KEY } = constants;

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CategoryFormData {
  name: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
}

const CategoryForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
    fetchCategories();
  }, [id]);

  const fetchCategory = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_BASE_URL}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const category = response.data.data;
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        parentCategory: category.parentCategory?._id,
        isActive: category.isActive,
      });
    } catch (error: any) {
      console.error('Error fetching category:', error);
      message.error(error.response?.data?.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      message.error(error.response?.data?.message || 'Failed to load categories');
    }
  };

  const onFinish = async (values: CategoryFormData) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const data = {
        ...values,
        parentCategory: values.parentCategory || null
      };

      if (id) {
        // Update existing category
        await axios.put(
          `${API_BASE_URL}/api/categories/${id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Category updated successfully');
      } else {
        // Create new category
        await axios.post(
          `${API_BASE_URL}/api/categories`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Category created successfully');
      }
      
      navigate('/products/categories');
    } catch (error: any) {
      console.error('Error saving category:', error);
      message.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="category-form">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/products/categories')}
        style={{ marginBottom: 16 }}
      >
        Back to Categories
      </Button>
      
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          {id ? 'Edit Category' : 'Add New Category'}
        </Title>
        
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ isActive: true }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: 'Please enter category name' },
                    { max: 50, message: 'Name cannot exceed 50 characters' }
                  ]}
                >
                  <Input placeholder="Enter category name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Parent Category"
                  name="parentCategory"
                >
                  <Select<string>
                    placeholder="Select parent category (optional)"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {categories
                      .filter(cat => !id || cat._id !== id) // Prevent selecting self as parent
                      .map(category => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { max: 500, message: 'Description cannot exceed 500 characters' }
                  ]}
                >
                  <TextArea rows={4} placeholder="Enter category description" />
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  label="Status"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive" 
                    defaultChecked 
                  />
                </Form.Item>
              </Col>
              
              <Col span={24} style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  {id ? 'Update' : 'Create'} Category
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CategoryForm;
