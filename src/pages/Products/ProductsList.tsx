import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Input, Card, Typography, Tag, message, Select,Row,Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ProductService from '../../services/productService';
import CategoryService from '../../services/categoryService';
import { notification } from 'antd';  // Add this import at the top

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface ProductType {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'available' | 'out-of-stock' | 'discontinued';
  imageUrl?: string;
}

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    checkLowStock();
  }, [products]);

  const checkLowStock = () => {
    const LOW_STOCK_THRESHOLD = 10; // You can adjust this threshold
    const lowStockProducts = products.filter(
      product => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
    );

    lowStockProducts.forEach(product => {
      notification.warning({
        message: 'Low Stock Alert',
        description: `${product.name} is running low! Only ${product.stock} items left in stock.`,
        duration: 10, // Show for 10 seconds
        placement: 'topRight',
      });
    });
  };


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts();
      setProducts(response.data);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value });
  };

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: '' });
  };

  const handleDelete = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error deleting product:', error);
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

  const columns: ColumnsType<ProductType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Product) => (
        <a onClick={() => navigate(`/products/${record._id}`)}>{text}</a>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: Array.from(new Set(products.map(p => p.category))).map(cat => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value, record) => record.category === value,
      render: (text: string, record: Product) => (
        <span>{typeof record.category === 'object' ? record.category?.name : 'N/A'}</span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-${status.replace(' ', '-')}`}>
          {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      ),
     
     
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/products/${record._id}`)}
            title="View Details"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/products/edit/${record._id}`)}
            title="Edit"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                handleDelete(record._id);
              }
            }}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        product.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = !filters.category || 
      (typeof product.category === 'string' 
        ? product.category === filters.category 
        : product.category?._id === filters.category);

    const matchesStatus = !filters.status || product.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });


  return (
    <div className="space-y-4">
      <div className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="Search products..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                className="mb-4"
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filter by category"
                style={{ width: '100%' }}
                allowClear
                onChange={handleCategoryChange}
                value={filters.category || undefined}
                className="mb-4"
              >
                {categories.map(category => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filter by status"
                style={{ width: '100%' }}
                allowClear
                onChange={handleStatusChange}
                value={filters.status || undefined}
                className="mb-4"
              >
                <Option value="in-stock">In Stock</Option>
                <Option value="out-of-stock">Out of Stock</Option>
                <Option value="discontinued">Discontinued</Option>
                <Option value="not-set">Not Set</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={clearFilters} className="mb-4">
                Clear Filters
              </Button>
            </Col>
          </Row>
        </div>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default ProductsList;
