import { ToastContextType, ToastMessage, ToastType } from '@/types/common';
import React, { createContext, useCallback, useState } from 'react';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newToast: ToastMessage = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast],
  );

  const toastSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast],
  );

  const toastError = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast],
  );

  const toastInfo = useCallback(
    (message: string) => {
      showToast(message, 'info');
    },
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        toastSuccess,
        toastError,
        toastInfo,
        removeToast,
      }}>
      {children}
    </ToastContext.Provider>
  );
};
