import { useRouter } from "expo-router";

export const useBudgetNavigation = () =>
{
  const router = useRouter();

  const navigateToBudget = (id: string): void => router.push(`/(drawer)/budget/${id}`);

  const navigateToEdit = (id: string): void => router.push(`/(drawer)/budget/${id}/edit`);

  const navigateBack = (): void => router.back();

  const navigateToBudgetList = (): void => router.replace("/(drawer)/budget");

  return {
    navigateToBudget,
    navigateToEdit,
    navigateBack,
    navigateToBudgetList,
  };
};
