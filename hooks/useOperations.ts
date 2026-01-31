import { Friend, Budget } from '@/types/models';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';

export const useOperations = () => {
  const friendsStore = useFriendsStore();
  const budgetStore = useBudgetStore();

  // Friend operations
  const getFriendById = (id: string): Friend | undefined =>
    friendsStore.friends.find((f) => f.id === id);

  const handleFriendPinToggle = (friend: Friend): void =>
    friend.pinned ? friendsStore.unpinFriend(friend.id) : friendsStore.pinFriend(friend.id);

  // Budget operations
  const getBudgetById = (id: string): Budget | undefined => budgetStore.getBudget(id);

  const handleBudgetPinToggle = (budget: Budget): void =>
    budget.pinned ? budgetStore.unpinBudget(budget.id) : budgetStore.pinBudget(budget.id);

  return {
    getFriendById,
    handleFriendPinToggle,
    getBudgetById,
    handleBudgetPinToggle,
  };
};
