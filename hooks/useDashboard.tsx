import { getGlobalDebit, getTotalPaidBack } from "@/lib/utils";
import { subscribeToNetwork } from "@/services/net";
import { useSyncStore } from "@/store/syncStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

  export const useDashboard = () => {
    const users = useUsersStore(useShallow((state) => state.users));
    const transactions = useTransactionsStore(useShallow((state) => state.transactions));
    const queueSize = useSyncStore((state) => state.queue.length);
    const [isOnline, setIsOnline] = useState(true);
  
    useEffect(() => {
      const unsubscribe = subscribeToNetwork((connected) => {
        setIsOnline(connected);
      });
      return () => unsubscribe();
    }, []);
      
    const globalDebit = useMemo(() => getGlobalDebit(transactions), [transactions]);
    const totalPaidBack = useMemo(() => getTotalPaidBack(transactions), [transactions]);

    return {
      users,
      queueSize,
      isOnline,
      globalDebit,
      totalPaidBack,
    };
  };