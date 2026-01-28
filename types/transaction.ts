import { Transaction } from "@/types/models";

export interface ITransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}