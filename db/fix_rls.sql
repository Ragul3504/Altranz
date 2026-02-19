-- Enable RLS (if not already enabled)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
-- Create a policy to allow anyone (anon) to insert data
CREATE POLICY "Allow public insert" ON registrations FOR
INSERT TO anon WITH CHECK (true);
-- Allow reading own data (optional, but good practice if you implement reading)
-- CREATE POLICY "Allow public read"
-- ON registrations
-- FOR SELECT
-- TO anon
-- USING (true);