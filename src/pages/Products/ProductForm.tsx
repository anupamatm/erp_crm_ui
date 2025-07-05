import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, InputNumber, Select, message, Card } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import ProductService, { Product } from '../../services/productService';
import CategoryService from '../../services/categoryService';

const { Option } = Select;
const { TextArea } = Input;

//const categoryOptions = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Groceries', 'Other'];
const statusOptions: Array<Product['status']> = ['in-stock', 'out-of-stock', 'discontinued'];

interface ProductFormProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface ProductFormValues extends Omit<Product, '_id' | 'createdAt' | 'updatedAt'> {}

const ProductForm: React.FC<ProductFormProps> = ({ 
  isModal = false,
  onClose = () => {}, 
  onSuccess = () => {}
}) => {
  const { id: productId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await CategoryService.getCategories(); // Create this service if it doesn't exist
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };



    const fetchProduct = async () => {
      if (!productId) {
        form.resetFields();
        return;
      }

      try {
        setLoading(true);
        const response = await ProductService.getProductById(productId);
        
        form.setFieldsValue({
          name: response.data.name || '',
          description: response.data.description || '',
          price: response.data.price || 0,
          category: response.data.category || '',
          stock: response.data.stock || 0,
          status: response.data.status || 'available',
          imageUrl: response.data.imageUrl || ''
        });
      } catch (err: any) {
        console.error('Error fetching product:', err);
        message.error(err.message || 'Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProduct();
  }, [productId, form]);

  const onFinish = async (values: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setSubmitting(true);
      
      if (productId) {
        await ProductService.updateProduct(productId, values);
        message.success('Product updated successfully');
      } else {
        await ProductService.addProduct(values);
        message.success('Product created successfully');
      }
      
      onSuccess();
      
      if (isModal) {
        onClose();
      } else {
        navigate('/products');
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save product';
      message.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Form validation failed:', errorInfo);
    message.error('Please fill in all required fields');
  };

  return (
    <div className="p-4">
      <Card 
        title={
          <div className="flex items-center">
            {!isModal && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/products')}
                className="mr-2"
              />
            )}
            <span>{productId ? 'Edit Product' : 'Add New Product'}</span>
          </div>
        }
        className="shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            status: 'in-stock',
            price: 0,
            stock: 0
          }}
          disabled={loading}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" size="large" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea rows={4} placeholder="Enter product description" />
              </Form.Item>

              <Form.Item
                label="Image URL"
                name="imageUrl"
                rules={[{ 
                  type: 'url', 
                  message: 'Please enter a valid URL',
                  warningOnly: true 
                }]}
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ 
                    required: true, 
                    message: 'Please enter price',
                    type: 'number',
                    min: 0,
                    transform: (value) => Number(value)
                  }]}
                >
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    className="w-full" 
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value ? value.toString().replace(/\$\s?|(,*)/g, '') : '0'}
                  />
                </Form.Item>

                <Form.Item
                  label="Stock"
                  name="stock"
                  rules={[{ 
                    required: true, 
                    message: 'Please enter stock quantity',
                    type: 'number',
                    min: 0,
                    transform: (value) => Number(value)
                  }]}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </div>

              <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select 
              placeholder="Select a category" 
              loading={categoriesLoading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status" size="large">
                  {statusOptions.map(status => (
                    <Option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              onClick={isModal ? onClose : () => navigate('/products')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {productId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductForm;
