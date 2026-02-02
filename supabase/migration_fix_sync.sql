-- =====================================================
-- Migration: Fix Sync - Change IDs to TEXT and Add user_id
-- =====================================================
-- This migration:
-- 1. Changes all ID columns from UUID to TEXT (to match local app IDs)
-- 2. Adds user_id TEXT column for Clerk user ID (for RLS)
-- 3. Updates foreign keys to TEXT
-- 4. Updates RLS policies to use user_id
-- =====================================================

-- Step 1: Drop existing foreign key constraints
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_friend_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_owner_id_fkey;
ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_budget_id_fkey;
ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_owner_id_fkey;
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_owner_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_owner_id_fkey;

-- Step 2: Change ID columns from UUID to TEXT (but keep owner_id as UUID for FK to app_users)
ALTER TABLE friends ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE transactions ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE budgets ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE budget_items ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 3: Change foreign key columns to TEXT (except owner_id which stays UUID)
-- friend_id and budget_id become TEXT (FK to TEXT IDs)
ALTER TABLE transactions ALTER COLUMN friend_id TYPE TEXT USING friend_id::TEXT;
ALTER TABLE budget_items ALTER COLUMN budget_id TYPE TEXT USING budget_id::TEXT;
-- owner_id stays UUID (FK to app_users.id which is UUID)

-- Step 4: Add user_id TEXT column to all tables
ALTER TABLE friends ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 5: Set default user_id from existing owner_id (via app_users.clerk_id)
-- This is a one-time migration - new inserts will set user_id directly
-- Note: owner_id is UUID, so we join on UUID directly
UPDATE friends f
SET user_id = au.clerk_id
FROM app_users au
WHERE f.owner_id = au.id AND f.user_id IS NULL;

UPDATE transactions t
SET user_id = au.clerk_id
FROM app_users au
WHERE t.owner_id = au.id AND t.user_id IS NULL;

UPDATE budgets b
SET user_id = au.clerk_id
FROM app_users au
WHERE b.owner_id = au.id AND b.user_id IS NULL;

UPDATE budget_items bi
SET user_id = au.clerk_id
FROM app_users au
WHERE bi.owner_id = au.id AND bi.user_id IS NULL;

-- Step 6: Make user_id NOT NULL (after setting values)
ALTER TABLE friends ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budget_items ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Recreate foreign key constraints
-- owner_id stays UUID (references app_users.id which is UUID)
-- friend_id and budget_id are TEXT (references TEXT IDs)
ALTER TABLE friends
  ADD CONSTRAINT friends_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_friend_id_fkey
  FOREIGN KEY (friend_id) REFERENCES friends(id) ON DELETE CASCADE;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE budget_items
  ADD CONSTRAINT budget_items_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE budget_items
  ADD CONSTRAINT budget_items_budget_id_fkey
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE;

-- Step 8: Add indexes for user_id
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);

-- Step 9: Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own friends" ON friends;
DROP POLICY IF EXISTS "Users can insert their own friends" ON friends;
DROP POLICY IF EXISTS "Users can update their own friends" ON friends;
DROP POLICY IF EXISTS "Users can delete their own friends" ON friends;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can insert their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can update their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can delete their own budget items" ON budget_items;

-- Step 10: Create new RLS policies using user_id
-- Friends policies
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

-- Transactions policies
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

-- Budgets policies
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

-- Budget Items policies
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
-- Migration Complete
-- =====================================================
-- Notes:
-- - All IDs are now TEXT (matching local app)
-- - user_id column added for RLS (Clerk user ID)
-- - owner_id kept for FK relationship to app_users
-- - RLS policies now check user_id = JWT sub claim
-- =====================================================

