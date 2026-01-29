import { SyncQueueItem, Transaction, User, BudgetItem, Budget } from "@/types/models";

export interface ISyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  addToQueue: (item: SyncQueueItem) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (status: boolean) => void;
  clearQueue: () => void;
}


export interface ITransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  markAsSynced: (id: string) => void;
}


export interface IUsersState {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setUsers: (users: User[]) => void;
  markAsSynced: (id: string) => void;
  pinUser: (id: string) => void;
  unpinUser: (id: string) => void;
}

export interface IBudgetState {
  budgets: Budget[];
  addBudget: (title: string, currency: string, totalBudget: number) => string;
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

