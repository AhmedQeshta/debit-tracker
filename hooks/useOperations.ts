import { User, Budget } from "@/types/models";
import { useUsersStore } from "@/store/usersStore";
import { useBudgetStore } from "@/store/budgetStore";

export const useOperations = () => {
  const usersStore = useUsersStore();
  const budgetStore = useBudgetStore();

  // User operations
  const getUserById = (id: string): User | undefined => usersStore.users.find((u) => u.id === id);

  const handleUserPinToggle = (user: User): void => user.pinned ? usersStore.unpinUser(user.id) : usersStore.pinUser(user.id);
  
  // Budget operations
  const getBudgetById = (id: string): Budget | undefined => budgetStore.getBudget(id);

  const handleBudgetPinToggle = (budget: Budget): void => budget.pinned ? budgetStore.unpinBudget(budget.id) : budgetStore.pinBudget(budget.id);

  return {
    getUserById,
    handleUserPinToggle,
    getBudgetById,
    handleBudgetPinToggle,
  };
};

