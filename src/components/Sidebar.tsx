import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  path: string;
  roles: string[];
}

const Sidebar: React.FC<{ navigation: NavigationItem[] }> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="w-64 bg-gray-800 text-white relative">
      <div className="p-4">
        <h1 className="text-xl font-bold text-white">ERP CRM</h1>
      </div>

      <div className="space-y-1 px-2 py-4">
      {navigation
  .filter(item => item.roles.includes(user?.role || ''))
  .map((item) => {
    const fullPath =
      user?.role === 'customer'
        ? `/customer${item.path === '/' ? '' : item.path}`
        : item.path;

    const isExact = fullPath === '/' || fullPath === `/customer`;

    return (
      <NavLink
        key={item.path}
        to={item.href}
        {...(isExact ? { end: true } : {})} // 👈 end only for exact matches
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-blue-500 text-white'
              : 'text-white hover:bg-gray-700'
          }`
        }
      >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
      </NavLink>
    );
  })}

      </div>

      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
