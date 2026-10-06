-- ============================================================================
-- Migration: Fix Supabase Database Linter Warnings
-- Issues Addressed:
--   1. auth_rls_initplan (0003): Wrap auth.<function>() and current_setting()
--      in (SELECT auth.<function>()) so PostgreSQL evaluates them as InitPlans
--      once per query rather than once per row.
--   2. multiple_permissive_policies (0006): Consolidate overlapping policies
--      per role and action so PostgreSQL doesn't evaluate redundant permissive policies.
-- Date: 2026-10-06
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Ensure is_admin helper function is optimized
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_uid uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    IF current_uid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = current_uid AND role IN ('admin', 'super_admin'))
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = current_uid)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ----------------------------------------------------------------------------
-- Helper function to cleanly drop all existing policies on a table
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.drop_all_table_policies(target_table text)
RETURNS void AS $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = target_table 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, target_table);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 1. Standard User-Owned Tables (Consolidated FOR ALL TO authenticated)
-- ============================================================================

-- 1.1 farmers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farmers') THEN
        PERFORM public.drop_all_table_policies('farmers');
        ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "farmers_owner_manage" ON public.farmers
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.2 apiaries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiaries') THEN
        PERFORM public.drop_all_table_policies('apiaries');
        ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "apiaries_owner_manage" ON public.apiaries
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.3 hives
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hives') THEN
        PERFORM public.drop_all_table_policies('hives');
        ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "hives_owner_manage" ON public.hives
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.4 inspections
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inspections') THEN
        PERFORM public.drop_all_table_policies('inspections');
        ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "inspections_owner_manage" ON public.inspections
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.5 tasks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        PERFORM public.drop_all_table_policies('tasks');
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "tasks_owner_manage" ON public.tasks
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.6 harvests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'harvests') THEN
        PERFORM public.drop_all_table_policies('harvests');
        ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "harvests_owner_manage" ON public.harvests
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.7 notes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        PERFORM public.drop_all_table_policies('notes');
        ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "notes_owner_manage" ON public.notes
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.8 user_preferences
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        PERFORM public.drop_all_table_policies('user_preferences');
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "user_preferences_owner_manage" ON public.user_preferences
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.9 alert_thresholds
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alert_thresholds') THEN
        PERFORM public.drop_all_table_policies('alert_thresholds');
        ALTER TABLE public.alert_thresholds ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "alert_thresholds_owner_manage" ON public.alert_thresholds
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.10 user_settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
        PERFORM public.drop_all_table_policies('user_settings');
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "user_settings_owner_manage" ON public.user_settings
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.11 notification_configs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_configs') THEN
        PERFORM public.drop_all_table_policies('notification_configs');
        ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "notification_configs_owner_manage" ON public.notification_configs
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.12 user_notification_settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notification_settings') THEN
        PERFORM public.drop_all_table_policies('user_notification_settings');
        ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "user_notification_settings_owner_manage" ON public.user_notification_settings
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.13 global_iot_settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'global_iot_settings') THEN
        PERFORM public.drop_all_table_policies('global_iot_settings');
        ALTER TABLE public.global_iot_settings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "global_iot_settings_owner_manage" ON public.global_iot_settings
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.14 hub_devices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hub_devices') THEN
        PERFORM public.drop_all_table_policies('hub_devices');
        ALTER TABLE public.hub_devices ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "hub_devices_owner_manage" ON public.hub_devices
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.15 sync_sessions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sync_sessions') THEN
        PERFORM public.drop_all_table_policies('sync_sessions');
        ALTER TABLE public.sync_sessions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "sync_sessions_owner_manage" ON public.sync_sessions
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.16 devices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'devices') THEN
        PERFORM public.drop_all_table_policies('devices');
        ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "devices_owner_manage" ON public.devices
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.17 support_tickets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
        PERFORM public.drop_all_table_policies('support_tickets');
        ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "support_tickets_owner_manage" ON public.support_tickets
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.18 requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'requests') THEN
        PERFORM public.drop_all_table_policies('requests');
        ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "requests_owner_manage" ON public.requests
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.19 bluetooth_devices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bluetooth_devices') THEN
        PERFORM public.drop_all_table_policies('bluetooth_devices');
        ALTER TABLE public.bluetooth_devices ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "bluetooth_devices_owner_manage" ON public.bluetooth_devices
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.20 sensor_readings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings') THEN
        PERFORM public.drop_all_table_policies('sensor_readings');
        ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "sensor_readings_owner_manage" ON public.sensor_readings
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.21 land_readings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'land_readings') THEN
        PERFORM public.drop_all_table_policies('land_readings');
        ALTER TABLE public.land_readings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "land_readings_owner_manage" ON public.land_readings
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.22 disease_detections
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disease_detections') THEN
        PERFORM public.drop_all_table_policies('disease_detections');
        ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "disease_detections_owner_manage" ON public.disease_detections
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.23 saved_labels
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_labels') THEN
        PERFORM public.drop_all_table_policies('saved_labels');
        ALTER TABLE public.saved_labels ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "saved_labels_owner_manage" ON public.saved_labels
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.24 generated_reports
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_reports') THEN
        PERFORM public.drop_all_table_policies('generated_reports');
        ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "generated_reports_owner_manage" ON public.generated_reports
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 1.25 scheduled_reports
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scheduled_reports') THEN
        PERFORM public.drop_all_table_policies('scheduled_reports');
        ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "scheduled_reports_owner_manage" ON public.scheduled_reports
            FOR ALL TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;


-- ============================================================================
-- 2. Profiles Tables (Individual CRUD Policies to avoid cross-role / multiple permissive warnings)
-- ============================================================================

-- 2.1 profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        PERFORM public.drop_all_table_policies('profiles');
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "profiles_select" ON public.profiles
            FOR SELECT TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "profiles_insert" ON public.profiles
            FOR INSERT TO authenticated
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "profiles_update" ON public.profiles
            FOR UPDATE TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "profiles_delete" ON public.profiles
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 2.2 shop_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shop_profiles') THEN
        PERFORM public.drop_all_table_policies('shop_profiles');
        ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "shop_profiles_select" ON public.shop_profiles
            FOR SELECT TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "shop_profiles_insert" ON public.shop_profiles
            FOR INSERT TO authenticated
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "shop_profiles_update" ON public.shop_profiles
            FOR UPDATE TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "shop_profiles_delete" ON public.shop_profiles
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 2.3 beeyield_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'beeyield_profiles') THEN
        PERFORM public.drop_all_table_policies('beeyield_profiles');
        ALTER TABLE public.beeyield_profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "beeyield_profiles_select" ON public.beeyield_profiles
            FOR SELECT TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "beeyield_profiles_insert" ON public.beeyield_profiles
            FOR INSERT TO authenticated
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "beeyield_profiles_update" ON public.beeyield_profiles
            FOR UPDATE TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "beeyield_profiles_delete" ON public.beeyield_profiles
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 2.4 ceba_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ceba_profiles') THEN
        PERFORM public.drop_all_table_policies('ceba_profiles');
        ALTER TABLE public.ceba_profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "ceba_profiles_select" ON public.ceba_profiles
            FOR SELECT TO authenticated
            USING (
                id = (SELECT auth.uid())
                OR (SELECT public.is_admin())
                OR EXISTS (SELECT 1 FROM public.ceba_profiles cp WHERE cp.id = (SELECT auth.uid()) AND cp.admin_role = 'super_admin')
            );

        CREATE POLICY "ceba_profiles_insert" ON public.ceba_profiles
            FOR INSERT TO authenticated
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "ceba_profiles_update" ON public.ceba_profiles
            FOR UPDATE TO authenticated
            USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "ceba_profiles_delete" ON public.ceba_profiles
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;


-- ============================================================================
-- 3. Relational / Multi-Condition Tables
-- ============================================================================

-- 3.1 note_attachments (Relational to notes)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'note_attachments') THEN
        PERFORM public.drop_all_table_policies('note_attachments');
        ALTER TABLE public.note_attachments ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "note_attachments_owner_manage" ON public.note_attachments
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.notes n
                    WHERE n.id = note_attachments.note_id
                      AND (n.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.notes n
                    WHERE n.id = note_attachments.note_id
                      AND (n.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
                )
            );
    END IF;
END $$;

-- 3.2 sensor_readings_buffer (Relational to bluetooth_devices)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings_buffer') THEN
        PERFORM public.drop_all_table_policies('sensor_readings_buffer');
        ALTER TABLE public.sensor_readings_buffer ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "sensor_readings_buffer_owner_manage" ON public.sensor_readings_buffer
            FOR ALL TO authenticated
            USING (
                (SELECT public.is_admin())
                OR EXISTS (
                    SELECT 1 FROM public.bluetooth_devices bd
                    WHERE bd.mac_address = sensor_readings_buffer.device_mac
                      AND bd.user_id = (SELECT auth.uid())
                )
            )
            WITH CHECK (
                (SELECT public.is_admin())
                OR EXISTS (
                    SELECT 1 FROM public.bluetooth_devices bd
                    WHERE bd.mac_address = sensor_readings_buffer.device_mac
                      AND bd.user_id = (SELECT auth.uid())
                )
            );
    END IF;
END $$;

-- 3.3 apiary_shares (Distinct actions to avoid SELECT duplication between owner and recipient)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiary_shares') THEN
        PERFORM public.drop_all_table_policies('apiary_shares');
        ALTER TABLE public.apiary_shares ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "apiary_shares_select" ON public.apiary_shares
            FOR SELECT TO authenticated
            USING (
                shared_with_user_id = (SELECT auth.uid())
                OR EXISTS (
                    SELECT 1 FROM public.apiaries a
                    WHERE a.id = apiary_shares.apiary_id
                      AND a.user_id = (SELECT auth.uid())
                )
                OR (SELECT public.is_admin())
            );

        CREATE POLICY "apiary_shares_insert" ON public.apiary_shares
            FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.apiaries a
                    WHERE a.id = apiary_shares.apiary_id
                      AND a.user_id = (SELECT auth.uid())
                )
                OR (SELECT public.is_admin())
            );

        CREATE POLICY "apiary_shares_update" ON public.apiary_shares
            FOR UPDATE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.apiaries a
                    WHERE a.id = apiary_shares.apiary_id
                      AND a.user_id = (SELECT auth.uid())
                )
                OR (SELECT public.is_admin())
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.apiaries a
                    WHERE a.id = apiary_shares.apiary_id
                      AND a.user_id = (SELECT auth.uid())
                )
                OR (SELECT public.is_admin())
            );

        CREATE POLICY "apiary_shares_delete" ON public.apiary_shares
            FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.apiaries a
                    WHERE a.id = apiary_shares.apiary_id
                      AND a.user_id = (SELECT auth.uid())
                )
                OR (SELECT public.is_admin())
            );
    END IF;
END $$;

-- 3.4 image_analyses (Single consolidated policy per action)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'image_analyses') THEN
        PERFORM public.drop_all_table_policies('image_analyses');
        ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "image_analyses_select" ON public.image_analyses
            FOR SELECT TO authenticated
            USING (
                user_id = (SELECT auth.uid())
                OR (SELECT public.is_admin())
                OR (
                    apiary_id IS NOT NULL AND
                    EXISTS (
                        SELECT 1 FROM public.apiary_shares s
                        WHERE s.apiary_id = image_analyses.apiary_id
                          AND s.shared_with_user_id = (SELECT auth.uid())
                    )
                )
            );

        CREATE POLICY "image_analyses_insert" ON public.image_analyses
            FOR INSERT TO authenticated
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "image_analyses_update" ON public.image_analyses
            FOR UPDATE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "image_analyses_delete" ON public.image_analyses
            FOR DELETE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 3.5 ticket_comments (Relational to support_tickets)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ticket_comments') THEN
        PERFORM public.drop_all_table_policies('ticket_comments');
        ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "ticket_comments_select" ON public.ticket_comments
            FOR SELECT TO authenticated
            USING (
                user_id = (SELECT auth.uid())
                OR (SELECT public.is_admin())
                OR EXISTS (
                    SELECT 1 FROM public.support_tickets st
                    WHERE st.id = ticket_comments.ticket_id
                      AND st.user_id = (SELECT auth.uid())
                )
            );

        CREATE POLICY "ticket_comments_insert" ON public.ticket_comments
            FOR INSERT TO authenticated
            WITH CHECK (
                (SELECT public.is_admin())
                OR (
                    user_id = (SELECT auth.uid())
                    AND EXISTS (
                        SELECT 1 FROM public.support_tickets st
                        WHERE st.id = ticket_comments.ticket_id
                          AND st.user_id = (SELECT auth.uid())
                    )
                )
            );

        CREATE POLICY "ticket_comments_update" ON public.ticket_comments
            FOR UPDATE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "ticket_comments_delete" ON public.ticket_comments
            FOR DELETE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;


-- ============================================================================
-- 4. Public Catalog & Content Tables
-- Policy Rule: 
--   - SELECT is public (anon + authenticated USING (true))
--   - INSERT, UPDATE, DELETE are restricted to Admin
--   - NEVER use "FOR ALL TO authenticated" when SELECT is already public!
-- ============================================================================

DO $$
DECLARE
    tbl text;
    catalog_tables text[] := ARRAY[
        'batches',
        'blog_posts',
        'company_milestones',
        'company_stats',
        'crops_pollinated',
        'esg_metrics',
        'impact_stories',
        'job_positions',
        'label_templates',
        'learning_lessons',
        'learning_modules',
        'media_items',
        'pollination_services',
        'product_variants',
        'products',
        'team_members'
    ];
BEGIN
    FOREACH tbl IN ARRAY catalog_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            PERFORM public.drop_all_table_policies(tbl);
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

            -- Exactly 1 SELECT policy for both anon and authenticated
            EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true);', tbl || '_public_read', tbl);

            -- Exactly 1 policy per write action for authenticated admin
            EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));', tbl || '_admin_insert', tbl);
            EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));', tbl || '_admin_update', tbl);
            EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_admin()));', tbl || '_admin_delete', tbl);
        END IF;
    END LOOP;
END $$;


-- ============================================================================
-- 5. Special E-Commerce & Intake Tables
-- ============================================================================

-- 5.1 job_applications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications') THEN
        PERFORM public.drop_all_table_policies('job_applications');
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

        -- Public insert (anyone can apply)
        CREATE POLICY "job_applications_public_insert" ON public.job_applications
            FOR INSERT TO anon, authenticated
            WITH CHECK (true);

        -- Admin read, update, delete
        CREATE POLICY "job_applications_admin_select" ON public.job_applications
            FOR SELECT TO authenticated
            USING ((SELECT public.is_admin()));

        CREATE POLICY "job_applications_admin_update" ON public.job_applications
            FOR UPDATE TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));

        CREATE POLICY "job_applications_admin_delete" ON public.job_applications
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 5.2 orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        PERFORM public.drop_all_table_policies('orders');
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- Users can view their own orders or admin can view all
        CREATE POLICY "orders_select" ON public.orders
            FOR SELECT TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        -- Guests and authenticated users can create orders
        CREATE POLICY "orders_insert" ON public.orders
            FOR INSERT TO anon, authenticated
            WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        -- Owners and admins can update
        CREATE POLICY "orders_update" ON public.orders
            FOR UPDATE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        -- Admins can delete
        CREATE POLICY "orders_delete" ON public.orders
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 5.3 order_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        PERFORM public.drop_all_table_policies('order_items');
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "order_items_select" ON public.order_items
            FOR SELECT TO anon, authenticated
            USING (true);

        CREATE POLICY "order_items_insert" ON public.order_items
            FOR INSERT TO anon, authenticated
            WITH CHECK (true);

        CREATE POLICY "order_items_update" ON public.order_items
            FOR UPDATE TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));

        CREATE POLICY "order_items_delete" ON public.order_items
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;

-- 5.4 product_reviews
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_reviews') THEN
        PERFORM public.drop_all_table_policies('product_reviews');
        ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "product_reviews_select" ON public.product_reviews
            FOR SELECT TO anon, authenticated
            USING (true);

        CREATE POLICY "product_reviews_insert" ON public.product_reviews
            FOR INSERT TO authenticated
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "product_reviews_update" ON public.product_reviews
            FOR UPDATE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
            WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

        CREATE POLICY "product_reviews_delete" ON public.product_reviews
            FOR DELETE TO authenticated
            USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
    END IF;
END $$;

-- 5.5 tracing_history
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracing_history') THEN
        PERFORM public.drop_all_table_policies('tracing_history');
        ALTER TABLE public.tracing_history ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "tracing_history_select" ON public.tracing_history
            FOR SELECT TO anon, authenticated
            USING (true);

        CREATE POLICY "tracing_history_insert" ON public.tracing_history
            FOR INSERT TO anon, authenticated
            WITH CHECK (true);

        CREATE POLICY "tracing_history_update" ON public.tracing_history
            FOR UPDATE TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));

        CREATE POLICY "tracing_history_delete" ON public.tracing_history
            FOR DELETE TO authenticated
            USING ((SELECT public.is_admin()));
    END IF;
END $$;


-- ----------------------------------------------------------------------------
-- Cleanup temporary helper function
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.drop_all_table_policies(text);

NOTIFY pgrst, 'reload schema';

COMMIT;


