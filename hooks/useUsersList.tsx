import { filterUsers, getBalance } from "@/lib/utils";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export const useUsersList = () => {

  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const users = useUsersStore(useShallow((state) => state.users));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));

  const getUserBalance = useMemo(
    () => (userId: string) => getBalance(userId, transactions),
    [transactions]
  );

  const filteredUsers = useMemo(() => {
    const filtered = filterUsers(users, search);
    // Sort: pinned first, then by createdAt (most recent first)
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [users, search]);


  const { pinUser, unpinUser } = useUsersStore();

  const handlePinToggle = (userId: string) => {
    const user = filteredUsers.find((u) => u.id === userId);
    if (user) {
      if (user.pinned) {
        unpinUser(userId);
      } else {
        pinUser(userId);
      }
    }
  };

  return {
    filteredUsers,
    isGrid,
    setSearch,
    setIsGrid,
    getUserBalance,
    search,
    handlePinToggle
  };
};