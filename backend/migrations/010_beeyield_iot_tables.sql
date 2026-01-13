-- BeeYield IoT Dashboard Tables
-- Migration: 010_beeyield_iot_tables.sql

-- 1. IoT Devices Table
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  device_code TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('infield', 'inland', 'disease')),
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  farmer_id UUID REFERENCES public.farmers(id),
  apiary_id UUID,
  hive_id UUID,
  last_ping TIMESTAMPTZ,
  battery_level NUMERIC,
  firmware_version TEXT,
  status TEXT DEFAULT 'active'
);

-- 2. Sensor Readings Table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  device_id UUID REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('infield', 'inland', 'disease')),
  timestamp TIMESTAMPTZ NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  -- Infield sensor data (JSON for flexibility)
  -- Expected: temperature, humidity, soil_moisture
  -- Inland sensor data
  -- Expected: hive_weight, internal_temp, bee_activity
  -- Disease sensor data
  -- Expected: colony_health_score, pest_detection, treatment_status
  readings JSONB NOT NULL,
  battery_level NUMERIC,
  signal_strength INTEGER,
  status TEXT DEFAULT 'active'
);

-- 3. Client Pollination Hives (links clients to their contracted hives)
CREATE TABLE IF NOT EXISTS public.client_hives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hive_name TEXT NOT NULL,
  hive_code TEXT UNIQUE,
  crop_type TEXT,
  farm_location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contract_start DATE,
  contract_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Enable RLS
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_hives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for IoT Devices
CREATE POLICY "Enable read for authenticated users" ON public.iot_devices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for service role" ON public.iot_devices FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for Sensor Readings
CREATE POLICY "Enable read for authenticated users" ON public.sensor_readings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for service role" ON public.sensor_readings FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for Client Hives (users can only see their own hives)
CREATE POLICY "Users can view own hives" ON public.client_hives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hives" ON public.client_hives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all for service role" ON public.client_hives FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device ON public.sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type ON public.sensor_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_client_hives_user ON public.client_hives(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_type ON public.iot_devices(device_type);
