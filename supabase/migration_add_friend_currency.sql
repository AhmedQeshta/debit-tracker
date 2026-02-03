-- =====================================================
-- Migration: Add currency column to friends table
-- =====================================================
-- This migration adds the currency column to the friends table
-- for existing databases. Safe to run multiple times.
-- =====================================================

-- Add currency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'friends' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE friends 
        ADD COLUMN currency TEXT NOT NULL DEFAULT '$';
        
        -- Add comment
        COMMENT ON COLUMN friends.currency IS 'Currency symbol for this friend (e.g., "$", "₪", "€")';
        
        RAISE NOTICE 'Added currency column to friends table';
    ELSE
        RAISE NOTICE 'Currency column already exists in friends table';
    END IF;
END $$;

