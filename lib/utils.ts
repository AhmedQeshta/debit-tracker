import { Transaction } from "@/types/models";

export const calculateLatestTransactions = (allTransactions: Transaction[]) => {
  return [...allTransactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
};

export const getBalance = (userId: string, allTransactions: Transaction[]) => {
  return allTransactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
};