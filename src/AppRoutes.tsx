// src/AppRoutes.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';

import SettingsPage from './pages/Settings';
import CustomerForm from './pages/CustomerForm';
import CustomerView from './pages/CustomerView';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import MyProfile from './pages/Customer/MyProfile';
import MyOrders from './pages/Customer/MyOrders';
import MyInvoices from './pages/Customer/MyInvoices';
import PaymentHistory from './pages/Customer/PaymentHistory';
import SalesDashboard from './pages/Sales/Dashboard';
import Orders from './pages/Sales/Orders';
import Opportunities from './pages/Sales/Opportunities';
import Invoices from './pages/Sales/Invoices';
import Reports from './pages/Sales/Reports';
import ProductForm from './pages/products/ProductForm';
import SalesOrderForm from './pages/Sales/SalesOrderForm';
import OpportunityForm from './pages/Sales/OpportunityForm';
import SalesLayout from './pages/Sales/SalesLayout';
import LeadsLayout from './pages/Leads/LeadsLayout';

import {
  Building2,
  Users, ShoppingCart,
  BarChart3, Settings as SettingsIcon,
  Box,
  FileText,
  DollarSign,
  User
} from 'lucide-react';
import LeadStats from './pages/Leads/LeadStats';
import LeadDashboard from './pages/Leads/LeadDashboard';
import LeadStatus from './pages/Leads/LeadStats';
import AssignLead from './pages/Leads/AssignLead';
import LeadSources from './pages/Leads/LeadSources';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import { useParams } from 'react-router-dom';
import OrderDetails from './pages/Sales/OrderDetails';
import UserList from './pages/UserManagement/UserList';
import UserForm from './pages/UserManagement/UserForm';
import Finance from './pages/Finance/FinanceIndex';
import Transactions from './pages/Finance/Transactions';
import Payments from './pages/Finance/Payments';

const adminNavigation = [
  { name: 'Dashboard', href: '/', icon: Building2, roles: ['admin'] },
  { name: 'Customers', href: '/customers', icon: User, roles: ['admin'] },
  { name: 'Products', href: '/products', icon: Box, roles: ['admin'] },
  { name: 'Sales', href: '/sales', icon: ShoppingCart, roles: ['admin'] },
  { name: 'Leads', href: '/leads', icon: BarChart3, roles: ['admin', 'sales_manager', 'sales_exec'] },
  
  { name: 'User Management', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Finance', href: '/finance', icon: DollarSign, roles: ['admin', 'finance'] },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, roles: ['admin'] },


];

const customerNavigation = [
  { name: 'Dashboard', href: '/customer', icon: Building2, roles: ['customer'] },
  { name: 'Orders', href: '/customer/orders', icon: ShoppingCart, roles: ['customer'] },
  { name: 'Invoices', href: '/customer/invoices', icon: FileText, roles: ['customer'] },
  { name: 'Payments', href: '/customer/payments', icon: DollarSign, roles: ['customer'] },
  { name: 'Profile', href: '/customer/profile', icon: User, roles: ['customer'] },
];

export default function AppRoutes() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

     
      <Route element={<ProtectedRoute roles={['admin', 'sales_manager', 'sales_exec', 'inventory_mgr', 'support', 'hr', 'finance']} />}>
        <Route path="/" element={<Layout navigation={adminNavigation} />}>
          <Route index element={<Dashboard />} />

          <Route path="users">
            <Route index element={<UserList />} />
            <Route path="new" element={<UserForm />} />
          </Route>

          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerView />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />

          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />

          <Route path="/finance" element={<Finance />} />
      <Route path="/finance/transactions" element={<Transactions />} />
      <Route path="/finance/invoices" element={<Invoices />} />
      <Route path="/finance/payments" element={<Payments />} />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="leads" element={<LeadsLayout />}>
            <Route index element={<LeadDashboard />} />
            <Route path="new" element={<LeadForm />} />
            <Route path=":id" element={<LeadDetail />} />
            <Route path=":id/edit" element={
              <LeadForm lead={useParams().id ? { _id: useParams().id } : undefined} />
            } />

          </Route>
        </Route>
      </Route>

      {/* Customer protected */}
      <Route element={<ProtectedRoute roles={['customer']} />}>
        <Route path="/customer" element={<Layout navigation={customerNavigation} />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="invoices" element={<MyInvoices />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>
      </Route>

      {/* sales protected */}
      <Route element={<ProtectedRoute roles={['admin', 'sales_manager', 'sales_exec']} />}>
        <Route path="/" element={<Layout navigation={adminNavigation} />}>
          <Route path="sales" element={<SalesLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="opportunities/new" element={<OpportunityForm />} />
            <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
            <Route path="/sales/orders/:id" element={<OrderDetails />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          {/* Leads Module */}
          <Route path="leads" element={<LeadsLayout />}>
            <Route index element={<LeadDashboard />} />
            <Route path="sources" element={<LeadSources />} />
            <Route path="status" element={<LeadStatus />} />
            <Route path="assign" element={<AssignLead />} />
            <Route path="new" element={<LeadForm />} />
            <Route path=":id" element={<LeadDetail />} />
            <Route path=":id/edit" element={
              <LeadForm lead={useParams().id ? { _id: useParams().id } : undefined} />
            } />
          </Route>

        </Route>

      </Route>



      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
