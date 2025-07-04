import { useEffect, useState } from 'react';
import { ToastContainer, toast, ToastContainerProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProps extends ToastContainerProps {}

export function Toast({ ...props }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering on the client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      {...props}
    />
  );
}

export { toast };
export default Toast;
