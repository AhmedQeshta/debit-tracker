import { calculateLatestTransactions, getBalance } from "@/lib/utils";
import { useMemo } from "react";
import { Transaction } from "@/types/models";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useShallow } from "zustand/react/shallow";

export const useHome = () => {
  const allUsers = useUsersStore(useShallow((state) => state.users));
  
  const latestUsers = useMemo(() => {
    // Sort: pinned first, then by createdAt (most recent first)
    const sorted = [...allUsers].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
    return sorted.slice(0, 5);
  }, [allUsers]);

  const allTransactions = useTransactionsStore(useShallow((state) => state.transactions));

  const latestTransactions = useMemo(
    () => calculateLatestTransactions(allTransactions),
    [allTransactions]
  );

  const getUserBalance = useMemo(
    () => (userId: string) => getBalance(userId, allTransactions),
    [allTransactions]
  );

  
  return {
    latestTransactions,
    getUserBalance,
    latestUsers,
  };
};