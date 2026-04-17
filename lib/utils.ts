import i18n from '@/i18n';
import { Colors } from '@/theme/colors';
import { BudgetSortKey } from '@/types/budget';
import { ToastMessage } from '@/types/common';
import {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetMetrics,
  Friend,
  Transaction,
} from '@/types/models';
import { calculateRawNetSpent } from './budgetMath';

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
  return balance < 0
    ? i18n.t('utils.balanceStatus.theyOweYou')
    : balance > 0
      ? i18n.t('utils.balanceStatus.youOweThem')
      : i18n.t('utils.balanceStatus.settled');
};

export type BalanceDirectionTone = 'positive' | 'negative' | 'neutral';

export const getBalanceDirectionTone = (netBalance: number): BalanceDirectionTone => {
  if (netBalance > 0) return 'positive';
  if (netBalance < 0) return 'negative';
  return 'neutral';
};

export const getBalanceDirectionText = (netBalance: number, friendName: string) => {
  if (netBalance > 0) return i18n.t('friendDetail.balance.directionOwesYou', { name: friendName });
  if (netBalance < 0) return i18n.t('friendDetail.balance.directionYouOwe', { name: friendName });
  return i18n.t('friendDetail.balance.directionSettled');
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
  if (!title.trim()) return i18n.t('utils.validation.titleRequired');
  if (title.length > 50) return i18n.t('utils.validation.titleTooLong');
  return null;
};

export const validateAmount = (amount: string, minValue: number = 0): string | null => {
  const num = parseFloat(amount);
  if (isNaN(num)) return i18n.t('utils.validation.amountMustBeNumber');
  if (minValue === 0 && num < 0) return i18n.t('utils.validation.amountMinZero');
  if (minValue > 0 && num <= 0) return i18n.t('utils.validation.amountGreaterThanZero');
  return null;
};

export const sortBudgets = (budgets: Budget[]) =>
  [...budgets].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

export const getBudgetItemType = (item: BudgetItem): BudgetItemType => {
  return item.type === 'income' ? 'income' : 'expense';
};

export const getTransactionBudgetItemType = (sign?: number, amount?: number): BudgetItemType => {
  if (sign === 1) return 'expense';
  if (sign === -1) return 'income';
  return (amount || 0) >= 0 ? 'expense' : 'income';
};

export const getTransactionBudgetItemId = (transactionId: string): string => {
  return `txn_item_${transactionId}`;
};

export const calculateBudgetMetrics = (items: BudgetItem[], budgetLimit: number): BudgetMetrics => {
  const activeItems = items.filter((item) => !item.deletedAt);

  const totalSpent = activeItems
    .filter((item) => getBudgetItemType(item) === 'expense')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const totalIncome = activeItems
    .filter((item) => getBudgetItemType(item) === 'income')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const netSpent = calculateRawNetSpent(totalSpent, totalIncome);
  const remaining = budgetLimit - netSpent;
  const progressRatio = budgetLimit > 0 ? Math.max(netSpent, 0) / budgetLimit : 0;

  return {
    totalSpent,
    totalIncome,
    netSpent,
    remaining,
    progressRatio,
    isOverspent: netSpent > budgetLimit,
  };
};

/**
 * Validation helpers
 */
export const validateFriendName = (name: string): string | null => {
  if (!name.trim()) return i18n.t('utils.validation.nameRequired');
  if (name.length > 50) return i18n.t('utils.validation.nameTooLong');
  return null;
};

export const generateId = (): string => Math.random().toString(36).substring(2, 15);

export const sortedTransactions = (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => b.date - a.date);

export const getFriendName = (friends: Friend[], id: string) =>
  friends.find((f) => f.id === id)?.name || i18n.t('utils.labels.unknownFriend');

export const getProgressText = (pullProgress: string | any) => {
  if (!pullProgress) return i18n.t('sync.loading.downloadingData');
  if (typeof pullProgress === 'string' && pullProgress.startsWith('syncing ')) {
    return i18n.t('utils.progress.syncing', { target: pullProgress.replace('syncing ', '') });
  }
  switch (pullProgress) {
    case 'friends':
      return i18n.t('utils.progress.downloadingFriends');
    case 'transactions':
      return i18n.t('utils.progress.downloadingTransactions');
    case 'budgets':
      return i18n.t('utils.progress.downloadingBudgets');
    default:
      return i18n.t('sync.loading.downloadingData');
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
  { key: 'recent', label: i18n.t('friends.sortOptions.recent') },
  { key: 'name', label: i18n.t('friends.sortOptions.name') },
  { key: 'balance', label: i18n.t('friends.sortOptions.balance') },
] as const;

export const FILTER_OPTIONS = [
  { key: 'all', label: i18n.t('friends.filterOptions.all') },
  { key: 'you-owe', label: i18n.t('friends.filterOptions.you-owe') },
  { key: 'owes-you', label: i18n.t('friends.filterOptions.owes-you') },
  { key: 'settled', label: i18n.t('friends.filterOptions.settled') },
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

  if (diff === 0) return i18n.t('utils.date.today');
  if (diff === 1) return i18n.t('utils.date.yesterday');

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

export const formatDateLabel = (timestamp?: number): string => {
  if (!timestamp) {
    return i18n.t('utils.date.noRecentActivity');
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const WARNING_COLOR = '#E0AE49';

export const SORT_LABELS: Record<BudgetSortKey, string> = {
  recent: i18n.t('budget.sort.options.recent'),
  name: i18n.t('budget.sort.options.name'),
  usage: i18n.t('budget.sort.options.usage'),
};

export const getNextSortKey = (current: BudgetSortKey): BudgetSortKey => {
  if (current === 'recent') return 'name';
  if (current === 'name') return 'usage';
  return 'recent';
};

export const RANGE_OPTIONS = [
  { key: 'week', label: i18n.t('dashboard.rangeOptions.week') },
  { key: 'month', label: i18n.t('dashboard.rangeOptions.month') },
  { key: 'all', label: i18n.t('dashboard.rangeOptions.all') },
] as const;
