-- ============================================================================
-- MIGRATION 025: NOTIFICATIONS SCHEDULING & AUDIENCE ALIGNMENT
-- Description: Adds scheduled_at column, auto-dispatch function, cron trigger,
--              and relaxed RLS policy for students to receive scheduled notices.
-- ============================================================================

-- 1. Add scheduled_at column if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
          AND column_name = 'scheduled_at'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN scheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create index for fast status & scheduled_at lookup
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled_at
    ON public.notifications(status, scheduled_at);

-- 3. Stored procedure to transition due scheduled notifications to 'sent'
CREATE OR REPLACE FUNCTION public.process_scheduled_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count integer := 0;
BEGIN
    UPDATE public.notifications
    SET status = 'sent',
        sent_at = COALESCE(scheduled_at, NOW())
    WHERE status = 'scheduled'
      AND scheduled_at IS NOT NULL
      AND scheduled_at <= NOW();

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.process_scheduled_notifications() TO anon, authenticated, service_role;

-- 5. Optional pg_cron automated schedule (runs every minute if pg_cron is available)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Remove existing schedule if it was previously created
        BEGIN
            PERFORM cron.unschedule('process_scheduled_notifications_minutely');
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        -- Register minutely cron job
        PERFORM cron.schedule(
            'process_scheduled_notifications_minutely',
            '* * * * *',
            'SELECT public.process_scheduled_notifications();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Non-fatal for platforms without pg_cron access
        RAISE NOTICE 'pg_cron registration skipped: %', SQLERRM;
END $$;

-- 6. Update Student RLS policy: Students can read sent notifications OR scheduled ones whose time has arrived
DROP POLICY IF EXISTS "Students can read sent notifications" ON public.notifications;

CREATE POLICY "Students can read sent notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        status = 'sent'
        OR (
            status = 'scheduled'
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= NOW()
        )
    );
