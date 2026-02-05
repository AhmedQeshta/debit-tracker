import { supabase, hasSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { Friend, Budget, Transaction, BudgetItem } from '@/types/models';
import { retryOnceOnJwtExpired, isJwtExpiredError, GetTokenFunction, getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';

// Timeout wrapper for Supabase queries (15 seconds)
const SYNC_TIMEOUT_MS = 15000;

const withTimeout = <T>(promise: Promise<T>, ms: number = SYNC_TIMEOUT_MS): Promise<T> =>
{
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Network timeout after ${ms}ms. Check your connection and retry.`)), ms),
    ),
  ]);
};

export const syncService = {
  pushChanges: async (getToken: GetTokenFunction, clerkUserId: string) =>
  {
    // Sync gating: if sync is disabled, don't write to Supabase
    if (!useSyncStore.getState().syncEnabled)
    {
      console.log('[Sync] pushChanges skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken())
    {
      console.log('[Sync] pushChanges skipped: no token');
      return; // Return silently, don't throw
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder'))
    {
      console.log('[Sync] Sync skipped: Placeholder configuration');
      return;
    }

    // Get cloudUserId from store (UUID for owner_id FK)
    const { cloudUserId } = useSyncStore.getState();
    if (!cloudUserId)
    {
      console.log('[Sync] pushChanges skipped: no cloudUserId (user not ensured)');
      return; // Return silently
    }

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

    // If no dirty items AND no deletions, nothing to sync
    if (totalDirty === 0 && totalDeleted === 0)
    {
      console.log('[Sync] No dirty items or deletions to push');
      return;
    }

    console.log(
      `[Sync] Starting push: ${dirtyFriends.length} friends, ${dirtyTransactions.length} transactions, ${dirtyBudgets.length} budgets, ${dirtyBudgetItems.length} items`,
    );

    // Helper to execute upsert with retry
    const executeUpsert = async (table: string, data: any[]) =>
    {
      if (data.length === 0) return { success: true, count: 0 };
      try
      {
        const result = await retryOnceOnJwtExpired(
          async () => await supabase.from(table).upsert(data, { onConflict: 'id' }),
          getToken,
        );
        if (result.error)
        {
          if (isJwtExpiredError(result.error))
          {
            useSyncStore.getState().setSyncStatus('needs_login');
            throw result.error;
          }
          return { success: false, error: result.error, count: 0 };
        }
        return { success: true, count: data.length };
      } catch (e: any)
      {
        if (isJwtExpiredError(e))
        {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw e;
        }
        return { success: false, error: e, count: 0 };
      }
    };

    let friendsSynced = 0;
    let transactionsSynced = 0;
    let budgetsSynced = 0;
    let itemsSynced = 0;

    try
    {
      // A) Push Friends first
      if (dirtyFriends.length > 0)
      {
        const friendsData = dirtyFriends.map((f) =>
          mapFriendToDb(f, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('friends', friendsData);
        if (result.success)
        {
          friendsSynced = result.count;
          dirtyFriends.forEach((f) => useFriendsStore.getState().markAsSynced(f.id));
          console.log(`[Sync] Pushed ${friendsSynced} friends: success`);
        } else
        {
          console.error(`[Sync] Failed to push friends:`, result.error);
          throw result.error;
        }
      }

      // B) Push Transactions (after friends exist)
      if (dirtyTransactions.length > 0)
      {
        const transactionsData = dirtyTransactions.map((t) =>
          mapTransactionToDb(t, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('transactions', transactionsData);
        if (result.success)
        {
          transactionsSynced = result.count;
          dirtyTransactions.forEach((t) =>
            useTransactionsStore.getState().markAsSynced(t.id),
          );
          console.log(`[Sync] Pushed ${transactionsSynced} transactions: success`);
        } else
        {
          console.error(`[Sync] Failed to push transactions:`, result.error);
          throw result.error;
        }
      }

      // C) Push Budgets
      if (dirtyBudgets.length > 0)
      {
        const budgetsData = dirtyBudgets.map((b) =>
          mapBudgetToDb(b, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('budgets', budgetsData);
        if (result.success)
        {
          budgetsSynced = result.count;
          dirtyBudgets.forEach((b) => useBudgetStore.getState().markAsSynced(b.id));
          console.log(`[Sync] Pushed ${budgetsSynced} budgets: success`);
        } else
        {
          console.error(`[Sync] Failed to push budgets:`, result.error);
          throw result.error;
        }
      }

      // D) Push Budget Items (after budgets exist)
      if (dirtyBudgetItems.length > 0)
      {
        const itemsData = dirtyBudgetItems.map((bi) =>
          mapBudgetItemToDb(bi, cloudUserId, clerkUserId),
        );
        const result = await executeUpsert('budget_items', itemsData);
        if (result.success)
        {
          itemsSynced = result.count;
          // Mark items as synced (without marking budget dirty)
          dirtyBudgetItems.forEach((item) =>
          {
            useBudgetStore.getState().markItemAsSynced(item.budgetId, item.id);
          });
          console.log(`[Sync] Pushed ${itemsSynced} budget items: success`);
        } else
        {
          console.error(`[Sync] Failed to push budget items:`, result.error);
          throw result.error;
        }
      }

      // E) Handle deletions (children first, then parents)
      // Note: deleted items are already fetched above, reusing them here

      // Initialize deletion counters (used in final log regardless of whether deletions occurred)
      let budgetItemsDeleted = 0;
      let transactionsDeleted = 0;
      let budgetsDeleted = 0;
      let friendsDeleted = 0;

      if (totalDeleted > 0)
      {
        console.log(
          `[Sync] Processing deletions: ${deletedBudgetItems.length} budget items, ${deletedTransactions.length} transactions, ${deletedBudgets.length} budgets, ${deletedFriends.length} friends`,
        );

        // Helper to execute delete with retry
        const executeDelete = async (table: string, ids: string[]) =>
        {
          if (ids.length === 0) return { success: true, count: 0 };
          try
          {
            // Delete in batches to avoid query size limits
            const batchSize = 100;
            let deletedCount = 0;
            for (let i = 0; i < ids.length; i += batchSize)
            {
              const batch = ids.slice(i, i + batchSize);
              const result = await retryOnceOnJwtExpired(
                async () =>
                  await supabase
                    .from(table)
                    .delete()
                    .eq('owner_id', cloudUserId)
                    .in('id', batch),
                getToken,
              );
              if (result.error)
              {
                if (isJwtExpiredError(result.error))
                {
                  useSyncStore.getState().setSyncStatus('needs_login');
                  throw result.error;
                }
                return { success: false, error: result.error, count: deletedCount };
              }
              deletedCount += batch.length;
            }
            return { success: true, count: deletedCount };
          } catch (e: any)
          {
            if (isJwtExpiredError(e))
            {
              useSyncStore.getState().setSyncStatus('needs_login');
              throw e;
            }
            return { success: false, error: e, count: 0 };
          }
        };

        try
        {
          // 1. Delete Budget Items first (children)
          if (deletedBudgetItems.length > 0)
          {
            const itemIds = deletedBudgetItems.map((item) => item.id);
            const result = await executeDelete('budget_items', itemIds);
            if (result.success)
            {
              budgetItemsDeleted = result.count;
              // Remove from store after successful deletion
              deletedBudgetItems.forEach((item) =>
                useBudgetStore.getState().removeDeletedBudgetItem(item.budgetId, item.id),
              );
              console.log(`[Sync] Deleted ${budgetItemsDeleted} budget items: success`);
            } else
            {
              console.error(`[Sync] Failed to delete budget items:`, result.error);
              // Keep in store for retry
            }
          }

          // 2. Delete Transactions (children of friends)
          if (deletedTransactions.length > 0)
          {
            const transactionIds = deletedTransactions.map((t) => t.id);
            const result = await executeDelete('transactions', transactionIds);
            if (result.success)
            {
              transactionsDeleted = result.count;
              // Remove from store after successful deletion
              deletedTransactions.forEach((t) =>
                useTransactionsStore.getState().removeDeletedTransaction(t.id),
              );
              console.log(`[Sync] Deleted ${transactionsDeleted} transactions: success`);
            } else
            {
              console.error(`[Sync] Failed to delete transactions:`, result.error);
              // Keep in store for retry
            }
          }

          // 3. Delete Budgets (parents, children already deleted)
          if (deletedBudgets.length > 0)
          {
            const budgetIds = deletedBudgets.map((b) => b.id);
            const result = await executeDelete('budgets', budgetIds);
            if (result.success)
            {
              budgetsDeleted = result.count;
              // Remove from store after successful deletion
              deletedBudgets.forEach((b) => useBudgetStore.getState().removeDeletedBudget(b.id));
              console.log(`[Sync] Deleted ${budgetsDeleted} budgets: success`);
            } else
            {
              console.error(`[Sync] Failed to delete budgets:`, result.error);
              // Keep in store for retry
            }
          }

          // 4. Delete Friends last (parents, children already deleted)
          if (deletedFriends.length > 0)
          {
            const friendIds = deletedFriends.map((f) => f.id);
            const result = await executeDelete('friends', friendIds);
            if (result.success)
            {
              friendsDeleted = result.count;
              // Remove from store after successful deletion
              deletedFriends.forEach((f) => useFriendsStore.getState().removeDeletedFriend(f.id));
              console.log(`[Sync] Deleted ${friendsDeleted} friends: success`);
            } else
            {
              console.error(`[Sync] Failed to delete friends:`, result.error);
              // Keep in store for retry
            }
          }
        } catch (e: any)
        {
          console.error('[Sync] Deletion processing failed:', e);
          if (isJwtExpiredError(e))
          {
            useSyncStore.getState().setSyncStatus('needs_login');
          }
          // Don't throw - allow upserts to complete even if deletions fail
          // Deletions will retry on next sync
        }
      }

      console.log(
        `[Sync] Push complete: ${friendsSynced}/${dirtyFriends.length} friends, ${transactionsSynced}/${dirtyTransactions.length} transactions, ${budgetsSynced}/${dirtyBudgets.length} budgets, ${itemsSynced}/${dirtyBudgetItems.length} items synced. Deletions: ${budgetItemsDeleted} items, ${transactionsDeleted} transactions, ${budgetsDeleted} budgets, ${friendsDeleted} friends`,
      );
    } catch (e: any)
    {
      console.error('[Sync] Push failed:', e);
      if (isJwtExpiredError(e))
      {
        useSyncStore.getState().setSyncStatus('needs_login');
      }
      throw e;
    }
  },

  pullChanges: async (cloudUserId: string, getToken: GetTokenFunction) =>
  {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't read from Supabase
    if (!syncEnabled)
    {
      console.log('[Sync] pullChanges skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken())
    {
      console.log('[Sync] pullChanges skipped: no token');
      throw new Error(
        'Sync is enabled but no authentication token available. Cannot sync without authentication.',
      );
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder'))
    {
      console.log('[Sync] Sync skipped: Placeholder configuration');
      return;
    }

    // Helper to execute a pull request with retry logic
    const executePull = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) =>
    {
      return retryOnceOnJwtExpired(queryFn, getToken);
    };

    // 1. Pull Friends (filtered by owner_id)
    const { data: friends, error: friendsError } = await executePull(
      async () => await supabase.from('friends').select('*').eq('owner_id', cloudUserId),
    );
    if (friends && !friendsError)
    {
      // Map DB format to local format
      const mappedFriends = friends.map((f: any) => ({
        id: f.id,
        name: f.name,
        email: undefined, // Friends don't have email in new schema
        bio: f.bio || '',
        imageUri: null, // Not in new schema
        currency: f.currency || '$', // Read from database, default to '$' if not present
        createdAt: safeDateToTimestamp(f.created_at),
        updatedAt: f.updated_at ? safeDateToTimestamp(f.updated_at) : undefined,
        synced: true,
        pinned: false, // Not in new schema
      }));
      useFriendsStore.getState().mergeFriends(mappedFriends as Friend[]);
    } else if (friendsError)
    {
      console.error('[Sync] Error pulling friends:', friendsError);
      if (isJwtExpiredError(friendsError))
      {
        console.error('[Sync] JWT expired and refresh failed while pulling friends, setting sync status to needs_login');
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }

    // 2. Pull Budgets (filtered by owner_id)
    const { data: budgets, error: budgetsError } = await executePull(
      async () =>
        await supabase
          .from('budgets')
          .select(`
        *,
        items:budget_items(*)
      `)
          .eq('owner_id', cloudUserId),
    );

    if (budgets && !budgetsError)
    {
      // Map DB format to local format
      const formattedBudgets = budgets.map((b: any) => ({
        id: b.id,
        friendId: '', // Not used in new schema (budgets owned by app_user, not friend)
        title: b.title,
        currency: b.currency || '$',
        totalBudget: Number(b.total_budget) || 0,
        items: (b.items || []).map((item: any) => ({
          id: item.id,
          budgetId: item.budget_id,
          title: item.title,
          amount: Number(item.amount) || 0,
          createdAt: safeDateToTimestamp(item.created_at),
          updatedAt: item.updated_at ? safeDateToTimestamp(item.updated_at) : undefined,
          synced: true,
        })),
        pinned: b.pinned || false,
        createdAt: safeDateToTimestamp(b.created_at),
        updatedAt: b.updated_at ? safeDateToTimestamp(b.updated_at) : undefined,
        synced: true,
      }));
      useBudgetStore.getState().mergeBudgets(formattedBudgets as Budget[]);
    } else if (budgetsError)
    {
      console.error('[Sync] Error pulling budgets:', budgetsError);
      if (isJwtExpiredError(budgetsError))
      {
        console.error('[Sync] JWT expired and refresh failed while pulling budgets, setting sync status to needs_login');
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }

    // 3. Pull Transactions (filtered by owner_id)
    const { data: transactions, error: transError } = await executePull(
      async () => await supabase.from('transactions').select('*').eq('owner_id', cloudUserId),
    );
    if (transactions && !transError)
    {
      // Map DB format to local format
      const mappedTransactions = transactions.map((t: any) => ({
        id: t.id,
        friendId: t.friend_id,
        title: t.description || '',
        amount: (t.sign || 1) * Math.abs(t.amount), // Apply sign to amount
        sign: t.sign || (t.amount < 0 ? 1 : -1),
        category: 'General', // Not in new schema
        date: safeDateToTimestamp(t.created_at), // Use created_at as date
        note: '', // Not in new schema
        createdAt: safeDateToTimestamp(t.created_at),
        updatedAt: t.updated_at ? safeDateToTimestamp(t.updated_at) : undefined,
        synced: true,
      }));
      useTransactionsStore.getState().mergeTransactions(mappedTransactions as Transaction[]);
    } else if (transError)
    {
      console.error('[Sync] Error pulling transactions:', transError);
      if (isJwtExpiredError(transError))
      {
        console.error('[Sync] JWT expired and refresh failed while pulling transactions, setting sync status to needs_login');
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }
  },

  syncAll: async (cloudUserId: string, clerkUserId: string, getToken: GetTokenFunction) =>
  {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't sync
    if (!syncEnabled)
    {
      console.log('[Sync] syncAll skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken())
    {
      console.log('[Sync] syncAll skipped: no token');
      return; // Return silently
    }

    try
    {
      // Pull first, then push (as per requirements)
      await syncService.pullChanges(cloudUserId, getToken);
      await syncService.pushChanges(getToken, clerkUserId);
      useSyncStore.getState().setLastSync(Date.now());
      // Clear error status on successful sync
      useSyncStore.getState().setSyncStatus(null);
    } catch (error: any)
    {
      console.error('[Sync] SyncAll error:', error);
      // If it's a JWT error, status is already set by pushChanges/pullChanges
      if (!isJwtExpiredError(error))
      {
        useSyncStore.getState().setSyncStatus('error');
      }
      // Don't throw - let caller handle gracefully
    }
  },

  ensureUserRecord: async (
    clerkUser: any,
    getToken: GetTokenFunction,
  ): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> =>
  {
    // Delegate to userService
    const result = await ensureAppUser(clerkUser, getToken);
    return {
      ok: result.ok,
      skipped: result.skipped,
      reason: result.reason,
    };
  },

  // Direct upsert helper for "Write-Through"
  upsertOne: async (table: string, data: any, getToken: GetTokenFunction) =>
  {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled)
    {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken())
    {
      throw new Error('No authentication token available');
    }

    return retryOnceOnJwtExpired(async () => await supabase.from(table).upsert(data), getToken);
  },

  deleteOne: async (table: string, id: string, getToken: GetTokenFunction) =>
  {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled)
    {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken())
    {
      throw new Error('No authentication token available');
    }

    return retryOnceOnJwtExpired(
      async () => await supabase.from(table).delete().eq('id', id),
      getToken,
    );
  },

  pullAllDataForUser: async (cloudUserId: string, getToken: GetTokenFunction) =>
  {
    const { syncEnabled } = useSyncStore.getState();

    // Gate: if sync disabled -> return silently
    if (!syncEnabled)
    {
      console.log('[Sync] pullAllDataForUser skipped: sync disabled');
      return { friends: [], transactions: [], budgets: [], budgetItems: [], counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 } };
    }

    // Gate: if no token -> return silently
    if (!hasSupabaseToken())
    {
      console.log('[Sync] pullAllDataForUser skipped: no token');
      return { friends: [], transactions: [], budgets: [], budgetItems: [], counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 } };
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder'))
    {
      console.log('[Sync] pullAllDataForUser skipped: Placeholder configuration');
      return { friends: [], transactions: [], budgets: [], budgetItems: [], counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 } };
    }

    // Ensure token is fresh (refresh if needed)
    try
    {
      const tokenResult = await getFreshSupabaseJwt(getToken);
      if (!tokenResult.token && tokenResult.error !== 'template_missing')
      {
        console.log('[Sync] pullAllDataForUser skipped: failed to get token');
        return { friends: [], transactions: [], budgets: [], budgetItems: [], counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 } };
      }
    } catch (e)
    {
      console.error('[Sync] Error refreshing token:', e);
      return { friends: [], transactions: [], budgets: [], budgetItems: [], counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 } };
    }

    // Helper to execute a pull request with retry logic and timeout
    const executePull = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) =>
    {
      return withTimeout(retryOnceOnJwtExpired(queryFn, getToken));
    };

    const result = {
      friends: [] as Friend[],
      transactions: [] as Transaction[],
      budgets: [] as Budget[],
      budgetItems: [] as BudgetItem[],
      counts: { friends: 0, transactions: 0, budgets: 0, budgetItems: 0 },
    };

    try
    {
      useSyncStore.getState().setPullProgress('friends');
      // 1. Pull Friends (filtered by owner_id)
      const { data: friends, error: friendsError } = await executePull(
        async () => await supabase.from('friends').select('id, owner_id, user_id, name, bio, created_at, updated_at').eq('owner_id', cloudUserId),
      );

      if (friendsError)
      {
        if (isJwtExpiredError(friendsError))
        {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw friendsError;
        }
        throw new Error(`Failed to pull friends: ${friendsError.message || 'Unknown error'}`);
      }

      if (friends)
      {
        result.friends = friends.map((f: any) => ({
          id: f.id,
          name: f.name,
          email: undefined,
          bio: f.bio || '',
          imageUri: null,
          currency: '$',
          createdAt: safeDateToTimestamp(f.created_at),
          updatedAt: f.updated_at ? safeDateToTimestamp(f.updated_at) : undefined,
          synced: true,
          pinned: false,
        }));
        result.counts.friends = result.friends.length;
      }

      useSyncStore.getState().setPullProgress('transactions');
      // 2. Pull Transactions (filtered by owner_id)
      const { data: transactions, error: transError } = await executePull(
        async () => await supabase.from('transactions').select('id, owner_id, user_id, friend_id, amount, description, sign, created_at, updated_at').eq('owner_id', cloudUserId),
      );

      if (transError)
      {
        if (isJwtExpiredError(transError))
        {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw transError;
        }
        throw new Error(`Failed to pull transactions: ${transError.message || 'Unknown error'}`);
      }

      if (transactions)
      {
        result.transactions = transactions.map((t: any) => ({
          id: t.id,
          friendId: t.friend_id,
          title: t.description || '',
          amount: (t.sign || 1) * Math.abs(t.amount),
          sign: t.sign || (t.amount < 0 ? 1 : -1),
          category: 'General',
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
            .select(`
              id, owner_id, user_id, title, currency, total_budget, pinned, created_at, updated_at,
              items:budget_items(id, owner_id, user_id, budget_id, title, amount, created_at, updated_at)
            `)
            .eq('owner_id', cloudUserId),
      );

      if (budgetsError)
      {
        if (isJwtExpiredError(budgetsError))
        {
          useSyncStore.getState().setSyncStatus('needs_login');
          throw budgetsError;
        }
        throw new Error(`Failed to pull budgets: ${budgetsError.message || 'Unknown error'}`);
      }

      if (budgets)
      {
        result.budgets = budgets.map((b: any) => ({
          id: b.id,
          friendId: '',
          title: b.title,
          currency: b.currency || '$',
          totalBudget: Number(b.total_budget) || 0,
          items: (b.items || []).map((item: any) => ({
            id: item.id,
            budgetId: item.budget_id,
            title: item.title,
            amount: Number(item.amount) || 0,
            createdAt: safeDateToTimestamp(item.created_at),
            updatedAt: item.updated_at ? safeDateToTimestamp(item.updated_at) : undefined,
            synced: true,
          })),
          pinned: b.pinned || false,
          createdAt: safeDateToTimestamp(b.created_at),
          updatedAt: b.updated_at ? safeDateToTimestamp(b.updated_at) : undefined,
          synced: true,
        }));
        result.counts.budgets = result.budgets.length;
        result.counts.budgetItems = result.budgets.reduce((sum, b) => sum + b.items.length, 0);
      }

      useSyncStore.getState().setPullProgress(undefined);
      return result;
    } catch (error: any)
    {
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
const safeTimestampToISO = (timestamp: number | undefined | null): string =>
{
  if (!timestamp || !Number.isFinite(timestamp) || timestamp <= 0)
  {
    return new Date().toISOString();
  }
  const date = new Date(timestamp);
  // Check if date is valid
  if (isNaN(date.getTime()))
  {
    return new Date().toISOString();
  }
  return date.toISOString();
};

// Helper to safely convert ISO string or timestamp to number (milliseconds)
// Returns current timestamp if date is invalid
const safeDateToTimestamp = (dateValue: string | null | undefined): number =>
{
  if (!dateValue)
  {
    return Date.now();
  }
  const date = new Date(dateValue);
  // Check if date is valid
  if (isNaN(date.getTime()))
  {
    return Date.now();
  }
  return date.getTime();
};

// Helpers to clean up data before sending to DB (e.g. remove 'items' from budget object)
const mapFriendToDb = (f: Friend, cloudUserId: string, clerkUserId: string) =>
{
  return {
    id: f.id, // TEXT (local string ID)
    owner_id: cloudUserId, // UUID (FK to app_users)
    user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
    name: f.name,
    bio: f.bio || null,
    currency: f.currency || '$',
    created_at: safeTimestampToISO(f.createdAt),
    updated_at: new Date().toISOString(),
  };
};

const mapTransactionToDb = (t: Transaction, cloudUserId: string, clerkUserId: string) => ({
  id: t.id, // TEXT (local string ID)
  owner_id: cloudUserId, // UUID (FK to app_users)
  user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
  friend_id: t.friendId, // TEXT (FK to friends, map camel to snake)
  amount: Math.abs(t.amount), // Always positive, use sign for direction
  description: t.title || t.note || null, // Use title as description
  sign: t.sign || (t.amount < 0 ? -1 : 1), // 1 = add debt, -1 = reduce debt
  created_at: safeTimestampToISO(t.createdAt),
  updated_at: new Date().toISOString(),
});

const mapBudgetToDb = (b: Budget, cloudUserId: string, clerkUserId: string) =>
{
  return {
    id: b.id, // TEXT (local string ID)
    owner_id: cloudUserId, // UUID (FK to app_users)
    user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
    title: b.title,
    currency: b.currency,
    total_budget: b.totalBudget,
    pinned: b.pinned,
    created_at: safeTimestampToISO(b.createdAt),
    updated_at: new Date().toISOString(),
  };
};

const mapBudgetItemToDb = (bi: BudgetItem, cloudUserId: string, clerkUserId: string) => ({
  id: bi.id, // TEXT (local string ID)
  owner_id: cloudUserId, // UUID (FK to app_users)
  user_id: clerkUserId, // TEXT (Clerk user ID for RLS)
  budget_id: bi.budgetId, // TEXT (FK to budgets)
  title: bi.title,
  amount: bi.amount,
  created_at: safeTimestampToISO(bi.createdAt),
  updated_at: new Date().toISOString(),
});
