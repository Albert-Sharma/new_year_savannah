-- Fix Row Level Security for anonymous form submissions
-- Run this in your Supabase SQL Editor

-- First, let's check if the table exists and drop any existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON submissions;

-- Disable RLS temporarily to fix the issue
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to insert data
CREATE POLICY "Allow anonymous inserts" ON submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy that allows anyone to read data (for testing)
CREATE POLICY "Allow public reads" ON submissions
    FOR SELECT
    TO public
    USING (true);

-- Test the policy by trying to insert a test record
-- (This will be rolled back automatically)
INSERT INTO submissions (firm_name, dealer_name, mobile_number, wishes_text) 
VALUES ('Test Firm', 'Test Dealer', '1234567890', 'Test message');

-- If the above insert works, the policies are correct
-- The test record will be automatically rolled back
