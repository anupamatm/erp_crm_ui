import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Target, 
  FileText, 
  TrendingUp ,
  ReceiptIndianRupee 
} from 'lucide-react';

const SalesLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/sales', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
    { path: '/sales/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { path: '/sales/opportunities', icon: <Target size={20} />, label: 'Opportunities' },
    { path: '/sales/invoices', icon: <FileText size={20} />, label: 'Invoices' },
    { path: '/sales/reports', icon: <TrendingUp size={20} />, label: 'Reports' },
    { path: '/sales/quotations', icon: <ReceiptIndianRupee size={20} />, label: 'Quotations' },
    
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub Navigation */}
      <div className="bg-white border-b">
        <div className="mx-auto px-4">
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-4 text-sm font-medium ${
                  isActive(item.path, item.exact)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SalesLayout; 