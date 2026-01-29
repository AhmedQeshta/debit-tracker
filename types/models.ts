export interface User {
  id: string;
  name: string;
  bio: string;
  imageUri: string | null;
  createdAt: number;
  synced: boolean;
  pinned: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // supports + or -
  description: string;
  createdAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'user' | 'transaction';
  action: 'create' | 'update' | 'delete';
  payload: any;
}

export interface BudgetItem {
  id: string;
  title: string;
  amount: number; // price (positive number)
  createdAt: number;
}

export interface Budget {
  id: string;
  title: string;
  currency: string;   // "$", "₪", "€"
  totalBudget: number;
  items: BudgetItem[];
  pinned: boolean;
  createdAt: number;
}
