import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

const CustomerLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: 'dashboard' },
    { name: 'My Orders', href: '/customer/orders', icon: 'shopping_cart' },
    { name: 'Invoices', href: '/customer/invoices', icon: 'receipt' },
    { name: 'Payments', href: '/customer/payments', icon: 'payments' },
    { name: 'Profile', href: '/customer/profile', icon: 'person' },
  ];

  console.log('CustomerLayout - Current path:', location.pathname);
  console.log('CustomerLayout - User:', user);

  return (
    <div className="flex h-screen bg-gray-50">
      
      

      {/* Main content */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
              <div className="py-6 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          
          {/* Page content */}
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
