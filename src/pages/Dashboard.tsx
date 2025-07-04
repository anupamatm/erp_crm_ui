import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, AlertCircle, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import DashboardService, { DashboardStats } from '../services/dashboardService';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sample data for charts (replace with actual data from your API)
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  const leadConversionData = [
    { name: 'New', value: 400 },
    { name: 'Contacted', value: 300 },
    { name: 'Qualified', value: 200 },
    { name: 'Closed', value: 100 },
  ];

  const customerDistributionData = [
    { name: 'Retail', value: 400 },
    { name: 'Wholesale', value: 300 },
    { name: 'Corporate', value: 200 },
    { name: 'Government', value: 100 },
  ];

  // Blue theme colors matching the sidebar
  const BLUE_THEME = {
    primary: '#3B82F6',    // blue-500 (matches sidebar active state)
    light: '#60A5FA',     // blue-400
    dark: '#2563EB',      // blue-600
    background: '#F8FAFF', // Very light blue background
    text: '#1E40AF',      // blue-800
    accent: '#1D4ED8'     // blue-700
  };
  
  const COLORS = [BLUE_THEME.primary, BLUE_THEME.light, BLUE_THEME.dark, BLUE_THEME.accent];
    useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await DashboardService.getAggregatedDashboardStats();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayStats = dashboardData ? [
    { name: 'Total Customers', value: dashboardData.totalCustomers?.toString() ?? 'N/A', icon: Users, iconBgClass: 'bg-blue-50', iconTextClass: 'text-blue-600' },
    { name: 'Total Leads', value: dashboardData.totalLeads?.toString() ?? 'N/A', icon: Users, iconBgClass: 'bg-blue-50', iconTextClass: 'text-blue-600' },
    { name: 'Products', value: dashboardData.totalProducts?.toString() ?? 'N/A', icon: ShoppingCart, iconBgClass: 'bg-blue-50', iconTextClass: 'text-blue-600' },
    { name: 'Revenue', value: dashboardData.totalRevenue ? `$${dashboardData.totalRevenue.toLocaleString()}` : 'N/A', icon: DollarSign, iconBgClass: 'bg-blue-50', iconTextClass: 'text-blue-600' },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {dashboardData && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.iconBgClass}`}>
                  <stat.icon className={`h-7 w-7 ${stat.iconTextClass}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {/* Trend data can be re-added here if available */}
                      {/* <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.trend}
                      </div> */}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#D1D5DB' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${BLUE_THEME.primary}`,
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={BLUE_THEME.primary} 
                  strokeWidth={2}
                  dot={{ fill: BLUE_THEME.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: BLUE_THEME.dark }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Lead Conversion</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadConversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  tick={{ fill: '#4B5563' }}
                  axisLine={{ stroke: '#D1D5DB' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${BLUE_THEME.primary}`,
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={BLUE_THEME.primary}
                  radius={[4, 4, 0, 0]}
                >
                  {leadConversionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Customer Distribution</h3>
          </div>
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={customerDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={BLUE_THEME.primary}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {customerDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${BLUE_THEME.primary}`,
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-6">
              <p className="text-gray-500">Activity feed coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;