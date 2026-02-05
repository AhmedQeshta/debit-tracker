import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';

/**
 * Alert helpers - now using toast and ConfirmDialog
 * These are wrapper functions for backward compatibility
 * Components should use useToast() and useConfirmDialog() hooks directly
 */

// These functions are deprecated - use hooks directly in components
// Keeping for backward compatibility during migration
export const confirmDelete = (
  title: string,
  message: string,
  onConfirm: () => void
): void => {
  // This won't work without context - components should use useConfirmDialog hook
  console.warn('confirmDelete called without context. Use useConfirmDialog hook instead.');
};

export const showSuccess = (
  title: string,
  message: string,
  onPress?: () => void
): void => {
  // This won't work without context - components should use useToast hook
  console.warn('showSuccess called without context. Use useToast hook instead.');
};

export const showError = (title: string, message: string): void => {
  // This won't work without context - components should use useToast hook
  console.warn('showError called without context. Use useToast hook instead.');
};
