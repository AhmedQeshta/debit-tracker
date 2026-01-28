import { calculateLatestTransactions, getBalance } from "@/lib/utils";
import { useMemo } from "react";
import { Transaction } from "@/types/models";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useShallow } from "zustand/react/shallow";

export const useHome = () => {
  const latestUsers = useUsersStore(useShallow((state) => state.users.slice(0, 5)));

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