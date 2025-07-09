// src/pages/Sales/Marketing/CouponManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Space, Modal, Form, Input, InputNumber,
  DatePicker, Select, message, Tag
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined
} from '@ant-design/icons';
import {
  createCoupon, getCoupons, deleteCoupon, Coupon, sendCouponToCustomers, updateCoupon
} from '../../services/couponService';
import CustomerService from '../../services/customerService';
import dayjs from 'dayjs';


const { Option } = Select;

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerEmails, setSelectedCustomerEmails] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchCoupons();
    fetchCustomers();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      message.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await CustomerService.getCustomers();
  
      // ✅ Extract actual array of customers
      const customerList = response.data;
  
      // ✅ Validate it is an array
      if (!Array.isArray(customerList)) {
        throw new Error("Invalid customer data format");
      }
  
      setCustomers(customerList); // ✅ Now this is an array
    } catch (error) {
      console.error(error);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  

  const handleCreateCoupon = async (values: any) => {
    try {
      await createCoupon({ ...values, isActive: true });
      message.success('Coupon created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchCoupons();
    } catch (error) {
      message.error('Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      message.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      message.error('Failed to delete coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon); // store selected
    setIsModalVisible(true);   // show form modal
  
    form.setFieldsValue({
      ...coupon,
      validUntil: coupon.validUntil ? dayjs(coupon.validUntil) : null, // use dayjs for DatePicker
    });
  };
  
  // at top if not already imported

const handleSubmit = async (values: any) => {
    try {
      // Safely convert date fields
      const payload = {
        ...values,
        // validUntil: values.validUntil ? values.validUntil.toDate() : null,
        isActive: true,
      };
  
      if (selectedCoupon && selectedCoupon._id) {
        console.log("Updating coupon:", selectedCoupon._id, payload);
        await updateCoupon(selectedCoupon._id, payload);
        message.success('Coupon updated successfully');
      } else {
        console.log("Creating coupon:", payload);
        await createCoupon(payload);
        message.success('Coupon created successfully');
      }
  
      // Reset and close modal
      form.resetFields();
      setIsModalVisible(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      console.error("handleSubmit error:", error.response?.data || error.message || error);
      message.error('Operation failed');
    }
  };
  
  
  
  
  

  const handleSendCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsSendModalVisible(true);
  };

  const handleSendSubmit = async () => {
    if (!selectedCoupon?._id) {
      message.error("Invalid coupon selected");
      return;
    }
  
    try {
      // ✅ Send as object matching the SendCouponPayload interface
      await sendCouponToCustomers({
        couponId: selectedCoupon._id,
        customerEmails: selectedCustomerEmails,
      });
  
      message.success('Coupon sent successfully');
      setIsSendModalVisible(false);
      setSelectedCustomerEmails([]);
    } catch (error) {
      console.error(error);
      message.error('Failed to send coupon');
    }
  };
  

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Type',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type: string) => (
        <Tag color={type === 'percentage' ? 'blue' : 'purple'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value: number, record: Coupon) =>
        record.discountType === 'percentage' ? `${value}%` : `$${value}`,
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Button
  type="text"
  icon={<EditOutlined />}
  onClick={() => handleEdit(record)}
/>

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => record._id && handleDelete(record._id)}
          />
          <Button
            type="link"
            icon={<SendOutlined />}
            onClick={() => handleSendCoupon(record)}
          >
            Send
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card
        title="Coupon Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create Coupon
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Coupon Modal */}
      <Modal
        title={selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}

        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ discountType: 'percentage' }}
        >
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: 'Please input coupon code!' }]}
          >
            <Input placeholder="e.g., SUMMER20" />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Discount Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed">Fixed Amount</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Discount Value"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              formatter={value =>
                form.getFieldValue('discountType') === 'percentage'
                  ? `${value}%`
                  : `$ ${value}`
              }
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="minPurchase"
            label="Minimum Purchase Amount (Optional)"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="validUntil"
            label="Valid Until"
            rules={[{ required: true, message: 'Please select expiry date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Send Coupon Modal */}
      <Modal
        title={`Send Coupon: ${selectedCoupon?.code || ''}`}
        open={isSendModalVisible}
        onCancel={() => {
          setIsSendModalVisible(false);
          setSelectedCustomerEmails([]);
        }}
        onOk={handleSendSubmit}
      >
        <Form layout="vertical">
          <Form.Item label="Select Customers">
            <Select
              mode="multiple"
              placeholder="Choose customer emails"
              value={selectedCustomerEmails}
              onChange={setSelectedCustomerEmails}
              options={customers.map((c: any) => ({
                label: c.email,
                value: c.email,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManager;


