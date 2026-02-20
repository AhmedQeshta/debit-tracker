import { ConfirmDialogContext } from '@/contexts/ConfirmDialogContext';
import { useContext } from 'react';

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
};
