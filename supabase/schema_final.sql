-- =====================================================
-- Final Database Schema for Debit Tracker App
-- =====================================================
-- This is the FINAL schema after all migrations
-- Run this if starting fresh, or use migrations if upgrading
-- =====================================================

-- Enable UUID extension (for app_users.id and owner_id)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- APP_USERS TABLE (Authenticated Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_clerk_id ON app_users(clerk_id);

-- =====================================================
-- FRIENDS TABLE (Actual Friends/Contacts)
-- =====================================================
-- Note: id is TEXT (not UUID) to match local app IDs
-- owner_id is UUID (FK to app_users)
-- user_id is TEXT (Clerk user ID for RLS)
CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- Clerk user ID for RLS
    name TEXT NOT NULL,
    bio TEXT,
    currency TEXT NOT NULL DEFAULT '$',
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friends_owner_id ON friends(owner_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_pinned ON friends(pinned) WHERE pinned = TRUE;

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
-- Note: id is TEXT (not UUID) to match local app IDs
-- friend_id is TEXT (FK to friends.id which is TEXT)
-- owner_id is UUID (FK to app_users)
-- user_id is TEXT (Clerk user ID for RLS)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- Clerk user ID for RLS
    friend_id TEXT NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    budget_id TEXT REFERENCES budgets(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    sign SMALLINT NOT NULL DEFAULT 1,  -- 1 = add debt, -1 = reduce debt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_friend_id ON transactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
-- Note: id is TEXT (not UUID) to match local app IDs
-- owner_id is UUID (FK to app_users)
-- user_id is TEXT (Clerk user ID for RLS)
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- Clerk user ID for RLS
    title TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT '$',
    total_budget NUMERIC NOT NULL DEFAULT 0,
    total_spent NUMERIC NOT NULL DEFAULT 0,
    total_income NUMERIC NOT NULL DEFAULT 0,
    net_spent NUMERIC NOT NULL DEFAULT 0,
    remaining NUMERIC NOT NULL DEFAULT 0,
    is_overspent BOOLEAN NOT NULL DEFAULT FALSE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_owner_id ON budgets(owner_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_pinned ON budgets(pinned) WHERE pinned = TRUE;

-- =====================================================
-- BUDGET_ITEMS TABLE
-- =====================================================
-- Note: id is TEXT (not UUID) to match local app IDs
-- budget_id is TEXT (FK to budgets.id which is TEXT)
-- owner_id is UUID (FK to app_users)
-- user_id is TEXT (Clerk user ID for RLS)
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- Clerk user ID for RLS
    budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_owner_id ON budget_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_transaction_id ON budget_items(transaction_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_budget_items_transaction_id
ON budget_items(transaction_id)
WHERE transaction_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- App Users policies: Users can only access their own record
CREATE POLICY "Users can view their own app_user record"
    ON app_users FOR SELECT
    USING (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can insert their own app_user record"
    ON app_users FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can update their own app_user record"
    ON app_users FOR UPDATE
    USING (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can delete their own app_user record"
    ON app_users FOR DELETE
    USING (auth.jwt() ->> 'sub' = clerk_id);

-- Friends policies: Using user_id for RLS
CREATE POLICY "Users can view their own friends"
    ON friends FOR SELECT
    USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own friends"
    ON friends FOR INSERT
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own friends"
    ON friends FOR UPDATE
    USING (user_id = auth.jwt() ->> 'sub')
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own friends"
    ON friends FOR DELETE
    USING (user_id = auth.jwt() ->> 'sub');

-- Transactions policies: Using user_id for RLS
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (user_id = auth.jwt() ->> 'sub')
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (user_id = auth.jwt() ->> 'sub');

-- Budgets policies: Using user_id for RLS
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (user_id = auth.jwt() ->> 'sub')
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (user_id = auth.jwt() ->> 'sub');

-- Budget Items policies: Using user_id for RLS
CREATE POLICY "Users can view their own budget items"
    ON budget_items FOR SELECT
    USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own budget items"
    ON budget_items FOR INSERT
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own budget items"
    ON budget_items FOR UPDATE
    USING (user_id = auth.jwt() ->> 'sub')
    WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own budget items"
    ON budget_items FOR DELETE
    USING (user_id = auth.jwt() ->> 'sub');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at
    BEFORE UPDATE ON friends
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- =====================================================
-- SCHEMA SUMMARY
-- =====================================================
-- Key Points:
-- 1. app_users.id = UUID (auto-generated)
-- 2. All other IDs (friends, transactions, budgets, budget_items) = TEXT (matches local app)
-- 3. owner_id = UUID (FK to app_users.id)
-- 4. user_id = TEXT (Clerk user ID, used for RLS)
-- 5. friend_id and budget_id = TEXT (FK to TEXT IDs)
-- 6. Hard delete (no is_deleted or deleted_at columns)
-- 7. updated_at automatically updated on UPDATE via triggers
-- 8. RLS policies use user_id = JWT 'sub' claim
-- =====================================================

