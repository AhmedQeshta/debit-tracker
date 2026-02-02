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
          const localMap = new Map(state.friends.map((f) => [f.id, f]));
          remoteFriends.forEach((remote) => {
            const local = localMap.get(remote.id);
            if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) {
              localMap.set(remote.id, { ...remote, synced: true });
            }
          });
          return { friends: Array.from(localMap.values()) };
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
