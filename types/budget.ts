import { Budget } from '@/types/models';

/**
 * Type definitions for form data and errors
 */
export interface BudgetFormData {
  title: string;
  currency: string;
  totalBudget: string;
}

export interface ItemFormData {
  title: string;
  amount: string;
}

export interface FormErrors {
  title?: string;
  amount?: string;
  budget?: string;
}

export interface ICurrencyPickerProps {
  currency: string;
  setCurrency: (currency: string) => void;
}

export interface IBudgetCardProps {
  item: Budget;
  handlePinToggle: (id: string) => void;
  handleDelete: (id: string, title: string) => void;
  handleResetPeriod: (id: string, title: string) => void;
  getTotalSpent: (id: string) => number;
  getRemainingBudget: (id: string) => number;
  onCopyAmount: (budgetId: string) => void;
}

export interface IBudgetFormData {
  title: string;
  currency: string;
  totalBudget: string;
}

export type BudgetSortKey = 'recent' | 'name' | 'usage';

export interface HomeBudgetOverviewCardProps {
  budget: Budget;
  spent: number;
  progress: number;
  warningLabel: string | null;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onPinToggle: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onCopyRemaining: (remaining: number, currency: string) => void;
  onResetPeriod: (id: string, title: string) => void;
}
