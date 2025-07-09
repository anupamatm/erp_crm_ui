// src/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './constants/navigation';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './pages/Customer/CustomerLayout';
import ProtectedRouteLayout from './components/ProtectedRouteLayout';
import RedirectByRole from './components/RedirectByRole';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';

// Main Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SettingsPage from './pages/Settings';

// Customer Pages
import CustomerForm from './pages/CustomerForm';
import CustomerView from './pages/CustomerView';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import MyProfile from './pages/Customer/MyProfile';
import MyOrders from './pages/Customer/MyOrders';
import MyInvoices from './pages/Customer/MyInvoices';
import PaymentHistory from './pages/Customer/PaymentHistory';

// Sales Pages
import Orders from './pages/Sales/Orders';
import Opportunities from './pages/Sales/Opportunities';
import Invoices from './pages/Sales/Invoices';
import Reports from './pages/Sales/Reports';
import SalesOrderForm from './pages/Sales/SalesOrderForm';
import OpportunityForm from './pages/Sales/OpportunityForm';
import SalesLayout from './pages/Sales/SalesLayout';
import { QuotationList } from './pages/Sales/QuotationList';
import { QuotationForm } from './pages/Sales/QuotationForm';
import InvoiceForm from './pages/Sales/InvoiceForm';
import SalesDashboard from './pages/Sales/SalesDashboard';
import OrderDetails from './pages/Sales/OrderDetails';

// Finance Pages
import FinanceLayout from './pages/Finance/FinanceLayout';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import Expenses from './pages/Finance/Expenses';

// Leads Pages
import LeadsLayout from './pages/Leads/LeadsLayout';
import LeadDashboard from './pages/Leads/LeadDashboard';
import LeadStatus from './pages/Leads/LeadStats';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import LeadSources from './pages/Leads/LeadSources';
import AssignLead from './pages/Leads/AssignLead';

// HR Pages
import HRLayout from './pages/HR/HRLayout';
import HRDashboard from './pages/HR/HRDashboard';
import Employees from './pages/HR/Employees';
import Attendance from './pages/HR/Attendance';
import Departments from './pages/HR/Departments';
import Payroll from './pages/HR/Payroll';


// Employee Components
import EmployeeLayout from './components/Employee/EmployeeLayout';
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProfile from './pages/Employee/Profile';
import EmployeeAttendance from './pages/Employee/AttendanceHistory';

// User Management
import UserList from './pages/UserManagement/UserList';
import UserForm from './pages/UserManagement/UserForm';

// Products Pages
import ProductsPage from './pages/Products/ProductsPage';
import ProductForm from './pages/Products/ProductForm';
import ProductDetails from './pages/Products/ProductDetails';
import { CategoryList, CategoryForm } from './pages/Products/Categories';
import ProductsLayout from './pages/Products/ProductsLayout';
import ProductRequirements from './pages/Products/ProductRequirements';
import ProductTraining from './pages/Products/ProductTraining';

// Finance Pages
import FReports from './pages/Finance/FReports';
import FAccounts from './pages/Finance/FAccounts';
import FTransactions from './pages/Finance/FTransactions';
import HRLeaveManagement from './pages/HR/HRLeaveManagement';
import PerformanceManagement from './pages/HR/PerformanceManagement';
import RecruitmentPage from './pages/HR/RecruitmentPage';
import CouponManager from './pages/Sales/CouponManager';
import InventoryLayout from './pages/Inventory/InventoryLayout';
import InventoryDashboard from './pages/Inventory/InventoryDashboard';
import InventoryItems from './pages/Inventory/InventoryItems';
import ProductSuggestions from './pages/Products/ProductSuggestions';

export default function AppRoutes() {

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.FINANCE, ROLES.SALES_MANAGER, ROLES.SALES_EXEC, ROLES.CUSTOMER, ROLES.HR, ROLES.EMPLOYEE, ROLES.INVENTORY_MANAGER, ROLES.LEAD_MANAGER]} />}>
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
          
          {/* Products Routes with Layout */}
          <Route path="products" element={<ProductsLayout />}>
            <Route index element={<ProductsPage />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path="edit/:id" element={<ProductForm />} />
            
            {/* Nested Category Routes */}
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/edit/:id" element={<CategoryForm />} />
            
            {/* Product Requirements */}
            <Route path="requirements" element={<ProductRequirements />} />
            
            {/* Product Training */}
            <Route path="training" element={<ProductTraining />} />
            
            {/* Product Suggestions */}
            <Route path="suggestions" element={<ProductSuggestions />} />
          </Route>
          
          {/* Inventory Routes - Protected for admin and inventory manager roles */}
          <Route 
            path="inventory" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
                <ProductsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InventoryDashboard />} />
            <Route path="items" element={<InventoryItems />} />
            <Route path="categories" element={<div>Inventory Categories</div>} />
            <Route path="suppliers" element={<div>Suppliers</div>} />
            <Route path="*" element={<Navigate to="/inventory" replace />} />
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
                {/* <Route index element={<AccountsList />} />
                <Route path="new" element={<AccountsForm />} />
                <Route path=":id/edit" element={<AccountsForm />} /> */}
                <Route index element={<FAccounts />} />
              </Route>
              <Route path="transactions">
                {/* <Route index element={<TransactionsList />} />
                <Route path="new" element={<TransactionForm />} />
                <Route path=":id/edit" element={<TransactionForm />} /> */}
                <Route index element={<FTransactions />} />
              </Route>
              <Route path="expenses">
                <Route index element={<Expenses />} />
                <Route path="reports" element={<FReports />} />
              </Route>
              {/* <Route path="summary" element={<Summary />} /> */}
            </Route>
          </Route>

          {/* HR Routes - Protected for admin and hr roles */}
          <Route 
            path="hr" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.HR]} />
            }
          >
            <Route element={<HRLayout />}>
              <Route index element={<HRDashboard />} />
              <Route path="employees">
                <Route index element={<Employees />} />
                {/* <Route path="new" element={<EmployeeForm />} />
                <Route path=":id" element={<EmployeeView />} />
                <Route path=":id/edit" element={<EmployeeForm />} /> */}
              </Route>
              <Route path="attendance" element={<Attendance />} />
              <Route path="departments" element={<Departments />} />
              <Route path="leaves">
                <Route index element={<HRLeaveManagement />} />
                {/* <Route path="new" element={<LeaveForm />} />
                <Route path=":id" element={<LeaveView />} />
                <Route path=":id/edit" element={<LeaveForm />} /> */}
              </Route>
              <Route path="payroll">
                <Route index element={<Payroll />} />
                {/* <Route path="new" element={<PayrollForm />} />
                <Route path=":id" element={<PayrollView />} />
                <Route path=":id/edit" element={<PayrollForm />} /> */}
              </Route>
              <Route path="performance">
                <Route index element={<PerformanceManagement />} />
                {/* <Route path="new" element={<PerformanceForm />} />
                <Route path=":id" element={<PerformanceView />} />
                <Route path=":id/edit" element={<PerformanceForm />} /> */}
              </Route>
              <Route path="recruitment">
                <Route index element={<RecruitmentPage />} />
                {/* <Route path="new" element={<RecruitmentForm />} />
                <Route path=":id" element={<RecruitmentView />} />
                <Route path=":id/edit" element={<RecruitmentForm />} /> */}
              </Route>
            </Route>
          </Route>

         

          {/* Sales Routes - Protected for admin and sales roles */}
          <Route 
            path="sales" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC]}>
                <SalesLayout />
              </ProtectedRoute>
            }
          >
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
            
            {/* Invoice Routes */}
            <Route path="invoices">
              <Route index element={<Invoices />} />
              <Route path="new" element={<InvoiceForm />} />
              <Route path=":id" element={<InvoiceForm />} />
              <Route path=":id/edit" element={<InvoiceForm />} />
            </Route>
            
            <Route path="reports" element={<Reports />} />
            
            {/* Quotation Routes */}
            <Route path="quotations">
              <Route index element={<QuotationList />} />
              <Route path="new" element={<QuotationForm />} />
              <Route path=":id" element={<QuotationForm />} />
              <Route path=":id/edit" element={<QuotationForm />} />
            </Route>
            
            {/* Coupon Routes */}
            <Route path="coupons">
              <Route index element={<CouponManager />} />
            </Route>
          </Route>
          
        

          {/* Leads Routes - Protected for admin and sales roles */}
          <Route 
            path="leads" 
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXEC, ROLES.LEAD_MANAGER]} />
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

      {/* Employee Portal Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={[ROLES.EMPLOYEE]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      {/* Fallback to login for any unmatched route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}