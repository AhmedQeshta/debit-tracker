import { CURRENCIES } from '@/lib/utils';
import { useState } from 'react';

export const useSummaryCurrency = () => {
  const [summaryCurrency, setSummaryCurrency] = useState('$');

  const summaryCurrencyLabel =
    CURRENCIES.find((currency) => currency.symbol === summaryCurrency)?.label || 'Custom';

  const handleSummaryCurrencyToggle = () => {
    const currentIndex = CURRENCIES.findIndex((currency) => currency.symbol === summaryCurrency);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % CURRENCIES.length : 0;
    setSummaryCurrency(CURRENCIES[nextIndex].symbol);
  };
  return {
    summaryCurrency,
    summaryCurrencyLabel,
    handleSummaryCurrencyToggle,
  };
};
