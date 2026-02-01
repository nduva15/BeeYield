-- ============================================
-- BeeYield Sharing Features Migration
-- Enables sharing apiaries with other users
-- ============================================

-- 1. Create apiary_shares table
CREATE TABLE IF NOT EXISTS apiary_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES apiaries(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_user_id UUID REFERENCES auth.users(id), -- Denormalized for easier RLS
    permission TEXT DEFAULT 'view', -- 'view', 'edit'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(apiary_id, shared_with_user_id)
);

-- 2. Enable RLS
ALTER TABLE apiary_shares ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for apiary_shares

-- Owner can manage shares for their apiaries
DROP POLICY IF EXISTS "Owners can manage shares" ON apiary_shares;
CREATE POLICY "Owners can manage shares"
    ON apiary_shares
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM apiaries 
            WHERE apiaries.id = apiary_shares.apiary_id 
            AND apiaries.user_id = auth.uid()
        )
    );

-- Users can view shares directed at them
DROP POLICY IF EXISTS "Users can view shares with them" ON apiary_shares;
CREATE POLICY "Users can view shares with them"
    ON apiary_shares
    FOR SELECT
    USING (shared_with_user_id = auth.uid());

-- 4. Update Apiaries RLS to allow shared access
-- Note: This extends the policies created in the previous migration

DROP POLICY IF EXISTS "Users can view shared apiaries" ON apiaries;
CREATE POLICY "Users can view shared apiaries"
    ON apiaries FOR SELECT
    USING (
        auth.uid() = user_id -- Owner
        OR 
        EXISTS ( -- Shared user
            SELECT 1 FROM apiary_shares 
            WHERE apiary_id = apiaries.id 
            AND shared_with_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can edit shared apiaries" ON apiaries;
CREATE POLICY "Users can edit shared apiaries"
    ON apiaries FOR UPDATE
    USING (
        auth.uid() = user_id -- Owner
        OR 
        EXISTS ( -- Editor
            SELECT 1 FROM apiary_shares 
            WHERE apiary_id = apiaries.id 
            AND shared_with_user_id = auth.uid()
            AND permission = 'edit'
        )
    );

-- 5. Update Policies for Related Tables (Hives, Harvests, Tasks, Inspections)
-- Basic Rule: If you can view/edit the apiary, you can view/edit its contents.

-- HIVES
DROP POLICY IF EXISTS "Users can view shared hives" ON hives;
CREATE POLICY "Users can view shared hives" ON hives FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = hives.apiary_id AND shared_with_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update shared hives" ON hives;
CREATE POLICY "Users can update shared hives" ON hives FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = hives.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

DROP POLICY IF EXISTS "Users can insert shared hives" ON hives;
CREATE POLICY "Users can insert shared hives" ON hives FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = hives.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

-- Note: DELETE typically reserved for Owner, but Editors can delete in this model
DROP POLICY IF EXISTS "Users can delete shared hives" ON hives;
CREATE POLICY "Users can delete shared hives" ON hives FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = hives.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

-- HARVESTS
DROP POLICY IF EXISTS "Users can view shared harvests" ON harvests;
CREATE POLICY "Users can view shared harvests" ON harvests FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = harvests.apiary_id AND shared_with_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage shared harvests" ON harvests;
CREATE POLICY "Users can manage shared harvests" ON harvests FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = harvests.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

-- TASKS
DROP POLICY IF EXISTS "Users can view shared tasks" ON tasks;
CREATE POLICY "Users can view shared tasks" ON tasks FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = tasks.apiary_id AND shared_with_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage shared tasks" ON tasks;
CREATE POLICY "Users can manage shared tasks" ON tasks FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = tasks.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

-- INSPECTIONS
DROP POLICY IF EXISTS "Users can view shared inspections" ON inspections;
CREATE POLICY "Users can view shared inspections" ON inspections FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = inspections.apiary_id AND shared_with_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage shared inspections" ON inspections;
CREATE POLICY "Users can manage shared inspections" ON inspections FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM apiary_shares WHERE apiary_id = inspections.apiary_id AND shared_with_user_id = auth.uid() AND permission = 'edit')
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_apiary_shares_apiary ON apiary_shares(apiary_id);
CREATE INDEX IF NOT EXISTS idx_apiary_shares_user ON apiary_shares(shared_with_user_id);
