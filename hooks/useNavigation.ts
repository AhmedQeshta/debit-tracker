import { useRouter } from 'expo-router';

export const useNavigation = () => {
  const router = useRouter();

  // Budget navigation methods
  const navigateToBudget = (id: string): void => {
    router.push(`/(drawer)/budget/${id}`);
  };

  const navigateToBudgetEdit = (id: string): void => {
    router.push(`/(drawer)/budget/${id}/edit`);
  };

  const navigateToBudgetList = (): void => {
    router.replace('/(drawer)/budget');
  };

  // Friend navigation methods
  const navigateToFriend = (id: string): void => {
    router.push(`/friend/${id}`);
  };

  const navigateToFriendEdit = (id: string): void => {
    router.push(`/friend/${id}/edit`);
  };

  // Common navigation methods
  const navigateBack = (): void => {
    router.back();
  };

  return {
    // Budget navigation
    navigateToBudget,
    navigateToBudgetEdit,
    navigateToBudgetList,
    // Friend navigation
    navigateToFriend,
    navigateToFriendEdit,
    // Common navigation
    navigateBack,
  };
};
