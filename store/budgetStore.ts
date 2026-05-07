import { clampNetSpentForDisplay } from '@/lib/budgetMath';
import { supabase } from '@/lib/supabase';
import {
  calculateBudgetMetrics,
  getTransactionBudgetItemId,
  getTransactionBudgetItemType,
} from '@/lib/utils';
import { pingSupabase } from '@/services/net';
import { useSyncStore } from '@/store/syncStore';
import { IBudgetState } from '@/types/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Budget, BudgetItem, SyncStatus, Transaction } from '../types/models';

const migrateItemSyncStatus = (item: BudgetItem): BudgetItem => {
  if (item.sync_status) return item;
  if (item.synced === true) return { ...item, sync_status: 'synced' };
  if (item.synced === false) return { ...item, sync_status: 'pending' };
  return { ...item, sync_status: 'pending' };
};

const migrateBudgetItems = (budgets: Budget[]): Budget[] => {
  return budgets.map((budget) => ({
    ...budget,
    items: budget.items.map((item) => migrateItemSyncStatus(item)),
  }));
};

const createBudgetItemId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const toBudgetTotals = (budgetData: any) => ({
  totalSpent: budgetData?.total_spent ?? 0,
  totalIncome: budgetData?.total_income ?? 0,
  netSpent: budgetData?.net_spent ?? 0,
  remaining: budgetData?.remaining ?? 0,
  isOverspent: budgetData?.is_overspent ?? false,
});

export const useBudgetStore = create<IBudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      addBudget: (title: string, currency: string, totalBudget: number, friendId: string) => {
        const newBudget: Budget = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
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
      getDirtyBudgets: (): Budget[] => {
        return get().budgets.filter((b) => {
          // Include budgets that are not synced AND not deleted
          // Deleted budgets are handled separately by getDeletedBudgets()
          return b.synced !== true && b.deletedAt === undefined;
        });
      },
      getDirtyBudgetItems: (): BudgetItem[] => {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) => {
          budget.items.forEach((item) => {
            // Include items that are not synced AND not deleted
            // Deleted items are handled separately by getDeletedBudgetItems()
            if (
              (item.sync_status ?? (item.synced ? 'synced' : 'pending')) !== 'synced' &&
              item.deletedAt === undefined
            ) {
              allItems.push(item);
            }
          });
        });
        return allItems;
      },
      getDeletedBudgets: (): Budget[] => {
        return get().budgets.filter((b) => b.deletedAt !== undefined);
      },
      getDeletedBudgetItems: (): BudgetItem[] => {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) => {
          budget.items.forEach((item) => {
            if (item.deletedAt !== undefined) {
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
      // Normalize legacy persisted items so old boolean sync state becomes the new enum.
      setBudgets: (budgets) => set({ budgets: migrateBudgetItems(budgets) }),
      mergeBudgets: (remoteBudgets: Budget[]) =>
        set((state) => {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.budgets.map((b) => [b.id, b]));
          const remoteIds = new Set(remoteBudgets.map((b) => b.id));

          // Process remote budgets with conflict resolution
          remoteBudgets.forEach((remote) => {
            const local = localMap.get(remote.id);
            if (!local) {
              // Remote budget doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else {
              const localPending = local.synced !== true && local.deletedAt === undefined;

              // Keep pending local deletion until sync confirms it remotely.
              if (local.deletedAt !== undefined && local.synced !== true) {
                return;
              }

              // Conflict resolution: pending local changes win over pull data.
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (!localPending && remoteUpdatedAt > localUpdatedAt) {
                // Remote is newer -> use remote (including its items, clear any local deletion)
                localMap.set(remote.id, { ...remote, synced: true });
              } else {
                // Local is newer/equal OR local has pending changes -> keep local fields.
                // Merge items while preserving local pending item changes.
                const localItemsMap = new Map(local.items.map((item) => [item.id, item]));
                const remoteItemsIds = new Set((remote.items || []).map((item) => item.id));

                // Process remote items
                (remote.items || []).forEach((remoteItem) => {
                  const localItem = localItemsMap.get(remoteItem.id);
                  if (!localItem) {
                    localItemsMap.set(remoteItem.id, { ...remoteItem, synced: true });
                  } else {
                    const localItemPending =
                      localItem.synced !== true && localItem.deletedAt === undefined;
                    const remoteItemUpdatedAt = remoteItem.updatedAt || 0;
                    const localItemUpdatedAt = localItem.updatedAt || 0;
                    if (!localItemPending && remoteItemUpdatedAt > localItemUpdatedAt) {
                      // Remote item is newer -> use remote (clear any local deletion)
                      localItemsMap.set(remoteItem.id, { ...remoteItem, synced: true });
                    } else {
                      localItemsMap.set(remoteItem.id, {
                        ...localItem,
                        synced: localItemPending ? false : true,
                      });
                    }
                  }
                });

                // Handle local items not in remote:
                // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
                // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
                const mergedItems = Array.from(localItemsMap.values()).filter((item) => {
                  if (remoteItemsIds.has(item.id)) {
                    return true; // Item exists in remote, keep it
                  }
                  // Item not in remote
                  if (item.deletedAt !== undefined) {
                    return false; // Was marked for deletion, now confirmed deleted remotely
                  }
                  // Item not in remote but not marked for deletion - might be new, keep it
                  return true;
                });

                localMap.set(remote.id, {
                  ...local,
                  items: mergedItems,
                  synced: localPending ? false : true,
                });
              }
            }
          });

          // Handle local budgets not in remote:
          // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
          // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
          const merged = Array.from(localMap.values()).filter((item) => {
            if (remoteIds.has(item.id)) {
              return true; // Budget exists in remote, keep it
            }
            // Budget not in remote
            if (item.deletedAt !== undefined) {
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
                    i.id === itemId
                      ? {
                          ...i,
                          synced: true,
                          sync_status: 'synced' as SyncStatus,
                          lastError: undefined,
                          updatedAt: Date.now(),
                        }
                      : i,
                  ),
                }
              : b,
          ),
        })),
      markItemAsSyncedV2: (
        budgetId: string,
        itemId: string,
        canonicalRecord?: Partial<BudgetItem>,
      ) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  items: b.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          ...(canonicalRecord || {}),
                          synced: true,
                          sync_status: 'synced' as SyncStatus,
                          lastError: undefined,
                          updatedAt: Date.now(),
                        }
                      : i,
                  ),
                }
              : b,
          ),
        })),
      markItemAsPending: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  items: b.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          synced: false,
                          sync_status: 'pending' as SyncStatus,
                          lastError: undefined,
                          updatedAt: Date.now(),
                        }
                      : i,
                  ),
                }
              : b,
          ),
        })),
      markItemAsFailed: (budgetId: string, itemId: string, errorMessage: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  items: b.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          synced: false,
                          sync_status: 'failed' as SyncStatus,
                          lastError: errorMessage,
                          updatedAt: Date.now(),
                        }
                      : i,
                  ),
                }
              : b,
          ),
        })),
      getPendingBudgetItems: (): BudgetItem[] => {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) => {
          budget.items.forEach((item) => {
            if (
              (item.sync_status ?? (item.synced ? 'synced' : 'pending')) === 'pending' &&
              item.deletedAt === undefined
            ) {
              allItems.push(item);
            }
          });
        });
        return allItems;
      },
      getFailedBudgetItems: (): BudgetItem[] => {
        const allItems: BudgetItem[] = [];
        get().budgets.forEach((budget) => {
          budget.items.forEach((item) => {
            if (item.sync_status === 'failed' && item.deletedAt === undefined) {
              allItems.push(item);
            }
          });
        });
        return allItems;
      },
      addBudgetItemOnline: async (
        budgetId: string,
        title: string,
        amount: number,
        type = 'expense',
        userId?: string,
        ownerId?: string,
      ): Promise<BudgetItem> => {
        const cleanTitle = title?.trim();
        if (!cleanTitle) throw new Error('Title is required');
        if (amount <= 0) throw new Error('Amount must be greater than 0');
        if (type !== 'expense' && type !== 'income') throw new Error('Invalid type');

        const budget = get().budgets.find((item) => item.id === budgetId);
        if (!budget) throw new Error('Budget not found');
        if (!userId || !ownerId) throw new Error('Missing sync identity');

        const itemId = createBudgetItemId();

        const { data: insertedItem, error: insertError } = await supabase
          .from('budget_items')
          .insert({
            id: itemId,
            owner_id: ownerId,
            user_id: userId,
            budget_id: budgetId,
            title: cleanTitle,
            amount: Math.abs(amount),
            type,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (!insertedItem) throw new Error('No data returned from Supabase');

        const { error: recalcError } = await supabase.rpc('recompute_budget_totals', {
          p_budget_id: budgetId,
          p_user_id: userId,
        });

        if (recalcError) {
          console.error('Budget total recalc failed:', recalcError);
        }

        const { data: canonicalBudget } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', budgetId)
          .single();

        const canonicalItem: BudgetItem = {
          id: insertedItem.id,
          budgetId: insertedItem.budget_id,
          transactionId: insertedItem.transaction_id ?? undefined,
          title: insertedItem.title,
          amount: Number(insertedItem.amount),
          type: insertedItem.type as 'expense' | 'income' | undefined,
          createdAt: insertedItem.created_at
            ? new Date(insertedItem.created_at).getTime()
            : Date.now(),
          updatedAt: insertedItem.updated_at
            ? new Date(insertedItem.updated_at).getTime()
            : Date.now(),
          synced: true,
          sync_status: 'synced',
          lastError: undefined,
        };

        set((state) => ({
          budgets: state.budgets.map((item) => {
            if (item.id !== budgetId) {
              return item;
            }

            return {
              ...item,
              items: [
                canonicalItem,
                ...item.items.filter((budgetItem) => budgetItem.id !== itemId),
              ],
              synced: true,
              updatedAt: Date.now(),
              ...(canonicalBudget ? toBudgetTotals(canonicalBudget) : {}),
            };
          }),
        }));

        return canonicalItem;
      },
      addBudgetItemOffline: (budgetId: string, title: string, amount: number, type = 'expense') => {
        const cleanTitle = title?.trim();
        if (!cleanTitle) throw new Error('Title is required');
        if (amount <= 0) throw new Error('Amount must be greater than 0');
        if (type !== 'expense' && type !== 'income') throw new Error('Invalid type');

        const budget = get().budgets.find((item) => item.id === budgetId);
        if (!budget) throw new Error('Budget not found');

        const now = Date.now();
        const newItem: BudgetItem = {
          id: createBudgetItemId(),
          title: cleanTitle,
          amount: Math.abs(amount),
          type,
          createdAt: now,
          budgetId,
          synced: false,
          sync_status: 'pending',
          updatedAt: now,
        };

        set((state) => ({
          budgets: state.budgets.map((item) => {
            if (item.id !== budgetId) {
              return item;
            }

            return {
              ...item,
              items: [newItem, ...item.items],
              synced: false,
              updatedAt: now,
            };
          }),
        }));

        useSyncStore.getState().addToQueue({
          id: `budget_item_${newItem.id}_${now}`,
          type: 'budget_item',
          action: 'create',
          operation: 'BUDGET_ITEM_UPSERT',
          entityId: newItem.id,
          createdAt: now,
          payload: {
            ...newItem,
            ownerId: null,
            userId: null,
          },
        });

        return newItem;
      },
      addBudgetItemSmart: async (
        budgetId: string,
        title: string,
        amount: number,
        type = 'expense',
        userId?: string,
        ownerId?: string,
        forceOffline = false,
      ): Promise<{ item: BudgetItem; isOnline: boolean }> => {
        if (forceOffline) {
          return {
            item: get().addBudgetItemOffline(budgetId, title, amount, type),
            isOnline: false,
          };
        }

        const ping = await pingSupabase(4000);
        if (ping.ok && userId && ownerId) {
          try {
            const item = await get().addBudgetItemOnline(
              budgetId,
              title,
              amount,
              type,
              userId,
              ownerId,
            );
            return { item, isOnline: true };
          } catch (error) {
            console.error('Online add failed, falling back to offline:', error);
          }
        }

        return { item: get().addBudgetItemOffline(budgetId, title, amount, type), isOnline: false };
      },
      pinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, pinned: true, synced: false, updatedAt: Date.now() } : b,
          ),
        })),
      unpinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, pinned: false, synced: false, updatedAt: Date.now() } : b,
          ),
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
      addItem: (budgetId: string, title: string, amount: number, type = 'expense') => {
        const newItem: BudgetItem = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          title,
          amount: Math.abs(amount),
          type,
          createdAt: Date.now(),
          budgetId,
          synced: false,
          sync_status: 'pending' as SyncStatus,
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
      updateItem: (budgetId: string, itemId: string, updates) => {
        const now = Date.now();
        set((state) => ({
          budgets: state.budgets.map((budget) => {
            if (budget.id !== budgetId) {
              return budget;
            }

            return {
              ...budget,
              items: budget.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      ...updates,
                      amount:
                        updates.amount !== undefined
                          ? Math.abs(updates.amount)
                          : Math.abs(item.amount),
                      synced: false,
                      sync_status: 'pending' as SyncStatus,
                      updatedAt: now,
                    }
                  : item,
              ),
              synced: false,
              updatedAt: now,
            };
          }),
        }));
      },
      upsertItemFromTransaction: (transaction: Transaction, budgetId?: string) => {
        const targetBudgetId = budgetId ?? transaction.budgetId;
        if (!targetBudgetId) return null;

        const now = Date.now();
        const itemType = getTransactionBudgetItemType(transaction.sign, transaction.amount);
        const amount = Math.abs(transaction.amount);
        const safeTitle = transaction.title?.trim() || 'Transaction';
        const candidateId = getTransactionBudgetItemId(transaction.id);

        let resultItem: BudgetItem | null = null;

        set((state) => {
          let existingItemId = candidateId;
          let existingCreatedAt = transaction.date || transaction.createdAt || now;

          state.budgets.forEach((budget) => {
            const linkedItem = budget.items.find(
              (item) => item.transactionId === transaction.id && !item.deletedAt,
            );
            if (linkedItem) {
              existingItemId = linkedItem.id;
              existingCreatedAt = linkedItem.createdAt || existingCreatedAt;
            }
          });

          const nextItem: BudgetItem = {
            id: existingItemId,
            budgetId: targetBudgetId,
            transactionId: transaction.id,
            title: safeTitle,
            amount,
            type: itemType,
            createdAt: existingCreatedAt,
            updatedAt: now,
            synced: false,
            sync_status: 'pending' as SyncStatus,
          };

          resultItem = nextItem;

          const budgets = state.budgets.map((budget) => {
            const linkedIndex = budget.items.findIndex(
              (item) => item.transactionId === transaction.id && !item.deletedAt,
            );

            if (budget.id === targetBudgetId) {
              if (linkedIndex >= 0) {
                const updatedItems = [...budget.items];
                updatedItems[linkedIndex] = {
                  ...updatedItems[linkedIndex],
                  ...nextItem,
                  deletedAt: undefined,
                };

                return {
                  ...budget,
                  items: updatedItems,
                  synced: false,
                  updatedAt: now,
                };
              }

              return {
                ...budget,
                items: [nextItem, ...budget.items],
                synced: false,
                updatedAt: now,
              };
            }

            if (linkedIndex >= 0) {
              const updatedItems = [...budget.items];
              updatedItems[linkedIndex] = {
                ...updatedItems[linkedIndex],
                deletedAt: now,
                synced: false,
                sync_status: 'pending' as SyncStatus,
                updatedAt: now,
              };

              return {
                ...budget,
                items: updatedItems,
                synced: false,
                updatedAt: now,
              };
            }

            return budget;
          });

          return { budgets };
        });

        return resultItem;
      },
      removeItemByTransactionId: (transactionId: string) => {
        if (!transactionId) return null;

        const now = Date.now();
        let removedItem: BudgetItem | null = null;

        set((state) => ({
          budgets: state.budgets.map((budget) => {
            const linkedIndex = budget.items.findIndex(
              (item) => item.transactionId === transactionId && !item.deletedAt,
            );

            if (linkedIndex < 0) {
              return budget;
            }

            const updatedItems = [...budget.items];
            removedItem = { ...updatedItems[linkedIndex] };
            updatedItems[linkedIndex] = {
              ...updatedItems[linkedIndex],
              deletedAt: now,
              synced: false,
              sync_status: 'pending' as SyncStatus,
              updatedAt: now,
            };

            return {
              ...budget,
              items: updatedItems,
              synced: false,
              updatedAt: now,
            };
          }),
        }));

        return removedItem;
      },
      removeItem: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  items: b.items.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          deletedAt: Date.now(),
                          synced: false,
                          sync_status: 'pending' as SyncStatus,
                        }
                      : item,
                  ),
                  synced: false,
                  updatedAt: Date.now(),
                }
              : b,
          ),
        })),
      getTotalSpent: (budgetId: string) => {
        const budget = get().budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return 0;
        // Display net spent should never be negative in UI components.
        return clampNetSpentForDisplay(
          calculateBudgetMetrics(budget.items, budget.totalBudget).netSpent,
        );
      },
      getRemainingBudget: (budgetId: string) => {
        const budget = get().budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return 0;
        return calculateBudgetMetrics(budget.items, budget.totalBudget).remaining;
      },
      getBudgetMetrics: (budgetId: string) => {
        const budget = get().budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) {
          return {
            totalSpent: 0,
            totalIncome: 0,
            netSpent: 0,
            remaining: 0,
            progressRatio: 0,
            isOverspent: false,
          };
        }
        return calculateBudgetMetrics(budget.items, budget.totalBudget);
      },
      getBudget: (id: string) => {
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
      version: 2,
      migrate: (persistedState) => {
        const nextState = persistedState as { budgets?: Budget[] } | undefined;
        return {
          ...(persistedState as object),
          budgets: migrateBudgetItems(nextState?.budgets ?? []),
        };
      },
    },
  ),
);
