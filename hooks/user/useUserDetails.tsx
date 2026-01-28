import { useLocalSearchParams, useRouter } from "expo-router";
import { useUsersStore } from "@/store/usersStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useSyncStore } from "@/store/syncStore";
import { useShallow } from "zustand/react/shallow";
import { Alert } from "react-native";
import { getUserBalance } from "@/lib/utils";
import { useMemo } from "react";

export const useUserDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const user = useUsersStore((state) => state.users.find((u) => u.id === id));
  const { deleteUser, pinUser, unpinUser } = useUsersStore();
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => t.userId === id)),
  );
  const { deleteTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();


  const balance = useMemo(() => getUserBalance(transactions), [transactions]);

  const handleEditUser = () => {
    if (!id) return;
    router.push(`/user/${id}/edit`);
  };

  const handleDeleteUser = () => {
    if (!user || !id) return;

    Alert.alert('Delete User', 'Are you sure you want to delete this user and all records?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Delete all transactions for this user
          transactions.forEach((t) => {
            deleteTransaction(t.id);
            addToQueue({
              id: Math.random().toString(36).substring(7),
              type: 'transaction',
              action: 'delete',
              payload: { id: t.id },
            });
          });

          // Delete the user
          deleteUser(id);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'user',
            action: 'delete',
            payload: { id },
          });

          router.back();
        },
      },
    ]);
  };

  const handleEditTransaction = (transactionId: string) => {
    router.push(`/transaction/${transactionId}/edit`);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transactionId);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'transaction',
            action: 'delete',
            payload: { id: transactionId },
          });
        },
      },
    ]);
  };

  const handlePinToggle = () => {
    if (!user || !id) return;
    if (user.pinned) {
      unpinUser(id);
    } else {
      pinUser(id);
    }
  };

  return {
    user,
    transactions,
    balance,
    handleEditUser,
    handleDeleteUser,
    handleEditTransaction,
    handleDeleteTransaction,
    handlePinToggle,
    router,
    id
  };
};