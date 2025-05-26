import React, { useEffect, useState } from 'react';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { getDashboardData, getCustomerStats, getLeadStats, getInvoiceStats, getOpportunityStats } from '../services/dashboardService';
import ProductService from '../services/productService';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [customerApiRaw, setCustomerApiRaw] = useState<any>(null); // For debugging
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueChart, setRevenueChart] = useState<any>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      let dashboard: any = {};
      let customers: any = {};
      let leads: any = {};
      let invoices: any = {};
      let opportunities: any = {};

      try {
        dashboard = await getDashboardData();
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }

      try {
        customers = await getCustomerStats();
        setCustomerApiRaw(customers);
      } catch (err) {
        console.error('Failed to fetch customer stats:', err);
      }

      try {
        leads = await getLeadStats();
      } catch (err) {
        console.error('Failed to fetch lead stats:', err);
      }

      try {
        invoices = await getInvoiceStats();
      } catch (err) {
        console.error('Failed to fetch invoice stats:', err);
      }

      try {
        opportunities = await getOpportunityStats();
      } catch (err) {
        console.error('Failed to fetch opportunity stats:', err);
      }

      // Defensive extraction
      let totalCustomers = 0;
      if (customers && typeof customers.total === 'object' && typeof customers.total.total === 'number') {
        totalCustomers = customers.total.total;
      } else if (typeof customers.total === 'number') {
        totalCustomers = customers.total;
      }
      // Fetch total products
      let totalProductCount = 0;
      try {
        totalProductCount = await ProductService.getTotalProducts();
        setTotalProducts(totalProductCount);
      } catch (err) {
        console.error('Failed to fetch total products:', err);
        totalProductCount = 0;
      }


      setStats({
        customers: totalCustomers,
        products: totalProductCount,
        revenue: dashboard?.summary?.totalRevenue ?? 0,
        orders: dashboard?.summary?.totalOrders ?? 0,
        pendingOrders: dashboard?.summary?.pendingOrders ?? 0,
        avgOrder: dashboard?.summary?.averageOrderValue ?? 0,
        leads: leads?.totalLeads ?? 0,
        opportunities: opportunities?.total?.totalCount ?? 0,
        conversionRate: dashboard?.summary?.conversionRate ?? 0,
        invoiceTotal: invoices?.overall?.totalInvoiced ?? 0,
        invoicePaid: invoices?.overall?.totalPaid ?? 0,
        invoiceOutstanding: invoices?.overall?.totalOutstanding ?? 0,
      });

      // Prepare revenue chart data
      if (dashboard.revenueByMonth) {
        setRevenueChart({
          labels: dashboard.revenueByMonth.map((m: any) => m.month),
          datasets: [
            {
              label: 'Revenue by Month',
              data: dashboard.revenueByMonth.map((m: any) => m.total),
              backgroundColor: '#6366f1',
            },
          ],
        });
      }

      setLoading(false);
    };

    fetchStats();


  }, []);


  // Loading State
  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // Error State
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Render only if stats are loaded
  if (!stats) {
    return <div>Something went wrong. No data found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Customers */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.customers}</dd>
              {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && customerApiRaw && (
                <pre style={{ fontSize: 10, color: '#888', marginTop: 4 }}>

                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.products}</dd>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-gray-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
              <dd className="text-2xl font-semibold text-gray-900">${stats.revenue?.toLocaleString()}</dd>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-gray-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Orders</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.orders}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white shadow p-6">
          <h3 className="text-lg font-medium mb-4">Revenue by Month</h3>
          {revenueChart ? (
            <Bar data={revenueChart} />
          ) : (
            <div className="text-gray-400">No revenue data</div>
          )}
        </div>
        <div className="rounded-lg bg-white shadow p-6">
          <h3 className="text-lg font-medium mb-4">Leads</h3>
          <div className="text-3xl font-bold">{stats.leads}</div>
        </div>
        <div className="rounded-lg bg-white shadow p-6">
          <h3 className="text-lg font-medium mb-4">Opportunities</h3>
          <div className="text-3xl font-bold">{stats.opportunities}</div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-8">
        <div className="rounded-lg bg-white shadow px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
          <div className="mt-6">
            <p className="text-gray-500">Activity feed coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
