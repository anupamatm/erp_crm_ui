import React, { useState, useEffect } from 'react';
import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import API from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const orderConversionSchema = z.object({
  items: z.array(z.object({
    product: z.string().nonempty('Product is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be at least 0')
  })).min(1, 'Add at least one item'),
  billingAddress: z.object({
    street: z.string().nonempty('Street is required'),
    city: z.string().nonempty('City is required'),
    state: z.string().nonempty('State is required'),
    country: z.string().nonempty('Country is required'),
    postalCode: z.string().nonempty('Postal code is required')
  }),
  shippingAddress: z.object({
    street: z.string().nonempty('Street is required'),
    city: z.string().nonempty('City is required'),
    state: z.string().nonempty('State is required'),
    country: z.string().nonempty('Country is required'),
    postalCode: z.string().nonempty('Postal code is required')
  }),
  terms: z.string().nonempty('Terms are required'),
  deliveryDate: z.string().nonempty('Delivery date is required')
});

type OrderConversionForm = z.infer<typeof orderConversionSchema>;

interface Opportunity {
  _id: string;
  title: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  source: string;
  description?: string;
  nextAction: string;
  nextActionDate?: string;
  convertedToOrderId?: string;
}

interface OpportunityStats {
  stage: string;
  count: number;
  totalValue: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [statistics, setStatistics] = useState<OpportunityStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    stage: '',
    search: ''
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await API.get('/api/products');
      const productsData = response.data?.data || [];
      console.log('Fetched products:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setProductsLoading(false);
    }
  };

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting }, 
    control 
  } = useForm<OrderConversionForm>({
    resolver: zodResolver(orderConversionSchema),
    defaultValues: {
      items: [{ product: '', quantity: 1, unitPrice: 0 }],
      billingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      terms: 'immediate',
      deliveryDate: new Date().toISOString().split('T')[0]
    },
    mode: 'all'
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: 'items'
  });

  const addNewItem = () => {
    append({ product: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    if (selectedOpportunity) {
      fetchProducts();
    }
  }, [selectedOpportunity]);

  useEffect(() => {
    if (selectedOpportunity) {
      reset({
        items: [{ product: '', quantity: 1, unitPrice: 0 }],
        billingAddress: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        terms: 'immediate',
        deliveryDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedOpportunity, reset]);

  useEffect(() => {
    if (!fields?.length) {
      append({ product: '', quantity: 1, unitPrice: 0 });
    }
  }, [fields, append]);

  const generateOrderNumber = () => {
    // Generate a unique order number in the format ORD-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `ORD-${year}${month}${day}-${random}`;
  };

  const onSubmit = async (data: OrderConversionForm) => {
    try {
      setLoading(true);
      
      // Generate a unique order number
      const orderNumber = generateOrderNumber();
      
      // Transform the form data to match the API expectations
      const transformedData = {
        orderNumber,
        items: data.items.map(item => ({
          productId: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        terms: data.terms,
        deliveryDate: data.deliveryDate
      };

      console.log('Submitting data:', transformedData);

      const response = await API.post(`/api/sales/opportunities/${selectedOpportunity?._id}/convert-to-order`, transformedData);
      
      // Refresh the data after conversion
      refreshData();
      
      // Show success message
      toast.success('Opportunity converted to order successfully');
      
      // Close the modal and reset form
      setSelectedOpportunity(null);
      reset();
      
      // Navigate to the new order
      navigate(`/sales/orders/${response.data.order._id}`);
    } catch (error: any) {
      console.error('Error converting opportunity:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error converting opportunity to order');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });

      const response = await API.get(`/api/sales/opportunities?${queryParams}`);
      setOpportunities(response.data.opportunities);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsError(false);
      const response = await API.get('/api/sales/opportunities/statistics');
      console.log('Statistics response:', response.data);
      
      const stats = response.data.byStage;
      if (!stats) {
        console.error('No statistics data in response');
        throw new Error('Invalid statistics response');
      }

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatsError(true);
      // Set default statistics with 0 values for each stage
      setStatistics([
        { stage: 'prospecting', count: 0, totalValue: 0 },
        { stage: 'qualification', count: 0, totalValue: 0 },
        { stage: 'proposal', count: 0, totalValue: 0 },
        { stage: 'negotiation', count: 0, totalValue: 0 },
        { stage: 'closed-won', count: 0, totalValue: 0 },
        { stage: 'closed-lost', count: 0, totalValue: 0 }
      ]);
    }
  };

  const refreshData = async () => {
    try {
      await Promise.all([fetchOpportunities(), fetchStatistics()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchOpportunities(), fetchStatistics()]);
      setLoading(false);
    };
    fetchData();
  }, [currentPage, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
    refreshData();
  };

  const handleStageFilter = (stage: string) => {
    setFilters(prev => ({ ...prev, stage }));
    setCurrentPage(1);
    refreshData();
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await API.delete(`/api/sales/opportunities/${id}`);
      refreshData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'prospecting': 'bg-blue-100 text-blue-800',
      'qualification': 'bg-purple-100 text-purple-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[stage.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Opportunities</h1>
        <button 
          onClick={() => navigate('/sales/opportunities/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          New Opportunity
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search opportunities..."
          value={filters.search}
          onChange={handleSearch}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Pipeline View */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Pipeline View</h2>
            {statsError && (
              <span className="text-sm text-red-600">
                Unable to load statistics. Showing default values.
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="flex space-x-4 overflow-x-auto">
            {['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].map((stage) => {
              const stageOpportunities = getOpportunitiesByStage(stage);
              const stageStats = statistics.find(s => s.stage === stage);
              
              return (
                <div key={stage} className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">{stage.replace(/-/g, ' ').replace(/\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}</h3>
                    <span className="text-sm text-gray-500">
                      {stageStats?.count || 0}
                    </span>
                  </div>
                  {stageOpportunities.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">No opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stageOpportunities.map(opp => (
                        <div
                          key={opp._id}
                          className="bg-white p-3 rounded shadow-sm cursor-pointer hover:shadow"
                          onClick={() => navigate(`/sales/opportunities/${opp._id}`)}
                        >
                          <div className="text-sm font-medium mb-1">{opp.title}</div>
                          <div className="text-xs text-gray-500">{opp.customer.name}</div>
                          <div className="text-xs font-medium text-gray-900 mt-1">
                            {formatCurrency(opp.value)}
                          </div>
                          {opp.stage === 'closed-won' && !opp.convertedToOrderId ? (
                            <div className="mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOpportunity(opp);
                                }}
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                              >
                                Convert to Order
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">List View</h2>
            <div className="flex items-center space-x-2">
              <select
                value={filters.stage}
                onChange={(e) => handleStageFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">No opportunities found</p>
              <p className="text-sm">Create your first opportunity to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Stage</th>
                    <th className="text-right py-3 px-4">Value</th>
                    <th className="text-center py-3 px-4">Probability</th>
                    <th className="text-left py-3 px-4">Expected Close</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{opportunity.title}</td>
                      <td className="py-3 px-4">{opportunity.customer.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                          {opportunity.stage.replace(/-/g, ' ').replace(/\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(opportunity.value)}</td>
                      <td className="py-3 px-4 text-center">{opportunity.probability}%</td>
                      <td className="py-3 px-4">{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/sales/opportunities/${opportunity._id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/sales/opportunities/${opportunity._id}/edit`)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOpportunity(opportunity._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && opportunities.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                    Convert Opportunity to Order
                  </h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Items</label>
                      <div className="mt-1">
                        {fields && fields.length > 0 ? (
                          fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Product</label>
                                <select
                                  {...register(`items.${index}.product`, { 
                                    required: true,
                                    validate: (value) => value !== '' || 'Please select a product'
                                  })}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="">Select a product</option>
                                  {products?.map((product: Product) => (
                                    <option key={product._id} value={product._id}>
                                      {product.name} - ${product.price}
                                    </option>
                                  ))}
                                </select>
                                {errors.items?.[index]?.product && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.items[index].product.message}
                                  </p>
                                )}
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  {...register(`items.${index}.quantity`, { 
                                    valueAsNumber: true, 
                                    required: true,
                                    validate: (value) => value > 0 || 'Quantity must be greater than 0'
                                  })}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.items?.[index]?.quantity && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.items[index].quantity.message}
                                  </p>
                                )}
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...register(`items.${index}.unitPrice`, { 
                                    valueAsNumber: true, 
                                    required: true,
                                    validate: (value) => value >= 0 || 'Price must be at least 0'
                                  })}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.items?.[index]?.unitPrice && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.items[index].unitPrice.message}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <button
                              type="button"
                              onClick={addNewItem}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Add First Item
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={addNewItem}
                          className="text-blue-600 hover:text-blue-800 mt-4"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                      <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Street</label>
                          <input
                            type="text"
                            {...register('billingAddress.street', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.billingAddress?.street && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.billingAddress.street.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            {...register('billingAddress.city', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.billingAddress?.city && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.billingAddress.city.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            {...register('billingAddress.state', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.billingAddress?.state && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.billingAddress.state.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <input
                            type="text"
                            {...register('billingAddress.country', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.billingAddress?.country && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.billingAddress.country.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                          <input
                            type="text"
                            {...register('billingAddress.postalCode', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.billingAddress?.postalCode && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.billingAddress.postalCode.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                      <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Street</label>
                          <input
                            type="text"
                            {...register('shippingAddress.street', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.shippingAddress?.street && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shippingAddress.street.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            {...register('shippingAddress.city', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.shippingAddress?.city && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shippingAddress.city.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            {...register('shippingAddress.state', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.shippingAddress?.state && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shippingAddress.state.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <input
                            type="text"
                            {...register('shippingAddress.country', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.shippingAddress?.country && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shippingAddress.country.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                          <input
                            type="text"
                            {...register('shippingAddress.postalCode', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.shippingAddress?.postalCode && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shippingAddress.postalCode.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms and Delivery Date */}
                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                          <select
                            {...register('terms', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="immediate">Immediate</option>
                            <option value="net15">Net 15</option>
                            <option value="net30">Net 30</option>
                            <option value="net60">Net 60</option>
                          </select>
                          {errors.terms && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.terms.message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                          <input
                            type="date"
                            {...register('deliveryDate', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.deliveryDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.deliveryDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSubmitting || loading ? 'Converting...' : 'Convert to Order'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;