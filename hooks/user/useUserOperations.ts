import { User } from "@/types/models";
import { useUsersStore } from "@/store/usersStore";

export const useUserOperations = () => {
  const store = useUsersStore();

  const getUserById = (id: string): User | undefined => {
    return store.users.find((u) => u.id === id);
  };

  const handlePinToggle = (user: User): void => {
    if (user.pinned) {
      store.unpinUser(user.id);
    } else {
      store.pinUser(user.id);
    }
  };

  return {
    getUserById,
    handlePinToggle,
  };
};
