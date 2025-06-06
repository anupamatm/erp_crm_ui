import { 
  LayoutDashboard, Users, User, ShoppingCart, 
  FileText, BarChart, Settings, Wallet, 
  CreditCard, ListChecks, BarChart2, PieChart,
  MessageSquare, Tag, Calendar, Mail, 
  Bell, HelpCircle, LogOut, Home, 
  FileCheck, DollarSign, Package, Briefcase,
  ClipboardList, TrendingUp, FileSearch, FileBarChart2
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
  FINANCE: 'finance',
  SALES_MANAGER: 'sales_manager',
  SALES_EXEC: 'sales_exec',
  CUSTOMER: 'customer'
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
  createNavItem('Leads', '/leads', ClipboardList, [ROLES.ADMIN]),
  createNavItem('Settings', '/settings', Settings, [ROLES.ADMIN]),
];

// Finance Navigation
export const financeNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/finance', LayoutDashboard, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Accounts', '/finance/accounts', Wallet, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Transactions', '/finance/transactions', CreditCard, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Summary', '/finance/summary', BarChart2, [ROLES.ADMIN, ROLES.FINANCE]),
  createNavItem('Reports', '/finance/reports', FileBarChart2, [ROLES.ADMIN, ROLES.FINANCE]),
  
];

// Sales Navigation
export const salesNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/sales', LayoutDashboard, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
//   createNavItem('Orders', '/sales/orders', ShoppingCart, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
//   createNavItem('Opportunities', '/sales/opportunities', TrendingUp, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
//   createNavItem('Invoices', '/sales/invoices', FileText, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
//   createNavItem('Reports', '/sales/reports', BarChart, [ROLES.SALES_MANAGER]),
  createNavItem('Leads', '/leads', ClipboardList, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Customers', '/customers', User, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
  createNavItem('Products', '/products', Package, [ROLES.SALES_MANAGER, ROLES.SALES_EXEC]),
];

// Customer Navigation
export const customerNavigation: NavigationItem[] = [
  createNavItem('Dashboard', '/customer', Home, [ROLES.CUSTOMER]),
  createNavItem('My Orders', '/customer/orders', ShoppingCart, [ROLES.CUSTOMER]),
  createNavItem('Invoices', '/customer/invoices', FileText, [ROLES.CUSTOMER]),
  createNavItem('Payments', '/customer/payments', CreditCard, [ROLES.CUSTOMER]),
  createNavItem('Profile', '/customer/profile', User, [ROLES.CUSTOMER]),
];

// Navigation map for ProtectedRouteLayout
const navigationMap: Record<string, NavigationItem[]> = {
  [ROLES.ADMIN]: adminNavigation, // Admin sees both admin and finance nav
  [ROLES.FINANCE]: financeNavigation,
  [ROLES.SALES_MANAGER]: salesNavigation,
  [ROLES.SALES_EXEC]: salesNavigation,
  [ROLES.CUSTOMER]: customerNavigation,
};

export const getNavigationForRole = (role: string): NavigationItem[] => {
  // Return the combined navigation for the role
  return navigationMap[role] || [];
};