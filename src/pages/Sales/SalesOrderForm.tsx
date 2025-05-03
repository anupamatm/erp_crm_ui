import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../lib/auth';
import CustomerService, { Customer } from '../../services/customerService';
import ProductService, { Product } from '../../services/productService';
import { SalesOrderService } from '../../services/SalesOrderService';
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
  terms: z.string().nonempty('Please enter terms'),
  deliveryDate: z.string().min(1, 'Please select a delivery date'),
  total: z.number().min(0, 'Total must be at least 0'),
  status: z.string().nonempty('Please select a status'),
  orderNumber: z.string().optional()
});

type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

interface SalesOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  order?: SalesOrder;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  order 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState({ customers: false, products: false });

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
      // Get the current year and month
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Get the last order number from the database
      const lastOrder = await SalesOrderService.getLastOrder();
      let sequence = 1;
      
      if (lastOrder && lastOrder.orderNumber) {
        // Extract the sequence number from the last order
        const match = lastOrder.orderNumber.match(/\d+$/);
        if (match) {
          sequence = parseInt(match[0]) + 1;
        }
      }
      
      // Format the order number as: YYMM-####
      const orderNumber = `${year}${month}-${sequence.toString().padStart(4, '0')}`;
      console.log('Generated order number:', orderNumber);
      return orderNumber;
    } catch (error) {
      console.error('Error generating order number:', error);
      throw new Error('Failed to generate order number. Please try again.');
    }
  };

  // Form initialization
  const { 
    register, 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    formState: { errors, isSubmitting } 
  } = useForm<SalesOrderFormData>({ 
    resolver: zodResolver(salesOrderSchema), 
    mode: 'onBlur',
    defaultValues: {
      customer: '',
      items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      billingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      terms: '',
      deliveryDate: formatDate(new Date()),
      total: 0,
      status: 'pending',
      orderNumber: ''
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading({ customers: true, products: true });
      
      // Fetch customers
      const customerResponse = await CustomerService.getCustomers();
      setCustomers(customerResponse.data);
      
      // Fetch products
      const productResponse = await ProductService.getProducts();
      setProducts(productResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load form data. Please try again.');
    } finally {
      setLoading({ customers: false, products: false });
    }
  };

  // Calculate total for all items
  const calculateTotal = () => {
    const subtotal = fields.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + itemTotal;
    }, 0);
    setValue('total', subtotal);
  };

  // Calculate total for a single item
  const calculateItemTotal = (item: any) => {
    const selectedProduct = products.find(p => p._id === item.product);
    const unitPrice = selectedProduct?.price || 0;
    return unitPrice * item.quantity;
  };

  // Form submission handler
  const onSubmit = async (data: SalesOrderFormData) => {
    try {
      // Ensure we have a valid user
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      // Generate a unique order number
      const orderNumber = await generateOrderNumber();

      // Transform form data to match backend requirements
      const orderData = transformFormDataToOrder(data, orderNumber);
      
      // Validate required fields
      if (!orderData.customer) {
        throw new Error('Customer is required');
      }
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('At least one item is required');
      }
      if (!orderData.billingAddress.street) {
        throw new Error('Billing address is required');
      }
      if (!orderData.deliveryDate) {
        throw new Error('Delivery date is required');
      }
      if (!orderData.status) {
        throw new Error('Status is required');
      }
      if (!orderData.orderNumber) {
        throw new Error('Order number is required');
      }

      // Create or update order
      if (order) {
        await SalesOrderService.updateSalesOrder(order._id, orderData);
      } else {
        await SalesOrderService.createSalesOrder(orderData);
      }

      // Close modal and refresh list
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving order:', error);
      if (error instanceof Error && error.message === 'User is not authenticated') {
        navigate('/login');
      } else {
        alert(error instanceof Error ? error.message : 'Failed to save order. Please try again.');
      }
    }
  };

  // Transform form data
  const transformFormDataToOrder = (formData: SalesOrderFormData, orderNumber: string): Partial<SalesOrder> => {
    const items = formData.items.map(item => {
      const selectedProduct = products.find(p => p._id === item.product);
      const unitPrice = selectedProduct?.price || 0;
      const total = item.quantity * unitPrice;
      
      return {
        product: item.product,
        quantity: item.quantity,
        unitPrice,
        total
      };
    });

    const transformedData = {
      customer: formData.customer,
      items,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      terms: formData.terms,
      deliveryDate: formData.deliveryDate,
      total: items.reduce((sum, item) => sum + item.total, 0),
      status: formData.status,
      assignedTo: user.id,
      createdBy: user.id,
      orderNumber
    };

    return transformedData;
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Sales Order</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <div key={item.id} className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                      <select
                        {...register(`items.${index}.product`)}
                        onChange={(e) => {
                          const productId = e.target.value;
                          const product = products.find(p => p._id === productId);
                          if (product) {
                            setValue(`items.${index}.unitPrice`, product.price);
                            setValue(`items.${index}.total`, product.price * Number(fields[index].quantity));
                            calculateTotal(); // Recalculate total when product changes
                          }
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ${product.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          const product = products.find(p => p._id === fields[index].product);
                          if (product) {
                            setValue(`items.${index}.total`, product.price * quantity);
                            calculateTotal(); // Recalculate total when quantity changes
                          }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Total</label>
            <input
              type="number"
              {...register('total')}
              readOnly
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.total && (
              <p className="mt-1 text-sm text-red-600">{errors.total.message}</p>
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SalesOrderForm;
