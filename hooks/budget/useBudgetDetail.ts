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
import {
  calculateBudgetMetrics,
  getBudgetItemType,
  safeId,
  validateAmount,
  validateTitle,
} from '@/lib/utils';
import { syncService } from '@/services/syncService';
import { useBudgetStore } from '@/store/budgetStore';
import { useSyncStore } from '@/store/syncStore';
import { BudgetItem, BudgetItemType } from '@/types/models';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

export const useBudgetDetail = () => {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemType, setItemType] = useState<BudgetItemType>('expense');
  const [itemTitleError, setItemTitleError] = useState('');
  const [itemAmountError, setItemAmountError] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState('');
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemAmount, setEditItemAmount] = useState('');
  const [editItemType, setEditItemType] = useState<BudgetItemType>('expense');
  const [editItemError, setEditItemError] = useState('');
  const [isSavingEditItem, setIsSavingEditItem] = useState(false);

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
  const {
    addItem,
    updateItem,
    markItemAsSynced,
    removeItem,
    getTotalSpent,
    getRemainingBudget,
    deleteBudget,
  } = useBudgetStore();

  const { navigateToBudgetEdit, navigateToBudgetList } = useNavigation();
  const { handleBudgetPinToggle: togglePin } = useOperations();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();
  const { handleBudgetAmountCopy } = useBudgetAmount();
  const { syncNow, isOnline, isLoggedIn } = useCloudSync();
  const { mutate } = useSyncMutation();
  const { getToken, userId } = useAuth();
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
    toastSuccess(t('budgetHooks.items.addSuccess'));

    // Trigger sync to push addition to Supabase
    try {
      await syncNow();
    } catch (error) {
      console.error('[Sync] Failed to sync after add item:', error);
    }
  };

  const handleDeleteItem = (itemId: string, title: string): void => {
    showConfirm(
      t('budgetHooks.items.deleteConfirmTitle'),
      t('budgetHooks.items.deleteConfirmMessage', { title }),
      async () => {
        removeItem(budgetId, itemId);
        toastSuccess(t('budgetHooks.items.deleteSuccess'));

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const selectedEditItem = useMemo<BudgetItem | null>(() => {
    if (!budget || !editingItemId) return null;
    return budget.items.find((item) => item.id === editingItemId) || null;
  }, [budget, editingItemId]);

  const openEditItemModal = (item: BudgetItem): void => {
    if (item.transactionId) {
      toastError(t('budgetDetail.editItem.linkedBlocked'));
      return;
    }

    setEditingItemId(item.id);
    setEditItemTitle(item.title);
    setEditItemAmount(String(Math.abs(item.amount)));
    setEditItemType(getBudgetItemType(item));
    setEditItemError('');
    setEditModalVisible(true);
  };

  const closeEditItemModal = (): void => {
    if (isSavingEditItem) return;
    setEditModalVisible(false);
    setEditingItemId('');
    setEditItemError('');
  };

  const isEditItemLinked = selectedEditItem?.transactionId !== undefined;
  const hasEditItemChanges =
    !!selectedEditItem &&
    (selectedEditItem.title.trim() !== editItemTitle.trim() ||
      Math.abs(selectedEditItem.amount) !== Math.abs(parseFloat(editItemAmount || '0')) ||
      getBudgetItemType(selectedEditItem) !== editItemType);
  const canSaveEditItem =
    !isEditItemLinked &&
    hasEditItemChanges &&
    !validateTitle(editItemTitle.trim()) &&
    !validateAmount(editItemAmount, 1);

  const handleSaveEditedItem = async (): Promise<void> => {
    if (!budget || !selectedEditItem) return;

    if (selectedEditItem.transactionId) {
      setEditItemError(t('budgetDetail.editItem.linkedBlocked'));
      return;
    }

    const titleError = validateTitle(editItemTitle.trim());
    if (titleError) {
      setEditItemError(titleError);
      return;
    }

    const amountError = validateAmount(editItemAmount, 1);
    if (amountError) {
      setEditItemError(amountError);
      return;
    }

    if (!hasEditItemChanges) {
      return;
    }

    const safeTitle = editItemTitle.trim();
    const safeAmount = Math.abs(parseFloat(editItemAmount));
    const now = Date.now();

    setIsSavingEditItem(true);
    setEditItemError('');

    try {
      updateItem(budget.id, selectedEditItem.id, {
        title: safeTitle,
        amount: safeAmount,
        type: editItemType,
      });

      const queuePayload = {
        itemId: selectedEditItem.id,
        budgetId: budget.id,
        title: safeTitle,
        amount: safeAmount,
        type: editItemType,
        updatedAt: now,
      };

      if (isOnline && isLoggedIn && userId) {
        try {
          await syncService.updateBudgetItem(
            selectedEditItem.id,
            budget.id,
            safeTitle,
            safeAmount,
            editItemType,
            {
              clerkUserId: userId,
              getToken,
            },
          );
          markItemAsSynced(budget.id, selectedEditItem.id);
        } catch (error: any) {
          console.error('[Sync] Failed to update budget item:', error?.message || error);

          await mutate('budget_item', 'update', queuePayload, {
            operation: 'BUDGET_ITEM_UPDATE',
            entityId: selectedEditItem.id,
          });

          await mutate(
            'budget_item',
            'update',
            { budgetId: budget.id, updatedAt: now },
            {
              operation: 'BUDGET_RECALC',
              entityId: budget.id,
            },
          );
        }
      } else {
        await mutate('budget_item', 'update', queuePayload, {
          operation: 'BUDGET_ITEM_UPDATE',
          entityId: selectedEditItem.id,
        });

        await mutate(
          'budget_item',
          'update',
          { budgetId: budget.id, updatedAt: now },
          {
            operation: 'BUDGET_RECALC',
            entityId: budget.id,
          },
        );
      }

      toastSuccess(t('budgetDetail.editItem.updated'));
      closeEditItemModal();
    } catch (error: any) {
      console.error('[Budget] Failed to save edited item:', error?.message || error);
      setEditItemError(t('budgetDetail.editItem.saveFailed'));
    } finally {
      setIsSavingEditItem(false);
    }
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
      t('budgetHooks.deleteBudget.confirmTitle'),
      t('budgetHooks.deleteBudget.cannotUndoMessage', { title: budget.title }),
      async () => {
        deleteBudget(budget.id);
        toastSuccess(t('budgetHooks.deleteBudget.success'));

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }

        navigateToBudgetList();
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleEdit = (): void => {
    navigateToBudgetEdit(budgetId);
  };

  const menuItems = createMenuItems(
    'budget',
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
    editModalVisible,
    openEditItemModal,
    closeEditItemModal,
    editItemTitle,
    setEditItemTitle,
    editItemAmount,
    setEditItemAmount,
    editItemType,
    setEditItemType,
    editItemError,
    isSavingEditItem,
    canSaveEditItem,
    isEditItemLinked,
    handleSaveEditedItem,
  };
};
