import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Friend } from '@/types/models';
import { IFriendsState } from '@/types/store';

export const useFriendsStore = create<IFriendsState>()(
  persist(
    (set) => ({
      friends: [],
      addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
      updateFriend: (updatedFriend) =>
        set((state) => ({
          friends: state.friends.map((f) => (f.id === updatedFriend.id ? updatedFriend : f)),
        })),
      deleteFriend: (id) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== id),
        })),
      setFriends: (friends) => set({ friends }),
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
