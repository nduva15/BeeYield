DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'alert_events'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'alert_events'
              AND column_name = 'snapshot_date'
        ) THEN
            ALTER TABLE public.alert_events
                ADD COLUMN snapshot_date DATE;
        END IF;

        DELETE FROM public.alert_events existing
        USING public.alert_events duplicate
        WHERE existing.ctid < duplicate.ctid
          AND existing.device_id = duplicate.device_id
          AND existing.rule_id = duplicate.rule_id
          AND existing.hive_label = duplicate.hive_label
          AND existing.metric = duplicate.metric
          AND existing.snapshot_date IS NOT NULL
          AND existing.snapshot_date = duplicate.snapshot_date;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND indexname = 'alert_events_snapshot_date_dedupe_idx'
        ) THEN
            CREATE UNIQUE INDEX alert_events_snapshot_date_dedupe_idx
                ON public.alert_events (device_id, rule_id, hive_label, metric, snapshot_date)
                WHERE snapshot_date IS NOT NULL;
        END IF;
    END IF;
END
$$;
