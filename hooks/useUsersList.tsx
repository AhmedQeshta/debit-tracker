import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { filterUsers, getBalance } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { confirmDelete } from "@/lib/alert";
import { useUserSync } from "@/hooks/user/useUserSync";

export const useUsersList = () =>
{
  const router = useRouter();
  const { pinUser, unpinUser, deleteUser } = useUsersStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToUserEdit } = useNavigation();
  const { addToSyncQueue } = useUserSync();
  const [search, setSearch] = useState("");
  const [isGrid, setIsGrid] = useState(false);
  const users = useUsersStore(useShallow((state) => state.users));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions)
  );

  const getUserBalance = useMemo(
    () => (userId: string) => getBalance(userId, transactions),
    [transactions]
  );

  const filteredUsers = useMemo(() =>
  {
    const filtered = filterUsers(users, search);
    // Sort: pinned first, then by createdAt (most recent first)
    return [...filtered].sort((a, b) =>
    {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [users, search]);

  const handlePinToggle = (userId: string): void =>
  {
    const user = filteredUsers.find((u) => u.id === userId);
    if (user)
    {
      if (user.pinned)
      {
        unpinUser(userId);
      } else
      {
        pinUser(userId);
      }
    }
  };

  const handleUserEdit = (userId: string): void =>
  {
    navigateToUserEdit(userId);
  };

  const handleUserDelete = (userId: string, userName: string): void =>
  {
    const userTransactions = useTransactionsStore
      .getState()
      .transactions.filter((t) => t.userId === userId);

    confirmDelete(
      "Delete User",
      `Are you sure you want to delete "${userName}" and all records?`,
      () =>
      {
        // Delete all transactions for this user
        userTransactions.forEach((t) =>
        {
          deleteTransaction(t.id);
          addToSyncQueue("transaction", "delete", { id: t.id });
        });

        // Delete the user
        deleteUser(userId);
        addToSyncQueue("user", "delete", { id: userId });
      }
    );
  };

  return {
    filteredUsers,
    isGrid,
    setSearch,
    setIsGrid,
    getUserBalance,
    search,
    handlePinToggle,
    handleUserEdit,
    handleUserDelete,
  };
};
