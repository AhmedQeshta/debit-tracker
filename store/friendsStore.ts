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
          friends: state.friends.filter((f) => f.id !== id),
        })),
      getDirtyFriends: (): Friend[] => {
        return get().friends.filter((f) => !f.synced || f.synced === false);
      },
      setFriends: (friends) => set({ friends }),
      mergeFriends: (remoteFriends) =>
        set((state) => {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.friends.map((f) => [f.id, f]));
          const remoteIds = new Set(remoteFriends.map((f) => f.id));
          
          // Process remote items with conflict resolution
          remoteFriends.forEach((remote) => {
            const local = localMap.get(remote.id);
            if (!local) {
              // Remote item doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else {
              // Conflict resolution: use the one with newer updatedAt
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (remoteUpdatedAt > localUpdatedAt) {
                // Remote is newer -> use remote
                localMap.set(remote.id, { ...remote, synced: true });
              } else {
                // Local is newer or equal -> keep local (but mark as synced if remote exists)
                localMap.set(remote.id, { ...local, synced: local.synced || true });
              }
            }
          });
          
          // Remove local items that don't exist in remote (hard delete in DB)
          const merged = Array.from(localMap.values()).filter((item) => remoteIds.has(item.id));
          
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
