import React from 'react';
import StatCard from './StatCard.tsx';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Building2,
  UserPlus
} from 'lucide-react';

const HRDashboard: React.FC = () => {
  const recentActivities = [
    { id: 1, action: 'New employee John Doe joined Engineering department', time: '2 hours ago', type: 'employee' },
    { id: 2, action: 'Leave request approved for Jane Smith', time: '4 hours ago', type: 'leave' },
    { id: 3, action: 'Performance review completed for Mike Johnson', time: '6 hours ago', type: 'performance' },
    { id: 4, action: 'New candidate Alex Thompson scheduled for interview', time: '1 day ago', type: 'recruitment' },
  ];

  const upcomingEvents = [
    { id: 1, event: 'Team Meeting - Engineering', date: 'Today, 2:00 PM', type: 'meeting' },
    { id: 2, event: 'Interview - Alex Thompson', date: 'Tomorrow, 10:00 AM', type: 'interview' },
    { id: 3, event: 'Performance Review - Sarah Wilson', date: 'Jan 20, 3:00 PM', type: 'review' },
    { id: 4, event: 'Department Budget Review', date: 'Jan 22, 9:00 AM', type: 'meeting' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your organization.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value="248"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Present Today"
          value="234"
          icon={UserCheck}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Pending Leaves"
          value="12"
          icon={Calendar}
          trend={{ value: -8.3, isPositive: false }}
          color="yellow"
        />
        <StatCard
          title="Monthly Payroll"
          value="$1.2M"
          icon={DollarSign}
          trend={{ value: 3.7, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Departments"
          value="8"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Avg. Performance"
          value="4.2/5"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Open Positions"
          value="15"
          icon={UserPlus}
          color="yellow"
        />
        <StatCard
          title="Avg. Work Hours"
          value="8.3h"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'employee' ? 'bg-blue-500' :
                    activity.type === 'leave' ? 'bg-yellow-500' :
                    activity.type === 'performance' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'interview' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {event.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-blue-600">Add Employee</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
            <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-green-600">Approve Leave</p>
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group">
            <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-yellow-600">Performance Review</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
            <UserPlus className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-purple-600">Post Job</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;