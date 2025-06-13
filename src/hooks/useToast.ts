import { useCallback } from 'react';
import { toast, ToastOptions, ToastContent } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

interface ToastConfig extends ToastOptions {
  variant?: ToastVariant;
}

export const useToast = () => {
  const showToast = useCallback(
    (
      content: ToastContent,
      { variant = 'default', ...options }: ToastConfig = {}
    ) => {
      const baseOptions: ToastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        ...options,
      };

      switch (variant) {
        case 'success':
          return toast.success(content, {
            ...baseOptions,
            className: 'bg-green-50 text-green-800',
          });
        case 'error':
        case 'destructive':
          return toast.error(content, {
            ...baseOptions,
            className: 'bg-red-50 text-red-800',
          });
        case 'warning':
          return toast.warn(content, {
            ...baseOptions,
            className: 'bg-yellow-50 text-yellow-800',
          });
        case 'info':
          return toast.info(content, {
            ...baseOptions,
            className: 'bg-blue-50 text-blue-800',
          });
        default:
          return toast(content, {
            ...baseOptions,
            className: 'bg-white text-gray-800 border border-gray-200',
          });
      }
    },
    []
  );

  const dismissToast = useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    toast: showToast,
    dismiss: dismissToast,
    success: (content: ToastContent, options?: Omit<ToastConfig, 'variant'>) =>
      showToast(content, { ...options, variant: 'success' }),
    error: (content: ToastContent, options?: Omit<ToastConfig, 'variant'>) =>
      showToast(content, { ...options, variant: 'error' }),
    warning: (content: ToastContent, options?: Omit<ToastConfig, 'variant'>) =>
      showToast(content, { ...options, variant: 'warning' }),
    info: (content: ToastContent, options?: Omit<ToastConfig, 'variant'>) =>
      showToast(content, { ...options, variant: 'info' }),
  };
};

export default useToast;
