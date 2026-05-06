-- Requires pg_cron extension enabled in Supabase dashboard
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'cleanup-pin-attempts',
    '*/15 * * * *',
    $$
    DELETE FROM public.app_config
    WHERE key LIKE 'pin_attempts_%'
      AND (value->>'last_attempt')::timestamptz < now() - interval '15 minutes';
    $$
);
