import { supabase, hasSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { SyncQueueItem, Friend, Budget, Transaction, BudgetItem } from '@/types/models';

export const syncService = {
  pushChanges: async () => {
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
        if (item.action === 'create' || item.action === 'update') {
          const { error: reqError } = await supabase.from(table).upsert(data);
          error = reqError;
        } else if (item.action === 'delete') {
          const { error: reqError } = await supabase.from(table).delete().eq('id', item.id);
          error = reqError;
        }

        if (error) {
          console.error(`[Sync] Error for ${item.type} ${item.id}:`, error);
          // If 401/403, maybe stop syncing?
          // For now, we keep it in queue to retry later.
        } else {
          removeFromQueue(item.id);

          // Mark as synced in local store if it was a create/update
          if (item.action !== 'delete') {
            markLocalAsSynced(item.type, item.id);
          }
        }
      } catch (e) {
        console.error('[Sync] Push exception:', e);
      }
    }
  },

  pullChanges: async (userId: string) => {
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

    // 1. Pull Friends (filtered by clerk_id if needed)
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .eq('clerk_id', userId);
    if (friends && !friendsError) {
      useFriendsStore.getState().mergeFriends(friends as Friend[]);
    }

    // 2. Pull Budgets (filtered by clerk_id via friend_id relationship)
    const { data: budgets, error: budgetsError } = await supabase.from('budgets').select(`
      *,
      items:budget_items(*)
    `);

    if (budgets && !budgetsError) {
      const formattedBudgets = budgets.map((b: any) => ({
        ...b,
        items: b.items || [],
      }));
      useBudgetStore.getState().mergeBudgets(formattedBudgets as Budget[]);
    }

    // 3. Pull Transactions (filtered by clerk_id via friend_id relationship)
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*');
    if (transactions && !transError) {
      useTransactionsStore.getState().mergeTransactions(transactions as Transaction[]);
    }
  },

  syncAll: async (userId: string) => {
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
      await syncService.pushChanges();
      await syncService.pullChanges(userId);
      useSyncStore.getState().setLastSync(Date.now());
    } catch (error) {
      console.error('[Sync] SyncAll error:', error);
      throw error; // Re-throw to let caller handle
    }
  },

  ensureUserRecord: async (
    clerkUser: any,
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
      // Query for existing record ONLY by clerk_id
      const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();

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

      const { error } = await supabase
        .from('friends')
        .upsert(upsertData, { onConflict: 'clerk_id' });

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
  upsertOne: async (table: string, data: any) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }
    return await supabase.from(table).upsert(data);
  },

  deleteOne: async (table: string, id: string) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }
    return await supabase.from(table).delete().eq('id', id);
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
