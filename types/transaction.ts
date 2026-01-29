import { Transaction } from "@/types/models";

export interface ITransactionItemProps {
  transaction: Transaction;
  currency?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}