import { getFinalAmount } from "@/lib/utils";
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
      Alert.alert('Error', 'Please select a user');
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }


    const newTransaction = {
      id: Math.random().toString(36).substring(7),
      userId,
      amount: getFinalAmount(amount, isNegative),
      description,
      createdAt: Date.now(),
      synced: false,
    };

    addTransaction(newTransaction);
    addToQueue({
      id: Math.random().toString(36).substring(7),
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