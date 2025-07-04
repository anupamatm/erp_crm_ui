import * as React from "react";
import { Toaster, toast } from "react-hot-toast";

export type Toast = ReturnType<typeof toast>;

export type UseToast = typeof toast;

export const useToast = () => {
  return {
    toast,
    Toaster,
  };
};

export type ToastActionElement = React.ReactElement & {
  variant?: "destructive";
};

export type ToastProps = React.ComponentPropsWithoutRef<typeof toast> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const ToastProvider = Toaster;