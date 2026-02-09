-- 1. Create Bluetooth Registry
CREATE TABLE IF NOT EXISTS public.bluetooth_devices (
    mac_address TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT DEFAULT 'New Sensor',
    device_type TEXT DEFAULT 'scale',
    assigned_hive_id UUID REFERENCES public.hives(id),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    battery_volts DECIMAL(4,2),
    firmware_version TEXT
);

-- 2. Create Sensor Readings Buffer (Incoming Data)
CREATE TABLE IF NOT EXISTS public.sensor_readings_buffer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_mac TEXT REFERENCES public.bluetooth_devices(mac_address) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temp_c DECIMAL(5,2),
    weight_kg DECIMAL(8,2),
    humidity DECIMAL(5,2),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS (Security)
ALTER TABLE bluetooth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings_buffer ENABLE ROW LEVEL SECURITY;

-- 4. Policies: User Owns Their Bluetooth Devices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own bluetooth devices') THEN
        CREATE POLICY "Users manage own bluetooth devices" 
        ON bluetooth_devices FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 5. Policies: User manages readings for their devices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own readings buffer') THEN
        CREATE POLICY "Users manage own readings buffer" 
        ON sensor_readings_buffer FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM bluetooth_devices 
                WHERE bluetooth_devices.mac_address = sensor_readings_buffer.device_mac 
                AND bluetooth_devices.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- 6. Indices for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_bt_user ON bluetooth_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_bt_readings_mac ON sensor_readings_buffer(device_mac);
