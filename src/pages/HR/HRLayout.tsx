import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserPlus,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

const HRLayout: React.FC = () => {
  const navItems = [
    { to: '/hr', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hr/employees', icon: Users, label: 'Employees' },
    { to: '/hr/departments', icon: Building2, label: 'Departments' },
    { to: '/hr/attendance', icon: Clock, label: 'Attendance' },
    { to: '/hr/leaves', icon: Calendar, label: 'Leave Management' },
    { to: '/hr/payroll', icon: DollarSign, label: 'Payroll' },
    { to: '/hr/performance', icon: TrendingUp, label: 'Performance' },
    { to: '/hr/recruitment', icon: UserPlus, label: 'Recruitment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">HR Module</h1>
             
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AD</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <nav className="ml-10 flex space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 ${
                        isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent hover:border-gray-300'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

      {/* Page Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-800">Human Resources</h2>
          <p className="text-sm text-gray-600">Manage your organization's workforce</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRLayout;