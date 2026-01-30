import { syncData } from "@/services/sync";
import { useSyncStore } from "@/store/syncStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useShallow } from "zustand/react/shallow";

export const useEditTransaction = () => {

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const transaction = useTransactionsStore(
    useShallow((state) => state.transactions.find((t) => t.id === id)),
  );
  const { updateTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setDescription(transaction.description);
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const isNegative = transaction.amount < 0;
    const finalAmount = isNegative ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    const updatedTransaction = {
      ...transaction,
      amount: finalAmount,
      description,
      synced: false,
    };

    updateTransaction(updatedTransaction);
    addToQueue({
      id: Math.random().toString(36).substring(7),
      type: 'transaction',
      action: 'update',
      payload: updatedTransaction,
    });

    syncData();
    router.back();
  };

  return {
    amount,
    setAmount,
    description,
    setDescription,
    handleSave,
    transaction,
    router
  };
};