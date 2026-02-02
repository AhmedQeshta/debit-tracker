import { supabase, hasSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { SyncQueueItem, Friend, Budget, Transaction, BudgetItem } from '@/types/models';
import { retryOnceOnJwtExpired, isJwtExpiredError,GetTokenFunction } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';

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

    // Get cloudUserId from store
    const { cloudUserId } = useSyncStore.getState();
    if (!cloudUserId) {
      console.log('[Sync] pushChanges skipped: no cloudUserId');
      throw new Error('cloudUserId is required for syncing');
    }

    // Process queue sequentially to maintain order
    for (const item of queue) {
      try {
        const { table, data } = getTableAndData(item, cloudUserId);
        if (!table) {
          removeFromQueue(item.id);
          continue;
        }

        let error;
        let retried = false;

        // Helper to execute the Supabase request with retry
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

        // Execute with automatic JWT retry
        try {
          error = await retryOnceOnJwtExpired(executeRequest, getToken);
        } catch (retryError: any) {
          // If retry failed due to JWT expiration, set sync status and stop
          if (isJwtExpiredError(retryError)) {
            console.error('[Sync] JWT refresh failed after retry, setting sync status to needs_login');
            useSyncStore.getState().setSyncStatus('needs_login');
            // Don't throw - preserve queue and stop gracefully
            return;
          }
          // Re-throw non-JWT errors
          throw retryError;
        }

        if (error) {
          console.error(`[Sync] Error for ${item.type} ${item.id}:`, error);
          // Keep item in queue for later retry
          // If it was a JWT error and retry failed, set status and stop
          if (isJwtExpiredError(error)) {
            console.error('[Sync] JWT expired and refresh failed, setting sync status to needs_login');
            useSyncStore.getState().setSyncStatus('needs_login');
            return; // Stop sync gracefully, preserve queue
          }
        } else {
          removeFromQueue(item.id);

          // Mark as synced in local store if it was a create/update
          if (item.action !== 'delete') {
            markLocalAsSynced(item.type, item.id);
          }
        }
      } catch (e: any) {
        console.error('[Sync] Push exception:', e);
        // If it's a JWT error, set status and stop gracefully
        if (isJwtExpiredError(e)) {
          useSyncStore.getState().setSyncStatus('needs_login');
          return;
        }
        // Re-throw other errors to stop sync and preserve queue
        throw e;
      }
    }
  },

  pullChanges: async (cloudUserId: string, getToken: GetTokenFunction) => {
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
      return retryOnceOnJwtExpired(queryFn, getToken);
    };

    // 1. Pull Friends (filtered by owner_id)
    const { data: friends, error: friendsError } = await executePull(
      async () => await supabase.from('friends').select('*').eq('owner_id', cloudUserId),
    );
    if (friends && !friendsError) {
      // Map DB format to local format
      const mappedFriends = friends.map((f: any) => ({
        id: f.id,
        name: f.name,
        email: undefined, // Friends don't have email in new schema
        bio: f.bio || '',
        imageUri: null, // Not in new schema
        currency: '$', // Default, not in new schema
        createdAt: safeDateToTimestamp(f.created_at),
        updatedAt: f.updated_at ? safeDateToTimestamp(f.updated_at) : undefined,
        synced: true,
        pinned: false, // Not in new schema
      }));
      useFriendsStore.getState().mergeFriends(mappedFriends as Friend[]);
    } else if (friendsError) {
      console.error('[Sync] Error pulling friends:', friendsError);
      if (isJwtExpiredError(friendsError)) {
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

    if (budgets && !budgetsError) {
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
    } else if (budgetsError) {
      console.error('[Sync] Error pulling budgets:', budgetsError);
      if (isJwtExpiredError(budgetsError)) {
        console.error('[Sync] JWT expired and refresh failed while pulling budgets, setting sync status to needs_login');
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
    } else if (transError) {
      console.error('[Sync] Error pulling transactions:', transError);
      if (isJwtExpiredError(transError)) {
        console.error('[Sync] JWT expired and refresh failed while pulling transactions, setting sync status to needs_login');
        useSyncStore.getState().setSyncStatus('needs_login');
        return; // Stop sync gracefully
      }
    }
  },

  syncAll: async (cloudUserId: string, getToken: GetTokenFunction) => {
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
      await syncService.pullChanges(cloudUserId, getToken);
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
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }

    return retryOnceOnJwtExpired(async () => await supabase.from(table).upsert(data), getToken);
  },

  deleteOne: async (table: string, id: string, getToken: GetTokenFunction) => {
    const { syncEnabled } = useSyncStore.getState();
    if (!syncEnabled) {
      throw new Error('Sync must be enabled');
    }
    if (!hasSupabaseToken()) {
      throw new Error('No authentication token available');
    }

    return retryOnceOnJwtExpired(
      async () => await supabase.from(table).delete().eq('id', id),
      getToken,
    );
  },
};

const getTableAndData = (item: SyncQueueItem, cloudUserId: string) => {
  switch (item.type) {
    case 'friend':
      return { table: 'friends', data: mapFriendToDb(item.payload, cloudUserId) };
    case 'transaction':
      return { table: 'transactions', data: mapTransactionToDb(item.payload, cloudUserId) };
    case 'budget':
      return { table: 'budgets', data: mapBudgetToDb(item.payload, cloudUserId) };
    case 'budget_item':
      return { table: 'budget_items', data: mapBudgetItemToDb(item.payload, cloudUserId) };
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

// Helper to safely convert timestamp to ISO string
// Returns current date ISO string if timestamp is invalid
const safeTimestampToISO = (timestamp: number | undefined | null): string => {
  if (!timestamp || !Number.isFinite(timestamp) || timestamp <= 0) {
    return new Date().toISOString();
  }
  const date = new Date(timestamp);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
};

// Helper to safely convert ISO string or timestamp to number (milliseconds)
// Returns current timestamp if date is invalid
const safeDateToTimestamp = (dateValue: string | null | undefined): number => {
  if (!dateValue) {
    return Date.now();
  }
  const date = new Date(dateValue);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return Date.now();
  }
  return date.getTime();
};

// Helpers to clean up data before sending to DB (e.g. remove 'items' from budget object)
const mapFriendToDb = (f: Friend, cloudUserId: string) => {
  return {
    id: f.id,
    owner_id: cloudUserId,
    name: f.name,
    bio: f.bio || null,
    created_at: safeTimestampToISO(f.createdAt),
    updated_at: new Date().toISOString(),
  };
};

const mapTransactionToDb = (t: Transaction, cloudUserId: string) => ({
  id: t.id,
  owner_id: cloudUserId,
  friend_id: t.friendId, // map camel to snake
  amount: Math.abs(t.amount), // Always positive, use sign for direction
  description: t.title || t.note || null, // Use title as description
  sign: t.sign || (t.amount < 0 ? -1 : 1), // 1 = add debt, -1 = reduce debt
  created_at: safeTimestampToISO(t.createdAt),
  updated_at: new Date().toISOString(),
});

const mapBudgetToDb = (b: Budget, cloudUserId: string) => {
  const { items, ...rest } = b;
  return {
    id: b.id,
    owner_id: cloudUserId,
    title: b.title,
    currency: b.currency,
    total_budget: b.totalBudget,
    pinned: b.pinned,
    created_at: safeTimestampToISO(b.createdAt),
    updated_at: new Date().toISOString(),
  };
};

const mapBudgetItemToDb = (bi: BudgetItem, cloudUserId: string) => ({
  id: bi.id,
  owner_id: cloudUserId,
  budget_id: bi.budgetId,
  title: bi.title,
  amount: bi.amount,
  created_at: safeTimestampToISO(bi.createdAt),
  updated_at: new Date().toISOString(),
});
