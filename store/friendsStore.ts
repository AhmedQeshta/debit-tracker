import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFriendsState } from '@/types/store';
import { Friend } from '@/types/models';

export const useFriendsStore = create<IFriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      addFriend: (friend) =>
        set((state) => ({
          friends: [
            { ...friend, synced: false, updatedAt: Date.now() },
            ...state.friends,
          ],
        })),
      updateFriend: (updatedFriend) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === updatedFriend.id
              ? { ...updatedFriend, synced: false, updatedAt: Date.now() }
              : f,
          ),
        })),
      deleteFriend: (id) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === id ? { ...f, deletedAt: Date.now(), synced: false } : f,
          ),
        })),
      getDirtyFriends: (): Friend[] =>
      {
        return get().friends.filter((f) =>
        {
          // Include items that are not synced OR marked for deletion
          return !f.synced || !f.synced || f.deletedAt !== undefined;
        });
      },
      getDeletedFriends: (): Friend[] =>
      {
        return get().friends.filter((f) => f.deletedAt !== undefined);
      },
      removeDeletedFriend: (id) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== id),
        })),
      setFriends: (friends) => set({ friends }),
      mergeFriends: (remoteFriends) =>
        set((state) =>
        {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.friends.map((f) => [f.id, f]));
          const remoteIds = new Set(remoteFriends.map((f) => f.id));

          // Process remote items with conflict resolution
          remoteFriends.forEach((remote) =>
          {
            const local = localMap.get(remote.id);
            if (!local)
            {
              // Remote item doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else
            {
              // Conflict resolution: use the one with newer updatedAt
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (remoteUpdatedAt > localUpdatedAt)
              {
                // Remote is newer -> use remote (clear any local deletion)
                localMap.set(remote.id, { ...remote, synced: true });
              } else
              {
                // Local is newer or equal -> keep local (but mark as synced if remote exists)
                localMap.set(remote.id, { ...local, synced: local.synced || true });
              }
            }
          });

          // Handle local items not in remote:
          // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
          // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
          const merged = Array.from(localMap.values()).filter((item) =>
          {
            if (remoteIds.has(item.id))
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

          return { friends: merged };
        }),
      markAsSynced: (id) =>
        set((state) => ({
          friends: state.friends.map((f) => (f.id === id ? { ...f, synced: true } : f)),
        })),
      pinFriend: (id) =>
        set((state) => ({
          friends: state.friends.map((f) => (f.id === id ? { ...f, pinned: true } : f)),
        })),
      unpinFriend: (id) =>
        set((state) => ({
          friends: state.friends.map((f) => (f.id === id ? { ...f, pinned: false } : f)),
        })),
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
