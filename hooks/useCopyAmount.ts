import { useToast } from '@/hooks/useToast';
import { formatAbsoluteCurrency } from '@/lib/utils';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

type CopyAmountOptions = {
  successMessage?: string;
  errorMessage?: string;
};

export const useCopyAmount = () => {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const handleCopyAmount = async (
    amount: number,
    currency: string,
    options?: CopyAmountOptions,
  ) => {
    try {
      const amountText = formatAbsoluteCurrency(amount, currency);
      await Clipboard.setStringAsync(amountText);
      toastSuccess(options?.successMessage || t('copyAmount.success'));
    } catch (error) {
      console.error('Failed to copy amount:', error);
      toastError(options?.errorMessage || t('copyAmount.error'));
    }
  };

  return { handleCopyAmount };
};
