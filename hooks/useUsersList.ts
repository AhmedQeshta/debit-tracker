import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { filterUsers, getBalance } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { confirmDelete } from "@/lib/alert";
import { useUserSync } from "@/hooks/user/useUserSync";

export const useUsersList = () =>
{
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
    return [...filtered].sort((a, b) =>
      a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt
    );
  }, [users, search]);

  const handlePinToggle = (userId: string): void =>
  {
    const user = filteredUsers.find((u) => u.id === userId);
    if (user) user.pinned ? unpinUser(userId) : pinUser(userId);
  };

  const handleUserEdit = (userId: string): void => navigateToUserEdit(userId);

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
