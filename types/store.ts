import { SyncQueueItem, Transaction, User } from "@/types/models";

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

