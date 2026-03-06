import { Colors } from '@/theme/colors';
import { ToastMessage } from '@/types/common';
import { Budget, Friend, Transaction } from '@/types/models';

export const calculateLatestTransactions = (allTransactions: Transaction[]) => {
  return [...allTransactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
};

export const getBalance = (friendId: string, allTransactions: Transaction[]) => {
  return allTransactions
    .filter((t) => t.friendId === friendId)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const filterFriends = (friends: Friend[], search: string) => {
  return friends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
};

export const getGlobalDebit = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const getTotalPaidBack = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
};

export const getFinalAmount = (amount: string, isNegative: boolean) => {
  if (!amount || isNaN(Number(amount))) return 0;
  return Number(amount) * (isNegative ? -1 : 1);
};

export const getUserBalance = (transactions: Transaction[]) => {
  // Maybe rename to getFriendBalance? But it sums ALL.
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

export const getBalanceText = (balance: number, currency?: string) => {
  if (currency) {
    return `${balance < 0 ? `-` : '+'} ${formatCurrency(Math.abs(balance), currency)}`;
  }
  return `${balance < 0 ? `-` : '+'} ${Math.abs(balance).toFixed(2)}`;
};

export const getBalanceStatus = (balance: number) => {
  return balance < 0 ? 'They owe you' : balance > 0 ? 'You owe them' : 'Settled';
};

export type BalanceDirectionTone = 'positive' | 'negative' | 'neutral';

export const getBalanceDirectionTone = (netBalance: number): BalanceDirectionTone => {
  if (netBalance > 0) return 'positive';
  if (netBalance < 0) return 'negative';
  return 'neutral';
};

export const getBalanceDirectionText = (netBalance: number, friendName: string) => {
  if (netBalance > 0) return `${friendName} owes you`;
  if (netBalance < 0) return `You owe ${friendName}`;
  return 'All settled';
};

export const formatAbsoluteCurrency = (amount: number, currency?: string) => {
  return currency ? formatCurrency(Math.abs(amount), currency) : Math.abs(amount).toFixed(2);
};

export const getBalanceBreakdown = (transactions: Transaction[]) => {
  const youOwe = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const owedToYou = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    youOwe,
    owedToYou,
  };
};

export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'error' | 'outline',
  styles: any,
) => {
  switch (variant) {
    case 'secondary':
      return [styles.button, { backgroundColor: Colors.secondary }];
    case 'error':
      return [styles.button, { backgroundColor: Colors.error }];
    case 'outline':
      return [styles.button, styles.outlineButton];
    default:
      return styles.button;
  }
};

export const getTextStyle = (
  variant: 'primary' | 'secondary' | 'error' | 'outline',
  styles: any,
) => {
  if (variant === 'outline') return [styles.text, { color: Colors.text }];
  return styles.text;
};

export const CURRENCIES = [
  { symbol: '$', label: 'USD' },
  { symbol: '₪', label: 'ILS' },
  { symbol: '€', label: 'EUR' },
];

export const formatCurrency = (amount: number, currency?: string) => {
  return currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2);
};

export const safeId = (id: string | string[] | undefined): string => {
  if (typeof id === 'string') return id;
  if (Array.isArray(id) && id.length > 0) return id[0];
  return '';
};

/**
 * Validation helpers
 */
export const validateTitle = (title: string): string | null => {
  if (!title.trim()) return 'Title is required';
  if (title.length > 50) return 'Title must be less than 50 characters';
  return null;
};

export const validateAmount = (amount: string, minValue: number = 0): string | null => {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Amount must be a valid number';
  if (minValue === 0 && num < 0) return 'Amount must be a valid number >= 0';
  if (minValue > 0 && num <= 0) return 'Amount must be a valid number > 0';
  return null;
};

export const sortBudgets = (budgets: Budget[]) =>
  [...budgets].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

/**
 * Validation helpers
 */
export const validateFriendName = (name: string): string | null => {
  if (!name.trim()) return 'Name is required';
  if (name.length > 50) return 'Name must be less than 50 characters';
  return null;
};

export const generateId = (): string => Math.random().toString(36).substring(2, 15);

export const sortedTransactions = (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => b.date - a.date);

export const getFriendName = (friends: Friend[], id: string) =>
  friends.find((f) => f.id === id)?.name || 'Unknown Friend';

export const getProgressText = (pullProgress: string | any) => {
  if (!pullProgress) return 'Downloading your data...';
  switch (pullProgress) {
    case 'friends':
      return 'Downloading friends...';
    case 'transactions':
      return 'Downloading transactions...';
    case 'budgets':
      return 'Downloading budgets...';
    default:
      return 'Downloading your data...';
  }
};

export const formatSignedCurrency = (amount: number) => {
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${prefix}${formatCurrency(Math.abs(amount), '$')}`;
};

export const getBackgroundColor = (toast: ToastMessage) => {
  switch (toast.type) {
    case 'success':
      return Colors.success + '20';
    case 'error':
      return Colors.error + '20';
    case 'info':
      return Colors.primary + '20';
  }
};
export const getBorderColor = (toast: ToastMessage) => {
  switch (toast.type) {
    case 'success':
      return Colors.success;
    case 'error':
      return Colors.error;
    case 'info':
      return Colors.primary;
  }
};

export const SORT_OPTIONS = [
  { key: 'recent', label: 'Recent' },
  { key: 'name', label: 'Name' },
  { key: 'balance', label: 'Balance' },
] as const;

export const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'you-owe', label: 'You owe' },
  { key: 'owes-you', label: 'Owes you' },
  { key: 'settled', label: 'Settled' },
] as const;

export const getMonthLabel = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
};

export const getDayLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayValue = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.floor((today - dayValue) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getStatus = (synced: boolean, hasSyncError: boolean) => {
  if (synced) return 'synced' as const;
  if (hasSyncError) return 'failed' as const;
  return 'pending' as const;
};
