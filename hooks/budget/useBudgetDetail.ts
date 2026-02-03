import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBudgetStore } from "@/store/budgetStore";
import { safeId, validateAmount, validateTitle } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { useOperations } from "@/hooks/useOperations";
import { confirmDelete } from "@/lib/alert";
import { createMenuItems } from "@/components/budget/createMenuItems";


export const useBudgetDetail = () =>
{
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = safeId(id);
  const budget = useBudgetStore((state) => state.getBudget(budgetId));
  const {
    addItem,
    removeItem,
    getTotalSpent,
    getRemainingBudget,
    deleteBudget,
  } = useBudgetStore();

  const { navigateToBudgetEdit, navigateToBudgetList } = useNavigation();
  const { handleBudgetPinToggle: togglePin } = useOperations();

  const [itemTitle, setItemTitle] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemTitleError, setItemTitleError] = useState("");
  const [itemAmountError, setItemAmountError] = useState("");

  // Calculate from budget object to make it reactive to changes (exclude deleted items)
  const totalSpent = budget ? budget.items.filter((item) => !item.deletedAt).reduce((sum, item) => sum + item.amount, 0) : 0;
  const remaining = budget ? budget.totalBudget - totalSpent : 0;

  const handleAddItem = (): void =>
  {
    const titleError = validateTitle(itemTitle);
    if (titleError)
    {
      setItemTitleError(titleError);
      return;
    }
    setItemTitleError("");

    const amountError = validateAmount(itemAmount, 1);
    if (amountError)
    {
      setItemAmountError(amountError);
      return;
    }
    setItemAmountError("");

    const amount = parseFloat(itemAmount);
    addItem(budgetId, itemTitle.trim(), amount);
    setItemTitle("");
    setItemAmount("");
  };

  const handleDeleteItem = (itemId: string, title: string): void =>
  {
    // confirmDelete(
    //   "Delete Item",
    //   `Are you sure you want to delete "${title}"?`,
    //   () => removeItem(budgetId, itemId)
    // );
    removeItem(budgetId, itemId)
  };

  const handlePinToggle = (): void =>
  {
    if (!budget) return;
    togglePin(budget);
  };

  const handleDeleteBudget = (): void =>
  {
    if (!budget) return;
    // confirmDelete(
    //   "Delete Budget",
    //   `Are you sure you want to delete "${budget.title}"? This action cannot be undone.`,
    //   () =>
    //   {
    //     deleteBudget(budget.id);
    //     navigateToBudgetList();
    //   }
    // );
    deleteBudget(budget.id);
    navigateToBudgetList();
  };

  const handleEdit = (): void =>
  {
    navigateToBudgetEdit(budgetId);
  };

  const menuItems = createMenuItems(
    budget,
    handlePinToggle,
    handleEdit,
    handleDeleteBudget
  );

  return {
    budget,
    router,
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
    handlePinToggle,
    handleDeleteBudget,
    menuItems,
  };
};
