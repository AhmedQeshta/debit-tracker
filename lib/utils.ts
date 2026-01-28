import { Transaction, User } from "@/types/models";

export const calculateLatestTransactions = (allTransactions: Transaction[]) => {
  return [...allTransactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
};

export const getBalance = (userId: string, allTransactions: Transaction[]) => {
  return allTransactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
};


export const filterUsers = (users: User[], search: string) => {
  return users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
};


export const getGlobalDebit = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const getTotalPaidBack = (transactions: Transaction[]) => {
  return transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
};

export const getFinalAmount = (amount: string, isNegative: boolean) => {
  if (!amount || isNaN(Number(amount))) {
    return 0;
  }
  return isNegative ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
};
