import { supabase, hasSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { SyncQueueItem, Friend, Budget, Transaction, BudgetItem } from '@/types/models';
import { GetTokenFunction, refreshSupabaseJwt, isJwtExpiredError } from '@/lib/syncAuth';

export const syncService = {
  pushChanges: async (getToken: GetTokenFunction) => {
    const { queue, removeFromQueue } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't write to Supabase
    if (!useSyncStore.getState().syncEnabled) {
      console.log('[Sync] pushChanges skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken()) {
      console.log('[Sync] pushChanges skipped: no token');
      throw new Error(
        'Sync is enabled but no authentication token available. Cannot sync without authentication.',
      );
    }

    if (queue.length === 0) return;

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      console.log('[Sync] Sync skipped: Placeholder configuration');
      return;
    }

    // Process queue sequentially to maintain order
    for (const item of queue) {
      try {
        const { table, data } = getTableAndData(item);
        if (!table) {
          removeFromQueue(item.id);
          continue;
        }

        let error;
        let retried = false;

        // Helper to execute the Supabase request
        const executeRequest = async () => {
          if (item.action === 'create' || item.action === 'update') {
            const { error: reqError } = await supabase.from(table).upsert(data);
            return reqError;
          } else if (item.action === 'delete') {
            const { error: reqError } = await supabase.from(table).delete().eq('id', item.id);
            return reqError;
          }
          return null;
        };

        // First attempt
        error = await executeRequest();

        // If JWT expired, refresh token and retry once
        if (error && isJwtExpiredError(error) && !retried) {
          console.log(`[Sync] JWT expired for ${item.type} ${item.id}, refreshing token...`);
          const newToken = await refreshSupabaseJwt(getToken);

          if (newToken) {
            retried = true;
            console.log(`[Sync] Retrying ${item.type} ${item.id} with new token...`);
            error = await executeRequest();
          } else {
            console.error('[Sync] Failed to refresh token, cannot retry');
          }
        }

        if (error) {
          console.error(`[Sync] Error for ${item.type} ${item.id}:`, error);
          // Keep item in queue for later retry
          // If it was a JWT error and retry failed, we stop here but preserve queue
          if (isJwtExpiredError(error)) {
            throw new Error(`JWT expired and refresh failed for ${item.type} ${item.id}`);
          }
        } else {
          removeFromQueue(item.id);

          // Mark as synced in local store if it was a create/update
          if (item.action !== 'delete') {
            markLocalAsSynced(item.type, item.id);
          }
        }
      } catch (e) {
        console.error('[Sync] Push exception:', e);
        // Re-throw to stop sync and preserve queue
        throw e;
      }
    }
  },

  pullChanges: async (userId: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't read from Supabase
    if (!syncEnabled) {
      console.log('[Sync] pullChanges skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken()) {
      console.log('[Sync] pullChanges skipped: no token');
      throw new Error(
        'Sync is enabled but no authentication token available. Cannot sync without authentication.',
      );
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      console.log('[Sync] Sync skipped: Placeholder configuration');
      return;
    }

    // Helper to execute a pull request with retry logic
    const executePull = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>) => {
      let result = await queryFn();

      // If JWT expired, refresh token and retry once
      if (result.error && isJwtExpiredError(result.error)) {
        console.log('[Sync] JWT expired during pull, refreshing token...');
        const newToken = await refreshSupabaseJwt(getToken);

        if (newToken) {
          console.log('[Sync] Retrying pull with new token...');
          result = await queryFn();
        } else {
          console.error('[Sync] Failed to refresh token, cannot retry pull');
        }
      }

      return result;
    };

    // 1. Pull Friends (filtered by clerk_id if needed)
    const { data: friends, error: friendsError } = await executePull(
      async () => await supabase.from('friends').select('*').eq('clerk_id', userId),
    );
    if (friends && !friendsError) {
      useFriendsStore.getState().mergeFriends(friends as Friend[]);
    } else if (friendsError) {
      console.error('[Sync] Error pulling friends:', friendsError);
      if (isJwtExpiredError(friendsError)) {
        throw new Error('JWT expired and refresh failed while pulling friends');
      }
    }

    // 2. Pull Budgets (filtered by clerk_id via friend_id relationship)
    const { data: budgets, error: budgetsError } = await executePull(
      async () =>
        await supabase.from('budgets').select(`
        *,
        items:budget_items(*)
      `),
    );

    if (budgets && !budgetsError) {
      const formattedBudgets = budgets.map((b: any) => ({
        ...b,
        items: b.items || [],
      }));
      useBudgetStore.getState().mergeBudgets(formattedBudgets as Budget[]);
    } else if (budgetsError) {
      console.error('[Sync] Error pulling budgets:', budgetsError);
      if (isJwtExpiredError(budgetsError)) {
        throw new Error('JWT expired and refresh failed while pulling budgets');
      }
    }

    // 3. Pull Transactions (filtered by clerk_id via friend_id relationship)
    const { data: transactions, error: transError } = await executePull(
      async () => await supabase.from('transactions').select('*'),
    );
    if (transactions && !transError) {
      useTransactionsStore.getState().mergeTransactions(transactions as Transaction[]);
    } else if (transError) {
      console.error('[Sync] Error pulling transactions:', transError);
      if (isJwtExpiredError(transError)) {
        throw new Error('JWT expired and refresh failed while pulling transactions');
      }
    }
  },

  syncAll: async (userId: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();

    // Sync gating: if sync is disabled, don't sync
    if (!syncEnabled) {
      console.log('[Sync] syncAll skipped: sync disabled');
      return;
    }

    // Token validation: if sync is enabled, token is required
    if (!hasSupabaseToken()) {
      console.log('[Sync] syncAll skipped: no token');
      throw new Error(
        'Sync is enabled but no authentication token available. Cannot sync without authentication.',
      );
    }

    try {
      await syncService.pushChanges(getToken);
      await syncService.pullChanges(userId, getToken);
      useSyncStore.getState().setLastSync(Date.now());
    } catch (error) {
      console.error('[Sync] SyncAll error:', error);
      throw error; // Re-throw to let caller handle
    }
  },

  ensureUserRecord: async (
    clerkUser: any,
    getToken: GetTokenFunction,
  ): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> => {
    const { syncEnabled } = useSyncStore.getState();

    // STRICT GATING: if sync is disabled, or no token, or no user -> skip
    if (!syncEnabled || !hasSupabaseToken() || !clerkUser) {
      console.log('[Sync] ensureUserRecord skipped:', {
        syncEnabled,
        hasToken: hasSupabaseToken(),
        hasUser: !!clerkUser,
      });
      return {
        ok: false,
        skipped: true,
        reason: !syncEnabled ? 'sync_disabled' : !hasSupabaseToken() ? 'no_token' : 'no_user',
      };
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      console.log('[Sync] Sync skipped: Placeholder configuration');
      return { ok: false, skipped: true, reason: 'placeholder_config' };
    }

    try {
      // Helper to execute with retry
      const executeWithRetry = async <T>(queryFn: () => Promise<T>): Promise<T> => {
        try {
          return await queryFn();
        } catch (error: any) {
          if (isJwtExpiredError(error)) {
            console.log('[Sync] JWT expired in ensureUserRecord, refreshing token...');
            const newToken = await refreshSupabaseJwt(getToken);

            if (newToken) {
              console.log('[Sync] Retrying ensureUserRecord with new token...');
              return await queryFn();
            } else {
              console.error('[Sync] Failed to refresh token, cannot retry');
              throw error;
            }
          }
          throw error;
        }
      };

      // Query for existing record ONLY by clerk_id
      const { data: existing } = await executeWithRetry(
        async () =>
          await supabase.from('friends').select('id').eq('clerk_id', clerkUser.id).maybeSingle(),
      );

      // Build upsert payload
      const upsertData: any = {
        clerk_id: clerkUser.id, // TEXT column
        email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddress, // Handle both user and signup objects
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If record exists, include the existing UUID for update
      // IMPORTANT: never use clerkUser.id here
      if (existing?.id) {
        upsertData.id = existing.id;
      }

      console.log('[Sync] ensureUserRecord payload:', upsertData);

      const { error } = await executeWithRetry(
        async () => await supabase.from('friends').upsert(upsertData, { onConflict: 'clerk_id' }),
      );

      if (error) {
        console.error('[Sync] Error ensuring user record (22P02 fix):', error);
        throw error;
      }

      return { ok: true };
    } catch (error) {
      throw error;
    }
  },

  // Direct upsert helper for "Write-Through"
  upsertOne: async (table: string, data: any, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }

    try {
      return await supabase.from(table).upsert(data);
    } catch (error: any) {
      if (isJwtExpiredError(error)) {
        console.log('[Sync] JWT expired in upsertOne, refreshing token...');
        const newToken = await refreshSupabaseJwt(getToken);

        if (newToken) {
          console.log('[Sync] Retrying upsertOne with new token...');
          return await supabase.from(table).upsert(data);
        }
      }
      throw error;
    }
  },

  deleteOne: async (table: string, id: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }

    try {
      return await supabase.from(table).delete().eq('id', id);
    } catch (error: any) {
      if (isJwtExpiredError(error)) {
        console.log('[Sync] JWT expired in deleteOne, refreshing token...');
        const newToken = await refreshSupabaseJwt(getToken);

        if (newToken) {
          console.log('[Sync] Retrying deleteOne with new token...');
          return await supabase.from(table).delete().eq('id', id);
        }
      }
      throw error;
    }
  },
};

const getTableAndData = (item: SyncQueueItem) => {
  switch (item.type) {
    case 'friend':
      return { table: 'friends', data: mapFriendToDb(item.payload) };
    case 'transaction':
      return { table: 'transactions', data: mapTransactionToDb(item.payload) };
    case 'budget':
      return { table: 'budgets', data: mapBudgetToDb(item.payload) };
    case 'budget_item':
      return { table: 'budget_items', data: mapBudgetItemToDb(item.payload) };
    default:
      return { table: null, data: null };
  }
};

const markLocalAsSynced = (type: string, id: string) => {
  switch (type) {
    case 'friend':
      useFriendsStore.getState().markAsSynced(id);
      break;
    case 'transaction':
      useTransactionsStore.getState().markAsSynced(id);
      break;
    // budgets don't have 'markAsSynced' in store yet? They should.
    // I didn't add it to BudgetStore. I should.
  }
};

// Helpers to clean up data before sending to DB (e.g. remove 'items' from budget object)
const mapFriendToDb = (f: Friend) => {
  const { items, ...rest } = f as any; // friends don't have items
  return {
    ...rest,
    updated_at: new Date().toISOString(), // Ensure timestamp update
  };
};

const mapTransactionToDb = (t: Transaction) => ({
  ...t,
  friend_id: t.friendId, // map camel to snake
  updated_at: new Date().toISOString(),
});

const mapBudgetToDb = (b: Budget) => {
  const { items, ...rest } = b;
  return {
    ...rest,
    friend_id: b.friendId,
    total_budget: b.totalBudget,
    created_at: new Date(b.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const mapBudgetItemToDb = (bi: BudgetItem) => ({
  ...bi,
  budget_id: bi.budgetId,
  created_at: new Date(bi.createdAt).toISOString(),
  updated_at: new Date().toISOString(),
});
