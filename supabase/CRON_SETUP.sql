-- ==========================================
-- BEE YIELD HIVES: CRON SCHEDULING
-- Schedule the task-notifications edge function
-- ==========================================

-- 1. Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Schedule the task reminder (Runs daily at 8:00 AM UTC)
-- REPLACE 'YOUR_SERVICE_ROLE_KEY' with your actual Supabase service_role key
-- REPLACE 'ezfccfypwmuvbpujkqrg' with your actual project ref

SELECT cron.schedule(
    'daily-task-notifications',
    '0 8 * * *',
    $$
    SELECT net.http_post(
        url := 'https://ezfccfypwmuvbpujkqrg.supabase.co/functions/v1/task-notifications',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    )
    $$
);

-- Note: You can check scheduled jobs with:
-- SELECT * FROM cron.job;

-- You can check job execution history with:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
