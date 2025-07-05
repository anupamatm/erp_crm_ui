import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Typography, Divider, Space, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProductService from '../../services/productService';

const { Title, Text } = Typography;

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'available' | 'out-of-stock' | 'discontinued';
  imageUrl?: string;
  sku?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await ProductService.getProductById(id || '');
      setProduct(response.data);
    } catch (error) {
      message.error('Failed to load product details');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await ProductService.deleteProduct(id);
      message.success('Product deleted successfully');
      navigate('/products');
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'available': { color: 'success', text: 'In Stock' },
      'out-of-stock': { color: 'warning', text: 'Out of Stock' },
      'discontinued': { color: 'error', text: 'Discontinued' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-6 text-center text-red-600">Product not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/products')}
          className="flex items-center"
        >
          Back to Products
        </Button>
        
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${product._id}`)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            loading={deleting}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                handleDelete();
              }
            }}
          >
            Delete
          </Button>
        </Space>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400">No image available</div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Title level={3} className="mb-2">{product.name}</Title>
            <Text type="secondary" className="block mb-6">{product.category?.name}</Text>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text strong>Status:</Text>
                {getStatusTag(product.status)}
              </div>
              
              <div className="flex justify-between">
                <Text strong>Price:</Text>
                <Text>${product.price.toFixed(2)}</Text>
              </div>
              
              <div className="flex justify-between">
                <Text strong>In Stock:</Text>
                <Text>{product.stock} units</Text>
              </div>
              
              {product.sku && (
                <div className="flex justify-between">
                  <Text strong>SKU:</Text>
                  <Text>{product.sku}</Text>
                </div>
              )}
              
              {product.brand && (
                <div className="flex justify-between">
                  <Text strong>Brand:</Text>
                  <Text>{product.brand}</Text>
                </div>
              )}
              
              <Divider />
              
              <div>
                <Text strong className="block mb-2">Description:</Text>
                <Text>
                  {product.description || 'No description available.'}
                </Text>
              </div>
              
              <div className="text-sm text-gray-500 mt-6">
                <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
                <div>Last updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetails;
