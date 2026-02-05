import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

interface ConfirmDialogContextType {
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Reset dialog state when it becomes invisible to prevent persistence issues
  useEffect(() => {
    if (!dialogState.visible) {
      // Clear state immediately when dialog closes
      setDialogState({
        visible: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      });
    }
  }, [dialogState.visible]);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: { confirmText?: string; cancelText?: string }
    ) => {
      setDialogState({
        visible: true,
        title,
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        onConfirm,
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, visible: false }));
        },
      });
    },
    []
  );

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      requestAnimationFrame(() => {
        dialogState.onConfirm?.();
        setDialogState((prev) => ({ ...prev, visible: false }));
      });
    }
  };

  const handleCancel = () => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    setDialogState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <ConfirmDialog
        visible={dialogState.visible}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
};

