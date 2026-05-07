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
  deletedAt?: number; // Timestamp when marked for deletion (pending sync)
}

export interface Transaction {
  id: string;
  friendId: string;
  budgetId?: string;
  title: string;
  amount: number; // supports + or -
  sign: number; // 1 = add debt, -1 = reduce debt (optional for backward compatibility)
  date: number;
  note?: string;
  createdAt: number;
  updatedAt?: number;
  synced: boolean;
  deletedAt?: number; // Timestamp when marked for deletion (pending sync)
}

export interface SyncQueueItem {
  id: string;
  type:
    | 'friend'
    | 'transaction'
    | 'budget'
    | 'budget_item'
    | 'settle_friend'
    | 'friend_pin'
    | 'budget_pin';
  action: 'create' | 'update' | 'delete' | 'settle';
  operation?:
    | 'FRIEND_UPSERT'
    | 'FRIEND_CURRENCY_UPDATE'
    | 'FRIEND_PIN_TOGGLE'
    | 'TX_UPSERT'
    | 'TX_DELETE'
    | 'BUDGET_UPSERT'
    | 'BUDGET_UPDATE_TOTAL'
    | 'BUDGET_PIN_TOGGLE'
    | 'BUDGET_ITEM_UPDATE'
    | 'BUDGET_ITEM_UPSERT'
    | 'BUDGET_ITEM_DELETE'
    | 'BUDGET_RECALC'
    | 'SETTLE_FRIEND';
  ownerId?: string | null;
  userId?: string | null;
  entityId?: string;
  createdAt?: number;
  attempts?: number;
  lastError?: string;
  status?: 'pending' | 'processing' | 'synced' | 'failed';
  payload: any;
}

export type SyncStatus = 'synced' | 'pending' | 'failed';

export type BudgetItemType = 'expense' | 'income';

export interface BudgetMetrics {
  totalSpent: number;
  totalIncome: number;
  netSpent: number;
  remaining: number;
  progressRatio: number;
  isOverspent: boolean;
}

export interface BudgetItem {
  id: string;
  friendId?: string; // Optional if linked via budget, but prompt says "friend_id"
  budgetId: string;
  transactionId?: string;
  title: string;
  amount: number; // price (positive number)
  type?: BudgetItemType; // missing type in legacy rows is treated as expense
  createdAt: number;
  updatedAt?: number;
  synced?: boolean;
  sync_status?: SyncStatus;
  lastError?: string;
  deletedAt?: number; // Timestamp when marked for deletion (pending sync)
}

export interface Budget {
  id: string;
  friendId: string;
  title: string;
  currency: string; // "$", "₪", "€"
  totalBudget: number;
  items: BudgetItem[];
  pinned: boolean;
  archivedAt?: number;
  createdAt: number;
  updatedAt?: number;
  synced?: boolean;
  deletedAt?: number; // Timestamp when marked for deletion (pending sync)
  totalSpent?: number;
  totalIncome?: number;
  netSpent?: number;
  remaining?: number;
  isOverspent?: boolean;
}
