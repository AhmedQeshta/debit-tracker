import { getGlobalDebit, getTotalPaidBack, getBalance } from "@/lib/utils";
import { subscribeToNetwork } from "@/services/net";
import { useSyncStore } from "@/store/syncStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

  export const useDashboard = () => {
    const users = useUsersStore(useShallow((state) => state.users));
    const transactions = useTransactionsStore(useShallow((state) => state.transactions));
    const queueSize = useSyncStore((state) => state.queue.length);
    const [isOnline, setIsOnline] = useState(true);


    const router = useRouter();

    const { unpinUser } = useUsersStore();
   
    
  
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
    
    const getUserBalance = useMemo(
      () => (userId: string) => getBalance(userId, transactions),
      [transactions]
    );

    const handleUnpin = (userId: string, e: any) => {
      e.stopPropagation();
      unpinUser(userId);
    };

    return {
      users,
      queueSize,
      isOnline,
      globalDebit,
      totalPaidBack,
      pinnedUsers,
      pinnedCount,
      getUserBalance,
      handleUnpin,
      router
    };
  };