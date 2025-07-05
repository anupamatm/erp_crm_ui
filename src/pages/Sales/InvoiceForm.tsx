import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  Typography, 
  message 
} from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

// Types
interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  taxRate?: number;
}

interface InvoiceItem {
  key?: string;
  _id?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

interface InvoiceFormData {
  customer: string;
  items: InvoiceItem[];
  invoiceDate: dayjs.Dayjs;
  dueDate: dayjs.Dayjs;
  notes?: string;
  status?: string;
}

// Import services
import CustomerService from '../../services/customerService';
import ProductService from '../../services/productService';
import InvoiceService from '../../services/InvoiceService';

// Types for API responses
interface ApiCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: string;
}

const InvoiceForm: React.FC = () => {
  const [form] = Form.useForm<InvoiceFormData>();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Calculate invoice totals
  const calculateTotals = (items: InvoiceItem[]) => {
    let subTotal = 0;
    let taxTotal = 0;

    items.forEach(item => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const discount = (item.discount || 0) / 100;
      const taxRate = (item.taxRate || 0) / 100;
      
      const itemSubTotal = quantity * unitPrice * (1 - discount);
      const itemTax = itemSubTotal * taxRate;
      
      subTotal += itemSubTotal;
      taxTotal += itemTax;
    });

    setSubTotal(subTotal);
    setTax(taxTotal);
    setTotal(subTotal + taxTotal);
  };

  // Handle form submission
  const handleSubmit = async (values: InvoiceFormData) => {
    try {
      setSubmitting(true);
      
      const invoiceData = {
        customer: {
          _id: values.customer,
          name: customers.find(c => c._id === values.customer)?.name || '',
          email: customers.find(c => c._id === values.customer)?.email || '',
          billingAddress: {
            street: customers.find(c => c._id === values.customer)?.billingAddress?.street || '',
            city: customers.find(c => c._id === values.customer)?.billingAddress?.city || '',
            state: customers.find(c => c._id === values.customer)?.billingAddress?.state || '',
            postalCode: customers.find(c => c._id === values.customer)?.billingAddress?.postalCode || '',
            country: customers.find(c => c._id === values.customer)?.billingAddress?.country || ''
          }
        },
        invoiceNumber: `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: values.invoiceDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        status: (values.status || 'draft') as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid',
        items: values.items.map(item => ({
          product: {
            _id: item.productId,
            name: products.find(p => p._id === item.productId)?.name || '',
            price: item.unitPrice,
            description: item.description || ''
          },
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.taxRate || 0,
          subTotal: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
          total: item.total
        })),
        subtotal: subTotal,
        discountAmount: 0, // Calculate if needed
        taxAmount: tax,
        totalAmount: total,
        notes: values.notes
      };

      if (id) {
        await InvoiceService.updateInvoice(id, invoiceData);
        message.success('Invoice updated successfully');
      } else {
        await InvoiceService.createInvoice(invoiceData);
        message.success('Invoice created successfully');
      }

      navigate('/sales/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      message.error('Failed to save invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...invoiceItems];
    
    // Create a new item with the updated field
    const updatedItem = { ...items[index], [field]: value };
    
    // Update dependent fields when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        updatedItem.unitPrice = product.price || 0;
        updatedItem.taxRate = product.taxRate || 0;
        updatedItem.description = product.description || '';
        updatedItem.quantity = updatedItem.quantity || 1; // Default quantity to 1
      }
    }
    
    // Update the item in the array with a unique key if not present
    if (!updatedItem.key) {
      updatedItem.key = generateId();
    }
    items[index] = updatedItem;
    
    // Recalculate row total
    const quantity = Number(updatedItem.quantity) || 0;
    const unitPrice = Number(updatedItem.unitPrice) || 0;
    const discount = (Number(updatedItem.discount) || 0) / 100;
    const taxRate = (Number(updatedItem.taxRate) || 0) / 100;
    
    const itemSubTotal = quantity * unitPrice * (1 - discount);
    const itemTax = itemSubTotal * taxRate;
    
    // Update the total in the item
    items[index].total = parseFloat((itemSubTotal + itemTax).toFixed(2));
    
    // Update the form state
    form.setFieldsValue({
      items: items.map((item, i) => ({
        ...item,
        // Make sure to include all fields that are in the form
        ...(i === index && {
          unitPrice: updatedItem.unitPrice,
          taxRate: updatedItem.taxRate,
          description: updatedItem.description,
          quantity: updatedItem.quantity,
          total: items[index].total
        })
      }))
    });
    
    setInvoiceItems(items);
    calculateTotals(items);
  };

  // Add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      key: generateId(),
      productId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
    calculateTotals(newItems);
  };

  // Table columns
  const columns: ColumnsType<InvoiceItem> = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'product',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'productId']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <Select
            showSearch
            placeholder="Select product"
            optionFilterProp="children"
            onChange={(value) => handleItemChange(index, 'productId', value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            options={products.map(p => ({
              value: p._id,
              label: p.name
            }))}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'description']}
          style={{ margin: 0 }}
        >
          <Input.TextArea 
            rows={1} 
            placeholder="Description"
            value={record.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'quantity']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <Input
            type="number"
            min={1}
            value={record.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'unitPrice']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <Input
            type="number"
            min={0}
            step={0.01}
            value={record.unitPrice}
            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Tax (%)',
      dataIndex: 'taxRate',
      key: 'tax',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'taxRate']}
          style={{ margin: 0 }}
        >
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={record.taxRate}
            onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (_, record) => (
        <Typography.Text strong>
          {formatCurrency(record.total || 0)}
        </Typography.Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
        />
      ),
    },
  ];

  // Generate a unique ID for new items
  const generateId = () => {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customers, products, and invoice (if editing) in parallel
        const [customersResponse, productsResponse] = await Promise.all([
          CustomerService.getCustomers(),
          ProductService.getProducts(1, 1000), // Fetch first 1000 products
        ]);

        // Transform API responses to match the expected format
        const customersData = Array.isArray(customersResponse.data) 
          ? customersResponse.data 
          : customersResponse.data?.data || [];
          
        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.data || [];

        setCustomers(customersData.map((c: ApiCustomer) => ({
          _id: c._id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          billingAddress: {
            street: c.address || '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
          }
        })));

        setProducts(productsData.map((p: ApiProduct) => ({
          _id: p._id,
          name: p.name,
          description: p.description,
          price: p.price,
          taxRate: 0 // Default tax rate, adjust as needed
        })));

        // If we have an ID, load the invoice data
        if (id) {
          try {
            const invoiceData = await InvoiceService.getInvoiceById(id);
            
            // Transform invoice items to match our form's expected format
            const items = invoiceData.items.map((item: any) => ({
              ...item,
              key: item._id || generateId(),
              productId: item.product?._id || '',
              description: item.description || item.product?.name || '',
              unitPrice: item.unitPrice || item.product?.price || 0,
              discount: item.discount || 0,
              taxRate: item.taxRate || 0,
              total: item.total || 0,
              quantity: item.quantity || 1
            }));

            // Set form values
            form.setFieldsValue({
              customer: invoiceData.customer?._id,
              status: invoiceData.status || 'draft',
              invoiceDate: dayjs(invoiceData.issueDate),
              dueDate: dayjs(invoiceData.dueDate),
              notes: invoiceData.notes,
              items: items
            });

            // Update local state
            setInvoiceItems(items);
            setSelectedCustomer(invoiceData.customer || null);
            calculateTotals(items);
          } catch (err) {
            console.error('Error loading invoice:', err);
            message.error('Failed to load invoice data');
          }
        } else {
          // For new invoice, add one empty item
          addItem();
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) {
      form.setFieldsValue({
        invoiceDate: dayjs(),
        dueDate: dayjs().add(30, 'days'),
        status: 'draft',
        items: [
          {
            key: generateId(),
            productId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            taxRate: 0,
            total: 0
          }
        ]
      });
      
      setInvoiceItems([
        {
          key: generateId(),
          productId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 0,
          total: 0
        }
      ]);
    }
  }, [form, id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">
      <p className="font-bold">Error loading data</p>
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>;
  }

  return (
    <Card
      title={`${id ? 'Edit' : 'Create'} Invoice`}
      loading={loading}
      extra={
        <Space>
          <Button onClick={() => navigate('/sales/invoices')}>Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
          >
            Save Invoice
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
              initialValue="draft"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select
                placeholder="Select status"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customer"
              label="Customer"
              rules={[{ required: true, message: 'Please select a customer' }]}
            >
              <Select
                showSearch
                placeholder="Select a customer"
                optionFilterProp="children"
                onChange={(value) => {
                  const customer = customers.find(c => c._id === value) || null;
                  setSelectedCustomer(customer);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={customers.map(customer => ({
                  value: customer._id,
                  label: customer.name
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="invoiceDate"
              label="Invoice Date"
              rules={[{ required: true, message: 'Please select invoice date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={invoiceItems}
          rowKey={(record) => record.key}
          pagination={false}
          footer={() => (
            <Button
              type="dashed"
              onClick={addItem}
              block
              icon={<PlusOutlined />}
            >
              Add Item
            </Button>
          )}
          style={{ margin: '16px 0' }}
        />

        <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Typography.Text>Subtotal:</Typography.Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Typography.Text>{formatCurrency(subTotal)}</Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>Tax:</Typography.Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Typography.Text>{formatCurrency(tax)}</Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text strong>Total:</Typography.Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Typography.Text strong>{formatCurrency(total)}</Typography.Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={4} placeholder="Additional notes" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default InvoiceForm;