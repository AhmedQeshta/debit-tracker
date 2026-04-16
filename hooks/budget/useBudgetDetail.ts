import { createMenuItems } from '@/components/ui/CreateMenuItems';
import { useBudgetAmount } from '@/hooks/budget/useBudgetAmount';
import { useBudgetPeriod } from '@/hooks/budget/useBudgetPeriod';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { useToast } from '@/hooks/useToast';
import { clampNetSpentForDisplay } from '@/lib/budgetMath';
import { calculateBudgetMetrics, safeId, validateAmount, validateTitle } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useSyncStore } from '@/store/syncStore';
import { BudgetItemType } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native';

export const useBudgetDetail = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemType, setItemType] = useState<BudgetItemType>('expense');
  const [itemTitleError, setItemTitleError] = useState('');
  const [itemAmountError, setItemAmountError] = useState('');

  const [showCalculator, setShowCalculator] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

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
  const { handleBudgetAmountCopy } = useBudgetAmount();
  const { syncNow } = useCloudSync();
  const { mutate } = useSyncMutation();
  const syncStatus = useSyncStore((state) => state.syncStatus);
  const { handleBudgetResetPeriod } = useBudgetPeriod();
  // Calculate from budget object to make it reactive to changes (exclude deleted items)
  const metrics = budget
    ? calculateBudgetMetrics(budget.items, budget.totalBudget)
    : {
        totalSpent: 0,
        totalIncome: 0,
        netSpent: 0,
        remaining: 0,
        progressRatio: 0,
        isOverspent: false,
      };

  const rawNetSpent = metrics.netSpent;
  // We preserve rawNetSpent for remaining/overspent logic, but clamp for display usage metrics.
  const displayNetSpent = clampNetSpentForDisplay(rawNetSpent);
  const remaining = metrics.remaining;

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
    addItem(budgetId, itemTitle.trim(), amount, itemType);
    setItemTitle('');
    setItemAmount('');
    setItemType('expense');
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

  const handleRetrySync = async (): Promise<void> => {
    try {
      await syncNow();
    } catch (error) {
      console.error('[Sync] Retry failed:', error);
    }
  };
  const handlePinToggle = async (): Promise<void> => {
    if (!budget) return;
    togglePin(budget);
    await mutate('budget_pin', 'update', {
      id: budget.id,
      budgetId: budget.id,
      pinned: !budget.pinned,
      updatedAt: Date.now(),
    });
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
    itemType,
    setItemType,
    itemTitleError,
    setItemTitleError,
    itemAmountError,
    setItemAmountError,
    handleAddItem,
    handleDeleteItem,
    rawNetSpent,
    displayNetSpent,
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
    amountInputRef,
    sortedItems,
    daysUntilReset,
    handleBudgetResetPeriod,
    handleBudgetAmountCopy,
    syncStatus,
    handleRetrySync,
    showCalculator,
    setShowCalculator,
  };
};
