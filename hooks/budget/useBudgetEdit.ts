import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBudgetStore } from "@/store/budgetStore";
import { safeId } from "@/lib/utils";
import { useBudgetNavigation } from "@/hooks/budget/useBudgetNavigation";
import { validateTitle, validateAmount } from "@/lib/utils";
import { showSuccess } from "@/lib/alert";


export const useBudgetEdit = () =>
{
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = safeId(id);
  const budget = useBudgetStore((state) => state.getBudget(budgetId));
  const { updateBudget } = useBudgetStore();
  const { navigateBack } = useBudgetNavigation();

  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("$");
  const [totalBudget, setTotalBudget] = useState("");
  const [titleError, setTitleError] = useState("");
  const [budgetError, setBudgetError] = useState("");

  useEffect(() =>
  {
    if (budget)
    {
      setTitle(budget.title);
      setCurrency(budget.currency);
      setTotalBudget(budget.totalBudget.toString());
    }
  }, [budget]);

  const handleSave = (): void =>
  {
    const titleErr = validateTitle(title);
    if (titleErr)
    {
      setTitleError(titleErr);
      return;
    }
    setTitleError("");

    const amountErr = validateAmount(totalBudget, 0);
    if (amountErr)
    {
      setBudgetError(amountErr);
      return;
    }
    setBudgetError("");

    const amount = parseFloat(totalBudget);
    updateBudget(budgetId, {
      title: title.trim(),
      currency,
      totalBudget: amount,
    });

    showSuccess("Success", "Budget updated successfully", () =>
    {
      navigateBack();
    });
  };

  return {
    budget,
    title,
    setTitle,
    currency,
    setCurrency,
    totalBudget,
    setTotalBudget,
    titleError,
    budgetError,
    handleSave,
    router,
    setTitleError,
    setBudgetError,
  };
};

