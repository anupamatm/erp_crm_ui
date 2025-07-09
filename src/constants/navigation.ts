import { 
  LayoutDashboard, Users, User, ShoppingCart, 
  FileText, Settings, Wallet, 
  CreditCard, Calendar, Home, 
  FileCheck, DollarSign, Package, Briefcase,
  ClipboardList, FileBarChart2,
  Star,
  Plus
} from 'lucide-react';

// Define navigation item type
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

// Role constants for better maintainability
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  FINANCE: 'finance',
  SALES_MANAGER: 'sales_manager',
  SALES_EXEC: 'sales_exec',
  CUSTOMER: 'customer',
  HR: 'hr',
  EMPLOYEE: 'employee',
  INVENTORY_MANAGER: 'inventory_mgr',
  LEAD_MANAGER: 'lead_manager'
};

// Helper function to create navigation items
const createNavItem = (
  name: string, 
  href: string, 
  icon: React.ComponentType<any>, 
  roles: string[]
): NavigationItem => ({
  name,
  href,
  icon,
  roles
});

// Admin Navigation
export const adminNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/dashboard', LayoutDashboard, [ROLES.ADMIN]),
  createNavItem('Users', '/users', Users, [ROLES.ADMIN]),
  createNavItem('Customers', '/customers', User, [ROLES.ADMIN]),
  createNavItem('Products', '/products', Package, [ROLES.ADMIN]),
  createNavItem('Finance', '/finance', DollarSign, [ROLES.ADMIN]),
  createNavItem('Sales', '/sales', Briefcase, [ROLES.ADMIN]),
  createNavItem('Leads', '/leads', ClipboardList, [ROLES.ADMIN, ROLES.LEAD_MANAGER]),
  createNavItem('HR', '/hr', Users, [ROLES.ADMIN]),
  createNavItem('Settings', '/settings', Settings, [ROLES.ADMIN]),
];

// Finance Navigation
export const financeNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/finance', LayoutDashboard, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Accounts', '/finance/accounts', Wallet, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Transactions', '/finance/transactions', CreditCard, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Expenses', '/finance/expenses', CreditCard, [ROLES.ADMIN, ROLES.FINANCE]),
  // createNavItem('Summary', '/finance/summary', BarChart2, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Reports', '/finance/reports', FileBarChart2, [ROLES.ADMIN, ROLES.FINANCE]),
  
];

// Sales Navigation
export const salesNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/sales', LayoutDashboard, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Leads', '/leads', ClipboardList, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Customers', '/customers', User, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Products', '/products', Package, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Invoices', '/sales/invoices', FileText, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Quotations', '/sales/quotations', FileCheck, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Orders', '/sales/orders', ShoppingCart, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Coupons', '/sales/coupons', ShoppingCart, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
];

// Customer Navigation
export const customerNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/customer', Home, [ROLES.CUSTOMER]),
  createNavItem('My Orders', '/customer/orders', ShoppingCart, [ROLES.CUSTOMER]),
  createNavItem('Invoices', '/customer/invoices', FileText, [ROLES.CUSTOMER]),
  createNavItem('Payments', '/customer/payments', CreditCard, [ROLES.CUSTOMER]),
  createNavItem('Profile', '/customer/profile', User, [ROLES.CUSTOMER]),

];

// HR Navigation
export const hrNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/hr', LayoutDashboard, [ROLES.ADMIN, ROLES.HR]),
  createNavItem('Employees', '/hr/employees', Users, [ROLES.ADMIN, ROLES.HR]),
  createNavItem('Leaves', '/hr/leaves', Calendar, [ROLES.ADMIN, ROLES.HR]),
  createNavItem('Payroll', '/hr/payroll', DollarSign, [ROLES.ADMIN, ROLES.HR]),
  createNavItem('Performance', '/hr/performance', Star, [ROLES.ADMIN, ROLES.HR]),
  createNavItem('Recruitment', '/hr/recruitment', Plus, [ROLES.ADMIN, ROLES.HR]),
];

// Employee Navigation
export const employeeNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/employee/dashboard', LayoutDashboard, [ROLES.EMPLOYEE]),
  createNavItem('My Profile', '/employee/profile', User, [ROLES.EMPLOYEE]),
  createNavItem('Attendance', '/employee/attendance', Calendar, [ROLES.EMPLOYEE]),
  createNavItem('Documents', '/employee/documents', FileText, [ROLES.EMPLOYEE])
];

// Lead Manager Navigation
export const leadManagerNavigation: NavigationItem[] = [
  createNavItem('Leads', '/leads', ClipboardList, [ROLES.LEAD_MANAGER]),
  // createNavItem('My Profile', '/profile', User, [ROLES.LEAD_MANAGER])
];

// Inventory Manager Navigation
export const inventoryManagerNavigation: NavigationItem[] = [
  //createNavItem('Dashboard', '/inventory', LayoutDashboard, [ROLES.INVENTORY_MANAGER]),
  createNavItem('Products', '/products', Package, [ROLES.INVENTORY_MANAGER]),
  //createNavItem('Inventory', '/inventory/items', Package, [ROLES.INVENTORY_MANAGER]),
  //createNavItem('Categories', '/inventory/categories', ClipboardList, [ROLES.INVENTORY_MANAGER]),
  //createNavItem('Suppliers', '/inventory/suppliers', Users, [ROLES.INVENTORY_MANAGER])
];

// Convert role to lowercase and trim for consistent comparison
const normalizeRole = (role: string): string => {
  return String(role || '').toLowerCase().trim();
};

export const getNavigationForRole = (role: string): NavigationItem[] => {
  const normalizedRole = normalizeRole(role);
  
  // For debugging
  console.log('getNavigationForRole - Input role:', role, 'Normalized role:', normalizedRole);
  
  switch (normalizedRole) {
    case normalizeRole(ROLES.ADMIN):
      return adminNavigation;
    case normalizeRole(ROLES.FINANCE):
      return financeNavigation;
    case normalizeRole(ROLES.SALES_MANAGER):
    case normalizeRole(ROLES.SALES_EXEC):
      return salesNavigation;
    case normalizeRole(ROLES.LEAD_MANAGER):
      console.log('Returning lead manager navigation');
      return leadManagerNavigation;
    case normalizeRole(ROLES.INVENTORY_MANAGER):
      console.log('Returning inventory manager navigation');
      return inventoryManagerNavigation;
    case normalizeRole(ROLES.HR):
      return hrNavigation;
    case normalizeRole(ROLES.EMPLOYEE):
      return employeeNavigation;
    case normalizeRole(ROLES.CUSTOMER):
      return customerNavigation;
    default:
      console.warn('No navigation found for role:', role, 'Normalized:', normalizedRole);
      return [];
  }
};