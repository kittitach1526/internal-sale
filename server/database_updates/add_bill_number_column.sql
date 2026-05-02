-- Add bill_number column to sales table
-- This script adds the bill_number column to allow users to input custom bill numbers

DO $$
BEGIN
    -- Check if the column exists before adding
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='sales' 
        AND column_name='bill_number'
    ) THEN
        -- Add the bill_number column
        ALTER TABLE sales 
        ADD COLUMN bill_number VARCHAR(50);
        
        RAISE NOTICE 'Added bill_number column to sales table';
    ELSE
        RAISE NOTICE 'bill_number column already exists in sales table';
    END IF;
END $$;

-- Update existing records to have default bill numbers if needed
UPDATE sales 
SET bill_number = 'BILL-' || TO_CHAR(created_at, 'YYYY-MM-DD') || '-' || id 
WHERE bill_number IS NULL OR bill_number = '';

-- Verify the changes
SELECT 
    id, 
    bill_number, 
    name, 
    created_at 
FROM sales 
ORDER BY created_at DESC 
LIMIT 5;
