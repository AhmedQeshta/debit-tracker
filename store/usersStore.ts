import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';

interface UsersState {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setUsers: (users: User[]) => void;
  markAsSynced: (id: string) => void;
}

export const useUsersStore = create<UsersState>()(
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
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
