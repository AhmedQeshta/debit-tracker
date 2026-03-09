import { useToast } from '@/hooks/useToast';
import { formatAbsoluteCurrency } from '@/lib/utils';
import * as Clipboard from 'expo-clipboard';

type CopyAmountOptions = {
  successMessage?: string;
  errorMessage?: string;
};

export const useCopyAmount = () => {
  const { toastSuccess, toastError } = useToast();
  const handleCopyAmount = async (
    amount: number,
    currency: string,
    options?: CopyAmountOptions,
  ) => {
    try {
      const amountText = formatAbsoluteCurrency(amount, currency);
      await Clipboard.setStringAsync(amountText);
      toastSuccess(options?.successMessage || 'Amount copied to clipboard');
    } catch (error) {
      console.error('Failed to copy amount:', error);
      toastError(options?.errorMessage || 'Failed to copy amount');
    }
  };

  return { handleCopyAmount };
};
