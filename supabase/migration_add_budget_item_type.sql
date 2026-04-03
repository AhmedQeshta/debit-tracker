-- Add budget item direction support (+ income / - expense) and server-side aggregate recompute

ALTER TABLE budget_items
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budget_items_type_check'
  ) THEN
    ALTER TABLE budget_items
      ADD CONSTRAINT budget_items_type_check
      CHECK (type IN ('expense', 'income'));
  END IF;
END $$;

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS total_spent NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_income NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_spent NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_overspent BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE budget_items
SET type = 'expense'
WHERE type IS NULL OR type NOT IN ('expense', 'income');

CREATE OR REPLACE FUNCTION recompute_budget_totals(p_budget_id TEXT, p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_budget NUMERIC := 0;
  v_total_spent NUMERIC := 0;
  v_total_income NUMERIC := 0;
  v_net_spent NUMERIC := 0;
  v_remaining NUMERIC := 0;
BEGIN
  SELECT COALESCE(total_budget, 0)
  INTO v_total_budget
  FROM budgets
  WHERE id = p_budget_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN COALESCE(type, 'expense') = 'expense' THEN ABS(amount) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN COALESCE(type, 'expense') = 'income' THEN ABS(amount) ELSE 0 END), 0)
  INTO v_total_spent, v_total_income
  FROM budget_items
  WHERE budget_id = p_budget_id
    AND user_id = p_user_id;

  v_net_spent := v_total_spent - v_total_income;
  v_remaining := v_total_budget - v_net_spent;

  UPDATE budgets
  SET
    total_spent = v_total_spent,
    total_income = v_total_income,
    net_spent = v_net_spent,
    remaining = v_remaining,
    is_overspent = v_net_spent > v_total_budget,
    updated_at = NOW()
  WHERE id = p_budget_id
    AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION recompute_budget_totals(TEXT, TEXT) TO authenticated;
