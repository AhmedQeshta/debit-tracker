import { useBudgetAmount } from '@/hooks/budget/useBudgetAmount';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, getMonthLabel, sortBudgets } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { BudgetSortKey } from '@/types/budget';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useBudgetList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<BudgetSortKey>('recent');
  const [hydrated, setHydrated] = useState(useBudgetStore.persist.hasHydrated());

  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const budgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { pinBudget, unpinBudget, deleteBudget, removeItem, getTotalSpent, getRemainingBudget } =
    useBudgetStore();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();
  const { syncNow } = useCloudSync();
  const sortedBudgets = sortBudgets(budgets);
  const handlePinToggle = (budgetId: string): void => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      if (budget.pinned) {
        unpinBudget(budgetId);
      } else {
        pinBudget(budgetId);
      }
    }
  };

  const handleDelete = (budgetId: string, title: string): void => {
    showConfirm(
      'Delete Budget',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        deleteBudget(budgetId);
        toastSuccess('Budget deleted successfully');

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

  const handleResetPeriod = (budgetId: string, title: string): void => {
    showConfirm(
      'Reset Budget Period',
      `Clear all transactions from "${title}" and start a new period?`,
      async () => {
        const budget = budgets.find((b) => b.id === budgetId);
        if (!budget) return;

        const activeItems = budget.items.filter((item) => !item.deletedAt);
        activeItems.forEach((entry) => {
          removeItem(budgetId, entry.id);
        });

        toastSuccess('Budget period has been reset');

        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after period reset:', error);
        }
      },
      { confirmText: 'Reset' },
    );
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncNow();
    } catch (error) {
      console.error('[Sync] Failed to refresh budgets:', error);
      toastError('Could not refresh budgets right now');
    } finally {
      setRefreshing(false);
    }
  }, [syncNow, toastError]);

  useEffect(() => {
    const unsubscribe = useBudgetStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  const monthLabel = getMonthLabel(Date.now());

  const displayedBudgets = useMemo(() => {
    const cloned = [...sortedBudgets];
    if (sortKey === 'name') {
      return cloned.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortKey === 'usage') {
      return cloned.sort((a, b) => {
        const aUsage = a.totalBudget > 0 ? getTotalSpent(a.id) / a.totalBudget : 0;
        const bUsage = b.totalBudget > 0 ? getTotalSpent(b.id) / b.totalBudget : 0;
        return bUsage - aUsage;
      });
    }

    return cloned;
  }, [sortedBudgets, sortKey, getTotalSpent]);

  const summary = useMemo(() => {
    const totalsByCurrency = new Map<
      string,
      { budget: number; spent: number; remaining: number }
    >();
    let nearLimitCount = 0;

    displayedBudgets.forEach((budget) => {
      const currency = budget.currency || '$';
      const spent = getTotalSpent(budget.id);
      const remaining = budget.totalBudget - spent;
      const usage = budget.totalBudget > 0 ? spent / budget.totalBudget : 0;

      const existing = totalsByCurrency.get(currency) || { budget: 0, spent: 0, remaining: 0 };
      totalsByCurrency.set(currency, {
        budget: existing.budget + budget.totalBudget,
        spent: existing.spent + spent,
        remaining: existing.remaining + remaining,
      });

      if (usage >= 0.9 && usage <= 1) {
        nearLimitCount += 1;
      }
    });

    const formatTotals = (type: 'budget' | 'spent' | 'remaining') => {
      if (totalsByCurrency.size === 0) return '-';
      return Array.from(totalsByCurrency.entries())
        .map(([currency, values]) => formatCurrency(values[type], currency))
        .join('  •  ');
    };

    const totalBudget = Array.from(totalsByCurrency.values()).reduce(
      (sum, value) => sum + value.budget,
      0,
    );
    const totalSpent = Array.from(totalsByCurrency.values()).reduce(
      (sum, value) => sum + value.spent,
      0,
    );

    const usedPercent =
      totalBudget > 0
        ? Math.max(0, Math.min(Math.round((totalSpent / totalBudget) * 100), 999))
        : 0;

    return {
      totalBudget: formatTotals('budget'),
      totalSpent: formatTotals('spent'),
      remaining: formatTotals('remaining'),
      usedPercent,
      nearLimitCount,
      hasMixedCurrency: totalsByCurrency.size > 1,
    };
  }, [displayedBudgets, getTotalSpent]);

  const { handleBudgetAmountCopy } = useBudgetAmount(displayedBudgets);

  return {
    budgets,
    sortedBudgets,
    handlePinToggle,
    handleDelete,
    handleResetPeriod,
    handleRefresh,
    refreshing,
    router,
    openDrawer,
    pinBudget,
    unpinBudget,
    deleteBudget,
    getTotalSpent,
    getRemainingBudget,
    setSortKey,
    sortKey,
    monthLabel,
    summary,
    hydrated,
    displayedBudgets,
    handleBudgetAmountCopy,
  };
};
