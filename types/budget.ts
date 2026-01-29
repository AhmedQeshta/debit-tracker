import { Budget } from "@/types/models";

export interface ICurrencyPickerProps {
  currency: string;
  setCurrency: (currency: string) => void;
}


export interface IBudgetCardProps {
  item: Budget;
  handlePinToggle: (id: string) => void;
  handleDelete: (id: string, title: string) => void;
  router: any;
  getTotalSpent: (id: string) => number;
  getRemainingBudget: (id: string) => number;
}