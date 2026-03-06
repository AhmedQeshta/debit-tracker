import { Transaction } from '@/types/models';

export type TransactionFilterBy = 'all' | 'you-paid' | 'they-paid' | 'pending' | 'settled';
export type TransactionSortBy = 'newest' | 'oldest' | 'amount';
export type TransactionSyncStatus = 'pending' | 'synced' | 'failed';

export interface ITransactionRow {
  transaction: Transaction;
  friendName: string;
  title: string;
  subtitle: string;
  amountText: string;
  amountDirectionLabel: 'Paid' | 'Received';
  amountTone: 'positive' | 'negative';
  dateText: string;
  timeText: string;
  syncStatus: TransactionSyncStatus;
}

export interface ITransactionSection {
  title: string;
  data: ITransactionRow[];
}

export interface ITransactionItemProps {
  transaction: Transaction;
  currency?: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export interface IEditTransactionFormData {
  amount: string;
  description: string;
  isNegative: boolean;
}

export interface ITransactionFormData {
  friendId: string;
  amount: string;
  title: string;
  date: number;
  note?: string;
  isNegative: boolean;
}

export interface ITransactionScreenItemProps {
  row: ITransactionRow;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, title: string) => void;
  onSettle?: (friendId: string) => void;
  onPress?: (id: string) => void;
}
