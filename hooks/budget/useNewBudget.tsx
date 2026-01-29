import { useBudgetStore } from "@/store/budgetStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useNewBudget = () => {
  const router = useRouter();
  const { addBudget } = useBudgetStore();
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('$');
  const [totalBudget, setTotalBudget] = useState('');
  const [titleError, setTitleError] = useState('');
  const [budgetError, setBudgetError] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');

    const amount = parseFloat(totalBudget);
    if (isNaN(amount) || amount < 0) {
      setBudgetError('Budget must be a valid number >= 0');
      return;
    } 
    setBudgetError('');

    const budgetId = addBudget(title.trim(), currency, amount);
    Alert.alert('Success', 'Budget created successfully', [
      {
        text: 'OK',
        onPress: () => router.push(`/(drawer)/budget/${budgetId}`),
      },
    ]);
  };

  return {
    title,
    setTitle,
    currency,
    setCurrency,
    totalBudget,
    setTotalBudget,
    titleError,
    budgetError,
    handleSave,
    router,
    setTitleError,
    setBudgetError,
  };
};