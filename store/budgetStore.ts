import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetItem, Budget } from '../types/models';
import { IBudgetState } from '@/types/store';

export const useBudgetStore = create<IBudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      addBudget: (title: string, currency: string, totalBudget: number, friendId: string) =>
      {
        const newBudget: Budget = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          currency,
          totalBudget,
          items: [],
          pinned: false,
          createdAt: Date.now(),
          friendId,
          synced: false,
          updatedAt: Date.now(),
        };
        set((state) => ({ budgets: [newBudget, ...state.budgets] }));
        return newBudget.id;
      },
      updateBudget: (id: string, updates: Partial<Budget>) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates, synced: false, updatedAt: Date.now() } : b,
          ),
        })),
      deleteBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id
              ? {
                ...b,
                deletedAt: Date.now(),
                synced: false,
                // Also mark all items as deleted
                items: b.items.map((item) => ({
                  ...item,
                  deletedAt: Date.now(),
                  synced: false,
                })),
              }
              : b,
          ),
        })),
      getDirtyBudgets: (): Budget[] =>
      {
        return get().budgets.filter((b) =>
        {
          // Include budgets that are not synced AND not deleted
          // Deleted budgets are handled separately by getDeletedBudgets()
          return b.synced !== true && b.deletedAt === undefined;
        });
      },
      getDirtyBudgetItems: (): BudgetItem[] =>
      {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) =>
        {
          budget.items.forEach((item) =>
          {
            // Include items that are not synced AND not deleted
            // Deleted items are handled separately by getDeletedBudgetItems()
            if (!item.synced && item.deletedAt === undefined)
            {
              allItems.push(item);
            }
          });
        });
        return allItems;
      },
      getDeletedBudgets: (): Budget[] =>
      {
        return get().budgets.filter((b) => b.deletedAt !== undefined);
      },
      getDeletedBudgetItems: (): BudgetItem[] =>
      {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) =>
        {
          budget.items.forEach((item) =>
          {
            if (item.deletedAt !== undefined)
            {
              allItems.push(item);
            }
          });
        });
        return allItems;
      },
      removeDeletedBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      removeDeletedBudgetItem: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                ...b,
                items: b.items.filter((item) => item.id !== itemId),
              }
              : b,
          ),
        })),
      setBudgets: (budgets) => set({ budgets }),
      mergeBudgets: (remoteBudgets: Budget[]) =>
        set((state) =>
        {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.budgets.map((b) => [b.id, b]));
          const remoteIds = new Set(remoteBudgets.map((b) => b.id));

          // Process remote budgets with conflict resolution
          remoteBudgets.forEach((remote) =>
          {
            const local = localMap.get(remote.id);
            if (!local)
            {
              // Remote budget doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else
            {
              // Conflict resolution: use the one with newer updatedAt
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (remoteUpdatedAt > localUpdatedAt)
              {
                // Remote is newer -> use remote (including its items, clear any local deletion)
                localMap.set(remote.id, { ...remote, synced: true });
              } else
              {
                // Local is newer or equal -> keep local (but mark as synced if remote exists)
                // Also merge budget items with conflict resolution
                const localItemsMap = new Map(local.items.map((item) => [item.id, item]));
                const remoteItemsIds = new Set((remote.items || []).map((item) => item.id));

                // Process remote items
                (remote.items || []).forEach((remoteItem) =>
                {
                  const localItem = localItemsMap.get(remoteItem.id);
                  if (!localItem)
                  {
                    localItemsMap.set(remoteItem.id, { ...remoteItem, synced: true });
                  } else
                  {
                    const remoteItemUpdatedAt = remoteItem.updatedAt || 0;
                    const localItemUpdatedAt = localItem.updatedAt || 0;
                    if (remoteItemUpdatedAt > localItemUpdatedAt)
                    {
                      // Remote item is newer -> use remote (clear any local deletion)
                      localItemsMap.set(remoteItem.id, { ...remoteItem, synced: true });
                    } else
                    {
                      localItemsMap.set(remoteItem.id, { ...localItem, synced: localItem.synced || true });
                    }
                  }
                });

                // Handle local items not in remote:
                // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
                // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
                const mergedItems = Array.from(localItemsMap.values()).filter((item) =>
                {
                  if (remoteItemsIds.has(item.id))
                  {
                    return true; // Item exists in remote, keep it
                  }
                  // Item not in remote
                  if (item.deletedAt !== undefined)
                  {
                    return false; // Was marked for deletion, now confirmed deleted remotely
                  }
                  // Item not in remote but not marked for deletion - might be new, keep it
                  return true;
                });

                localMap.set(remote.id, {
                  ...local,
                  items: mergedItems,
                  synced: local.synced || true,
                });
              }
            }
          });

          // Handle local budgets not in remote:
          // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
          // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
          const merged = Array.from(localMap.values()).filter((item) =>
          {
            if (remoteIds.has(item.id))
            {
              return true; // Budget exists in remote, keep it
            }
            // Budget not in remote
            if (item.deletedAt !== undefined)
            {
              return false; // Was marked for deletion, now confirmed deleted remotely
            }
            // Budget not in remote but not marked for deletion - might be new, keep it
            return true;
          });

          return { budgets: merged };
        }),
      markAsSynced: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, synced: true } : b)),
        })),
      markItemAsSynced: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                ...b,
                items: b.items.map((i) =>
                  i.id === itemId ? { ...i, synced: true, updatedAt: Date.now() } : i,
                ),
              }
              : b,
          ),
        })),
      pinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, pinned: true } : b)),
        })),
      unpinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, pinned: false } : b)),
        })),
      setCurrency: (id: string, currency: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, currency, synced: false, updatedAt: Date.now() } : b,
          ),
        })),
      setTotalBudget: (id: string, amount: number) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, totalBudget: amount, synced: false, updatedAt: Date.now() } : b,
          ),
        })),
      addItem: (budgetId: string, title: string, amount: number) =>
      {
        const newItem: BudgetItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          amount,
          createdAt: Date.now(),
          budgetId,
          synced: false,
          updatedAt: Date.now(),
        };
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                ...b,
                items: [newItem, ...b.items],
                synced: false,
                updatedAt: Date.now(),
              }
              : b,
          ),
        }));
      },
      removeItem: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                ...b,
                items: b.items.map((item) =>
                  item.id === itemId
                    ? { ...item, deletedAt: Date.now(), synced: false }
                    : item,
                ),
                synced: false,
                updatedAt: Date.now(),
              }
              : b,
          ),
        })),
      getTotalSpent: (budgetId: string) =>
      {
        const budget = get().budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return 0;
        return budget.items.filter((item) => !item.deletedAt).reduce((sum, item) => sum + item.amount, 0);
      },
      getRemainingBudget: (budgetId: string) =>
      {
        const budget = get().budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return 0;
        const totalSpent = get().getTotalSpent(budgetId);
        return budget.totalBudget - totalSpent;
      },
      getBudget: (id: string) =>
      {
        const budget = get().budgets.find((b) => b.id === id && !b.deletedAt);
        if (!budget) return undefined;
        // Filter out deleted items
        return {
          ...budget,
          items: budget.items.filter((item) => !item.deletedAt),
        };
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
