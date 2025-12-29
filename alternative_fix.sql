-- Alternative fix: More permissive RLS policies
-- Run this if the above doesn't work

-- Option 1: Temporarily disable RLS (for testing only)
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Option 2: Create very permissive policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON submissions;
DROP POLICY IF EXISTS "Allow public reads" ON submissions;

-- Allow anonymous users to insert
CREATE POLICY "Allow anonymous inserts" ON submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anyone to read (for testing)
CREATE POLICY "Allow public reads" ON submissions
    FOR SELECT
    TO public
    USING (true);

-- Option 3: If still having issues, you can temporarily disable RLS
-- Uncomment the line below if needed:
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
