// src/AppRoutes.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ROLES } from './constants/navigation';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './pages/Customer/CustomerLayout';
import ProtectedRouteLayout from './components/ProtectedRouteLayout';
import RedirectByRole from './components/RedirectByRole';
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

import Orders from './pages/Sales/Orders';
import Opportunities from './pages/Sales/Opportunities';
import Invoices from './pages/Sales/Invoices';
import Reports from './pages/Sales/Reports';
import ProductForm from './pages/products/ProductForm';
import SalesOrderForm from './pages/Sales/SalesOrderForm';
import OpportunityForm from './pages/Sales/OpportunityForm';
import SalesLayout from './pages/Sales/SalesLayout';
import LeadsLayout from './pages/Leads/LeadsLayout';
import FinanceLayout from './pages/Finance/FinanceLayout';
import AccountsList from './pages/Finance/AccountsList';
import AccountsForm from './pages/Finance/AccountsForm';
import TransactionsList from './pages/Finance/TransactionsList';
import TransactionForm from './pages/Finance/TransactionForm';
import Summary from './pages/Finance/Summary';
import FinanceReports from './pages/Finance/FinanceReports';



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
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import Accounts from './pages/Finance/Accounts';
import SalesDashboard from './pages/Sales/SalesDashboard';
import ProductDetails from './pages/Products/ProductDetails';



export default function AppRoutes() {


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={['admin', 'finance', 'sales_manager', 'sales_exec', 'customer']} />}>
        <Route path="/" element={<ProtectedRouteLayout />}>
          {/* Redirect to role-specific dashboard */}
          <Route index element={<RedirectByRole />} />
          
          {/* Admin Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="users">
            <Route index element={<UserList />} />
            <Route path="new" element={<UserForm />} />
          </Route>
          
          <Route path="settings" element={<SettingsPage />} />
          
          <Route path="customers">
            <Route index element={<Customers />} />
            <Route path="new" element={<CustomerForm />} />
            <Route path=":id" element={<CustomerView />} />
            <Route path=":id/edit" element={<CustomerForm />} />
          </Route>
          
          <Route path="products">
            <Route index element={<Products />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path=":id/edit" element={<ProductForm />} />
          </Route>

          {/* Finance Routes - Protected for both admin and finance roles */}
          <Route 
            path="finance" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.FINANCE]} />
            }
          >
            <Route element={<FinanceLayout />}>
              <Route index element={<FinanceDashboard />} />
              <Route path="accounts">
                <Route index element={<AccountsList />} />
                <Route path="new" element={<AccountsForm />} />
                <Route path=":id/edit" element={<AccountsForm />} />
              </Route>
              <Route path="transactions">
                <Route index element={<TransactionsList />} />
                <Route path="new" element={<TransactionForm />} />
                <Route path=":id/edit" element={<TransactionForm />} />
              </Route>
              <Route path="summary" element={<Summary />} />
              <Route path="reports" element={<FinanceReports />} />
            </Route>
          </Route>

          {/* Sales Routes - Protected for admin and sales roles */}
          <Route 
            path="sales" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC]} />
            }
          >
            <Route element={<SalesLayout />}>
              <Route index element={<SalesDashboard />} />
              <Route path="orders">
                <Route index element={<Orders />} />
                <Route path="new" element={<SalesOrderForm isOpen={true} onClose={() => window.history.back()} />} />
                <Route path=":id" element={<OrderDetails />} />
                <Route path=":id/edit" element={<SalesOrderForm isOpen={true} onClose={() => window.history.back()} />} />
              </Route>
              <Route path="opportunities">
                <Route index element={<Opportunities />} />
                <Route path="new" element={<OpportunityForm />} />
                <Route path=":id" element={<OpportunityForm />} />
              </Route>
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Leads Routes - Protected for admin and sales roles */}
          <Route 
            path="leads" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC]} />
            }
          >
            <Route element={<LeadsLayout />}>
              <Route index element={<LeadDashboard />} />
              <Route path="sources" element={<LeadSources />} />
              <Route path="status" element={<LeadStatus />} />
              <Route path="assign" element={<AssignLead />} />
              <Route path="new" element={<LeadForm />} />
              <Route path=":id" element={<LeadDetail />} />
              <Route path=":id/edit" element={<LeadForm />} />
            </Route>
          </Route>

          {/* Customer Routes - Protected for customer role */}
          <Route 
            path="customer" 
            element={
              <ProtectedRoute roles={[ROLES.CUSTOMER]}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      {/* Fallback to login for any unmatched route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}