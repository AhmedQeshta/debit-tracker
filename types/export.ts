import { GetTokenFunction } from '@/services/authSync';
import { Budget, Friend, Transaction } from '@/types/models';

export type ExportFormat = 'csv' | 'json';
export type ExportDetailLevel = 'summary' | 'detailed';
export type ExportSource = 'local' | 'supabase';

export type ExportScope = {
  friends?: boolean;
  budgets?: boolean;
  includeBudgetItems?: boolean;
  includeFriendTransactions?: boolean;
  friendId?: string;
  budgetId?: string;
};

export type ExportDeliveryMode = 'save' | 'share';

export type ExportFileDescriptor = {
  name: string;
  uri: string;
  mimeType: string;
};

export type ExportFilePayload = {
  name: string;
  content: string;
  mimeType: string;
};

export type ExportOptions = {
  format: ExportFormat;
  detailLevel: ExportDetailLevel;
  scope: ExportScope;
  source: ExportSource;
  cloudUserId?: string | null;
  getToken?: GetTokenFunction;
  deliveryMode?: ExportDeliveryMode;
  fileNamePrefix?: string;
};

export type ExportAndSaveOptions = {
  format: ExportFormat;
  scope: ExportScope;
  source: ExportSource;
  cloudUserId?: string | null;
  getToken?: GetTokenFunction;
  detailLevel?: ExportDetailLevel;
  deliveryMode?: ExportDeliveryMode;
  fileNamePrefix?: string;
};

export type ExportResult = {
  files: ExportFileDescriptor[];
  warnings: string[];
  usedSource: ExportSource;
  deliveryMode: ExportDeliveryMode;
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

export type JsonBuildInput = {
  source: ExportSource;
  detailLevel: ExportDetailLevel;
  friends: FriendExportRow[];
  budgets: BudgetExportRow[];
  friendTransactions: FriendTransactionExportRow[];
  budgetItems: BudgetItemExportRow[];
  fileNamePrefix?: string;
};

export type CsvBuildInput = {
  scope: ExportScope;
  friends: FriendExportRow[];
  budgets: BudgetExportRow[];
  friendTransactions: FriendTransactionExportRow[];
  budgetItems: BudgetItemExportRow[];
};

export type PersistOptions = {
  deliveryMode?: ExportDeliveryMode;
};

export type PersistResult = {
  files: ExportFileDescriptor[];
  warnings: string[];
  deliveryMode: ExportDeliveryMode;
};

export type BudgetExportScopeMode = 'all' | 'selected';

export type OpenBudgetExportModalOptions = {
  budgetId?: string;
};

export type BudgetExportModalProps = {
  visible: boolean;
  format: ExportFormat;
  onChangeFormat: (format: ExportFormat) => void;
  includeBudgetItems: boolean;
  onChangeIncludeBudgetItems: (value: boolean) => void;
  scopeMode: 'all' | 'selected';
  onChangeScopeMode: (scopeMode: 'all' | 'selected') => void;
  canUseSelectedScope: boolean;
  loading?: boolean;
  onClose: () => void;
  onSaveToDevice: () => void;
  onShare: () => void;
};
