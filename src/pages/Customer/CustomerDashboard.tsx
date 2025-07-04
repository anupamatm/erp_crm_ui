// src/pages/Customer/CustomerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerSampleData } from '../../data/customerSampleData';
import { useAuth } from '../../lib/auth';
import { API } from '../../lib/api';
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [data, setData] = useState(customerSampleData);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const response = await API.get(`/api/userManagement/customers/${user.id}/profile`);
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // For stats and invoices, keep using sample data for now.
    setData(customerSampleData);
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              className="h-16 w-16 rounded-full" 
              src={profile?.avatar || data.profile.avatar} 
              alt={profile?.name || data.profile.name} 
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || data.profile.name}</h1>
              <p className="text-gray-600">{profile?.company || data.profile.company}</p>
              <p className="text-gray-500 text-sm">{profile?.email || data.profile.email}</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {profile?.status || data.profile.status}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{data.stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${data.stats.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Order</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${data.stats.averageOrder.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Order</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Date(data.stats.lastOrder).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <Link to="/customer/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all
              </Link>
              </div>
          </div>
          <div className="divide-y divide-gray-200">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">#{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <div className="flex items-center justify-end mt-1 text-sm text-gray-500">
                      {order.status === 'Delivered' && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {order.status === 'Shipped' && (
                        <Truck className="h-4 w-4 text-purple-500 mr-1" />
                      )}
                      {order.status === 'Processing' && (
                        <RefreshCw className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      {order.status === 'Pending' && (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      {order.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
              <Link to="/customer/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {data.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">#{invoice.id}</div>
                    <p className="text-sm text-gray-500 mt-1">
                      Issued: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                    <div className="mt-1">
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <Link
            to="/customer/orders/new"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <ShoppingCart className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">New Order</span>
          </Link>
          <Link
            to="/customer/support"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <svg
              className="h-8 w-8 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Get Support</span>
          </Link>
          <Link
            to="/customer/profile"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <svg
              className="h-8 w-8 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Account Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;