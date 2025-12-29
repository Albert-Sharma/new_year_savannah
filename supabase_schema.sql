-- Create the submissions table for the Diwali marketing site
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    firm_name TEXT NOT NULL,
    dealer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    firm_address TEXT NOT NULL,
    wishes_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to insert data
CREATE POLICY "Allow anonymous inserts" ON submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow anonymous inserts" ON submissions;
CREATE POLICY "Allow anonymous inserts" ON submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy that allows authenticated users to read data
CREATE POLICY "Allow authenticated reads" ON submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Optional: Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Optional: Create an index on mobile_number for lookups
CREATE INDEX IF NOT EXISTS idx_submissions_mobile_number ON submissions(mobile_number);
