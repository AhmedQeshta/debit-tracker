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
    router.replace('/(drawer)/(tabs)/budget');
  };

  const navigateToCreateBudget = (): void => {
    router.push('/(drawer)/budget/new');
  };

  // Friend navigation methods
  const navigateToFriend = (id: string): void => {
    router.push(`/(drawer)/friend/${id}`);
  };

  const navigateToFriendEdit = (id: string): void => {
    router.push(`/(drawer)/friend/${id}/edit`);
  };

  const navigateToCreateFriend = (): void => {
    router.push('/(drawer)/friend/new');
  };

  // Transaction
  const navigateToTransactionEdit = (id: string): void => {
    router.push(`/(drawer)/transaction/${id}/edit`);
  };

  const navigateToCreateTransaction = (): void => {
    router.push('/(drawer)/transaction/new');
  };

  // Common navigation methods
  const navigateBack = (): void => {
    router.back();
  };

  // Budget navigation methods
  const navigateToHome = (): void => {
    router.push(`/`);
  };

  return {
    // Budget navigation
    navigateToBudget,
    navigateToBudgetEdit,
    navigateToBudgetList,
    navigateToCreateBudget,
    // Friend navigation
    navigateToFriend,
    navigateToFriendEdit,
    navigateToCreateFriend,
    navigateToTransactionEdit,
    navigateToCreateTransaction,
    // Common navigation
    navigateBack,
    navigateToHome,
  };
};
