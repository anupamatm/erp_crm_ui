import React from 'react';
import { useAuth } from '../../lib/auth';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
          <p className="text-gray-600">Your customer dashboard is ready!</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <p className="text-gray-600">View your recent orders and status</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Invoices</h2>
          <p className="text-gray-600">Access your invoices and payment history</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;