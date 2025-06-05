import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';

const RedirectByRole = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    case 'finance':
      return <Navigate to="/finance" replace />;
    case 'sales_manager':
    case 'sales_exec':
      return <Navigate to="/sales" replace />;
    case 'customer':
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RedirectByRole;
