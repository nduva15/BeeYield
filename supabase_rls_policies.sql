DROP POLICY IF EXISTS "Users can view own apiaries" ON apiaries;
DROP POLICY IF EXISTS "Users can insert own apiaries" ON apiaries;
DROP POLICY IF EXISTS "Users can update own apiaries" ON apiaries;
DROP POLICY IF EXISTS "Users can delete own apiaries" ON apiaries;
DROP POLICY IF EXISTS "Users can view own hives" ON hives;
DROP POLICY IF EXISTS "Users can insert own hives" ON hives;
DROP POLICY IF EXISTS "Users can update own hives" ON hives;
DROP POLICY IF EXISTS "Users can delete own hives" ON hives;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own apiaries" 
ON apiaries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own apiaries" 
ON apiaries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own apiaries" 
ON apiaries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own apiaries" 
ON apiaries FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own hives" 
ON hives FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hives" 
ON hives FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hives" 
ON hives FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hives" 
ON hives FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- =============================================
-- NEWSLETTER SUBSCRIBERS RLS FIX
-- Issue: Table has policies but RLS was not enabled
-- =============================================

-- First, drop all the redundant/duplicate policies
DROP POLICY IF EXISTS "Admin all access" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable public insert for newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public insert newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public read access" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public read for newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "authenticated_read_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "enable_insert_for_all_users_newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "public_read_newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "service_role_all_newsletter" ON newsletter_subscribers;

-- CRITICAL: Enable RLS on the table (this was the missing step!)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create clean, consolidated policies
-- Allow anyone (including anonymous) to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to read subscribers (for admin purposes)
CREATE POLICY "Authenticated users can read subscribers"
ON newsletter_subscribers FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access (for backend operations)
CREATE POLICY "Service role full access"
ON newsletter_subscribers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
