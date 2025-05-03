import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Flag,
  UserPlus
} from 'lucide-react';

const LeadsLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/leads', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
    { path: '/leads/sources', icon: <Compass size={20} />, label: 'Sources' },
    { path: '/leads/status', icon: <Flag size={20} />, label: 'Status' },
    { path: '/leads/assign', icon: <UserPlus size={20} />, label: 'Assign Lead' },
    { path: '/leads/new', icon: <Users size={20} />, label: 'Add Lead' }
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

export default LeadsLayout;
