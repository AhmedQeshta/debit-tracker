import { useRouter } from "expo-router";

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
    router.replace("/(drawer)/budget");
  };

  // User navigation methods
  const navigateToUser = (id: string): void => {
    router.push(`/user/${id}`);
  };

  const navigateToUserEdit = (id: string): void => {
    router.push(`/user/${id}/edit`);
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
    // User navigation
    navigateToUser,
    navigateToUserEdit,
    // Common navigation
    navigateBack,
  };
};
