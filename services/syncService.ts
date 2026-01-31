import { supabase } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { SyncQueueItem } from '@/types/models';

export const syncService = {
  pushChanges: async () => {
    const { queue, removeFromQueue } = useSyncStore.getState();
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        const { table, data } = getTableAndData(item);
        if (!table) {
          removeFromQueue(item.id); // Remove invalid items
          continue;
        }

        if (item.action === 'create') {
          await supabase.from(table).upsert(data);
        } else if (item.action === 'update') {
          await supabase.from(table).update(data).eq('id', item.id);
        } else if (item.action === 'delete') {
          await supabase.from(table).delete().eq('id', item.id);
        }
        removeFromQueue(item.id);
      } catch (error) {
        console.error('Sync push error:', error);
        // Keep in queue to retry? Or remove? For now, keep.
      }
    }
  },

  pullChanges: async (userId: string) => {
    // Pull Friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', userId); // For now, sync *my* friend profile

    if (friends && !friendsError) {
      // Merge logic (simple replace for now)
      // In a real app, we'd compare updated_at
      // useFriendsStore.getState().setFriends(friends); // Careful not to overwrite local-only friends if any?
      // Prompt says "Clerk user = Supabase friend". So maybe only sync THAT record?
      // But what about the friends I track?
      // If the table 'friends' stores ALL user profiles, then maybe I need to fetch friends unrelated to me?
      // Or maybe I have a 'friends' relationship table?
      // The prompt says "All data is tied to friend_id".
      // If I am following "Single User" model, I only pull MY data.
    }
  },

  syncAll: async (userId: string) => {
    await syncService.pushChanges();
    // await syncService.pullChanges(userId);
    useSyncStore.getState().setLastSync(Date.now());
  },

  ensureUserRecord: async (clerkUser: any) => {
    if (!clerkUser) return;

    const { data, error } = await supabase.from('friends').upsert(
      {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) {
      console.error('Error ensuring user record:', error);
    }
  },
};

const getTableAndData = (item: SyncQueueItem) => {
  // payload should have keys matching db columns
  switch (item.type) {
    case 'friend':
      return { table: 'friends', data: item.payload };
    case 'transaction':
      return { table: 'transactions', data: item.payload };
    case 'budget':
      return { table: 'budgets', data: item.payload };
    case 'budget_item':
      return { table: 'budget_items', data: item.payload };
    default:
      return { table: null, data: null };
  }
};
