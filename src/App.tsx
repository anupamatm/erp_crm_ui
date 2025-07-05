
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './lib/auth';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { AccountProvider } from './contexts/AccountContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccountProvider>
          <TransactionProvider>
            <ExpenseProvider>
              <AppRoutes />
              <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                hideProgressBar={false} 
                newestOnTop={false} 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
              />
            </ExpenseProvider>
          </TransactionProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
