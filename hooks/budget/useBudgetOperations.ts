import { useBudgetStore } from "@/store/budgetStore";
import { Budget } from "@/types/models";

export const useBudgetOperations = () =>
{
  const store = useBudgetStore();
  const getBudgetById = (id: string): Budget | undefined => store.getBudget(id);
  const handlePinToggle = (budget: Budget): void => budget.pinned ? store.unpinBudget(budget.id) : store.pinBudget(budget.id);

  return {
    getBudgetById,
    handlePinToggle
  };
};