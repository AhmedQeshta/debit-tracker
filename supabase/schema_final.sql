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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friends_owner_id ON friends(owner_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);

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
    amount NUMERIC NOT NULL,
    description TEXT,
    sign SMALLINT NOT NULL DEFAULT 1,  -- 1 = add debt, -1 = reduce debt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_friend_id ON transactions(friend_id);
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
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_owner_id ON budget_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);

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

