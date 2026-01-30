import { useState } from "react";
import { useRouter } from "expo-router";
import { useBudgetStore } from "@/store/budgetStore";
import { useBudgetNavigation } from "@/hooks/budget/useBudgetNavigation";
import { validateTitle, validateAmount } from "@/lib/utils";
import { showSuccess } from "@/lib/alert";


export const useBudgetCreate = () =>
{
  const router = useRouter();
  const { addBudget } = useBudgetStore();
  const { navigateToBudget } = useBudgetNavigation();

  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("$");
  const [totalBudget, setTotalBudget] = useState("");
  const [titleError, setTitleError] = useState("");
  const [budgetError, setBudgetError] = useState("");

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
    const budgetId = addBudget(title.trim(), currency, amount);

    showSuccess("Success", "Budget created successfully", () =>
    {
      navigateToBudget(budgetId);
    });
  };

  return {
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

