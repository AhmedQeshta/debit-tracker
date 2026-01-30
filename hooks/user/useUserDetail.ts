import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUsersStore } from "@/store/usersStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useShallow } from "zustand/react/shallow";
import { getUserBalance, safeId } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { useUserSync } from "@/hooks/user/useUserSync";
import { useUserOperations } from "@/hooks/user/useUserOperations";
import { confirmDelete } from "@/lib/alert";


export const useUserDetail = () =>
{
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = safeId(id);
  const user = useUsersStore((state) => state.users.find((u) => u.id === userId));
  const { deleteUser } = useUsersStore();
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => t.userId === userId))
  );
  const { deleteTransaction } = useTransactionsStore();

  const { navigateToUserEdit, navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useUserSync();
  const { handlePinToggle: togglePin } = useUserOperations();

  const balance = useMemo(() => getUserBalance(transactions), [transactions]);

  const handleEditUser = (): void =>
  {
    if (!userId) return;
    navigateToUserEdit(userId);
  };

  const handleDeleteUser = (): void =>
  {
    if (!user || !userId) return;

    confirmDelete(
      "Delete User",
      "Are you sure you want to delete this user and all records?",
      async () =>
      {
        // Delete all transactions for this user
        transactions.forEach((t) =>
        {
          deleteTransaction(t.id);
          addToSyncQueue("transaction", "delete", { id: t.id });
        });

        // Delete the user
        deleteUser(userId);
        addToSyncQueue("user", "delete", { id: userId });

        navigateBack();
      }
    );
  };

  const handleEditTransaction = (transactionId: string): void =>
  {
    router.push(`/transaction/${transactionId}/edit`);
  };

  const handleDeleteTransaction = (transactionId: string): void =>
  {
    confirmDelete(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      () =>
      {
        deleteTransaction(transactionId);
        addToSyncQueue("transaction", "delete", { id: transactionId });
      }
    );
  };

  const handlePinToggle = (): void =>
  {
    if (!user) return;
    togglePin(user);
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
    id: userId,
  };
};

