import { createMenuItems } from '@/components/ui/CreateMenuItems';
import { useBudgetPeriod } from '@/hooks/budget/useBudgetPeriod';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { useToast } from '@/hooks/useToast';
import { safeId, validateAmount, validateTitle } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native';

export const useBudgetDetail = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemTitleError, setItemTitleError] = useState('');
  const [itemAmountError, setItemAmountError] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = safeId(id);
  // Select budget directly from store to avoid infinite loop (getBudget returns new object each time)
  const rawBudget = useBudgetStore((state) =>
    state.budgets.find((b) => b.id === budgetId && !b.deletedAt),
  );
  // Memoize filtered budget to create stable reference
  const budget = useMemo(() => {
    if (!rawBudget) return undefined;
    // Filter out deleted items
    return {
      ...rawBudget,
      items: rawBudget.items.filter((item) => !item.deletedAt),
    };
  }, [rawBudget]);
  const { addItem, removeItem, getTotalSpent, getRemainingBudget, deleteBudget } = useBudgetStore();

  const { navigateToBudgetEdit, navigateToBudgetList } = useNavigation();
  const { handleBudgetPinToggle: togglePin } = useOperations();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const { handleBudgetResetPeriod } = useBudgetPeriod();
  // Calculate from budget object to make it reactive to changes (exclude deleted items)
  const totalSpent = budget
    ? budget.items.filter((item) => !item.deletedAt).reduce((sum, item) => sum + item.amount, 0)
    : 0;
  const remaining = budget ? budget.totalBudget - totalSpent : 0;

  const handleAddItem = async (): Promise<void> => {
    const titleError = validateTitle(itemTitle);
    if (titleError) {
      setItemTitleError(titleError);
      return;
    }
    setItemTitleError('');

    const amountError = validateAmount(itemAmount, 1);
    if (amountError) {
      setItemAmountError(amountError);
      return;
    }
    setItemAmountError('');

    const amount = parseFloat(itemAmount);
    addItem(budgetId, itemTitle.trim(), amount);
    setItemTitle('');
    setItemAmount('');
    toastSuccess('Budget item added successfully');

    // Trigger sync to push addition to Supabase
    try {
      await syncNow();
    } catch (error) {
      console.error('[Sync] Failed to sync after add item:', error);
    }
  };

  const handleDeleteItem = (itemId: string, title: string): void => {
    showConfirm(
      'Delete Item',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        removeItem(budgetId, itemId);
        toastSuccess('Budget item deleted successfully');

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' },
    );
  };

  const handlePinToggle = (): void => {
    if (!budget) return;
    togglePin(budget);
  };

  const handleDeleteBudget = (): void => {
    if (!budget) return;
    showConfirm(
      'Delete Budget',
      `Are you sure you want to delete "${budget.title}"? This action cannot be undone.`,
      async () => {
        deleteBudget(budget.id);
        toastSuccess('Budget deleted successfully');

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }

        navigateToBudgetList();
      },
      { confirmText: 'Delete' },
    );
  };

  const handleEdit = (): void => {
    navigateToBudgetEdit(budgetId);
  };

  const menuItems = createMenuItems(
    'Budget',
    handleEdit,
    handleDeleteBudget,
    budget,
    handlePinToggle,
  );

  const sortedItems = useMemo(
    () => (budget ? [...budget.items].sort((a, b) => b.createdAt - a.createdAt) : []),
    [budget],
  );

  const daysUntilReset = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = Math.max(0, endOfMonth.getDate() - now.getDate());
    return diff;
  }, []);

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
    getTotalSpent,
    getRemainingBudget,
    menuVisible,
    setMenuVisible,
    showMoreFields,
    setShowMoreFields,
    titleInputRef,
    sortedItems,
    daysUntilReset,
    handleBudgetResetPeriod,
  };
};
