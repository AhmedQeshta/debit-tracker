import { filterUsers, getBalance } from "@/lib/utils";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSyncStore } from "@/store/syncStore";

export const useUsersList = () => {
  const { pinUser, unpinUser, deleteUser } = useUsersStore();
  const { deleteTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();
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

  const handleUserEdit = (userId: string) => {
    router.push(`/user/${userId}/edit`);
  };

  const handleUserDelete = (userId: string, userName: string) => {
    const userTransactions = useTransactionsStore.getState().transactions.filter(
      (t) => t.userId === userId
    );

    Alert.alert('Delete User', `Are you sure you want to delete "${userName}" and all records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Delete all transactions for this user
          userTransactions.forEach((t) => {
            deleteTransaction(t.id);
            addToQueue({
              id: Math.random().toString(36).substring(7),
              type: 'transaction',
              action: 'delete',
              payload: { id: t.id },
            });
          });

          // Delete the user
          deleteUser(userId);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'user',
            action: 'delete',
            payload: { id: userId },
          });
        },
      },
    ]);
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