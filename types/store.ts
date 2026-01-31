import { SyncQueueItem, Transaction, Friend, BudgetItem, Budget } from '@/types/models';

export interface ISyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  syncEnabled: boolean;
  lastSync: number | null;
  addToQueue: (item: SyncQueueItem) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (status: boolean) => void;
  clearQueue: () => void;
  setSyncEnabled: (enabled: boolean) => void;
  setLastSync: (timestamp: number) => void;
}

export interface ITransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  markAsSynced: (id: string) => void;
}

export interface IFriendsState {
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  updateFriend: (friend: Friend) => void;
  deleteFriend: (id: string) => void;
  setFriends: (friends: Friend[]) => void;
  markAsSynced: (id: string) => void;
  pinFriend: (id: string) => void;
  unpinFriend: (id: string) => void;
}

export interface IBudgetState {
  budgets: Budget[];
  addBudget: (title: string, currency: string, totalBudget: number, friendId: string) => string;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  pinBudget: (id: string) => void;
  unpinBudget: (id: string) => void;
  setCurrency: (id: string, currency: string) => void;
  setTotalBudget: (id: string, amount: number) => void;
  addItem: (budgetId: string, title: string, amount: number) => void;
  removeItem: (budgetId: string, itemId: string) => void;
  getTotalSpent: (budgetId: string) => number;
  getRemainingBudget: (budgetId: string) => number;
  getBudget: (id: string) => Budget | undefined;
}
