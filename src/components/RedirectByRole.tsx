import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/navigation';

const RedirectByRole = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Normalize role for comparison
  const normalizeRole = (role: string): string => {
    return String(role || '').toLowerCase().trim();
  };

  const userRole = normalizeRole(user.role);
  console.log('RedirectByRole - User role:', userRole);

  switch (userRole) {
    case normalizeRole(ROLES.ADMIN):
      return <Navigate to="/dashboard" replace />;
    case normalizeRole(ROLES.FINANCE):
      return <Navigate to="/finance" replace />;
    case normalizeRole(ROLES.SALES_MANAGER):
    case normalizeRole(ROLES.SALES_EXEC):
      return <Navigate to="/sales" replace />;
    case normalizeRole(ROLES.LEAD_MANAGER):
      return <Navigate to="/leads" replace />;
    case normalizeRole(ROLES.CUSTOMER):
      return <Navigate to="/customer" replace />;
    case normalizeRole(ROLES.INVENTORY_MANAGER):
      console.log('Redirecting inventory manager to /inventory');
      return <Navigate to="/inventory" replace />;
    case normalizeRole(ROLES.HR):
      return <Navigate to="/hr" replace />;
    case normalizeRole(ROLES.EMPLOYEE):
      return <Navigate to="/employee/dashboard" replace />;
    default:
      console.warn('No redirect path defined for role:', userRole);
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RedirectByRole;
