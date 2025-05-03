import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SalesOrderForm from './SalesOrderForm';
import { SalesOrderService } from '../../services/SalesOrderService';
import { SalesOrder } from '../../types/SalesOrder';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const Orders = () => {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await SalesOrderService.getSalesOrders(page, limit);
      console.log('API Response:', response);
      
      if (response && response.data.orders && response.data.total && response.data.pages) {
        setOrders(response.data.orders);
        setTotalItems(response.data.total);
        setTotalPages(response.data.pages);
      } else {
        console.log('Invalid response format');
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    if (!orderId) {
      console.error('Invalid order ID');
      return;
    }
    console.log('Viewing order:', orderId);
    navigate(`/sales/orders/${orderId}`);
  };

  const handleEditOrder = async (order: SalesOrder) => {
    try {
      setSelectedOrder(order);
      setIsOrderFormOpen(true);
    } catch (error) {
      console.error('Error editing order:', error);
      alert('Error editing order');
    }
  };

  const handleDeleteOrder = async (order: SalesOrder) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await SalesOrderService.deleteSalesOrder(order._id);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  useEffect(() => {
    // If we're on an order details page, fetch that specific order
    if (id) {
      const fetchOrderDetails = async () => {
        try {
          const response = await SalesOrderService.getSalesOrderById(id);
          if (response && response.data) {
            setOrders([response.data]);
          } else {
            console.error('Invalid order data received');
            navigate('/sales/orders');
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
          navigate('/sales/orders');
        }
      };
      fetchOrderDetails();
    } else {
      fetchOrders(currentPage);
    }
  }, [currentPage, id, navigate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (!order.orderNumber || order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!order.customer || !order.customer.name || 
       order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Orders</h1>
        <button 
          onClick={() => setIsOrderFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          New Order
        </button>
      </div>

      <SalesOrderForm
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => {
          setIsOrderFormOpen(false);
          setSelectedOrder(null);
          fetchOrders();
        }}
        order={selectedOrder}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                className="border rounded-md px-3 py-2 w-64"
              />
              <select 
                value={selectedStatus}
                onChange={handleStatusChange}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders found. Create your first sales order to get started.
          </div>
        ) : (
          <div className="p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Order #</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="py-2">{order.orderNumber}</td>
                    <td className="py-2">{order.customer?.name || 'N/A'}</td>
                    <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-2 text-right">
                      <button 
                        onClick={() => handleViewOrder(order._id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="View Order"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditOrder(order)}
                        className="text-green-600 hover:text-green-800 mr-2"
                        title="Edit Order"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Order"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!id && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Previous
                </button>
                <span className="mx-4 text-gray-600">
                  Page {currentPage} of {totalPages} ({totalItems} orders)
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;