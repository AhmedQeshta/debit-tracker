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

  const filteredUsers = useMemo(
    () => filterUsers(users, search),
    [users, search]
  );

  return {
    filteredUsers,
    isGrid,
    setSearch,
    setIsGrid,
    getUserBalance,
    search
  };
};