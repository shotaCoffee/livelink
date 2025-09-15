-- Temporarily disable RLS for testing
-- In production, you would want proper authentication and RLS

-- Disable RLS on all tables for testing
ALTER TABLE bands DISABLE ROW LEVEL SECURITY;
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items DISABLE ROW LEVEL SECURITY;

-- Allow public access for testing
GRANT ALL ON bands TO anon;
GRANT ALL ON songs TO anon;
GRANT ALL ON lives TO anon;
GRANT ALL ON setlist_items TO anon;