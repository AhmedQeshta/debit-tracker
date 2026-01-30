import { showError } from "@/lib/alert";
import { generateId, getFinalAmount } from "@/lib/utils";
import { syncData } from "@/services/sync";
import { useSyncStore } from "@/store/syncStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useShallow } from "zustand/react/shallow";

export const useTransaction = () => {
  const { userId: initialUserId } = useLocalSearchParams<{ userId: string }>();
  const [userId, setUserId] = useState(initialUserId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isNegative, setIsNegative] = useState(true);

  const users = useUsersStore(useShallow((state) => state.users));
  const { addTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();

  const selectedUser = users.find((u) => u.id === userId);

  const handleSave = () => {
    if (!userId) {
      showError('Error', 'Please select a user');
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      showError('Error', 'Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      showError('Error', 'Description is required');
      return;
    }


    const newTransaction = {
      id: generateId(),
      userId,
      amount: getFinalAmount(amount, isNegative),
      description,
      createdAt: Date.now(),
      synced: false,
    };

    addTransaction(newTransaction);
    addToQueue({
      id: generateId(),
      type: 'transaction',
      action: 'create',
      payload: newTransaction,
    });

    syncData();
    router.back();
  };

  return {
    users,
    userId, 
    setUserId, 
    isNegative, 
    setIsNegative, 
    amount, 
    setAmount, 
    description, 
    setDescription, 
    handleSave,
    selectedUser,
  };
};