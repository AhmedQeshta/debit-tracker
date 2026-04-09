-- Link transactions to budgets and keep budget totals in sync via transaction-derived budget_items

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS budget_id TEXT NULL REFERENCES budgets(id) ON DELETE SET NULL;

ALTER TABLE budget_items
ADD COLUMN IF NOT EXISTS transaction_id TEXT NULL REFERENCES transactions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_friend_id ON transactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_items_transaction_id ON budget_items(transaction_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_budget_items_transaction_id
ON budget_items(transaction_id)
WHERE transaction_id IS NOT NULL;

CREATE OR REPLACE FUNCTION apply_transaction_budget_link(
  p_transaction_id TEXT,
  p_budget_id TEXT,
  p_amount NUMERIC,
  p_sign SMALLINT,
  p_title TEXT,
  p_user_id TEXT,
  p_owner_id UUID,
  p_created_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  budget_id TEXT,
  total_spent NUMERIC,
  total_income NUMERIC,
  net_spent NUMERIC,
  remaining NUMERIC,
  is_overspent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_type TEXT;
  v_item_amount NUMERIC;
  v_budget_exists BOOLEAN;
BEGIN
  IF p_budget_id IS NULL OR p_transaction_id IS NULL THEN
    RAISE EXCEPTION 'Budget not found';
  END IF;

  IF p_sign NOT IN (1, -1) THEN
    RAISE EXCEPTION 'Invalid sign';
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM budgets b
    WHERE b.id = p_budget_id
      AND b.user_id = p_user_id
  ) INTO v_budget_exists;

  IF NOT v_budget_exists THEN
    RAISE EXCEPTION 'Budget not found';
  END IF;

  v_item_type := CASE WHEN p_sign = 1 THEN 'expense' ELSE 'income' END;
  v_item_amount := ABS(COALESCE(p_amount, 0));

  INSERT INTO budget_items (
    id,
    owner_id,
    user_id,
    budget_id,
    transaction_id,
    title,
    amount,
    type,
    created_at,
    updated_at
  ) VALUES (
    'txn_item_' || p_transaction_id,
    p_owner_id,
    p_user_id,
    p_budget_id,
    p_transaction_id,
    COALESCE(NULLIF(TRIM(p_title), ''), 'Transaction'),
    v_item_amount,
    v_item_type,
    p_created_at,
    NOW()
  )
  ON CONFLICT (transaction_id)
  DO UPDATE SET
    budget_id = EXCLUDED.budget_id,
    title = EXCLUDED.title,
    amount = EXCLUDED.amount,
    type = EXCLUDED.type,
    updated_at = NOW();

  PERFORM recompute_budget_totals(p_budget_id, p_user_id);

  RETURN QUERY
  SELECT
    b.id,
    b.total_spent,
    b.total_income,
    b.net_spent,
    b.remaining,
    b.is_overspent
  FROM budgets b
  WHERE b.id = p_budget_id AND b.user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION apply_transaction_budget_link(TEXT, TEXT, NUMERIC, SMALLINT, TEXT, TEXT, UUID, TIMESTAMPTZ) TO authenticated;
