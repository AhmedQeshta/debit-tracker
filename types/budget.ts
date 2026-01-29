import { Budget } from "@/types/models";

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

export interface IActionsProps{
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  budget: Budget;
  handlePinToggle: (id: string) => void;
  handleDeleteBudget: (id: string, title: string) => void;
}