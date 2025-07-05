import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerService from '../../services/customerService';
import ProductService from '../../services/productService';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  DatePicker, 
  InputNumber, 
  message,
  Row,
  Col,
  Space
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { QuotationService, QuotationStatus } from '../../services/QuotationService';

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
}

interface Item {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subTotal: number;
}

interface QuotationData {
  customer: Customer;
  quoteNumber: string;
  validUntil: string | Date;
  status: QuotationStatus;
  items: Item[];
  terms?: string;
  notes?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  // Legacy fields
  client?: string;
  number?: string;
  year?: string;
  currency?: string;
  date?: Date;
  expireDate?: string | Date;
  note?: string;
  taxValue?: number;
}

const { Option } = Select;
const { TextArea } = Input;

export const QuotationForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [isViewMode, setIsViewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<{
    customers: boolean;
    products: boolean;
    form: boolean;
  }>({
    customers: true,
    products: true,
    form: false
  });
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<QuotationData>>({
    status: 'draft',
    items: [
      { product: { _id: '', name: '', price: 0 }, quantity: 1, unitPrice: 0, discount: 0, tax: 0, subTotal: 0 }
    ]
  });
  
  // Helper function to check if a string is a valid MongoDB ObjectId
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch customers from the backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(prev => ({ ...prev, customers: true }));
        const response = await CustomerService.getCustomers(1, 1000); // Fetch all customers with a high limit
        setCustomers(response.data || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
        setError(`Failed to load customers: ${errorMessage}`);
        message.error('Failed to load customers. Please check your connection and try again.');
      } finally {
        setLoading(prev => ({ ...prev, customers: false }));
      }
    };

    fetchCustomers();
  }, []);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const response = await ProductService.getProducts(1, 1000); // Fetch all products with a high limit
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(`Failed to load products: ${errorMessage}`);
        message.error('Failed to load products. Please check your connection and try again.');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const initialValues: any = {
      customer: null, // Will be set when a customer is selected
      items: [
        {
          product: { _id: '', name: 'Select Product' },
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          tax: 0,
          subTotal: 0,
        },
      ],
      status: 'draft',
      terms: '',
      notes: '',
      validUntil: dayjs().add(30, 'days'), // Keep as Day.js object for form
      currency: 'USD',
      taxValue: 0,
    };

    if (id) {
      // Load quotation data if in edit mode
      const loadQuotation = async () => {
        try {
          // Replace with actual API call
          // const data = await QuotationService.getQuotationById(id);
          const data: QuotationData = {
            ...initialValues,
            customer: { _id: '1', name: 'Test Customer', email: 'test@example.com' },
            validUntil: dayjs().add(30, 'days').toDate(),
            status: 'draft',
            items: [
              {
                product: { _id: '1', name: 'Test Product', price: 100 },
                quantity: 1,
                unitPrice: 100,
                discount: 0,
                tax: 0,
                subTotal: 100
              }
            ]
          };
          
          form.setFieldsValue({
            ...data,
            validUntil: dayjs(data.validUntil), // Convert to Day.js object
            expireDate: data.expireDate ? dayjs(data.expireDate) : null,
            date: data.date ? dayjs(data.date) : null
          });
          
          // Calculate initial totals
          calculateTotals();
        } catch (error) {
          console.error('Error loading quotation:', error);
          message.error('Failed to load quotation');
        }
      };

      loadQuotation();
    } else {
      // Set default values for new quotation
      form.setFieldsValue(initialValues);
    }
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Convert Day.js dates to ISO strings
      const formValues = {
        ...values,
        validUntil: values.validUntil?.toISOString?.(),
      };
      
      // Validate that a customer is selected and has a valid MongoDB ObjectId
      if (!formValues.customer?._id || !isValidObjectId(formValues.customer._id)) {
        throw new Error('Please select a valid customer');
      }
      
      // Get full customer details
      const customer = await CustomerService.getCustomerById(formValues.customer._id);
      if (!customer) {
        throw new Error('Failed to load customer details');
      }
      
      // Validate that at least one item is added
      if (!values.items?.length) {
        throw new Error('Please add at least one item to the quotation');
      }
      
      // Process items and calculate totals
      const items: Item[] = (values.items || []).map((item: any) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const discount = item.discount || 0;
        const tax = item.tax || 0;
        const subTotal = quantity * unitPrice;
        
        return {
          product: {
            _id: item.product?._id || '',
            name: item.product?.name || 'Unnamed Product',
            description: item.product?.description || '',
            price: unitPrice
          },
          quantity,
          unitPrice,
          discount,
          tax,
          subTotal
        };
      });
      
      // Calculate grand totals with proper TypeScript types
      const subtotal = items.reduce((sum: number, item: Item) => sum + item.subTotal, 0);
      const discountAmount = items.reduce((sum: number, item: Item) => 
        sum + (item.subTotal * (item.discount / 100)), 0);
      const taxAmount = items.reduce((sum: number, item: Item) => {
        const itemTotal = item.subTotal * (1 - (item.discount / 100));
        return sum + (itemTotal * (item.tax / 100));
      }, 0);
      const totalAmount = subtotal - discountAmount + taxAmount;
      
      // Prepare quotation data for submission
      const quotationData: QuotationData = {
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email || ''
        },
        quoteNumber: formValues.quoteNumber || `QT-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: formValues.status || 'draft',
        validUntil: formValues.validUntil,
        items,
        terms: values.terms || '',
        notes: values.notes || '',
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        
        // Legacy fields for backward compatibility
        client: values.customer?.name || 'Unknown Customer',
        number: `QT-${new Date().getTime()}`,
        year: new Date().getFullYear().toString(),
        currency: 'USD',
        date: new Date(),
        expireDate: values.validUntil,
        note: values.notes || '',
        taxValue: parseFloat(taxAmount.toFixed(2))
      };

      if (id) {
        // Update existing quotation
        await QuotationService.updateQuotation(id, quotationData);
        message.success('Quotation updated successfully');
      } else {
        // Create new quotation
        await QuotationService.createQuotation(quotationData);
        message.success('Quotation created successfully');
      }
      
      navigate('/sales/quotations');
    } catch (error: any) {
      console.error('Error saving quotation:', error);
      
      if (error.response?.data?.errors) {
        // Display validation errors from the backend
        const errorMessages = error.response.data.errors.map((e: any) => 
          `${e.field || 'Field'}: ${e.message}`
        ).join('\n');
        
        message.error({
          content: `Please fix the following errors:\n\n${errorMessages}`,
          duration: 10,
          style: { whiteSpace: 'pre-line' }
        });
      } else if (error.response?.data?.message) {
        // Display error message from the backend
        message.error({
          content: error.response.data.message,
          duration: 10
        });
      } else {
        // Generic error message
        message.error({
          content: 'Failed to save quotation. Please check the console for details.',
          duration: 10
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateItemTotal = (quantity: number, price: number, discount: number, tax: number) => {
    const itemTotal = quantity * price;
    const discountAmount = itemTotal * (discount / 100);
    const afterDiscount = itemTotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);
    return {
      subTotal: itemTotal,
      discountAmount,
      taxAmount,
      total: afterDiscount + taxAmount
    };
  };

  const calculateTotals = (items: any[] = form.getFieldValue('items') || []) => {
    const allTotals = items.reduce((acc: any, item: any) => {
      const itemTotals = calculateItemTotal(
        item.quantity || 1,
        item.unitPrice || 0,
        item.discount || 0,
        item.tax || 0
      );
      
      return {
        subTotal: acc.subTotal + itemTotals.subTotal,
        discountAmount: acc.discountAmount + itemTotals.discountAmount,
        taxAmount: acc.taxAmount + itemTotals.taxAmount,
        total: acc.total + itemTotals.total
      };
    }, { subTotal: 0, discountAmount: 0, taxAmount: 0, total: 0 });
    
    form.setFieldsValue({
      subtotal: parseFloat(allTotals.subTotal.toFixed(2)),
      discountAmount: parseFloat(allTotals.discountAmount.toFixed(2)),
      taxAmount: parseFloat(allTotals.taxAmount.toFixed(2)),
      totalAmount: parseFloat(allTotals.total.toFixed(2)),
      taxValue: parseFloat(allTotals.taxAmount.toFixed(2))
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = form.getFieldValue('items') || [];
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate subtotal if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'tax') {
      const item = updatedItems[index];
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discount || 0;
      const tax = item.tax || 0;
      
      const subTotal = quantity * unitPrice;
      const discountAmount = (subTotal * discount) / 100;
      const taxAmount = ((subTotal - discountAmount) * tax) / 100;
      const total = subTotal - discountAmount + taxAmount;
      
      updatedItems[index] = {
        ...updatedItems[index],
        subTotal: parseFloat(subTotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      };
      
      // Recalculate all totals
      calculateTotals(updatedItems);
    }
    
    form.setFieldsValue({ items: updatedItems });
  };

  // The add item functionality is handled by Form.List's add function

  const handleRemoveItem = (index: number) => {
    const items = form.getFieldValue('items');
    if (items && items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      form.setFieldsValue({ items: newItems });
      calculateTotals();
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      form.setFieldsValue({
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email
        }
      });
    }
  };

  const onCustomerChange = (value: string) => {
    handleCustomerSelect(value);
  };

  const handleProductChange = (value: string, index: number) => {
    const selectedProduct = products.find(p => p._id === value);
    if (selectedProduct) {
      const items = form.getFieldValue('items') || [];
      const updatedItems = [...items];
      
      // Update the product and unit price
      updatedItems[index] = {
        ...updatedItems[index],
        product: {
          _id: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price
        },
        unitPrice: selectedProduct.price
      };
      
      form.setFieldsValue({ items: updatedItems });
      
      // Trigger recalculation
      handleItemChange(index, 'unitPrice', selectedProduct.price);
    }
  };



  return (
    <div className="quotation-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        {isViewMode && id && (
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate(`/sales/quotations/${id}/edit`)}
            >
              Edit
            </Button>
          </Space>
        )}
      </div>

      <h2>
        {isViewMode ? 'View Quotation' : id ? 'Edit Quotation' : 'Create New Quotation'}
        {isViewMode && formValues.quoteNumber && (
          <span style={{ marginLeft: 16, fontSize: '0.8em', color: '#666' }}>
            #{formValues.quoteNumber}
          </span>
        )}
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'draft',
          items: [
            { product: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, subTotal: 0 }
          ]
        }}
        disabled={isViewMode}
      >
        <Row gutter={16}>
          <Col span={24} md={12}>
            <Card title="Customer Information" style={{ marginBottom: 16 }}>
              <Form.Item
                name={['customer', '_id']}
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer' }]}
              >
                <Select
                  showSearch
                  placeholder={loading.customers ? 'Loading customers...' : 'Select a customer'}
                  optionFilterProp="children"
                  onChange={onCustomerChange}
                  loading={loading.customers}
                  disabled={loading.customers || !!error}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers.map(customer => ({
                    value: customer._id,
                    label: customer.name,
                    email: customer.email
                  }))}
                  notFoundContent={error ? 'Error loading customers' : 'No customers found'}
                />
                {error && <div className="ant-form-item-extra" style={{ color: '#ff4d4f' }}>{error}</div>}
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="sent">Sent</Option>
                  <Option value="accepted">Accepted</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="validUntil"
                label="Valid Until"
                rules={[{ required: true, message: 'Please select a valid date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Card>

            <Card title="Items" style={{ marginBottom: 16 }}>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 16, border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'product', '_id']}
                              label="Product"
                              rules={[{ required: true, message: 'Please select a product' }]}
                            >
                              <Select
                                showSearch
                                placeholder={loading.products ? 'Loading products...' : 'Select a product'}
                                optionFilterProp="children"
                                loading={loading.products}
                                disabled={loading.products}
                                onChange={(value) => handleProductChange(value, name)}
                                filterOption={(input, option) =>
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                              >
                                {products.map(product => (
                                  <Option key={product._id} value={product._id}>
                                    {product.name} - ${product.price.toFixed(2)}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              label="Qty"
                              rules={[{ required: true, message: 'Enter quantity' }]}
                            >
                              <InputNumber 
                                min={1} 
                                style={{ width: '100%' }}
                                onChange={(value) => handleItemChange(name, 'quantity', value || 1)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'unitPrice']}
                              label="Unit Price"
                              rules={[{ required: true, message: 'Enter price' }]}
                            >
                              <InputNumber 
                                min={0} 
                                step={0.01}
                                style={{ width: '100%' }}
                                onChange={(value) => handleItemChange(name, 'unitPrice', value || 0)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'discount']}
                              label="Discount %"
                            >
                              <InputNumber 
                                min={0} 
                                max={100}
                                style={{ width: '100%' }}
                                onChange={(value) => handleItemChange(name, 'discount', value || 0)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'tax']}
                              label="Tax %"
                            >
                              <InputNumber 
                                min={0} 
                                max={100}
                                style={{ width: '100%' }}
                                onChange={(value) => handleItemChange(name, 'tax', value || 0)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'subTotal']}
                              label="Total"
                            >
                              <InputNumber 
                                style={{ width: '100%', backgroundColor: '#f5f5f5' }} 
                                readOnly 
                              />
                            </Form.Item>
                          </Col>
                          {fields.length > 1 && (
                            <Col span={24} style={{ textAlign: 'right' }}>
                              <Button 
                                type="text" 
                                danger 
                                onClick={() => {
                                  remove(name);
                                  handleRemoveItem(name);
                                }}
                              >
                                Remove Item
                              </Button>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Item
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
            
            <Card title="Summary" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div>Subtotal:</div>
                  <div>Discount:</div>
                  <div>Tax:</div>
                  <div><strong>Total:</strong></div>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <div>
                    <Form.Item name="subtotal" noStyle>
                      <InputNumber 
                        style={{ width: '100%', textAlign: 'right', border: 'none', background: 'transparent' }} 
                        readOnly 
                        prefix="$"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <Form.Item name="discountAmount" noStyle>
                      <InputNumber 
                        style={{ width: '100%', textAlign: 'right', border: 'none', background: 'transparent' }} 
                        readOnly 
                        prefix="$"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <Form.Item name="taxAmount" noStyle>
                      <InputNumber 
                        style={{ width: '100%', textAlign: 'right', border: 'none', background: 'transparent' }} 
                        readOnly 
                        prefix="$"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <Form.Item name="totalAmount" noStyle>
                      <InputNumber 
                        style={{ width: '100%', textAlign: 'right', border: 'none', background: 'transparent', fontWeight: 'bold' }} 
                        readOnly 
                        prefix="$"
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Card>
            
            <Card title="Notes" style={{ marginBottom: 16 }}>
              <Form.Item name="notes">
                <TextArea rows={4} placeholder="Enter any additional notes or terms" />
              </Form.Item>
            </Card>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<SaveOutlined />}
                >
                  {id ? 'Update' : 'Create'} Quotation
                </Button>
              </Space>
            </div>
          </Col>
          
          <Col span={24} md={12}>
            <Card title="Preview" style={{ position: 'sticky', top: 16 }}>
              <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Quotation preview will appear here
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

// Export is now at the component declaration
