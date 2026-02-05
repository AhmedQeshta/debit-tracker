import { SyncQueueItem, Transaction, Friend, Budget } from '@/types/models';

export type SyncStatus = 'idle' | 'checking' | 'pulling' | 'pushing' | 'success' | 'needs_config' | 'needs_login' | 'error' | null;

export interface DeviceSyncState {
  hasHydratedFromCloud: boolean;
  lastPullAt: number | null;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable?: boolean;
  type?: string;
}

export interface SyncError {
  code?: string;
  message: string;
  details?: any;
  at: number;
}

export interface ISyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  syncEnabled: boolean;
  lastSync: number | null;
  cloudUserId: string | null;
  syncStatus: SyncStatus;
  deviceSyncState: DeviceSyncState;
  lastError: SyncError | null;
  network: NetworkState;
  latencyMs?: number;
  isSyncRunning: boolean;
  pullProgress?: string; // Current step during pull: "friends", "transactions", "budgets", etc.
  addToQueue: (item: SyncQueueItem) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (status: boolean) => void;
  clearQueue: () => void;
  setSyncEnabled: (enabled: boolean) => void;
  setLastSync: (timestamp: number) => void;
  setCloudUserId: (id: string | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setHasHydratedFromCloud: (hasHydrated: boolean) => void;
  setLastPullAt: (timestamp: number | null) => void;
  setLastError: (error: SyncError | null) => void;
  setNetworkState: (state: NetworkState) => void;
  setLatencyMs: (ms: number | undefined) => void;
  setIsSyncRunning: (running: boolean) => void;
  setPullProgress: (progress: string | undefined) => void;
}

export interface ITransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  mergeTransactions: (transactions: Transaction[]) => void;
  markAsSynced: (id: string) => void;
  getDirtyTransactions: () => Transaction[];
  getDeletedTransactions: () => Transaction[];
  removeDeletedTransaction: (id: string) => void;
}

export interface IFriendsState {
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  updateFriend: (friend: Friend) => void;
  deleteFriend: (id: string) => void;
  setFriends: (friends: Friend[]) => void;
  mergeFriends: (friends: Friend[]) => void;
  markAsSynced: (id: string) => void;
  pinFriend: (id: string) => void;
  unpinFriend: (id: string) => void;
  getDirtyFriends: () => Friend[];
  getDeletedFriends: () => Friend[];
  removeDeletedFriend: (id: string) => void;
}

import { BudgetItem } from '@/types/models';

export interface IBudgetState {
  budgets: Budget[];
  addBudget: (title: string, currency: string, totalBudget: number, friendId: string) => string;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
  mergeBudgets: (budgets: Budget[]) => void;
  markAsSynced: (id: string) => void;
  pinBudget: (id: string) => void;
  unpinBudget: (id: string) => void;
  setCurrency: (id: string, currency: string) => void;
  setTotalBudget: (id: string, amount: number) => void;
  addItem: (budgetId: string, title: string, amount: number) => void;
  removeItem: (budgetId: string, itemId: string) => void;
  getTotalSpent: (budgetId: string) => number;
  getRemainingBudget: (budgetId: string) => number;
  getBudget: (id: string) => Budget | undefined;
  getDirtyBudgets: () => Budget[];
  getDirtyBudgetItems: () => BudgetItem[];
  markItemAsSynced: (budgetId: string, itemId: string) => void;
  getDeletedBudgets: () => Budget[];
  getDeletedBudgetItems: () => BudgetItem[];
  removeDeletedBudget: (id: string) => void;
  removeDeletedBudgetItem: (budgetId: string, itemId: string) => void;
}
