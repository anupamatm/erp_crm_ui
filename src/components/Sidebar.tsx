import React from 'react';
import { NavLink } from 'react-router-dom';
import { CircuitBoard, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  path: string;
}

interface SidebarProps {
  navigation: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigation }) => {
  const { signOut } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800">
      <div className="flex h-16 items-center px-4">
        <CircuitBoard className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">ERP/CRM</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
        >
          <LogOut className="mr-3 h-6 w-6" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;