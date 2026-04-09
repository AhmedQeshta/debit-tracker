/**
 * Budget math helpers used for UI display values.
 */

/**
 * Raw net spent uses the original schema rule: total_spent - total_income.
 */
export const calculateRawNetSpent = (totalSpent: number, totalIncome: number): number => {
  return totalSpent - totalIncome;
};

/**
 * Net spent is clamped only for display to avoid confusing negative usage in UI.
 * Rule: displayNetSpent = max(0, rawNetSpent).
 */
export const clampNetSpentForDisplay = (rawNetSpent: number): number => {
  return Math.max(0, rawNetSpent);
};

/**
 * Convenience helper for display net spent directly from totals.
 */
export const calculateDisplayNetSpent = (totalSpent: number, totalIncome: number): number => {
  return clampNetSpentForDisplay(calculateRawNetSpent(totalSpent, totalIncome));
};
