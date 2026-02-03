-- =====================================================
-- Complete Database Schema for Debit Tracker App
-- =====================================================
-- This file contains the complete database schema including:
-- - app_users table (authenticated users)
-- - friends table (user's contacts/friends)
-- - transactions table
-- - budgets table
-- - budget_items table
-- =====================================================

-- Enable UUID extension
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

-- Add index for clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_app_users_clerk_id ON app_users(clerk_id);

-- Add comments
COMMENT ON TABLE app_users IS 'Stores authenticated app users with Clerk integration';
COMMENT ON COLUMN app_users.id IS 'UUID primary key (auto-generated)';
COMMENT ON COLUMN app_users.clerk_id IS 'Clerk user ID (e.g., user_394...). This is the unique identifier from Clerk authentication.';

-- =====================================================
-- FRIENDS TABLE (Actual Friends/Contacts)
-- =====================================================
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    currency TEXT NOT NULL DEFAULT '$',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for friends
CREATE INDEX IF NOT EXISTS idx_friends_owner_id ON friends(owner_id);

-- Add comments
COMMENT ON TABLE friends IS 'Stores friends/contacts for each app user';
COMMENT ON COLUMN friends.owner_id IS 'Reference to the app_user who owns this friend record';
COMMENT ON COLUMN friends.currency IS 'Currency symbol for this friend (e.g., "$", "₪", "€")';

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    description TEXT,
    sign SMALLINT NOT NULL DEFAULT 1,  -- 1 = add debt, -1 = reduce debt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_friend_id ON transactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Add comments
COMMENT ON TABLE transactions IS 'Stores financial transactions for each friend';
COMMENT ON COLUMN transactions.owner_id IS 'Reference to the app_user who owns this transaction';
COMMENT ON COLUMN transactions.friend_id IS 'Reference to the friend this transaction belongs to';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount (always positive, use sign for direction)';
COMMENT ON COLUMN transactions.sign IS '1 = add debt, -1 = reduce debt';

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT '$',
    total_budget NUMERIC NOT NULL DEFAULT 0,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for budgets
CREATE INDEX IF NOT EXISTS idx_budgets_owner_id ON budgets(owner_id);
CREATE INDEX IF NOT EXISTS idx_budgets_pinned ON budgets(pinned) WHERE pinned = TRUE;

-- Add comments
COMMENT ON TABLE budgets IS 'Stores budget information for app users';
COMMENT ON COLUMN budgets.owner_id IS 'Reference to the app_user who owns this budget';

-- =====================================================
-- BUDGET_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for budget_items
CREATE INDEX IF NOT EXISTS idx_budget_items_owner_id ON budget_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);

-- Add comments
COMMENT ON TABLE budget_items IS 'Stores individual items within a budget';
COMMENT ON COLUMN budget_items.owner_id IS 'Reference to the app_user who owns this budget item';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
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

-- Friends policies: Users can only access friends they own
CREATE POLICY "Users can view their own friends"
    ON friends FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = friends.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own friends"
    ON friends FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = friends.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own friends"
    ON friends FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = friends.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own friends"
    ON friends FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = friends.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Transactions policies: Users can only access transactions they own
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = transactions.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = transactions.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = transactions.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = transactions.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Budgets policies: Users can only access budgets they own
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budgets.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budgets.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budgets.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budgets.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Budget Items policies: Users can only access budget items they own
CREATE POLICY "Users can view their own budget items"
    ON budget_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budget_items.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own budget items"
    ON budget_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budget_items.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own budget items"
    ON budget_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budget_items.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own budget items"
    ON budget_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = budget_items.owner_id
            AND app_users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

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
-- END OF SCHEMA
-- =====================================================

