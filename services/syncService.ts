import { supabase } from '@/lib/supabase';
import { getBudgetItemType } from '@/lib/utils';
import {
  GetTokenFunction,
  getFreshSupabaseJwt,
  isJwtExpiredError,
  retryOnceOnJwtExpired,
} from '@/services/authSync';
import { classifySyncError, getSyncErrorCode, isRetryableSyncError } from '@/services/syncErrors';
import { ensureAppUser } from '@/services/userService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { QueueBlockedReason, SyncQueueFlushSummary } from '@/types/common';
import { Budget, BudgetItem, Friend, Transaction } from '@/types/models';

// Timeout wrapper for Supabase queries (15 seconds)
const SYNC_TIMEOUT_MS = 15000;

const withTimeout = <T>(promise: Promise<T>, ms: number = SYNC_TIMEOUT_MS): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Network timeout after ${ms}ms. Check your connection and retry.`)),
        ms,
      ),
    ),
  ]);
};

const normalizeCurrency = (currency: unknown): string => {
  if (typeof currency !== 'string') return '$';
  const trimmed = currency.trim();
  return trimmed.length > 0 ? trimmed : '$';
};

const DEFAULT_SYNC_CHUNK_SIZE = 30;
const DEFAULT_SYNC_CONCURRENCY = 2;
const MAX_SYNC_RETRIES = 4;
const MAX_SYNC_BACKOFF_MS = 30000;

const waitMs = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const mapCategoryToBlockedReason = (
  category: ReturnType<typeof classifySyncError>,
): QueueBlockedReason => {
  if (category === 'validation/conflict') {
    return 'validation/conflict';
  }

  if (category === 'offline') return 'offline';
  if (category === 'timeout') return 'timeout';
  if (category === 'rate_limited') return 'rate_limited';
  if (category === 'auth') return 'auth';
  if (category === 'server') return 'server';
  return 'unknown';
};

const computeBackoffMs = (attempt: number, category: ReturnType<typeof classifySyncError>) => {
  const exponential = Math.min(1000 * 2 ** attempt, MAX_SYNC_BACKOFF_MS);
  if (category === 'rate_limited') {
    return Math.max(5000, exponential);
  }
  return exponential;
};

const runWithRetry = async <T>(
  execute: () => Promise<T>,
  onRetry?: (attempt: number, maxRetries: number, delayMs: number, error: unknown) => void,
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await execute();
    } catch (error: any) {
      const category = classifySyncError(error);
      const retryable = isRetryableSyncError(category);

      if (!retryable || attempt >= MAX_SYNC_RETRIES) {
        if (error && typeof error === 'object') {
          (error as any).syncCategory = category;
        }
        throw error;
      }

      const delayMs = computeBackoffMs(attempt, category);
      onRetry?.(attempt + 1, MAX_SYNC_RETRIES, delayMs, error);
      await waitMs(delayMs);
      attempt += 1;
    }
  }
};

const mapWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) => {
  let index = 0;
  const safeConcurrency = Math.max(1, concurrency);

  const runWorker = async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      await worker(items[currentIndex]);
    }
  };

  const workers = Array.from({ length: Math.min(safeConcurrency, items.length) }, () =>
    runWorker(),
  );
  await Promise.all(workers);
};

export const syncService = {
  syncQueueFlush: async (
    cloudUserId: string,
    clerkUserId: string,
    getToken: GetTokenFunction,
    options?: {
      onProgress?: (processed: number, total: number, itemId: string) => void;
      chunkSize?: number;
      concurrency?: number;
    },
  ): Promise<SyncQueueFlushSummary> => {
    const { syncEnabled, queue } = useSyncStore.getState();

    if (!syncEnabled) {
      return { total: 0, successCount: 0, failedCount: 0, blockedReason: 'unknown' };
    }

    const sortedQueue = [...queue].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const total = sortedQueue.length;

    const chunkSize = Math.max(1, options?.chunkSize ?? DEFAULT_SYNC_CHUNK_SIZE);
    const concurrency = Math.max(1, Math.min(options?.concurrency ?? DEFAULT_SYNC_CONCURRENCY, 3));

    let successCount = 0;
    let failedCount = 0;
    let processedCount = 0;
    let blockedReason: QueueBlockedReason | undefined;
    let lastErrorCode: string | undefined;
    let lastErrorMessage: string | undefined;

    const advanceProgress = (itemId: string) => {
      processedCount += 1;
      options?.onProgress?.(processedCount, total, itemId);
    };

    const directOperations = new Set([
      'BUDGET_RECALC',
      'FRIEND_CURRENCY_UPDATE',
      'BUDGET_ITEM_UPDATE',
      'SETTLE_FRIEND',
    ]);

    const processDirectItem = async (item: (typeof sortedQueue)[number]) => {
      if (item.operation === 'BUDGET_RECALC' && item.entityId) {
        const rpcResult = await retryOnceOnJwtExpired(
          async () =>
            await supabase.rpc('recompute_budget_totals', {
              p_budget_id: item.entityId,
              p_user_id: clerkUserId,
            }),
          getToken,
        );

        if (rpcResult.error) {
          throw rpcResult.error;
        }
        return;
      }

      if (item.operation === 'FRIEND_CURRENCY_UPDATE') {
        const friendId = item.payload?.friendId;
        const currency = item.payload?.currency;

        if (!friendId || typeof currency !== 'string') {
          useSyncStore.getState().removeFromQueue(item.id);
          return;
        }

        const updatedFriend = await syncService.updateFriendCurrency(friendId, currency, {
          cloudUserId,
          clerkUserId,
          getToken,
        });

        const friendsState = useFriendsStore.getState();
        friendsState.setFriends(
          friendsState.friends.map((friend) =>
            friend.id === friendId
              ? {
                  ...friend,
                  currency: updatedFriend.currency,
                  updatedAt: updatedFriend.updatedAt,
                  synced: true,
                }
              : friend,
          ),
        );
        return;
      }

      if (item.operation === 'BUDGET_ITEM_UPDATE') {
        const itemId = item.payload?.itemId;
        const budgetId = item.payload?.budgetId;
        const title = item.payload?.title;
        const amount = item.payload?.amount;
        const type = item.payload?.type;

        if (
          !itemId ||
          !budgetId ||
          typeof title !== 'string' ||
          typeof amount !== 'number' ||
          (type !== 'expense' && type !== 'income')
        ) {
          useSyncStore.getState().removeFromQueue(item.id);
          return;
        }

        await syncService.updateBudgetItem(itemId, budgetId, title, amount, type, {
          cloudUserId,
          clerkUserId,
          getToken,
        });

        useBudgetStore.getState().markItemAsSynced(budgetId, itemId);
        return;
      }

      if (item.operation === 'SETTLE_FRIEND') {
        const friendId = item.payload?.friendId;
        if (!friendId) {
          useSyncStore.getState().removeFromQueue(item.id);
          return;
        }

        const result = await retryOnceOnJwtExpired(
          async () =>
            await supabase
              .from('transactions')
              .delete()
              .eq('owner_id', cloudUserId)
              .eq('friend_id', friendId),
          getToken,
        );

        if (result.error) {
          throw result.error;
        }
      }
    };

    if (total === 0) {
      try {
        await runWithRetry(() => syncService.pushChanges(getToken, clerkUserId));
        return { total: 0, successCount: 0, failedCount: 0 };
      } catch (error: any) {
        const category =
          (error?.syncCategory as ReturnType<typeof classifySyncError>) || classifySyncError(error);
        return {
          total: 0,
          successCount: 0,
          failedCount: 0,
          blockedReason: mapCategoryToBlockedReason(category),
          lastErrorCode: getSyncErrorCode(category),
          lastErrorMessage: error?.message || 'Sync failed',
        };
      }
    }

    for (let i = 0; i < sortedQueue.length; i += chunkSize) {
      const chunk = sortedQueue.slice(i, i + chunkSize);

      const directItems = chunk.filter(
        (item) => item.operation && directOperations.has(item.operation),
      );
      const pushItems = chunk.filter(
        (item) => !item.operation || !directOperations.has(item.operation),
      );

      if (directItems.length > 0) {
        await mapWithConcurrency(directItems, concurrency, async (item) => {
          if (blockedReason) {
            return;
          }

          useSyncStore.getState().updateQueueItem(item.id, { status: 'processing' });

          try {
            await runWithRetry(
              () => processDirectItem(item),
              (_, __, delayMs, error) => {
                const category = classifySyncError(error);
                useSyncStore.getState().setLastError({
                  code: getSyncErrorCode(category),
                  message:
                    category === 'rate_limited'
                      ? `Too many requests. Retrying in ${Math.ceil(delayMs / 1000)}s...`
                      : `Sync retrying in ${Math.ceil(delayMs / 1000)}s...`,
                  details: error,
                  at: Date.now(),
                });
              },
            );

            useSyncStore.getState().updateQueueItem(item.id, { status: 'synced' });
            useSyncStore.getState().removeFromQueue(item.id);
            successCount += 1;
          } catch (error: any) {
            failedCount += 1;
            const category =
              (error?.syncCategory as ReturnType<typeof classifySyncError>) ||
              classifySyncError(error);
            const message = error?.message || 'Unknown queue sync error';

            useSyncStore.getState().updateQueueItem(item.id, {
              attempts: (item.attempts || 0) + 1,
              lastError: message,
              status: 'failed',
            });

            blockedReason = mapCategoryToBlockedReason(category);
            lastErrorCode = getSyncErrorCode(category);
            lastErrorMessage = message;

            useSyncStore.getState().setLastError({
              code: lastErrorCode,
              message,
              details: error,
              at: Date.now(),
            });

            if (category === 'auth' || isJwtExpiredError(error)) {
              useSyncStore.getState().setSyncStatus('needs_login');
            }
          } finally {
            advanceProgress(item.id);
          }
        });
      }

      if (blockedReason) {
        break;
      }

      if (pushItems.length > 0) {
        pushItems.forEach((item) => {
          useSyncStore.getState().updateQueueItem(item.id, { status: 'processing' });
        });

        try {
          await runWithRetry(
            () => syncService.pushChanges(getToken, clerkUserId),
            (_, __, delayMs, error) => {
              const category = classifySyncError(error);
              useSyncStore.getState().setLastError({
                code: getSyncErrorCode(category),
                message:
                  category === 'rate_limited'
                    ? `Too many requests. Retrying in ${Math.ceil(delayMs / 1000)}s...`
                    : `Sync retrying in ${Math.ceil(delayMs / 1000)}s...`,
                details: error,
                at: Date.now(),
              });
            },
          );

          for (const item of pushItems) {
            useSyncStore.getState().updateQueueItem(item.id, { status: 'synced' });
            useSyncStore.getState().removeFromQueue(item.id);
            successCount += 1;
            advanceProgress(item.id);
          }
        } catch (error: any) {
          const category =
            (error?.syncCategory as ReturnType<typeof classifySyncError>) ||
            classifySyncError(error);
          const message = error?.message || 'Sync batch failed';

          for (const item of pushItems) {
            useSyncStore.getState().updateQueueItem(item.id, {
              attempts: (item.attempts || 0) + 1,
              lastError: message,
              status: 'failed',
            });
            failedCount += 1;
            advanceProgress(item.id);
          }

          blockedReason = mapCategoryToBlockedReason(category);
          lastErrorCode = getSyncErrorCode(category);
          lastErrorMessage = message;

          useSyncStore.getState().setLastError({
            code: lastErrorCode,
            message,
            details: error,
            at: Date.now(),
          });

          if (category === 'auth' || isJwtExpiredError(error)) {
            useSyncStore.getState().setSyncStatus('needs_login');
          }

          break;
        }
      }
    }

    return {
      total,
      successCount,
      failedCount,
      blockedReason,
      lastErrorCode,
      lastErrorMessage,
    };
  },

  pushChanges: async (getToken: GetTokenFunction, clerkUserId: string) => {
    // Sync gating: if sync is disabled, don't write to Supabase
    if (
      !useSyncStore.getState().syncEnabled ||
      process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')
    )
      return;

    // Get cloudUserId from store (UUID for owner_id FK)
    const { cloudUserId, queue } = useSyncStore.getState();

    if (!cloudUserId) return;

    // Get all dirty items from stores (excludes deleted items)
    const dirtyFriends = useFriendsStore.getState().getDirtyFriends();
    const dirtyTransactions = useTransactionsStore.getState().getDirtyTransactions();
    const dirtyBudgets = useBudgetStore.getState().getDirtyBudgets();
    const dirtyBudgetItems = useBudgetStore.getState().getDirtyBudgetItems();

    // Get deleted items separately
    const deletedBudgetItems = useBudgetStore.getState().getDeletedBudgetItems();
    const deletedTransactions = useTransactionsStore.getState().getDeletedTransactions();
    const deletedBudgets = useBudgetStore.getState().getDeletedBudgets();
    const deletedFriends = useFriendsStore.getState().getDeletedFriends();

    const totalDirty =
      dirtyFriends.length +
      dirtyTransactions.length +
      dirtyBudgets.length +
      dirtyBudgetItems.length;

    const totalDeleted =
      deletedBudgetItems.length +
      deletedTransactions.length +
      deletedBudgets.length +
      deletedFriends.length;

    const settleQueueItems = queue.filter((item) => item.type === 'settle_friend');
    const totalQueuedSettle = settleQueueItems.length;

    // If no dirty items, no deletions, and no settle intents, nothing to sync
    if (totalDirty === 0 && totalDeleted === 0 && totalQueuedSettle === 0) {
      return;
    }

    // Helper to execute upsert with retry
    const executeUpsert = async (table: string, data: any[]) => {
      if (data.length === 0) return { success: true, count: 0 };
      try {
        const result = await retryOnceOnJwtExpired(
          async () => await supabase.from(table).upsert(data, { onConflict: 'id' }),
          getToken,
        );
        if (result.error) {
          if (isJwtExpiredError(result.error)) {
            useSyncStore.getState().setSyncStatus('needs_login');
            throw result.error;
          }
          return { success: false, error: result.error, count: 0 };
        }
        return { success: true, count: data.length };
      } catch (e: any) {
        if (isJwtExpiredError(e)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw e;
        }
        return { success: false, error: e, count: 0 };
      }
    };

    const executeDelete = async (table: string, ids: string[]) => {
      if (ids.length === 0) return { success: true, count: 0 };
      try {
        // Delete in batches to avoid query size limits
        const batchSize = 100;
        let deletedCount = 0;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          const result = await retryOnceOnJwtExpired(
            async () =>
              await supabase.from(table).delete().eq('owner_id', cloudUserId).in('id', batch),
            getToken,
          );
          if (result.error) {
            if (isJwtExpiredError(result.error)) {
              useSyncStore.getState().setSyncStatus('needs_login');
              throw result.error;
            }
            return { success: false, error: result.error, count: deletedCount };
          }
          deletedCount += batch.length;
        }
        return { success: true, count: deletedCount };
      } catch (e: any) {
        if (isJwtExpiredError(e)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw e;
        }
        return { success: false, error: e, count: 0 };
      }
    };

    try {
      // A) Push Friends first
      if (dirtyFriends.length > 0) {
        const friendsData = dirtyFriends.map((f) => mapFriendToDb(f, cloudUserId, clerkUserId));
        const result = await executeUpsert('friends', friendsData);
        if (result.success) {
          dirtyFriends.forEach((f) => useFriendsStore.getState().markAsSynced(f.id));
        } else {
          console.error(`[Sync] Failed to push friends:`, result.error);
          throw result.error;
        }
      }

      // B) Push Transactions (after friends exist)
      if (dirtyTransactions.length > 0) {
        const transactionsData = dirtyTransactions.map((t) =>
          mapTransactionToDb(t, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('transactions', transactionsData);
        if (result.success) {
          dirtyTransactions.forEach((t) => useTransactionsStore.getState().markAsSynced(t.id));
        } else {
          console.error(`[Sync] Failed to push transactions:`, result.error);
          throw result.error;
        }
      }

      // C) Push Budgets
      if (dirtyBudgets.length > 0) {
        const affectedBudgetIds = Array.from(new Set(dirtyBudgets.map((budget) => budget.id)));
        const budgetsData = dirtyBudgets.map((b) => mapBudgetToDb(b, cloudUserId, clerkUserId));
        const result = await executeUpsert('budgets', budgetsData);
        if (result.success) {
          for (const budgetId of affectedBudgetIds) {
            const rpcResult = await retryOnceOnJwtExpired(
              async () =>
                await supabase.rpc('recompute_budget_totals', {
                  p_budget_id: budgetId,
                  p_user_id: clerkUserId,
                }),
              getToken,
            );

            if (rpcResult.error) {
              if (isJwtExpiredError(rpcResult.error)) {
                useSyncStore.getState().setSyncStatus('needs_login');
                throw rpcResult.error;
              }
              console.error(
                '[Sync] Failed to recompute budget totals after budget update:',
                rpcResult.error,
              );
              throw rpcResult.error;
            }
          }

          dirtyBudgets.forEach((b) => useBudgetStore.getState().markAsSynced(b.id));
        } else {
          console.error(`[Sync] Failed to push budgets:`, result.error);
          throw result.error;
        }
      }

      // D) Push Budget Items (after budgets exist)
      if (dirtyBudgetItems.length > 0) {
        const affectedBudgetIds = Array.from(
          new Set(dirtyBudgetItems.map((item) => item.budgetId)),
        );
        const itemsData = dirtyBudgetItems.map((bi) =>
          mapBudgetItemToDb(bi, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('budget_items', itemsData);
        if (result.success) {
          dirtyBudgetItems.forEach((item) => {
            useBudgetStore.getState().markItemAsSynced(item.budgetId, item.id);
          });

          for (const budgetId of affectedBudgetIds) {
            const rpcResult = await retryOnceOnJwtExpired(
              async () =>
                await supabase.rpc('recompute_budget_totals', {
                  p_budget_id: budgetId,
                  p_user_id: clerkUserId,
                }),
              getToken,
            );

            if (rpcResult.error) {
              if (isJwtExpiredError(rpcResult.error)) {
                useSyncStore.getState().setSyncStatus('needs_login');
                throw rpcResult.error;
              }
              console.error('[Sync] Failed to recompute budget totals:', rpcResult.error);
              throw rpcResult.error;
            }
          }
        } else {
          console.error(`[Sync] Failed to push budget items:`, result.error);
          throw result.error;
        }
      }

      // E) Execute settle intents by deleting all transactions for each friend remotely.
      if (settleQueueItems.length > 0) {
        for (const queueItem of settleQueueItems) {
          const friendId = queueItem.payload?.friendId;
          if (!friendId) {
            useSyncStore.getState().removeFromQueue(queueItem.id);
            continue;
          }

          const result = await retryOnceOnJwtExpired(
            async () =>
              await supabase
                .from('transactions')
                .delete()
                .eq('owner_id', cloudUserId)
                .eq('friend_id', friendId),
            getToken,
          );

          if (result.error) {
            if (isJwtExpiredError(result.error)) {
              useSyncStore.getState().setSyncStatus('needs_login');
              throw result.error;
            }
            console.error('[Sync] Failed to settle friend transactions:', result.error);
            throw result.error;
          }

          useSyncStore.getState().removeFromQueue(queueItem.id);
        }
      }

      if (totalDeleted > 0) {
        try {
          // 1. Delete Budget Items first (children)
          if (deletedBudgetItems.length > 0) {
            const affectedBudgetIds = Array.from(
              new Set(deletedBudgetItems.map((item) => item.budgetId)),
            );
            const itemIds = deletedBudgetItems.map((item) => item.id);
            const result = await executeDelete('budget_items', itemIds);
            if (result.success) {
              deletedBudgetItems.forEach((item) =>
                useBudgetStore.getState().removeDeletedBudgetItem(item.budgetId, item.id),
              );

              for (const budgetId of affectedBudgetIds) {
                const rpcResult = await retryOnceOnJwtExpired(
                  async () =>
                    await supabase.rpc('recompute_budget_totals', {
                      p_budget_id: budgetId,
                      p_user_id: clerkUserId,
                    }),
                  getToken,
                );

                if (rpcResult.error) {
                  if (isJwtExpiredError(rpcResult.error)) {
                    useSyncStore.getState().setSyncStatus('needs_login');
                    throw rpcResult.error;
                  }
                  console.error(
                    '[Sync] Failed to recompute budget totals after delete:',
                    rpcResult.error,
                  );
                  throw rpcResult.error;
                }
              }
            } else {
              console.error(`[Sync] Failed to delete budget items:`, result.error);
              // Keep in store for retry
            }
          }

          // 2. Delete Transactions (children of friends)
          if (deletedTransactions.length > 0) {
            const transactionIds = deletedTransactions.map((t) => t.id);
            const result = await executeDelete('transactions', transactionIds);
            if (result.success) {
              deletedTransactions.forEach((t) =>
                useTransactionsStore.getState().removeDeletedTransaction(t.id),
              );
            } else {
              console.error(`[Sync] Failed to delete transactions:`, result.error);
              // Keep in store for retry
            }
          }

          // 3. Delete Budgets (parents, children already deleted)
          if (deletedBudgets.length > 0) {
            const budgetIds = deletedBudgets.map((b) => b.id);
            const result = await executeDelete('budgets', budgetIds);
            if (result.success) {
              deletedBudgets.forEach((b) => useBudgetStore.getState().removeDeletedBudget(b.id));
            } else {
              console.error(`[Sync] Failed to delete budgets:`, result.error);
              // Keep in store for retry
            }
          }

          // 4. Delete Friends last (parents, children already deleted)
          if (deletedFriends.length > 0) {
            const friendIds = deletedFriends.map((f) => f.id);
            const result = await executeDelete('friends', friendIds);
            if (result.success) {
              deletedFriends.forEach((f) => useFriendsStore.getState().removeDeletedFriend(f.id));
            } else {
              console.error(`[Sync] Failed to delete friends:`, result.error);
              // Keep in store for retry
            }
          }
        } catch (e: any) {
          console.error('[Sync] Deletion processing failed:', e);
          if (isJwtExpiredError(e)) {
            useSyncStore.getState().setSyncStatus('needs_login');
          }
        }
      }
    } catch (e: any) {
      console.error('[Sync] Push failed:', e);
      if (isJwtExpiredError(e)) {
        useSyncStore.getState().setSyncStatus('needs_login');
      }
      throw e;
    }
  },

  pullChanges: async (cloudUserId: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't read from Supabase
    if (!syncEnabled || process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')) return;

    // Helper to execute a pull request with retry logic
    const executePull = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) => {
      return retryOnceOnJwtExpired(queryFn, getToken);
    };

    // 1. Pull Friends (filtered by owner_id)
    const { data: friends, error: friendsError } = await executePull(
      async () =>
        await supabase
          .from('friends')
          .select('id, owner_id, user_id, name, bio, currency, pinned, created_at, updated_at')
          .eq('owner_id', cloudUserId),
    );
    if (friends && !friendsError) {
      // Map DB format to local format
      const mappedFriends = friends.map((f: any) => mapFriendFromDb(f));
      console.warn(
        '[Sync] Pulled friends with currency:',
        mappedFriends.map((friend) => ({ id: friend.id, currency: friend.currency })),
      );
      useFriendsStore.getState().mergeFriends(mappedFriends as Friend[]);
    } else if (friendsError) {
      console.error('[Sync] Error pulling friends:', friendsError);
      if (isJwtExpiredError(friendsError)) {
        console.error(
          '[Sync] JWT expired and refresh failed while pulling friends, setting sync status to needs_login',
        );
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }

    // 2. Pull Budgets (filtered by owner_id)
    const { data: budgets, error: budgetsError } = await executePull(
      async () =>
        await supabase
          .from('budgets')
          .select(
            `
        *,
        items:budget_items(*)
      `,
          )
          .eq('owner_id', cloudUserId),
    );

    if (budgets && !budgetsError) {
      // Map DB format to local format
      const formattedBudgets = budgets.map((b: any) => ({
        id: b.id,
        friendId: '', // Not used in new schema (budgets owned by app_user, not friend)
        title: b.title,
        currency: normalizeCurrency(b.currency),
        totalBudget: Number(b.total_budget) || 0,
        items: (b.items || []).map((item: any) => ({
          id: item.id,
          budgetId: item.budget_id,
          transactionId: item.transaction_id || undefined,
          title: item.title,
          amount: Number(item.amount) || 0,
          type: item.type === 'income' ? 'income' : 'expense',
          createdAt: safeDateToTimestamp(item.created_at),
          updatedAt: item.updated_at ? safeDateToTimestamp(item.updated_at) : undefined,
          synced: true,
        })),
        pinned: b.pinned || false,
        createdAt: safeDateToTimestamp(b.created_at),
        updatedAt: b.updated_at ? safeDateToTimestamp(b.updated_at) : undefined,
        synced: true,
        totalSpent: Number(b.total_spent) || 0,
        totalIncome: Number(b.total_income) || 0,
        netSpent: Number(b.net_spent) || 0,
        remaining: Number(b.remaining) || 0,
        isOverspent: Boolean(b.is_overspent),
      }));
      useBudgetStore.getState().mergeBudgets(formattedBudgets as Budget[]);
    } else if (budgetsError) {
      console.error('[Sync] Error pulling budgets:', budgetsError);
      if (isJwtExpiredError(budgetsError)) {
        console.error(
          '[Sync] JWT expired and refresh failed while pulling budgets, setting sync status to needs_login',
        );
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }

    // 3. Pull Transactions (filtered by owner_id)
    const { data: transactions, error: transError } = await executePull(
      async () => await supabase.from('transactions').select('*').eq('owner_id', cloudUserId),
    );
    if (transactions && !transError) {
      // Map DB format to local format
      const mappedTransactions = transactions.map((t: any) => ({
        id: t.id,
        friendId: t.friend_id,
        budgetId: t.budget_id || undefined,
        title: t.description || '',
        amount: (t.sign === -1 ? -1 : 1) * Math.abs(t.amount), // Local keeps signed amount
        sign: t.sign === -1 ? -1 : 1,
        date: safeDateToTimestamp(t.created_at), // Use created_at as date
        note: '', // Not in new schema
        createdAt: safeDateToTimestamp(t.created_at),
        updatedAt: t.updated_at ? safeDateToTimestamp(t.updated_at) : undefined,
        synced: true,
      }));
      useTransactionsStore.getState().mergeTransactions(mappedTransactions as Transaction[]);
    } else if (transError) {
      console.error('[Sync] Error pulling transactions:', transError);
      if (isJwtExpiredError(transError)) {
        console.error(
          '[Sync] JWT expired and refresh failed while pulling transactions, setting sync status to needs_login',
        );
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }
  },

  syncAll: async (cloudUserId: string, clerkUserId: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't sync
    if (!syncEnabled) return;

    try {
      // Pull first, then push (as per requirements)
      await syncService.pullChanges(cloudUserId, getToken);
      await syncService.pushChanges(getToken, clerkUserId);
      useSyncStore.getState().setLastSync(Date.now());
      // Clear error status on successful sync
      useSyncStore.getState().setSyncStatus(null);
    } catch (error: any) {
      console.error('[Sync] SyncAll error:', error);
      // If it's a JWT error, status is already set by pushChanges/pullChanges
      if (!isJwtExpiredError(error)) {
        useSyncStore.getState().setSyncStatus('error');
      }
      // Don't throw - let caller handle gracefully
    }
  },

  updateFriendCurrency: async (
    friendId: string,
    currency: string,
    options?: {
      cloudUserId?: string | null;
      clerkUserId?: string;
      getToken?: GetTokenFunction;
    },
  ): Promise<Friend> => {
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      throw new Error('Currency must be non-empty');
    }

    const normalizedCurrency = currency.trim();

    const ownerId = options?.cloudUserId ?? useSyncStore.getState().cloudUserId;
    if (!ownerId) {
      throw new Error('Missing cloud user id for friend currency update');
    }

    const updateQuery = async () =>
      await supabase
        .from('friends')
        .update({
          currency: normalizedCurrency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', friendId)
        .eq('owner_id', ownerId)
        .select('id, owner_id, user_id, name, bio, currency, pinned, created_at, updated_at')
        .single();

    const { data, error } = options?.getToken
      ? await retryOnceOnJwtExpired(updateQuery, options.getToken)
      : await updateQuery();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Friend not found');
    }

    return mapFriendFromDb(data);
  },

  updateBudgetItem: async (
    itemId: string,
    budgetId: string,
    title: string,
    amount: number,
    type: 'expense' | 'income',
    options?: {
      cloudUserId?: string | null;
      clerkUserId?: string;
      getToken?: GetTokenFunction;
    },
  ): Promise<BudgetItem> => {
    const ownerId = options?.cloudUserId ?? useSyncStore.getState().cloudUserId;
    if (!ownerId) {
      throw new Error('Missing cloud user id for budget item update');
    }

    const clerkUserId = options?.clerkUserId;
    if (!clerkUserId) {
      throw new Error('Missing clerk user id for budget totals recompute');
    }

    const safeTitle = title.trim();
    if (!safeTitle) {
      throw new Error('Title is required');
    }

    const safeAmount = Math.abs(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const updateQuery = async () =>
      await supabase
        .from('budget_items')
        .update({
          title: safeTitle,
          amount: safeAmount,
          type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('owner_id', ownerId)
        .select(
          'id, owner_id, user_id, budget_id, transaction_id, title, amount, type, created_at, updated_at',
        )
        .single();

    const { data, error } = options?.getToken
      ? await retryOnceOnJwtExpired(updateQuery, options.getToken)
      : await updateQuery();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Budget item not found');
    }

    const rpcQuery = async () =>
      await supabase.rpc('recompute_budget_totals', {
        p_budget_id: budgetId,
        p_user_id: clerkUserId,
      });

    const rpcResult = options?.getToken
      ? await retryOnceOnJwtExpired(rpcQuery, options.getToken)
      : await rpcQuery();

    if (rpcResult.error) {
      throw rpcResult.error;
    }

    return {
      id: data.id,
      budgetId: data.budget_id,
      transactionId: data.transaction_id || undefined,
      title: data.title,
      amount: Number(data.amount) || 0,
      type: data.type === 'income' ? 'income' : 'expense',
      createdAt: safeDateToTimestamp(data.created_at),
      updatedAt: data.updated_at ? safeDateToTimestamp(data.updated_at) : undefined,
      synced: true,
    };
  },

  ensureUserRecord: async (
    clerkUser: any,
    getToken: GetTokenFunction,
  ): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> => {
    // Delegate to userService
    const result = await ensureAppUser(clerkUser, getToken);
    return {
      ok: result.ok,
      skipped: result.skipped,
      reason: result.reason,
    };
  },

  // Direct upsert helper for "Write-Through"
  upsertOne: async (table: string, data: any, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }

    return retryOnceOnJwtExpired(async () => await supabase.from(table).upsert(data), getToken);
  },

  deleteOne: async (table: string, id: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }

    return retryOnceOnJwtExpired(
      async () => await supabase.from(table).delete().eq('id', id),
      getToken,
    );
  },

  deleteFriendWithTransactions: async (
    friendId: string,
    cloudUserId: string,
    getToken: GetTokenFunction,
  ) => {
    // 1. Delete transactions first (children)
    const { error: transError } = await retryOnceOnJwtExpired(
      async () =>
        await supabase
          .from('transactions')
          .delete()
          .eq('owner_id', cloudUserId)
          .eq('friend_id', friendId),
      getToken,
    );

    if (transError) {
      console.error('[Sync] Failed to delete transactions for friend:', transError);
      return { success: false, error: transError };
    }

    // 2. Delete the friend (parent)
    const { error: friendError } = await retryOnceOnJwtExpired(
      async () =>
        await supabase.from('friends').delete().eq('owner_id', cloudUserId).eq('id', friendId),
      getToken,
    );

    if (friendError) {
      console.error('[Sync] Failed to delete friend:', friendError);
      return { success: false, error: friendError };
    }

    return { success: true };
  },

  pullAllDataForUser: async (cloudUserId: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();

    // Gate: if sync disabled -> return silently
    if (!syncEnabled || process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder'))
      return {
        friends: [],
        transactions: [],
        budgets: [],
        budgetItems: [],
        counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 },
      };

    // Ensure token is fresh (refresh if needed)
    try {
      const tokenResult = await getFreshSupabaseJwt(getToken);
      if (!tokenResult.token && tokenResult.error !== 'template_missing') {
        return {
          friends: [],
          transactions: [],
          budgets: [],
          budgetItems: [],
          counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 },
        };
      }
    } catch (e) {
      console.error('[Sync] Error refreshing token:', e);
      return {
        friends: [],
        transactions: [],
        budgets: [],
        budgetItems: [],
        counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 },
      };
    }

    // Helper to execute a pull request with retry logic and timeout
    const executePull = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) => {
      return withTimeout(retryOnceOnJwtExpired(queryFn, getToken));
    };

    const result = {
      friends: [] as Friend[],
      transactions: [] as Transaction[],
      budgets: [] as Budget[],
      budgetItems: [] as BudgetItem[],
      counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 },
    };

    try {
      useSyncStore.getState().setPullProgress('friends');
      // 1. Pull Friends (filtered by owner_id)
      const { data: friends, error: friendsError } = await executePull(
        async () =>
          await supabase
            .from('friends')
            .select('id, owner_id, user_id, name, bio, currency, pinned, created_at, updated_at')
            .eq('owner_id', cloudUserId),
      );

      if (friendsError) {
        if (isJwtExpiredError(friendsError)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw friendsError;
        }
        throw new Error(`Failed to pull friends: ${friendsError.message || 'Unknown error'}`);
      }

      if (friends) {
        result.friends = friends.map((f: any) => mapFriendFromDb(f));
        console.warn(
          '[Sync] Pulled friends for hydration:',
          result.friends.map((friend) => ({ id: friend.id, currency: friend.currency })),
        );
        result.counts.friends = result.friends.length;
      }

      useSyncStore.getState().setPullProgress('transactions');
      // 2. Pull Transactions (filtered by owner_id)
      const { data: transactions, error: transError } = await executePull(
        async () =>
          await supabase
            .from('transactions')
            .select(
              'id, owner_id, user_id, friend_id, budget_id, amount, description, sign, created_at, updated_at',
            )
            .eq('owner_id', cloudUserId),
      );

      if (transError) {
        if (isJwtExpiredError(transError)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw transError;
        }
        throw new Error(`Failed to pull transactions: ${transError.message || 'Unknown error'}`);
      }

      if (transactions) {
        result.transactions = transactions.map((t: any) => ({
          id: t.id,
          friendId: t.friend_id,
          budgetId: t.budget_id || undefined,
          title: t.description || '',
          amount: (t.sign === -1 ? -1 : 1) * Math.abs(t.amount),
          sign: t.sign === -1 ? -1 : 1,
          date: safeDateToTimestamp(t.created_at),
          note: '',
          createdAt: safeDateToTimestamp(t.created_at),
          updatedAt: t.updated_at ? safeDateToTimestamp(t.updated_at) : undefined,
          synced: true,
        }));
        result.counts.transactions = result.transactions.length;
      }

      useSyncStore.getState().setPullProgress('budgets');
      // 3. Pull Budgets (with nested budget_items)
      const { data: budgets, error: budgetsError } = await executePull(
        async () =>
          await supabase
            .from('budgets')
            .select(
              `
              id, owner_id, user_id, title, currency, total_budget, pinned, created_at, updated_at,
              total_spent, total_income, net_spent, remaining, is_overspent,
              items:budget_items(id, owner_id, user_id, budget_id, transaction_id, title, amount, type, created_at, updated_at)
            `,
            )
            .eq('owner_id', cloudUserId),
      );

      if (budgetsError) {
        if (isJwtExpiredError(budgetsError)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw budgetsError;
        }
        throw new Error(`Failed to pull budgets: ${budgetsError.message || 'Unknown error'}`);
      }

      if (budgets) {
        result.budgets = budgets.map((b: any) => ({
          id: b.id,
          friendId: '',
          title: b.title,
          currency: normalizeCurrency(b.currency),
          totalBudget: Number(b.total_budget) || 0,
          items: (b.items || []).map((item: any) => ({
            id: item.id,
            budgetId: item.budget_id,
            transactionId: item.transaction_id || undefined,
            title: item.title,
            amount: Number(item.amount) || 0,
            type: item.type === 'income' ? 'income' : 'expense',
            createdAt: safeDateToTimestamp(item.created_at),
            updatedAt: item.updated_at ? safeDateToTimestamp(item.updated_at) : undefined,
            synced: true,
          })),
          pinned: b.pinned || false,
          createdAt: safeDateToTimestamp(b.created_at),
          updatedAt: b.updated_at ? safeDateToTimestamp(b.updated_at) : undefined,
          synced: true,
          totalSpent: Number(b.total_spent) || 0,
          totalIncome: Number(b.total_income) || 0,
          netSpent: Number(b.net_spent) || 0,
          remaining: Number(b.remaining) || 0,
          isOverspent: Boolean(b.is_overspent),
        }));
        result.counts.budgets = result.budgets.length;
        result.counts.budgetItems = result.budgets.reduce((sum, b) => sum + b.items.length, 0);
      }

      useSyncStore.getState().setPullProgress(undefined);
      return result;
    } catch (error: any) {
      useSyncStore.getState().setPullProgress(undefined);
      const errorMessage = error.message || 'Unknown error occurred during data pull';
      const isTimeout = errorMessage.includes('timeout');

      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setLastError({
        code: isTimeout ? 'TIMEOUT' : 'PULL_ERROR',
        message: isTimeout ? 'Network timeout. Check your connection and retry.' : errorMessage,
        details: error,
        at: Date.now(),
      });

      throw error;
    }
  },
};

// Helper to safely convert timestamp to ISO string
// Returns current date ISO string if timestamp is invalid
const safeTimestampToISO = (timestamp: number | undefined | null): string => {
  if (!timestamp || !Number.isFinite(timestamp) || timestamp <= 0) return new Date().toISOString();

  const date = new Date(timestamp);
  // Check if date is valid
  if (isNaN(date.getTime())) return new Date().toISOString();

  return date.toISOString();
};

// Helper to safely convert ISO string or timestamp to number (milliseconds)
// Returns current timestamp if date is invalid
const safeDateToTimestamp = (dateValue: string | null | undefined): number => {
  if (!dateValue) return Date.now();

  const date = new Date(dateValue);
  // Check if date is valid
  if (isNaN(date.getTime())) return Date.now();
  return date.getTime();
};

const mapFriendFromDb = (row: any): Friend => ({
  id: row.id,
  name: row.name,
  email: undefined,
  bio: row.bio || '',
  imageUri: null,
  currency: normalizeCurrency(row.currency),
  createdAt: safeDateToTimestamp(row.created_at),
  updatedAt: row.updated_at ? safeDateToTimestamp(row.updated_at) : undefined,
  synced: true,
  pinned: Boolean(row.pinned),
});

// Helpers to clean up data before sending to DB (e.g. remove 'items' from budget object)
const mapFriendToDb = (f: Friend, cloudUserId: string, clerkUserId: string) => {
  return {
    id: f.id, // TEXT (local string ID)
    owner_id: cloudUserId, // UUID (FK to app_users)
    user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
    name: f.name,
    bio: f.bio || null,
    currency: normalizeCurrency(f.currency),
    pinned: f.pinned,
    created_at: safeTimestampToISO(f.createdAt),
    updated_at: safeTimestampToISO(f.updatedAt),
  };
};

const mapTransactionToDb = (t: Transaction, cloudUserId: string, clerkUserId: string) => ({
  id: t.id, // TEXT (local string ID)
  owner_id: cloudUserId, // UUID (FK to app_users)
  user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
  friend_id: t.friendId, // TEXT (FK to friends, map camel to snake)
  budget_id: t.budgetId || null,
  amount: Math.abs(t.amount), // Always positive, use sign for direction
  description: t.title || t.note || null, // Use title as description
  sign: t.sign === -1 ? -1 : 1,
  created_at: safeTimestampToISO(t.createdAt),
  updated_at: safeTimestampToISO(t.updatedAt),
});

const mapBudgetToDb = (b: Budget, cloudUserId: string, clerkUserId: string) => {
  return {
    id: b.id, // TEXT (local string ID)
    owner_id: cloudUserId, // UUID (FK to app_users)
    user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
    title: b.title,
    currency: b.currency,
    total_budget: b.totalBudget,
    pinned: b.pinned,
    created_at: safeTimestampToISO(b.createdAt),
    updated_at: safeTimestampToISO(b.updatedAt),
  };
};

const mapBudgetItemToDb = (bi: BudgetItem, cloudUserId: string, clerkUserId: string) => ({
  id: bi.id, // TEXT (local string ID)
  owner_id: cloudUserId, // UUID (FK to app_users)
  user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
  budget_id: bi.budgetId, // TEXT (FK to budgets)
  transaction_id: bi.transactionId || null,
  title: bi.title,
  amount: Math.abs(bi.amount),
  type: getBudgetItemType(bi),
  created_at: safeTimestampToISO(bi.createdAt),
  updated_at: safeTimestampToISO(bi.updatedAt),
});
