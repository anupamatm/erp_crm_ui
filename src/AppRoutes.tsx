import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import LeadDashboard from './pages/Leads/LeadDashboard';
import LeadStatus from './pages/Leads/LeadStats';
import AssignLead from './pages/Leads/AssignLead';
import LeadSources from './pages/Leads/LeadSources';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import OrderDetails from './pages/Sales/OrderDetails';
import UserList from './pages/UserManagement/UserList';
import UserForm from './pages/UserManagement/UserForm';
import QuotationForm from './pages/Sales/QuotationForm';
import QuotationView from './pages/Sales/QuotationView';
import InvoiceForm from './pages/Sales/InvoiceForm';
import InvoiceView from './pages/Sales/InvoiceView';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import ProductDetails from './pages/Products/ProductDetails';
import HRLayout from './pages/HR/HRLayout';
import HRDashboard from './pages/HR/HRDashboard';
import Employees from './pages/HR/Employees';
import Attendance from './pages/HR/Attendance';
import Departments from './pages/HR/Departments';
import LeaveManagement from './pages/HR/LeaveManagement';
import Payroll from './pages/HR/Payroll';
import Performance from './pages/HR/Performance';
import EmployeeLayout from './components/Employee/EmployeeLayout';
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProfile from './pages/Employee/Profile';
import EmployeeAttendance from './pages/Employee/AttendanceHistory';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={[
        ROLES.ADMIN, ROLES.FINANCE, ROLES.SALES_MANAGER,
        ROLES.SALES_EXEC, ROLES.CUSTOMER, ROLES.HR, ROLES.EMPLOYEE
      ]} />}>
        <Route path="/" element={<ProtectedRouteLayout />}>
          <Route index element={<RedirectByRole />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route path="users">
            <Route index element={<UserList />} />
            <Route path="new" element={<UserForm />} />
          </Route>

          <Route path="settings" element={<SettingsPage />} />

          {/* Customers */}
          <Route path="customers">
            <Route index element={<Customers />} />
            <Route path="new" element={<CustomerForm />} />
            <Route path=":id" element={<CustomerView />} />
            <Route path=":id/edit" element={<CustomerForm />} />
          </Route>

          {/* Products */}
          <Route path="products">
            <Route index element={<Products />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path=":id/edit" element={<ProductForm />} />
          </Route>

          {/* Finance */}
          <Route path="finance" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.FINANCE]} />}>
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

          {/* HR */}
          <Route path="hr" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.HR]} />}>
            <Route element={<HRLayout />}>
              <Route index element={<HRDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="departments" element={<Departments />} />
              <Route path="leaves" element={<LeaveManagement />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="performance" element={<Performance />} />
            </Route>
          </Route>

          {/* Sales */}
          <Route path="sales" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC]} />}>
            <Route element={<SalesLayout />}>
              <Route index element={<Dashboard />} />
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
              <Route path="invoices/new" element={<InvoiceForm />} />
              <Route path="invoices/:id/edit" element={<InvoiceForm />} />
              <Route path="invoices/:id" element={<InvoiceView />} />
              <Route path="quotations">
                <Route index element={<QuotationView />} />
                <Route path="new" element={<QuotationForm />} />
                <Route path="edit/:id" element={<QuotationForm />} />
                <Route path=":id" element={<QuotationView />} />
              </Route>
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Leads */}
          <Route path="leads" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC]} />}>
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

          {/* Customer Portal */}
          <Route path="customer" element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CustomerDashboard />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Employee Portal */}
      <Route path="/employee" element={
        <ProtectedRoute roles={[ROLES.EMPLOYEE]}>
          <EmployeeLayout />
        </ProtectedRoute>
      }>
        <Route index element={<EmployeeDashboard />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="leave" element={<div>Leave Management</div>} />
        <Route path="documents" element={<div>Documents</div>} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
