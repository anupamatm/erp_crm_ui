import React, { useEffect, useState } from 'react';
import { CheckCircle, Truck, RefreshCw, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending';
  total: number;
  items: number;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate API call with dummy data
    const fetchDummyOrders = () => {
      setLoading(true);
      setTimeout(() => {
        const dummyOrders: Order[] = [
          {
            id: 'ORD001',
            date: new Date().toISOString(),
            status: 'Delivered',
            total: 99.99,
            items: 2,
          },
          {
            id: 'ORD002',
            date: new Date().toISOString(),
            status: 'Shipped',
            total: 49.5,
            items: 1,
          },
          {
            id: 'ORD003',
            date: new Date().toISOString(),
            status: 'Processing',
            total: 150.75,
            items: 3,
          },
        ];
        setOrders(dummyOrders);
        setLoading(false);
      }, 1000); // simulate 1 second delay
    };

    fetchDummyOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
        <p>No orders found for this customer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Shipped'
                      ? 'bg-purple-100 text-purple-800'
                      : order.status === 'Processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'Delivered' && <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                    {order.status === 'Shipped' && <Truck className="h-4 w-4 mr-1 text-purple-500" />}
                    {order.status === 'Processing' && <RefreshCw className="h-4 w-4 mr-1 text-blue-500" />}
                    {order.status === 'Pending' && <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />}
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
