export interface Friend {
  id: string;
  name: string; // Keeping name for compatibility, though Prompt says "email" for Clerk users.
  email?: string; // Added optional email
  bio: string;
  imageUri: string | null;
  currency: string; // "$", "₪", "€"
  createdAt: number;
  updatedAt?: number;
  lastLogin?: number;
  lastSync?: number;
  synced: boolean;
  pinned: boolean;
}

export interface Transaction {
  id: string;
  friendId: string;
  title: string;
  amount: number; // supports + or -
  sign?: number; // 1 = add debt, -1 = reduce debt (optional for backward compatibility)
  category: string;
  date: number;
  note?: string;
  createdAt: number;
  updatedAt?: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'friend' | 'transaction' | 'budget' | 'budget_item';
  action: 'create' | 'update' | 'delete';
  payload: any;
}

export interface BudgetItem {
  id: string;
  friendId?: string; // Optional if linked via budget, but prompt says "friend_id"
  budgetId: string;
  title: string;
  amount: number; // price (positive number)
  createdAt: number;
  updatedAt?: number;
  synced?: boolean;
}

export interface Budget {
  id: string;
  friendId: string;
  title: string;
  currency: string; // "$", "₪", "€"
  totalBudget: number;
  items: BudgetItem[];
  pinned: boolean;
  createdAt: number;
  updatedAt?: number;
  synced?: boolean;
}
