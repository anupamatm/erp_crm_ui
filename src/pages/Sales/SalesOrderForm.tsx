import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../lib/auth';
import CustomerService from '../../services/customerService';
import type { Customer } from '../../types/customer';
import ProductService from '../../services/productService';
import type { Product } from '../../types/product';
import { SalesOrderService } from '../../services/SalesOrderService';
import type { SalesOrder, OrderItem, OrderStatus, PaymentStatus, PaymentTerms } from '../../types/SalesOrder';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';


// Validation schema
const salesOrderSchema = z.object({
  customer: z.string().nonempty('Please select a customer'),
  items: z.array(
    z.object({
      product: z.string().nonempty('Please select a product'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Price must be at least 0'),
      discount: z.number().min(0).max(100).default(0),
      total: z.number().min(0, 'Total must be at least 0')
    })
  ).min(1, 'Please add at least one item'),
  billingAddress: z.object({
    street: z.string().nonempty('Please enter a street address'),
    city: z.string().nonempty('Please enter a city'),
    state: z.string().nonempty('Please enter a state'),
    postalCode: z.string().nonempty('Please enter a postal code'),
    country: z.string().nonempty('Please enter a country')
  }),
  shippingAddress: z.object({
    street: z.string().nonempty('Please enter a street address'),
    city: z.string().nonempty('Please enter a city'),
    state: z.string().nonempty('Please enter a state'),
    postalCode: z.string().nonempty('Please enter a postal code'),
    country: z.string().nonempty('Please enter a country')
  }),
  terms: z.string().default(''),
  deliveryDate: z.string().min(1, 'Please select a delivery date'),
  totalAmount: z.number().min(0, 'Total must be at least 0'),
  status: z.enum(['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).default('draft'),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid', 'overdue', 'refunded', 'failed']).default('pending'),
  paymentTerms: z.enum(['due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_60']).default('net_30'),
  orderNumber: z.string().optional()
});

type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

interface SalesOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  order?: SalesOrder;
  title?: string;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  order,
  title = order ? 'Edit Sales Order' : 'Create Sales Order'
}) => {
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [_loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user || !user.id) {
      alert('Please log in to create an order');
      navigate('/login');
    }
  }, [user, navigate]);

  // Helper functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const generateOrderNumber = async (): Promise<string> => {
    try {
      // Try to get the last order
      const lastOrder = await SalesOrderService.getLastOrder();
      
      if (lastOrder?.orderNumber) {
        const orderNumber = lastOrder.orderNumber;
        const match = orderNumber.match(/(\d+)$/);
        if (match) {
          const lastNumber = parseInt(match[1], 10);
          if (!isNaN(lastNumber)) {
            return `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
          }
        }
      }
      
      // Fallback to timestamp-based order number
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2).padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      return `ORD-${year}${month}${day}-${random}`;
      
    } catch (error) {
      console.error('Error generating order number, using fallback:', error);
      // Fallback to timestamp-based order number on error
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2).padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      return `ORD-${year}${month}${day}-${random}`;
    }
  };

  // Form initialization
 // Form initialization
const methods = useForm<SalesOrderFormData>({
  resolver: zodResolver(salesOrderSchema),
  defaultValues: {
    customer: '',
    status: 'draft',
    paymentStatus: 'pending',
    paymentTerms: 'net_30',
    items: [{
      product: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    }],
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    terms: '',
    deliveryDate: '',
    totalAmount: 0,
    orderNumber: ''
  }
});

// Update form values when order prop changes
useEffect(() => {
  if (order) {
    methods.reset({
      customer: order.customer?._id || '',
      items: order.items?.map(item => ({
        product: item.product?._id || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.subTotal || 0
      })) || [{ product: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }],
      billingAddress: order.billingAddress || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      shippingAddress: order.shippingAddress || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      terms: order.notes || '',
      deliveryDate: order.deliveryDate?.split('T')[0] || '',
      totalAmount: order.totalAmount || 0,
      status: order.status || 'draft',
      paymentStatus: order.paymentStatus || 'pending',
      paymentTerms: order.paymentTerms || 'net_30',
      orderNumber: order.orderNumber || ''
    });
  }
}, [order, methods]);

// Destructure form methods and state
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },  // Add isSubmitting here
  reset,
  setValue,
  watch,
  control
} = methods;

const { fields, append, remove } = useFieldArray({ 
  control, 
  name: 'items' 
});

const items = watch('items');

  // Ensure order total updates when any item changes (product, quantity, etc)
  // Keep all recalculation in a single effect for reliability
  useEffect(() => {
    if (items && products) {
      items.forEach((item, idx) => {
        const product = products.find(p => p._id === item.product);
        const unitPrice = product ? Number(product.price) : 0;
        const quantity = Number(item.quantity) || 0;
        const newTotal = unitPrice * quantity;
        if (item.product && item.unitPrice !== unitPrice) setValue(`items.${idx}.unitPrice`, unitPrice, { shouldValidate: true, shouldDirty: true });
        if (item.product && item.total !== newTotal) setValue(`items.${idx}.total`, newTotal, { shouldValidate: true, shouldDirty: true });
      });
    }
    calculateTotal();
  }, [JSON.stringify(items), products]);

  // Reset form when modal is closed or opened for new order
  useEffect(() => {
    if (isOpen && !order) {
      reset({
        customer: '',
        items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
        billingAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
        shippingAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
        terms: '',
        deliveryDate: '',
        totalAmount: 0,
        status: 'pending',
        orderNumber: ''
      });
    }
  }, [isOpen, order, reset]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customerResponse = await CustomerService.getCustomers();
      setCustomers(customerResponse.data);
      
      // Fetch products
      const productResponse = await ProductService.getProducts();
      console.log('ProductService.getProducts() response:', productResponse);
      setProducts(Array.isArray(productResponse.data) ? productResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load form data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for all items
  const calculateTotal = () => {
    if (!items || items.length === 0) {
      setValue('totalAmount', 0);
      return;
    }
    const subtotal = items.reduce((sum: number, item: any) => {
      const itemTotal = calculateItemTotal(item);
      return sum + itemTotal;
    }, 0);
    setValue('totalAmount', Number(subtotal));
  };

  // Calculate total for a single item
  const calculateItemTotal = (item: any) => {
    const selectedProduct = products.find(p => p._id === item.product);
    const unitPrice = selectedProduct?.price || 0;
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;
    return unitPrice * quantity * (1 - discount / 100);
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  // Form submission handler
  const onSubmit = async (formData: any) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
  
    try {
      setLoading(true);
      
      // Generate order number for new orders
      const orderNumber = order?.orderNumber || await generateOrderNumber();
      const orderData = transformFormDataToOrder(formData, orderNumber);
      
      // Prepare the order with user info
      const orderPayload = {
        ...orderData,
        createdBy: user.id,
        assignedTo: user.id,
        // Ensure all required fields are included
        status: formData.status || 'pending',
        paymentStatus: formData.paymentStatus || 'pending',
        paymentTerms: formData.paymentTerms || 'net_30',
        total: orderData.totalAmount // Ensure total is included
      };
  
      console.log('Submitting order:', orderPayload);
  
      if (order?._id) {
        await SalesOrderService.updateSalesOrder(order._id, orderPayload);
      } else {
        await SalesOrderService.createSalesOrder(orderPayload);
      }
  
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save order';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Transform form data to match SalesOrder type
  const transformFormDataToOrder = (formData: any, orderNumber: string) => {
    // Calculate totals
    const items = formData.items.map((item: any) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const subTotal = quantity * unitPrice * (1 - discount / 100);
      
      return {
        product: item.product,
        quantity,
        unitPrice,
        discount,
        tax: 0,
        total: subTotal,  // Ensure each item has a total
        subTotal
      };
    });
  
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const total = items.reduce((sum: number, item: any) => sum + item.subTotal, 0);
  
    return {
      orderNumber,
      customer: formData.customer,
      items,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      shippingCost: 0,
      totalAmount: total,  // Ensure total is set
      status: formData.status || 'pending',
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      terms: formData.terms || '',
      deliveryDate: formData.deliveryDate,
      paymentStatus: formData.paymentStatus || 'pending',
      paymentTerms: formData.paymentTerms || 'net_30',
      total: total  // Add top-level total field
    };
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
    >
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{order ? 'Edit' : 'Create New'} Sales Order</h1>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              {...register('customer')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option 
                  key={customer._id} 
                  value={customer._id}
                >
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
            )}
          </div>

          {/* Items */}
          <div>
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            <div className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6 mb-6 relative">
                  {/* Remove item button */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold px-2 py-1 rounded"
                      title="Remove Item"
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                      <select
                        {...register(`items.${index}.product`)}
                        onChange={e => {
                          const productId = e.target.value;
                          setValue(`items.${index}.product`, productId, { shouldValidate: true, shouldDirty: true });
                          const product = products.find(p => p._id === productId);
                          const unitPrice = product ? Number(product.price) : 0;
                          const quantity = Number(items[index]?.quantity) || 0;
                          setValue(`items.${index}.unitPrice`, unitPrice, { shouldValidate: true, shouldDirty: true });
                          setValue(`items.${index}.total`, unitPrice * quantity, { shouldValidate: true, shouldDirty: true });
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select a product</option>
                        {Array.isArray(products) && products.length > 0 ? (
                          products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ${product.price}
                            </option>
                          ))
                        ) : (
                          <option disabled>No products found</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        onChange={e => {
                          const qty = Number(e.target.value);
                          setValue(`items.${index}.quantity`, qty, { shouldValidate: true, shouldDirty: true });
                          const productId = items[index]?.product;
                          const product = products.find(p => p._id === productId);
                          const unitPrice = product ? Number(product.price) : 0;
                          setValue(`items.${index}.unitPrice`, unitPrice, { shouldValidate: true, shouldDirty: true });
                          setValue(`items.${index}.total`, unitPrice * qty, { shouldValidate: true, shouldDirty: true });
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        readOnly
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Total</label>
                      <input
                        type="number"
                        min="0"
                        {...register(`items.${index}.total`, { valueAsNumber: true })}
                        readOnly
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ product: '', quantity: 1, unitPrice: 0, total: 0 })}
                className="text-blue-600 hover:text-blue-800"
              >
                Add another item
              </button>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    {...register('shippingAddress.street')}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.shippingAddress?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.street.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      {...register('shippingAddress.city')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.shippingAddress?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      {...register('shippingAddress.state')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.shippingAddress?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      {...register('shippingAddress.postalCode')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.shippingAddress?.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      {...register('shippingAddress.country')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.shippingAddress?.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Billing Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    {...register('billingAddress.street')}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.billingAddress?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingAddress.street.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      {...register('billingAddress.city')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.billingAddress?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      {...register('billingAddress.state')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.billingAddress?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.state.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      {...register('billingAddress.postalCode')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.billingAddress?.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.postalCode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      {...register('billingAddress.country')}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {errors.billingAddress?.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
            <input
              type="text"
              {...register('terms')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
            )}
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
            <input
              type="date"
              {...register('deliveryDate')}
              min={formatDate(new Date())}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.deliveryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>
            )}
          </div>

          {/* Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Total </label>
            <input
              type="number"
              value={watch('totalAmount') ?? 0}
              readOnly
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.totalAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>
            )}
          </div>

          {/* Order Number */}
          {order && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
              <input
                type="text"
                {...register('orderNumber')}
                readOnly
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.orderNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.orderNumber.message}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <input
              type="text"
              {...register('status')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={_loading || isSubmitting}  // Add isSubmitting from useForm
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {_loading || isSubmitting ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SalesOrderForm;
