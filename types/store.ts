import {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetMetrics,
  Friend,
  SyncQueueItem,
  Transaction,
} from '@/types/models';

export type SyncStatus =
  | 'idle'
  | 'checking'
  | 'pulling'
  | 'pushing'
  | 'success'
  | 'needs_config'
  | 'needs_login'
  | 'error'
  | null;

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
  isSigningOut: boolean;
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
  updateQueueItem: (id: string, patch: Partial<SyncQueueItem>) => void;
  removeFromQueue: (id: string) => void;
  clearQueueForFriend: (friendId: string, transactionIds?: string[]) => void;
  setSyncing: (status: boolean) => void;
  setIsSigningOut: (status: boolean) => void;
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
  settleTransactionsByFriendId: (friendId: string) => string[];
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
  setCurrency: (id: string, currency: string) => void;
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
  addItem: (budgetId: string, title: string, amount: number, type?: BudgetItemType) => void;
  updateItem: (
    budgetId: string,
    itemId: string,
    updates: Partial<Pick<BudgetItem, 'title' | 'amount' | 'type'>>,
  ) => void;
  upsertItemFromTransaction: (transaction: Transaction, budgetId?: string) => BudgetItem | null;
  removeItemByTransactionId: (transactionId: string) => BudgetItem | null;
  removeItem: (budgetId: string, itemId: string) => void;
  getTotalSpent: (budgetId: string) => number;
  getRemainingBudget: (budgetId: string) => number;
  getBudgetMetrics: (budgetId: string) => BudgetMetrics;
  getBudget: (id: string) => Budget | undefined;
  getDirtyBudgets: () => Budget[];
  getDirtyBudgetItems: () => BudgetItem[];
  markItemAsSynced: (budgetId: string, itemId: string) => void;
  markItemAsSyncedV2: (
    budgetId: string,
    itemId: string,
    canonicalRecord?: Partial<BudgetItem>,
  ) => void;
  markItemAsPending: (budgetId: string, itemId: string) => void;
  markItemAsFailed: (budgetId: string, itemId: string, errorMessage: string) => void;
  getPendingBudgetItems: () => BudgetItem[];
  getFailedBudgetItems: () => BudgetItem[];
  addBudgetItemOnline: (
    budgetId: string,
    title: string,
    amount: number,
    type?: string,
    userId?: string,
    ownerId?: string,
  ) => Promise<BudgetItem>;
  addBudgetItemOffline: (
    budgetId: string,
    title: string,
    amount: number,
    type?: string,
  ) => BudgetItem;
  addBudgetItemSmart: (
    budgetId: string,
    title: string,
    amount: number,
    type?: string,
    userId?: string,
    ownerId?: string,
    forceOffline?: boolean,
  ) => Promise<{ item: BudgetItem; isOnline: boolean }>;
  getDeletedBudgets: () => Budget[];
  getDeletedBudgetItems: () => BudgetItem[];
  removeDeletedBudget: (id: string) => void;
  removeDeletedBudgetItem: (budgetId: string, itemId: string) => void;
}
