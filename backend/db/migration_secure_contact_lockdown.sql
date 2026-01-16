-- Secure Contact Forms Lockdown
-- This migration removes public access policies, enforcing Service Role access only via Backend.

-- 1. Contact Submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
-- Drop policies created by previous migrations
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insertion" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anon" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_submissions;

-- Ensure no public permissions (just in case)
REVOKE ALL ON contact_submissions FROM anon;
REVOKE ALL ON contact_submissions FROM authenticated;
GRANT SELECT ON contact_submissions TO service_role;
GRANT INSERT ON contact_submissions TO service_role;
GRANT UPDATE ON contact_submissions TO service_role;
GRANT DELETE ON contact_submissions TO service_role;


-- 2. Pollination Requests
ALTER TABLE pollination_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert on pollination_requests" ON pollination_requests;
DROP POLICY IF EXISTS "Allow public insertion" ON pollination_requests;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON pollination_requests;

-- Ensure no public permissions
REVOKE ALL ON pollination_requests FROM anon;
REVOKE ALL ON pollination_requests FROM authenticated;
GRANT ALL ON pollination_requests TO service_role;


-- 3. Newsletter Subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert on newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public insertion" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON newsletter_subscribers;

-- Ensure no public permissions
REVOKE ALL ON newsletter_subscribers FROM anon;
REVOKE ALL ON newsletter_subscribers FROM authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;
