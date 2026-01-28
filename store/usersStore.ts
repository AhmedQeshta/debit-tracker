import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { IUsersState } from '@/types/store';


export const useUsersStore = create<IUsersState>()(
  persist(
    (set) => ({
      users: [],
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),
      updateUser: (updatedUser) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
      setUsers: (users) => set({ users }),
      markAsSynced: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, synced: true } : u)),
        })),
      pinUser: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, pinned: true } : u)),
        })),
      unpinUser: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, pinned: false } : u)),
        })),
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
