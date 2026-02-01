-- =====================================================
-- Complete Database Schema for Debit Tracker App
-- =====================================================
-- This file contains the complete database schema including:
-- - friends table (users)
-- - transactions table
-- - budgets table
-- - budget_items table
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FRIENDS TABLE (Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    bio TEXT,
    image_uri TEXT,
    currency TEXT DEFAULT '$',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE,
    synced BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE
);

-- Add index for clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_friends_clerk_id ON friends(clerk_id);

-- Add index for pinned friends
CREATE INDEX IF NOT EXISTS idx_friends_pinned ON friends(pinned) WHERE pinned = TRUE;

-- Add comments for documentation
COMMENT ON TABLE friends IS 'Stores user/friend information with Clerk authentication integration';
COMMENT ON COLUMN friends.id IS 'UUID primary key (auto-generated)';
COMMENT ON COLUMN friends.clerk_id IS 'Clerk user ID (e.g., user_394...). This is the unique identifier from Clerk authentication.';
COMMENT ON COLUMN friends.last_login IS 'Timestamp of the last time the user logged in';

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT FALSE
);

-- Add indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_friend_id ON transactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Add comments
COMMENT ON TABLE transactions IS 'Stores financial transactions for each friend';
COMMENT ON COLUMN transactions.friend_id IS 'Reference to the friend (user) this transaction belongs to';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount (negative for debts, positive for payments)';

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    currency TEXT DEFAULT '$',
    total_budget NUMERIC NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT FALSE
);

-- Add indexes for budgets
CREATE INDEX IF NOT EXISTS idx_budgets_friend_id ON budgets(friend_id);
CREATE INDEX IF NOT EXISTS idx_budgets_pinned ON budgets(pinned) WHERE pinned = TRUE;

-- Add comments
COMMENT ON TABLE budgets IS 'Stores budget information for friends';
COMMENT ON COLUMN budgets.friend_id IS 'Reference to the friend (user) this budget belongs to';
COMMENT ON COLUMN budgets.total_budget IS 'Total budget amount';

-- =====================================================
-- BUDGET_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT FALSE
);

-- Add indexes for budget_items
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);

-- Add comments
COMMENT ON TABLE budget_items IS 'Stores individual items within a budget';
COMMENT ON COLUMN budget_items.budget_id IS 'Reference to the parent budget';
COMMENT ON COLUMN budget_items.amount IS 'Item amount (price)';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Friends policies: Users can only access their own data
CREATE POLICY "Users can view their own friend record"
    ON friends FOR SELECT
    USING (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can insert their own friend record"
    ON friends FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can update their own friend record"
    ON friends FOR UPDATE
    USING (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can delete their own friend record"
    ON friends FOR DELETE
    USING (auth.jwt() ->> 'sub' = clerk_id);

-- Transactions policies: Users can only access transactions for their friends
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = transactions.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = transactions.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = transactions.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = transactions.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Budgets policies: Users can only access budgets for their friends
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = budgets.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = budgets.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = budgets.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = budgets.friend_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Budget Items policies: Users can only access budget items for their budgets
CREATE POLICY "Users can view their own budget items"
    ON budget_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            JOIN friends ON friends.id = budgets.friend_id
            WHERE budgets.id = budget_items.budget_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert their own budget items"
    ON budget_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budgets
            JOIN friends ON friends.id = budgets.friend_id
            WHERE budgets.id = budget_items.budget_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own budget items"
    ON budget_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            JOIN friends ON friends.id = budgets.friend_id
            WHERE budgets.id = budget_items.budget_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete their own budget items"
    ON budget_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            JOIN friends ON friends.id = budgets.friend_id
            WHERE budgets.id = budget_items.budget_id
            AND friends.clerk_id = auth.jwt() ->> 'sub'
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
-- INITIAL DATA (Optional)
-- =====================================================
-- You can add any initial/seed data here if needed

-- =====================================================
-- END OF SCHEMA
-- =====================================================
