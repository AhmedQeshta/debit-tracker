import { Transaction } from "@/types/models";

export interface ITransactionItemProps {
  transaction: Transaction;
  currency?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export interface IEditTransactionFormData {
  amount: string;
  description: string;
}


export interface ITransactionFormData {
  friendId: string;
  amount: string;
  title: string;
  category: string;
  date: number;
  note?: string;
  isNegative: boolean;
}


export interface ITransactionScreenItemProps {
  item: Transaction;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, title: string) => void;
}
