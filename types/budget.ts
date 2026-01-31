import { Budget } from "@/types/models";

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
  getTotalSpent: (id: string) => number;
  getRemainingBudget: (id: string) => number;
}

export interface IBudgetFormData {
  title: string;
  currency: string;
  totalBudget: string;
}
