import { getGlobalDebit, getTotalPaidBack, getBalance } from "@/lib/utils";
import { subscribeToNetwork } from "@/services/net";
import { useSyncStore } from "@/store/syncStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

  export const useDashboard = () => {
    const users = useUsersStore(useShallow((state) => state.users));
    const transactions = useTransactionsStore(useShallow((state) => state.transactions));
    const budgets = useBudgetStore(useShallow((state) => state.budgets));
    const queueSize = useSyncStore((state) => state.queue.length);
    const [isOnline, setIsOnline] = useState(true);


    const router = useRouter();

    const { unpinUser } = useUsersStore();
    const { unpinBudget, getTotalSpent, getRemainingBudget } = useBudgetStore();
   
    
  
    useEffect(() => {
      const unsubscribe = subscribeToNetwork((connected) => {
        setIsOnline(connected);
      });
      return () => unsubscribe();
    }, []);
      
    const globalDebit = useMemo(() => getGlobalDebit(transactions), [transactions]);
    const totalPaidBack = useMemo(() => getTotalPaidBack(transactions), [transactions]);
    
    const pinnedUsers = useMemo(() => {
      return users.filter((user) => user.pinned);
    }, [users]);
    
    const pinnedCount = pinnedUsers.length;

    const pinnedBudgets = useMemo(() => {
      return budgets.filter((budget) => budget.pinned);
    }, [budgets]);

    const pinnedBudgetCount = pinnedBudgets.length;
    
    const getUserBalance = useMemo(
      () => (userId: string) => getBalance(userId, transactions),
      [transactions]
    );

    const getBudgetTotalSpent = useMemo(
      () => (budgetId: string) => getTotalSpent(budgetId),
      [getTotalSpent]
    );

    const getBudgetRemaining = useMemo(
      () => (budgetId: string) => getRemainingBudget(budgetId),
      [getRemainingBudget]
    );

    const handleUnpin = (userId: string, e: any) => {
      e.stopPropagation();
      unpinUser(userId);
    };

    const handleUnpinBudget = (budgetId: string, e: any) => {
      e.stopPropagation();
      unpinBudget(budgetId);
    };

    return {
      users,
      queueSize,
      isOnline,
      globalDebit,
      totalPaidBack,
      pinnedUsers,
      pinnedCount,
      pinnedBudgets,
      pinnedBudgetCount,
      getUserBalance,
      getBudgetTotalSpent,
      getBudgetRemaining,
      handleUnpin,
      handleUnpinBudget,
      router
    };
  };