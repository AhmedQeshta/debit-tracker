import { useBudgetStore } from "@/store/budgetStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useBudgetDetail = () => { 
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budget = useBudgetStore((state) => state.getBudget(id || ''));
  const {
    addItem,
    removeItem,
    getTotalSpent,
    getRemainingBudget,
  } = useBudgetStore();

  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemTitleError, setItemTitleError] = useState('');
  const [itemAmountError, setItemAmountError] = useState('');

 const totalSpent = getTotalSpent(budget?.id || '');
  const remaining = getRemainingBudget(budget?.id || '');


  const handleAddItem = () => {
    if (!itemTitle.trim()) {
      setItemTitleError('Title is required');
      return;
    }
    setItemTitleError('');

    const amount = parseFloat(itemAmount);
    if (isNaN(amount) || amount <= 0) {
      setItemAmountError('Amount must be a valid number > 0');
      return;
    }
    setItemAmountError('');

    addItem(budget?.id || '', itemTitle.trim(), amount);
    setItemTitle('');
    setItemAmount('');
  };

  const handleDeleteItem = (itemId: string, title: string) => {
    Alert.alert('Delete Item', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeItem(budget?.id || '', itemId),
      },
    ]);
  };

  return {
    itemTitle,
    setItemTitle,
    itemAmount,
    setItemAmount,
    itemTitleError,
    setItemTitleError,
    itemAmountError,
    setItemAmountError,
    handleAddItem,
    handleDeleteItem,
    totalSpent,
    remaining,
    budget,
    router,
    id,
    addItem,
    removeItem,
    getTotalSpent,
    getRemainingBudget,
  }
}