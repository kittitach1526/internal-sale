-- Remove category and product_type columns from fostec_product table
-- This script cleans up the database to match the simplified frontend

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fostec_product' 
ORDER BY ordinal_position;

-- Remove the category column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fostec_product' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE fostec_product DROP COLUMN category;
        RAISE NOTICE 'Column "category" dropped from fostec_product table';
    ELSE
        RAISE NOTICE 'Column "category" does not exist in fostec_product table';
    END IF;
END $$;

-- Remove the product_type column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fostec_product' 
        AND column_name = 'product_type'
    ) THEN
        ALTER TABLE fostec_product DROP COLUMN product_type;
        RAISE NOTICE 'Column "product_type" dropped from fostec_product table';
    ELSE
        RAISE NOTICE 'Column "product_type" does not exist in fostec_product table';
    END IF;
END $$;

-- Verify the updated structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fostec_product' 
ORDER BY ordinal_position;

-- Show sample data to verify the table still works
SELECT * FROM fostec_product LIMIT 5;

RAISE NOTICE 'Database update completed successfully!';
RAISE NOTICE 'Fostec product table now only contains: id, name, created_at, status';
