import { GetTokenFunction } from '@/services/authSync';
import { Budget, Friend, Transaction } from '@/types/models';

export type ExportFormat = 'csv' | 'json';
export type ExportDetailLevel = 'summary' | 'detailed';
export type ExportSource = 'local' | 'supabase';

export type ExportScope = {
  friends: boolean;
  budgets: boolean;
  includeBudgetItems?: boolean;
  includeFriendTransactions?: boolean;
  friendId?: string;
};

export type ExportFileDescriptor = {
  name: string;
  uri: string;
  mimeType: string;
};

export type ExportOptions = {
  format: ExportFormat;
  detailLevel: ExportDetailLevel;
  scope: ExportScope;
  source: ExportSource;
  cloudUserId?: string | null;
  getToken?: GetTokenFunction;
};

export type ExportResult = {
  files: ExportFileDescriptor[];
  warnings: string[];
  usedSource: ExportSource;
};

export type FriendExportRow = {
  friendId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  netBalance: number;
  youOwe: number;
  owedToYou: number;
  lastTransactionDate: string;
  pendingSyncCount: number;
};

export type FriendTransactionExportRow = {
  transactionId: string;
  friendId: string;
  friendName: string;
  title: string;
  signedAmount: number;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  source: 'manual' | 'transaction';
  budgetId: string;
  budgetName: string;
  syncStatus: 'pending' | 'synced';
};

export type BudgetExportRow = {
  budgetId: string;
  name: string;
  currency: string;
  period: 'month' | 'week' | 'custom';
  startDate: string;
  endDate: string;
  limit: number;
  totalSpent: number;
  totalIncome: number;
  remaining: number;
  progressPercent: number;
  itemsCount: number;
  lastUpdatedAt: string;
};

export type BudgetItemExportRow = {
  itemId: string;
  budgetId: string;
  title: string;
  signedAmount: number;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  source: 'manual' | 'transaction';
  transactionId: string;
  syncStatus: 'pending' | 'synced';
};

export type ExportJsonPayload = {
  exportedAt: string;
  source: ExportSource;
  friends: FriendExportRow[];
  friendTransactions?: FriendTransactionExportRow[];
  budgets: BudgetExportRow[];
  budgetItems?: BudgetItemExportRow[];
};

export type ExportDataBundle = {
  friends: Friend[];
  transactions: Transaction[];
  budgets: Budget[];
  warnings: string[];
  usedSource: ExportSource;
};
