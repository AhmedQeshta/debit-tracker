import { Colors } from '@/theme/colors';
import { Budget, Friend, Transaction } from '@/types/models';

export const calculateLatestTransactions = (allTransactions: Transaction[]) => {
  return [...allTransactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
};

export const getBalance = (friendId: string, allTransactions: Transaction[]) => {
  return allTransactions
    .filter((t) => t.friendId === friendId)
    .reduce((sum, t) => sum + getBalanceWithSign(t.amount,t.sign), 0);
};

export const getBalanceWithSign = (amount:number,sign:number) =>{
  return amount * sign;
}

export const filterFriends = (friends: Friend[], search: string) => {
  return friends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
};

export const getGlobalDebit = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const getTotalPaidBack = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
};

export const getFinalAmount = (amount: string) => {
  if (!amount || isNaN(Number(amount))) return 0;
  return Number(amount);
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
  if (variant === 'outline') return [styles.text, { color: Colors.primary }];
  return styles.text;
};

export const CURRENCIES = [
  { symbol: '$', label: 'USD' },
  { symbol: '₪', label: 'ILS' },
  { symbol: '€', label: 'EUR' },
];

export const formatCurrency = (amount: number, currency: string) => {
  return `${currency || '$'} ${amount.toFixed(2)}`;
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
