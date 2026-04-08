import { supabaseBeeYield } from '@/lib/supabase';
import { getAuthHeaders, getBaseUrl, apiDelete, apiGet, apiPatch, apiPost, apiPut } from './api';
import { dashboardPollinationCropDetails } from '@/data/beePollinationData';
import { toast } from 'sonner';

// Shorthand for the Supabase client used throughout this service
const sb = supabaseBeeYield;

// ========= LOCAL FALLBACK STORE (when Supabase/backends unavailable) =========
// This allows core forms to keep working in dev/demo environments.
type LocalEntity = { id: string; created_at?: string; updated_at?: string };

/**
 * MOCK/FALLBACK DISABLED
 * The product requirement is: no mock/demo/local fallback data.
 * Keep helper functions for minimal diff, but make them no-ops.
 */
const DISABLE_LOCAL_FALLBACK = true;

const LS_KEYS = {
    apiaries: 'beeyield_local_apiaries_v1',
    hives: 'beeyield_local_hives_v1',
    harvests: 'beeyield_local_harvests_v1',
    requests: 'beeyield_local_requests_v1',
    inspections: 'beeyield_local_inspections_v1',
    notes: 'beeyield_local_notes_v1',
} as const;

function _nowIso() {
    return new Date().toISOString();
}

function _uuid() {
    // crypto.randomUUID exists in modern browsers; fall back gracefully.
    return (globalThis.crypto as any)?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function _lsRead<T>(key: string, fallback: T): T {
    if (DISABLE_LOCAL_FALLBACK) return fallback;
    try {
        const raw = globalThis.localStorage?.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function _lsWrite<T>(key: string, value: T) {
    if (DISABLE_LOCAL_FALLBACK) return;
    try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
        // ignore (private mode / storage disabled)
    }
}

function _lsUpsert<T extends LocalEntity>(key: string, row: T): T {
    if (DISABLE_LOCAL_FALLBACK) return row;
    const list = _lsRead<T[]>(key, []);
    const idx = list.findIndex((x) => x.id === row.id);
    const next = { ...row, updated_at: _nowIso() } as T;
    if (idx >= 0) list[idx] = next;
    else list.unshift({ ...next, created_at: next.created_at || _nowIso() });
    _lsWrite(key, list);
    return next;
}

function _lsDelete(key: string, id: string) {
    if (DISABLE_LOCAL_FALLBACK) return;
    const list = _lsRead<any[]>(key, []);
    _lsWrite(key, list.filter((x) => x?.id !== id));
}

// Types for BeeYield Dashboard
export interface InfieldReadings {
    temperature: number;
    humidity: number;
    soil_moisture: number;
}

export interface InlandReadings {
    hive_weight: number;
    internal_temp: number;
    bee_activity: number;
}

export interface DiseaseReadings {
    treatment_status: string;
}

// ========== ACTIVITY LOG TYPE ==========
export interface ActivityLog {
    id: string;
    user_id: string;
    event_type: string;
    entity_type?: string;
    entity_id?: string;
    title: string;
    subtitle?: string;
    metadata?: any;
    created_at: string;
}

// ========== STORAGE & PROFILES ==========
export const uploadAvatar = async (userId: string, file: File): Promise<{ url: string | null; error: any }> => {
    try {
        if (!sb) throw new Error('Supabase client not initialized');
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to 'profiles' bucket
        const { error: uploadError } = await sb.storage
            .from('profiles')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(
                uploadError.message?.includes('not found')
                    ? 'The "profiles" storage bucket does not exist. Please create it in the Supabase dashboard → Storage.'
                    : uploadError.message || 'Upload failed'
            );
        }

        // Get public URL
        const { data } = sb.storage
            .from('profiles')
            .getPublicUrl(filePath);

        return { url: data.publicUrl, error: null };
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        return { url: null, error };
    }
};


// ========== SENSOR ALERT TYPE ==========
export interface SensorAlert {
    id: string;
    user_id: string;
    hive_id: string;
    apiary_id: string;
    alert_type: 'temperature' | 'humidity' | 'weight' | 'acoustic';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    reading_value?: number;
    threshold_value?: number;
    resolved: boolean;
    resolved_at?: string;
    created_at: string;
}

export interface IoTDevice {
    id: string;
    device_code: string;
    device_name: string;
    device_type: 'infield' | 'inland' | 'disease';
    status: 'active' | 'inactive';
    battery_level: number;
    firmware_version: string;
    last_ping: string;
    location_name: string;
    latitude?: number;
    longitude?: number;
    farmer_id?: string;
    apiary_id?: string;
    linked_apiary_id?: string;
    hive_id?: string;
}

export interface IoTDeviceCreateInput {
    device_code: string;
    device_name: string;
    device_type: 'infield' | 'inland' | 'disease';
    location_name?: string;
    latitude?: number;
    longitude?: number;
    farmer_id?: string;
    apiary_id?: string;
    linked_apiary_id?: string;
    hive_id?: string;
}

export type IoTDeviceUpdateInput = Partial<IoTDeviceCreateInput> & {
    status?: 'active' | 'inactive';
    battery_level?: number;
    firmware_version?: string;
    last_ping?: string;
};

export type DeviceAuditAction = 'created' | 'updated' | 'deleted';

export interface DeviceAuditLog {
    id: string;
    device_id: string;
    action: DeviceAuditAction;
    user_id?: string;
    user_email?: string;
    changes?: any;
    created_at: string;
}

export interface BluetoothDeviceRecord {
    mac_address: string;
    name: string;
    device_type: string;
    assigned_hive_id?: string | null;
    last_sync_at?: string | null;
    battery_volts?: number | null;
    firmware_version?: string | null;
    user_id?: string;
}

export interface BluetoothDeviceCreateInput {
    mac_address: string;
    name: string;
    device_type?: string;
    assigned_hive_id?: string | null;
    battery_volts?: number | null;
    firmware_version?: string | null;
}

export interface BluetoothDeviceUpdateInput {
    name?: string;
    device_type?: string;
    assigned_hive_id?: string | null;
    battery_volts?: number | null;
    firmware_version?: string | null;
}

export interface BluetoothReadingUpload {
    device_mac: string;
    recorded_at: string;
    temp_c?: number | null;
    weight_kg?: number | null;
    humidity?: number | null;
}

export interface UsbHubDeviceRecord {
    id?: string;
    serial_number: string;
    firmware_version?: string | null;
    config_json?: Record<string, any> | null;
    status?: string | null;
    last_connected_at?: string | null;
    last_sync_at?: string | null;
    user_id?: string;
}

export interface UsbHubDeviceCreateInput {
    serial_number: string;
    firmware_version?: string | null;
    config_json?: Record<string, any>;
    status?: string;
}

export interface UsbHubDeviceUpdateInput {
    firmware_version?: string | null;
    config_json?: Record<string, any>;
    status?: string;
}

// ========== POLLINATION TYPES ==========
export interface CropPollinationRequirement {
    id: string;
    crop_name: string;
    target_fpa: number;
    hives_per_acre_recommended: number;
    target_frames_per_hive: number;
    pollination_window_start?: string;
    pollination_window_end?: string;
    metadata?: any;
}

export interface PollinationCalculatorInput {
    crop_type: string;
    acreage: number;
    avg_frames_per_hive: number;
    weather_factor: number;
}

export interface PollinationCalculatorResult {
    hives_needed: number;
    target_fpa: number;
    actual_fpa: number;
    coverage_health_pct: number;
    foraging_efficiency: number;
    colony_strength_category: string;
    recommendations: string[];
}

export interface SensorReading {
    id: string;
    device_id: string;
    hive_id?: string;
    sensor_type: 'infield' | 'inland' | 'disease';
    timestamp: string;
    status: string;
    readings: InfieldReadings | InlandReadings | DiseaseReadings;
    signal_strength?: number;
    battery_level?: number;
    // Flat accessors for common fields
    temperature?: number;
    humidity?: number;
    weight?: number;
    delta_w?: number;
    signal_dbm?: number;
}

export interface WeatherMetricSource {
    source: 'device' | 'provider' | 'unavailable' | string;
    device_id?: string | null;
    provider?: string | null;
    observed_at?: string | null;
}

export interface WeatherCurrent {
    temperature_c?: number | null;
    humidity_pct?: number | null;
    pressure_hpa?: number | null;
    wind_speed_kmh?: number | null;
    wind_direction?: string | null;
    feels_like_c?: number | null;
    condition?: string | null;
    cloud_cover_pct?: number | null;
    sunrise_at?: string | null;
    sunset_at?: string | null;
    uv_index?: number | null;
    aqi?: number | null;
    last_observed_at?: string | null;
}

export interface WeatherHourlyPoint {
    timestamp?: string | null;
    temperature_c?: number | null;
    humidity_pct?: number | null;
    pressure_hpa?: number | null;
    wind_speed_kmh?: number | null;
    condition?: string | null;
    uv_index?: number | null;
}

export interface WeatherDailySummary {
    date?: string | null;
    condition?: string | null;
    temp_max_c?: number | null;
    temp_min_c?: number | null;
    sunrise_at?: string | null;
    sunset_at?: string | null;
    uv_index_max?: number | null;
    aqi?: number | null;
}

export interface WeatherLinkedDeviceMeta {
    device_id: string;
    device_name: string;
    device_type?: string | null;
    status?: string | null;
    last_ping?: string | null;
    last_observed_at?: string | null;
}

export interface ApiaryWeatherSummary {
    apiary_id: string;
    current: WeatherCurrent;
    hourly_forecast: WeatherHourlyPoint[];
    daily_summary: WeatherDailySummary;
    source_meta: Record<string, WeatherMetricSource>;
    linked_device_meta: WeatherLinkedDeviceMeta[];
}

export interface YieldForecastRequest {
    apiary_id?: string | null;
    latitude: number;
    longitude: number;
    date_from: string;
    date_to: string;
    radius_m: number;
    vegetation_index: string;
    crop_profile: string;
    bee_activity_pct?: number | null;
}

export interface YieldForecastSourceStatus {
    key: string;
    label: string;
    status: string;
    detail: string;
}

export interface YieldForecastTimelinePoint {
    date: string;
    yield_kg: number;
    lower_kg: number;
    upper_kg: number;
    activity_index: number;
    weather_index: number;
    vegetation_index: number;
}

export interface YieldForecastResponse {
    location: {
        label: string;
        latitude: number;
        longitude: number;
        source: 'apiary' | 'manual';
        apiary_id?: string | null;
        apiary_name?: string | null;
        nearest_apiary_distance_km?: number | null;
    };
    analysis_window: {
        date_from: string;
        date_to: string;
        days: number;
        radius_m: number;
        vegetation_index: string;
        crop_profile: string;
        bee_activity_pct?: number | null;
    };
    forecast: {
        expected_yield_kg: number;
        low_kg: number;
        high_kg: number;
        confidence_pct: number;
        yield_per_hive_kg: number;
        yield_per_acre_kg?: number | null;
        forecast_score: number;
    };
    comparisons: {
        last_period_yield_kg?: number | null;
        delta_pct?: number | null;
        active_hives: number;
        harvest_count: number;
        sensor_samples: number;
    };
    signals: {
        vegetation_score: number;
        weather_score: number;
        activity_score: number;
        history_score: number;
        source_statuses: YieldForecastSourceStatus[];
    };
    model?: {
        name: string;
        strategy: string;
        disagreement_kg: number;
        components: Array<{
            key: string;
            label: string;
            value_kg: number;
            weight: number;
            detail: string;
        }>;
        rationale: string[];
    };
    timeline: YieldForecastTimelinePoint[];
    drivers: Array<{
        label: string;
        impact: 'positive' | 'neutral' | 'negative';
        value: string;
        detail: string;
    }>;
    recommendations: string[];
    weather: {
        current: WeatherCurrent;
        status: string;
    };
    map: {
        center: {
            lat: number;
            lng: number;
        };
        radius_m: number;
    };
}

export interface PublicFlightMapPoint {
    lat: number;
    lng: number;
}

export interface PublicFlightMapPayload {
    site_mode: string;
    source_label: string;
    apiary: Apiary;
    hives: Hive[];
    route_points: PublicFlightMapPoint[];
    coverage_radius_m: number;
    land_types?: Array<{
        id: string;
        name: string;
        share_pct: number;
        nectar_score: number;
        is_blooming: boolean;
    }>;
    weather_summary: ApiaryWeatherSummary;
    flight_potential: {
        score: number;
        status: string;
        recommendation: string;
        active_sources: Array<{
            name: string;
            potential: number;
            is_optimal: boolean;
        }>;
    };
}

export interface Orchard {
    id: string;
    grower_id: string;
    apiary_id?: string | null;
    name: string;
    location_name?: string | null;
    crop_type?: string | null;
    boundary_geojson?: any;
    acreage?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface TelemetryGateway {
    id: string;
    beekeeper_id: string;
    device_code: string;
    status: 'ONLINE' | 'OFFLINE';
    battery: number;
    signal: number;
    deployment_date: string;
}

export interface DashboardStats {
    totalDevices: number;
    activeDevices: number;
    totalReadings: number;
    lastUpdate: string;
    avgTemperature: number;
    avgHumidity: number;
    avgHiveWeight: number;
    healthScore: number;
}

export interface ClientHive {
    id: string;
    user_id: string;
    hive_name: string;
    hive_code: string;
    crop_type: string;
    farm_location: string;
    status: string;
    contract_start: string;
    contract_end: string;
}

// ========== REPORTS & EXPORTS TYPES ==========
export interface GeneratedReport {
    id: string;
    user_id: string;
    report_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    file_format: string;
    file_url?: string;
    file_name?: string;
    parameters?: any;
    created_at: string;
}

export interface ScheduledReport {
    id: string;
    user_id: string;
    name: string;
    report_type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    is_active: boolean;
    last_run_at?: string;
    next_run_at?: string;
    created_at: string;
    report_config?: any;
}

export interface ReportCreateInput {
    report_type: string;
    parameters?: any;
    file_format?: string;
}

export interface ScheduledReportCreateInput {
    name: string;
    report_type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
    is_active?: boolean;
    report_config?: any;
}

// ========== REQUESTS TYPES ==========
export interface Request {
    id: string;
    user_id: string;
    reference_id?: string;
    subject: string;
    description: string;
    status: 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'new' | 'Draft' | 'Open' | 'In Progress' | 'Resolved';
    priority: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High' | 'Critical';
    type?: 'maintenance' | 'support' | 'inspection' | 'other' | string;
    apiary_id?: string;
    hive_id?: string;
    category?: string;
    created_at: string;
    updated_at?: string | null;
}

export type SupportRequest = Request;

export interface ForageZone {
    id: string;
    user_id: string;
    apiary_id: string;
    zone_name?: string | null;
    flora_type?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radius_km?: number | null;
    density_score?: number | null;
    season?: string | null;
    geojson?: any;
    notes?: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface Geofence {
    id: string;
    user_id: string;
    apiary_id?: string | null;
    name: string;
    center_latitude?: number | null;
    center_longitude?: number | null;
    radius_meters?: number | null;
    boundary_geojson?: any;
    notes?: string | null;
    alert_triggered: boolean;
    created_at: string;
    updated_at?: string | null;
}

export interface MapView {
    id: string;
    user_id: string;
    apiary_id?: string | null;
    name: string;
    description?: string | null;
    view_type: string;
    center_latitude?: number | null;
    center_longitude?: number | null;
    zoom_level?: number | null;
    active_layers: string[];
    filters: Record<string, any>;
    viewport_state: Record<string, any>;
    is_default: boolean;
    created_at: string;
    updated_at?: string | null;
}

export interface RequestCreateInput {
    subject: string;
    description: string;
    type: string;
    priority?: string;
    apiary_id?: string;
    hive_id?: string;
    category?: string;
    status?: string;
}

export interface RequestComment {
    id: string;
    request_id: string;
    author_id: string;
    message: string;
    created_at: string;
    is_internal?: boolean;
}

// ========== APIARY & FARMER TYPES ==========
export interface Farmer {
    id: string;
    user_id?: string;
    name: string;
    phone?: string;
    experience_years?: number;
    story?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    certification_status?: string;
    total_hives?: number;
    registration_date?: string;
    created_at?: string;
}

export interface Apiary {
    id: string;
    user_id?: string;
    farmer_id?: string | null;
    name: string;
    type?: string;
    status?: string | null;
    location_name?: string | null;
    county?: string | null;
    region?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    forage_type?: string;
    expected_hives?: number;
    size_acres?: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    farmer?: Farmer | null;
    hive_count?: number;
}

export interface ApiaryCreateInput {
    name: string;
    type?: string;
    location_name?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    forage_type?: string;
    expected_hives?: number;
    size_acres?: number;
    notes?: string;
    farmer_id?: string;
}

// ========== HIVE TYPES ==========
export interface Hive {
    id: string;
    user_id?: string | null;
    apiary_id?: string | null;
    farmer_id?: string | null;
    hive_code: string;
    hive_type?: string;
    bee_type?: string;
    frame_count?: number;
    material?: string;
    status?: string;
    installation_date?: string;
    has_sensors?: boolean;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    apiary?: Apiary | null;
    apiary_name?: string;
    farmer?: Farmer | null;
    latest_temp?: number;
    latest_humidity?: number;
    latest_weight?: number;
    latitude?: number;
    longitude?: number;
    temp_threshold_high?: number;
    temp_threshold_low?: number;
    weight_drop_threshold?: number;
}

export interface HiveCreateInput {
    apiary_id?: string;
    farmer_id?: string;
    hive_code: string;
    hive_type?: string;
    bee_type?: string;
    frame_count?: number;
    material?: string;
    status?: string;
    installation_date?: string;
    has_sensors?: boolean;
    notes?: string;
}

// ========== HARVEST TYPES ==========
export interface Harvest {
    id: string;
    hive_id?: string | null;
    farmer_id?: string | null;
    harvest_date: string;
    quantity_kg: number;
    quantity_left_for_bees_kg?: number;
    extraction_method?: string;
    nectar_source?: string;
    weather_conditions?: string;
    moisture_content_percent?: number;
    batch_code?: string;
    honey_type?: string;
    color_grade?: string;
    is_verified?: boolean;
    blockchain_hash?: string;
    florage_type?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    hive?: Hive | null;
    farmer?: Farmer | null;
    apiary?: Apiary | null;
}

export interface HarvestCreateInput {
    hive_id?: string | null;
    apiary_id?: string;
    farmer_id?: string;
    harvest_date: string;
    quantity_kg: number;
    quantity_left_for_bees_kg?: number;
    extraction_method?: string;
    nectar_source?: string;
    weather_conditions?: string;
    moisture_content_percent?: number;
    batch_code?: string;
    honey_type?: string;
    color_grade?: string;
    is_verified?: boolean;
    florage_type?: string;
    notes?: string;
}

export interface HarvestBatchInput {
    hive_id: string;
    apiary_id: string;
    quantity_kg: number;
    florage_type: string;
    harvest_date?: string;
    honey_type?: string;
    notes?: string;
}

export interface CompletenessSection {
    status: string;
    present: number;
    derivable: number;
    missing: number;
    fields: Record<string, string>;
}

export interface BatchCompleteness {
    status: string;
    present: number;
    derivable: number;
    missing: number;
    sections: Record<string, CompletenessSection>;
}

export interface BatchVerificationDetails {
    verified?: boolean;
    status?: string;
    block_hash?: string;
    tx_hash?: string;
    verification_url?: string;
    network?: string;
    on_chain_verified?: boolean;
    error?: string;
}

export interface BatchBlockchainStatus {
    overall: string;
    block_hash?: string;
    honeychain?: BatchVerificationDetails;
    polygon?: BatchVerificationDetails;
}

export interface BatchView {
    id: string;
    batch_code: string;
    honey_type?: string;
    harvest_date?: string;
    quantity_kg?: number;
    processing_method?: string;
    farmer_name?: string;
    farmer_phone?: string;
    beekeeper_name?: string;
    beekeeper_id?: string;
    apiary_name?: string;
    location_county?: string;
    location_region?: string;
    latitude?: number;
    longitude?: number;
    quality_grade?: string;
    moisture_content?: number;
    color_grade?: string;
    status?: string;
    block_hash?: string;
    blockchain_verified?: boolean;
    verification_status?: string;
    verification_url?: string;
    blockchain_status?: BatchBlockchainStatus;
    completeness?: BatchCompleteness;
    harvest?: Harvest | null;
    hive?: Hive | null;
    apiary?: Apiary | null;
    farmer?: Farmer | null;
    sensor_snapshot?: Record<string, unknown> | null;
    health_snapshot?: Record<string, unknown> | null;
    florage_type?: string;
    extra_metadata?: Record<string, unknown>;
    quantity_left_for_bees_kg?: number;
    sustainability?: {
        rule: string;
        ratio?: number | null;
        status: string;
    };
}

// ========== TASK TYPES ==========
export interface Task {
    id: string;
    user_id?: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed' | 'in_progress';
    priority: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
    type?: string;
    category: string;
    due_date?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed: boolean;
    is_recurring?: boolean;
    recurrence_days?: number;
    parent_task_id?: string;
    has_spawned_next?: boolean;
    recurrence_status?: 'active' | 'paused' | 'stopped';
    completed_at?: string;
    created_at?: string;
    updated_at?: string;
    apiary?: Apiary;
    hive?: Hive;
    recurrence?: string;
}

export interface TaskCreateInput {
    title: string;
    description?: string;
    status?: 'pending' | 'completed' | 'in_progress';
    priority?: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
    type?: string;
    category?: string;
    due_date?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed?: boolean;
    is_recurring?: boolean;
    recurrence_days?: number;
    parent_task_id?: string;
    has_spawned_next?: boolean;
    recurrence_status?: 'active' | 'paused' | 'stopped';
    completed_at?: string;
    recurrence?: string;
}

// ========== NOTE TYPES ==========
export interface Note {
    id: string;
    user_id: string;
    apiary_id?: string;
    hive_id?: string;
    title?: string;
    content?: string;
    category?: string;
    priority: 'low' | 'medium' | 'high';
    note_date: string;
    created_at: string;
    updated_at: string;
}

export interface NoteCreateInput {
    apiary_id?: string;
    hive_id?: string;
    title?: string;
    content?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    note_date?: string;
}

// ========== INSPECTION TYPES ==========
export interface InspectionCreateInput {
    hive_id: string;
    inspector_name?: string;
    inspection_date: string;
    findings?: string;
    actions_taken?: string;
    health_status?: string;
    temperament?: string;
    honey_stores?: number;
    pollen_stores?: number;
    brood_pattern?: string;
    eggs_seen?: boolean;
    queen_seen?: boolean;
    queen_cells_seen?: boolean;
    varroa_mite_count?: number;
    small_hive_beetles_seen?: number;
    weather_condition?: string;
    temperature_celsius?: number;
    notes?: string;
}

export interface Inspection extends InspectionCreateInput {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface VarroaReadingCreateInput {
    hive_id: string;
    reading_date: string;
    method?: 'alcohol_wash' | 'sticky_board' | 'sugar_roll' | 'visual' | 'other';
    mite_count: number;
    sample_size?: number;
    inspector_name?: string;
    notes?: string;
}

export interface VarroaReading extends VarroaReadingCreateInput {
    id: string;
    infestation_rate: number;
    created_at: string;
    updated_at: string;
}

export interface VarroaTreatmentCreateInput {
    hive_id: string;
    treatment_type: 'oxalic_acid' | 'formic_acid' | 'thymol' | 'amitraz' | 'fluvalinate' | 'biotechnical' | 'other';
    start_date: string;
    end_date?: string;
    dosage?: string;
    effectiveness_percent?: number;
    notes?: string;
}

export interface VarroaTreatment extends VarroaTreatmentCreateInput {
    id: string;
    created_at: string;
    updated_at: string;
}

// ========== PRECISION POLLINATION TYPES ==========
export interface PollinationContract {
    id: string;
    contract_code: string;
    crop_type: string;
    farm_location: string;
    farm_size_acres: number;
    contract_start_date: string;
    contract_end_date: string;
    hive_count_required: number;
    hive_count_deployed: number;
    target_fpa: number;
    actual_fpa?: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    payment_amount?: number;
    payment_status?: string;
    notes?: string;
}

export interface PollinationAnalytics {
    total_contracts: number;
    active_contracts: number;
    total_hives_deployed: number;
    total_acres_covered: number;
    average_fpa: number;
    coverage_health_percent: number;
    healthy_hives: number;
    warning_hives: number;
    critical_hives: number;
    total_revenue: number;
}

const DASHBOARD_CROP_REQUIREMENTS: CropPollinationRequirement[] = dashboardPollinationCropDetails.map((crop, index) => {
    const range = crop.optimalHivesPerAcre.match(/(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)/);
    const recommendedHivesPerAcre = range
        ? Number(((parseFloat(range[1]) + parseFloat(range[3])) / 2).toFixed(1))
        : Math.max(0.5, Number((crop.targetFPA / 8).toFixed(1)));

    return {
        id: `dashboard-crop-${index + 1}`,
        crop_name: crop.cropName,
        target_fpa: crop.targetFPA,
        hives_per_acre_recommended: recommendedHivesPerAcre,
        target_frames_per_hive: 8,
        metadata: {
            bee_dependence: crop.beeDependence,
            dependency_percent: crop.dependencyPercent,
            economic_impact: crop.economicImpact,
        },
    };
});

const DASHBOARD_CROP_NAMES = new Set(DASHBOARD_CROP_REQUIREMENTS.map((crop) => crop.crop_name));

function normalizeCropRequirements(data: CropPollinationRequirement[] | null | undefined): CropPollinationRequirement[] {
    const cropMap = new Map<string, CropPollinationRequirement>();

    for (const crop of DASHBOARD_CROP_REQUIREMENTS) {
        cropMap.set(crop.crop_name, crop);
    }

    for (const crop of data || []) {
        const name = String(crop?.crop_name || '').trim();
        if (!name || !DASHBOARD_CROP_NAMES.has(name)) continue;
        cropMap.set(name, {
            ...cropMap.get(name),
            ...crop,
            crop_name: name,
            target_fpa: Number(crop.target_fpa || cropMap.get(name)?.target_fpa || 0),
        });
    }

    return DASHBOARD_CROP_REQUIREMENTS.map((crop) => cropMap.get(crop.crop_name) || crop);
}

// ========== SETTINGS TYPES ==========
export interface NotificationConfig {
    event_type: string;
    email_enabled: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
    updated_at: string;
}

export interface UserSettings {
    user_id: string;
    language: string;
    unit_system: 'Metric' | 'Imperial';
    theme: 'Light' | 'Dark' | 'System';
    timezone: string;
    temp_threshold_high: number;
    temp_threshold_low: number;
    weight_drop_threshold: number;
    created_at: string;
    updated_at: string;
    notification_configs?: NotificationConfig[];
}

export interface UserSettingsUpdate {
    language?: string;
    unit_system?: 'Metric' | 'Imperial';
    theme?: 'Light' | 'Dark' | 'System';
    timezone?: string;
    temp_threshold_high?: number;
    temp_threshold_low?: number;
    weight_drop_threshold?: number;
}

export interface NotificationConfigUpdate {
    email_enabled?: boolean;
    push_enabled?: boolean;
    sms_enabled?: boolean;
}

// ========== CALCULATOR TYPES ==========
export interface CalculatorLog {
    id: string;
    user_id: string;
    calculation_type: 'feeding' | 'health' | 'logistics' | 'economy';
    sub_type: string;
    inputs: any;
    results: any;
    created_at: string;
}

export interface CalculatorLogCreateInput {
    calculation_type: 'feeding' | 'health' | 'logistics' | 'economy';
    sub_type: string;
    inputs: any;
    results: any;
}

export interface UserNotificationSettings {
    user_id: string;
    email_alerts_enabled: boolean;
    push_notifications_enabled: boolean;
    notify_on_swarm: boolean;
    notify_on_theft: boolean;
    notify_on_low_battery: boolean;
    updated_at: string;
}

export interface IoTSettings {
    user_id: string;
    temp_min_threshold: number;
    temp_max_threshold: number;
    weight_drop_alert_kg: number;
    humidity_min_threshold: number;
    humidity_max_threshold: number;
    updated_at: string;
}


// ========== BILLING TYPES ==========
export interface BillingOverview {
    total_revenue: number;
    total_costs: number;
    net_result: number;
    outstanding_invoices: number;
}

export interface Transaction {
    id: string;
    user_id: string;
    date: string;
    amount: number;
    currency: string;
    transaction_type: 'income' | 'expense';
    type?: 'income' | 'expense'; // legacy ref
    description: string;
    module_type?: string;
    category?: string; // legacy ref
    etims_status: string;
    status?: string; // legacy ref
    metadata?: any;
    etims_qr_url?: string | null;
}

export interface VarroaSimulationPoint {
    day: number;
    dayLabel: string;
    population: number;
    phoretic: number;
    dailyMiteFall: number;
    cumulativeMiteFall: number;
    brood: number;
    mitesInBrood: number;
    broodlessPhoretic: number;
    infectionPer100: number;
    scenarioRisk: number;
    adultBees: number;
    allBrood: number;
    cappedBrood: number;
    alcoholWash: number;
}

export interface VarroaSimulationSummary {
    estimatedMiteCount: number;
    totalPopulation: number;
    phoretic: number;
    brood: number;
    dailyMiteFall: number;
    collapseThreshold: number;
}

export interface VarroaSimulationMeta {
    source: string;
    modelVersion: string;
    generatedAt: string;
    startMode: string;
    measurementType: string;
    treatmentType: string;
}

export interface VarroaSimulationResponse {
    timeline: VarroaSimulationPoint[];
    summary: VarroaSimulationSummary;
    meta: VarroaSimulationMeta;
}

function normalizeInspection(record: any): Inspection {
    const inspectionDate = record?.inspection_date ?? record?.date ?? new Date().toISOString().slice(0, 10);

    return {
        id: String(record?.id ?? ''),
        hive_id: String(record?.hive_id ?? ''),
        inspector_name: record?.inspector_name ?? '',
        inspection_date: String(inspectionDate),
        findings: record?.findings ?? '',
        actions_taken: record?.actions_taken ?? '',
        health_status: record?.health_status ?? 'healthy',
        temperament: record?.temperament ?? 'calm',
        honey_stores: Number(record?.honey_stores ?? 0),
        pollen_stores: Number(record?.pollen_stores ?? 0),
        brood_pattern: record?.brood_pattern ?? 'solid',
        eggs_seen: Boolean(record?.eggs_seen),
        queen_seen: Boolean(record?.queen_seen),
        queen_cells_seen: Boolean(record?.queen_cells_seen),
        varroa_mite_count: Number(record?.varroa_mite_count ?? 0),
        small_hive_beetles_seen: Number(record?.small_hive_beetles_seen ?? 0),
        weather_condition: record?.weather_condition ?? 'sunny',
        temperature_celsius: Number(record?.temperature_celsius ?? 25),
        notes: record?.notes ?? '',
        created_at: record?.created_at ?? _nowIso(),
        updated_at: record?.updated_at ?? record?.created_at ?? _nowIso(),
    };
}

function normalizeVarroaReading(record: any): VarroaReading {
    const miteCount = Number(record?.mite_count ?? 0);
    const sampleSize = Number(record?.sample_size ?? 300);
    const infestationRate = Number(
        record?.infestation_rate ?? (sampleSize > 0 ? ((miteCount / sampleSize) * 100).toFixed(2) : 0),
    );

    return {
        id: String(record?.id ?? ''),
        hive_id: String(record?.hive_id ?? ''),
        reading_date: String(record?.reading_date ?? new Date().toISOString().slice(0, 10)),
        method: record?.method ?? 'alcohol_wash',
        mite_count: miteCount,
        sample_size: sampleSize,
        inspector_name: record?.inspector_name ?? '',
        notes: record?.notes ?? '',
        infestation_rate: Number.isFinite(infestationRate) ? infestationRate : 0,
        created_at: record?.created_at ?? _nowIso(),
        updated_at: record?.updated_at ?? record?.created_at ?? _nowIso(),
    };
}

function normalizeVarroaTreatment(record: any): VarroaTreatment {
    return {
        id: String(record?.id ?? ''),
        hive_id: String(record?.hive_id ?? ''),
        treatment_type: record?.treatment_type ?? 'other',
        start_date: String(record?.start_date ?? new Date().toISOString().slice(0, 10)),
        end_date: record?.end_date ?? undefined,
        dosage: record?.dosage ?? '',
        effectiveness_percent: record?.effectiveness_percent === null || record?.effectiveness_percent === undefined
            ? undefined
            : Number(record.effectiveness_percent),
        notes: record?.notes ?? '',
        created_at: record?.created_at ?? _nowIso(),
        updated_at: record?.updated_at ?? record?.created_at ?? _nowIso(),
    };
}

function mapApiaryRecord(record: any, hiveCountByApiary: Record<string, number> = {}): Apiary {
    const apiaryId = String(record?.id ?? '');

    return {
        ...record,
        id: apiaryId,
        type: record?.apiary_type || record?.type || 'Permanent',
        forage_type: record?.primary_forage || record?.forage_type || '',
        hive_count: record?.hive_count ?? hiveCountByApiary[apiaryId] ?? 0,
    };
}

function mapHiveRecord(record: any): Hive {
    return {
        ...record,
        id: String(record?.id ?? ''),
        apiary_name: record?.apiary?.name || record?.apiary_name,
    };
}

function mapHarvestRecord(record: any): Harvest {
    const normalized = { ...record };

    if (normalized.date && !normalized.harvest_date) {
        normalized.harvest_date = normalized.date;
    }
    if (normalized.weight_kg !== undefined && normalized.quantity_kg === undefined) {
        normalized.quantity_kg = normalized.weight_kg;
    }
    if (normalized.floral_source && !normalized.nectar_source) {
        normalized.nectar_source = normalized.floral_source;
    }
    if (normalized.moisture_content !== undefined && normalized.moisture_content_percent === undefined) {
        normalized.moisture_content_percent = normalized.moisture_content;
    }
    if (normalized.hive?.apiary && !normalized.apiary) {
        normalized.apiary = normalized.hive.apiary;
    }

    return normalized as Harvest;
}

function mapBatchRecord(record: any): BatchView {
    return {
        ...record,
        id: String(record?.id ?? record?.batch_code ?? ''),
        blockchain_verified: Boolean(record?.blockchain_verified ?? record?.block_hash),
        verification_status: record?.verification_status || record?.status,
    };
}

function deriveBatchViewsFromHarvests(harvests: Harvest[]): BatchView[] {
    const seen = new Set<string>();
    const derived: BatchView[] = [];

    for (const harvest of harvests) {
        const key = harvest.batch_code || harvest.id;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        derived.push({
            id: key,
            batch_code: harvest.batch_code || harvest.id,
            honey_type: harvest.honey_type,
            harvest_date: harvest.harvest_date,
            quantity_kg: harvest.quantity_kg,
            color_grade: harvest.color_grade,
            apiary: harvest.apiary || harvest.hive?.apiary || null,
            apiary_name: harvest.apiary?.name || harvest.hive?.apiary?.name,
            farmer: harvest.farmer || null,
            farmer_name: harvest.farmer?.name,
            hive: harvest.hive || null,
            verification_status: harvest.is_verified ? 'verified' : 'pending',
            blockchain_verified: Boolean(harvest.is_verified),
            status: harvest.is_verified ? 'verified' : 'pending',
            quantity_left_for_bees_kg: harvest.quantity_left_for_bees_kg,
            florage_type: harvest.florage_type,
            harvest,
        });
    }

    return derived;
}

export const beeyieldService = {
    supabaseBeeYield: sb,
    _configsCache: null as any[] | null,
    _configsCacheTime: 0,
    _auditLogsCache: {} as Record<string, any[]>,
    _auditLogsCacheTime: {} as Record<string, number>,

    // ========== IoT DEVICES & GATEWAYS ==========
    async getDevices(): Promise<IoTDevice[]> {
        try {
            return await apiGet<IoTDevice[]>('/iot/devices');
        } catch (error) {
            console.error('getDevices:', error);
            return [];
        }
    },

    async getDeviceById(id: string): Promise<IoTDevice | null> {
        try {
            return await apiGet<IoTDevice>(`/iot/devices/${id}`);
        } catch (error) {
            console.error('getDeviceById:', error);
            return null;
        }
    },

    // ========== INTEGRATIONS ==========
    // IMPORTANT: Integrations must work even when the "BeeYield" Supabase client lacks a session.
    // We therefore route reads/writes through FastAPI, authenticated via getAuthHeaders().
    async getIntegrationConfigs(): Promise<any[]> {
        const CACHE_TTL = 30000; // 30 seconds
        const now = Date.now();
        if (this._configsCache && (now - this._configsCacheTime < CACHE_TTL)) {
            return this._configsCache;
        }

        try {
            const headers = await getAuthHeaders();
            const data = await apiGet<any[]>('/integrations/configs', undefined, { headers });
            this._configsCache = data;
            this._configsCacheTime = now;
            return data;
        } catch (e) {
            console.error('getIntegrationConfigs:', e);
            return this._configsCache || [];
        }
    },

    async upsertIntegrationConfig(config: { platform: string; is_active: boolean; store_url?: string; kra_pin?: string; branch_code?: string; device_serial?: string; access_token?: string; config_json?: any }): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPost<any>('/integrations/config', {
                platform: config.platform,
                is_active: config.is_active,
                store_url: config.store_url,
                kra_pin: config.kra_pin,
                branch_code: config.branch_code,
                device_serial: config.device_serial,
                access_token: config.access_token,
                config_json: config.config_json,
            }, { headers });
            
            // Invalidate cache on update
            this._configsCache = null;
            this._configsCacheTime = 0;
            
            return res;
        } catch (e) {
            console.error('upsertIntegrationConfig:', e);
            return null;
        }
    },

    // ========== OAUTH INTEGRATIONS (QuickBooks / Shopify) ==========
    async getQuickBooksAuthorizeUrl(): Promise<{ url: string; state: string }> {
        const headers = await getAuthHeaders();
        return apiGet<{ url: string; state: string }>('/integrations/quickbooks/authorize-url', undefined, { headers });
    },

    async completeQuickBooksOAuth(input: { code: string; realmId?: string | null; state: string }): Promise<{ success: boolean }> {
        const headers = await getAuthHeaders();
        return apiPost<{ success: boolean }>('/integrations/quickbooks/complete', input, { headers });
    },

    async getShopifyAuthorizeUrl(shop: string): Promise<{ url: string; state: string }> {
        const headers = await getAuthHeaders();
        return apiGet<{ url: string; state: string }>('/integrations/shopify/authorize-url', { shop }, { headers });
    },

    async completeShopifyOAuth(input: { query: string }): Promise<{ success: boolean }> {
        const headers = await getAuthHeaders();
        return apiPost<{ success: boolean }>('/integrations/shopify/complete', input, { headers });
    },

    async syncQuickBooksLedger(): Promise<{ success: boolean; platform: string; message?: string; metrics?: any; config?: any }> {
        const headers = await getAuthHeaders();
        return apiPost('/integrations/quickbooks/sync', {}, { headers });
    },

    async syncShopifyProducts(): Promise<{ success: boolean; platform: string; message?: string; metrics?: any; config?: any }> {
        const headers = await getAuthHeaders();
        return apiPost('/integrations/shopify/sync', {}, { headers });
    },

    async getGateways(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/iot/gateways');
        } catch (error) {
            console.error('getGateways:', error);
            return [];
        }
    },

    async createDevice(input: IoTDeviceCreateInput, options?: { silent?: boolean }): Promise<{ data: IoTDevice | null; error: any }> {
        try {
            const payload: any = { ...input };
            if (payload.hive_id === '') payload.hive_id = null;
            if (payload.apiary_id === '') payload.apiary_id = null;
            if (payload.location_name === '') payload.location_name = null;
            delete payload.linked_apiary_id;
            const data = await apiPost<IoTDevice>('/iot/devices', payload);
            if (!options?.silent) {
                toast.success('Device linked successfully!');
            }
            return { data, error: null };
        } catch (error) {
            console.error('createDevice:', error);
            if (!options?.silent) {
                toast.error('Failed to link device');
            }
            return { data: null, error };
        }
    },

    async updateDevice(id: string, patch: IoTDeviceUpdateInput): Promise<{ data: IoTDevice | null; error: any }> {
        try {
            const clean: any = { ...patch };
            if (clean.hive_id === '') clean.hive_id = null;
            if (clean.apiary_id === '') clean.apiary_id = null;
            if (clean.linked_apiary_id === '') clean.linked_apiary_id = null;
            delete clean.linked_apiary_id;

            const data = await apiPatch<IoTDevice>(`/iot/devices/${id}`, clean);
            toast.success('Device updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateDevice:', error);
            toast.error('Failed to update device');
            return { data: null, error };
        }
    },

    async deleteDevice(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/iot/devices/${id}`);
            toast.success('Device deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteDevice:', error);
            toast.error('Failed to delete device');
            return { success: false, error };
        }
    },

    // ========== DEVICE AUDIT LOGS ==========
    async getDeviceAuditLogs(deviceId: string, limit: number = 50): Promise<DeviceAuditLog[]> {
        try {
            return await apiGet<DeviceAuditLog[]>(`/iot/devices/${deviceId}/audit-logs`, { limit });
        } catch (e) {
            console.warn('getDeviceAuditLogs error:', e);
            return [];
        }
    },

    async logDeviceAuditEvent(input: { device_id: string; action: DeviceAuditAction; changes?: any }): Promise<void> {
        try {
            const payload: any = {
                device_id: input.device_id,
                action: input.action,
                changes: input.changes ?? null,
                created_at: new Date().toISOString(),
            };
            await apiPost(`/iot/devices/${input.device_id}/audit-logs`, payload);
        } catch (e) {
            console.warn('logDeviceAuditEvent error:', e);
        }
    },

    async getDevicesByType(type: 'infield' | 'inland' | 'disease'): Promise<IoTDevice[]> {
        const devices = await this.getDevices();
        return devices.filter(d => d.device_type === type);
    },

    async getSensorReadings(type?: 'infield' | 'inland' | 'disease', hours: number = 24): Promise<SensorReading[]> {
        try {
            return await apiGet<SensorReading[]>('/iot/readings', {
                sensor_type: type,
                hours,
            });
        } catch (error) {
            console.error('getSensorReadings:', error);
            return [];
        }
    },

    subscribeToDeviceReadings(deviceId: string, callback: (payload: any) => void) {
        if (!sb) return null;
        return sb
            .channel(`device-readings-${deviceId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${deviceId}` }, callback)
            .subscribe();
    },

    async getReadings(hiveId: string, limit?: number): Promise<SensorReading[]> {
        try {
            const headers = await getAuthHeaders();
            const params = new URLSearchParams();
            params.set('hive_id', hiveId);
            if (limit) params.set('limit', String(limit));
            return await apiGet<SensorReading[]>(`/beeyield/readings?${params.toString()}`, {}, { headers });
        } catch (error) {
            console.error('getReadings:', error);
            return [];
        }
    },

    async getLatestReadings(): Promise<{ infield: SensorReading | null; inland: SensorReading | null; disease: SensorReading | null }> {
        const readings = await this.getSensorReadings(undefined, 1);
        return {
            infield: readings.find(r => r.sensor_type === 'infield') || null,
            inland: readings.find(r => r.sensor_type === 'inland') || null,
            disease: readings.find(r => r.sensor_type === 'disease') || null
        };
    },

    async getClientHives(_userId?: string): Promise<ClientHive[]> {
        try {
            return await apiGet<ClientHive[]>('/iot/client-hives');
        } catch (error) {
            console.error('getClientHives:', error);
            return [];
        }
    },

    async getDashboardStats(): Promise<DashboardStats> {
        if (!sb) throw new Error('No client');
        const [devRes, readRes, hiveRes] = await Promise.all([
            sb.from('devices').select('device_code, status'),
            sb.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(50),
            sb.from('hives').select('id'),
        ]);
        const devices = devRes.data || [];
        const readings = readRes.data || [];
        const avgTemp = readings.length ? readings.reduce((s, r: any) => s + (r.temperature || r.readings?.temperature || 0), 0) / readings.length : 0;
        const avgHum = readings.length ? readings.reduce((s, r: any) => s + (r.humidity || r.readings?.humidity || 0), 0) / readings.length : 0;
        const avgWt = readings.length ? readings.reduce((s, r: any) => s + (r.weight || r.readings?.hive_weight || 0), 0) / readings.length : 0;
        return {
            totalDevices: devices.length,
            activeDevices: devices.filter((d: any) => d.status === 'online').length,
            totalReadings: readings.length,
            lastUpdate: new Date().toISOString(),
            avgTemperature: parseFloat(avgTemp.toFixed(1)),
            avgHumidity: parseFloat(avgHum.toFixed(1)),
            avgHiveWeight: parseFloat(avgWt.toFixed(1)),
            healthScore: 85, // TODO: compute from real data
        };
    },

    async getTelemetryLatest(): Promise<SensorReading[]> {
        return this.getSensorReadings(undefined, 1);
    },

    async getImpactStats(): Promise<{ total_apiaries: number; total_hives: number; total_honey_kg: number }> {
        try {
            if (!sb) return { total_apiaries: 0, total_hives: 0, total_honey_kg: 0 };
            const [apiaries, hives, harvests] = await Promise.all([
                sb.from('apiaries').select('id', { count: 'exact', head: true }),
                sb.from('hives').select('id', { count: 'exact', head: true }),
                sb.from('harvests').select('quantity_kg'),
            ]);
            const totalHoney = (harvests.data || []).reduce((s, h) => s + (Number(h.quantity_kg) || 0), 0);
            return { total_apiaries: apiaries.count || 0, total_hives: hives.count || 0, total_honey_kg: totalHoney };
        } catch (e) {
            console.error('[BeeYieldService] getImpactStats failed:', e);
            return { total_apiaries: 0, total_hives: 0, total_honey_kg: 0 };
        }
    },

    async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: any }> {
        if (!sb) return { error: new Error('Supabase client not initialized') };
        const { error } = await sb.auth.updateUser({ data: metadata });
        return { error };
    },

    async updateUserProfile(input: {
        first_name?: string | null;
        last_name?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
        theme?: string | null;
        language?: string | null;
        unit_system?: string | null;
    }): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPut<any>('/settings/profile', input as any, { headers });
            toast.success('Profile updated');
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateUserProfile:', error);
            toast.error('Failed to update profile');
            return { data: null, error };
        }
    },

    // ========== APIARIES ==========
    async getApiaries(): Promise<Apiary[]> {
        try {
            const data = await apiGet<Apiary[]>('beeyield/apiaries');
            if (Array.isArray(data) && data.length > 0) {
                return data.map((record: any) => mapApiaryRecord(record));
            }
        } catch (error) {
            console.error('getApiaries:', error);
        }

        if (!sb) return [];

        try {
            const [{ data: apiaries, error: apiariesError }, { data: hives, error: hivesError }] = await Promise.all([
                sb.from('apiaries').select('*, farmer:farmers(*)').order('created_at', { ascending: false }),
                sb.from('hives').select('id, apiary_id'),
            ]);

            if (apiariesError) throw apiariesError;
            if (hivesError) throw hivesError;

            const hiveCountByApiary = (hives || []).reduce<Record<string, number>>((acc, hive: any) => {
                const apiaryId = String(hive?.apiary_id ?? '');
                if (!apiaryId) return acc;
                acc[apiaryId] = (acc[apiaryId] || 0) + 1;
                return acc;
            }, {});

            return (apiaries || []).map((record: any) => mapApiaryRecord(record, hiveCountByApiary));
        } catch (fallbackError) {
            console.error('getApiaries fallback:', fallbackError);
            return [];
        }
    },

    async createApiary(input: any): Promise<{ data: Apiary | null; error: any }> {
        try {
            const data = await apiPost<any>('beeyield/apiaries', input);
            const remapped = { 
                ...data, 
                type: data.apiary_type || 'Permanent', 
                forage_type: data.primary_forage || '' 
            };
            toast.success('Apiary deployed successfully!');
            return { data: remapped as Apiary, error: null };
        } catch (error) {
            console.error('createApiary:', error);
            toast.error('Failed to create apiary');
            return { data: null, error };
        }
    },

    async updateApiary(id: string, input: Partial<ApiaryCreateInput>): Promise<{ data: Apiary | null; error: any }> {
        try {
            const data = await apiPut<Apiary>(`beeyield/apiaries/${id}`, input);
            toast.success('Apiary updated!');
            return { data, error: null };
        } catch (error) {
            console.error('updateApiary:', error);
            toast.error('Failed to update apiary');
            return { data: null, error };
        }
    },

    async deleteApiary(id: string): Promise<{ error: any }> {
        try {
            console.log(`[BeeYieldService] Attempting to delete apiary: ${id}`);
            await apiDelete(`beeyield/apiaries/${id}`);
            toast.success('Apiary removed');
            return { error: null };
        } catch (error: any) {
            console.error('deleteApiary:', error);
            toast.error('Failed to delete apiary');
            return { error };
        }
    },

    // ========== NOTES ==========
    async getNotes(): Promise<Note[]> {
        try {
            return await apiGet<Note[]>('beeyield/notes');
        } catch (error) {
            console.error('getNotes:', error);
            return [];
        }
    },

    async createNote(input: NoteCreateInput): Promise<{ data: Note | null; error: any }> {
        try {
            const data = await apiPost<Note>('beeyield/notes', input);
            toast.success('Note saved');
            return { data, error: null };
        } catch (error) {
            console.error('createNote:', error);
            toast.error('Failed to save note');
            return { data: null, error };
        }
    },

    async updateNote(id: string, updates: Partial<NoteCreateInput>): Promise<{ data: Note | null; error: any }> {
        try {
            const data = await apiPut<Note>(`beeyield/notes/${id}`, updates);
            toast.success('Note updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateNote:', error);
            toast.error('Failed to update note');
            return { data: null, error };
        }
    },

    async deleteNote(id: string): Promise<{ error: any }> {
        try {
            console.log(`[BeeYieldService] Attempting to delete note: ${id}`);
            await apiDelete(`beeyield/notes/${id}`);
            toast.success('Note deleted');
            return { error: null };
        } catch (error: any) {
            console.error('deleteNote:', error);
            toast.error('Failed to delete note');
            return { error };
        }
    },

    // ========== HIVES ==========
    async getHives(apiaryId?: string): Promise<Hive[]> {
        try {
            const data = await apiGet<Hive[]>('beeyield/hives', apiaryId ? { apiary_id: apiaryId } : undefined);
            if (Array.isArray(data) && data.length > 0) {
                return data.map((record: any) => mapHiveRecord(record));
            }
        } catch (error) {
            console.error('getHives:', error);
        }

        if (!sb) return [];

        try {
            let query = sb
                .from('hives')
                .select('*, apiary:apiaries(*), farmer:farmers(*)')
                .order('created_at', { ascending: false });

            if (apiaryId) {
                query = query.eq('apiary_id', apiaryId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return (data || []).map((record: any) => mapHiveRecord(record));
        } catch (fallbackError) {
            console.error('getHives fallback:', fallbackError);
            return [];
        }
    },

    async createHive(input: HiveCreateInput): Promise<{ data: Hive | null; error: any }> {
        try {
            const data = await apiPost<Hive>('beeyield/hives', input);
            toast.success('Hive added successfully!');
            return { data, error: null };
        } catch (error) {
            console.error('createHive:', error);
            toast.error('Failed to create hive');
            return { data: null, error };
        }
    },

    async updateHive(id: string, input: Partial<HiveCreateInput>): Promise<{ data: Hive | null; error: any }> {
        try {
            const data = await apiPut<Hive>(`beeyield/hives/${id}`, input);
            toast.success('Hive updated!');
            return { data, error: null };
        } catch (error) {
            console.error('updateHive:', error);
            toast.error('Failed to update hive');
            return { data: null, error };
        }
    },

    async deleteHive(id: string): Promise<{ error: any }> {
        try {
            console.log(`[BeeYieldService] Attempting to delete hive: ${id}`);
            await apiDelete(`beeyield/hives/${id}`);
            toast.success('Hive removed');
            return { error: null };
        } catch (error: any) {
            console.error('deleteHive:', error);
            toast.error('Failed to delete hive');
            return { error };
        }
    },

    // ========== HARVESTS ==========
    async getHarvests(filters?: { hive_id?: string; apiary_id?: string; farmer_id?: string; year?: number }): Promise<Harvest[]> {
        try {
            const data = await apiGet<Harvest[]>('beeyield/harvests', filters as any);
            if (Array.isArray(data) && data.length > 0) {
                return data.map((record: any) => mapHarvestRecord(record));
            }
        } catch (error) {
            console.error('getHarvests:', error);
        }

        if (!sb) return [];

        try {
            let query = sb
                .from('harvests')
                .select('*, hive:hives(*, apiary:apiaries(*)), farmer:farmers(*)')
                .order('harvest_date', { ascending: false })
                .limit(2000);

            if (filters?.hive_id) {
                query = query.eq('hive_id', filters.hive_id);
            }
            if (filters?.apiary_id) {
                query = query.eq('apiary_id', filters.apiary_id);
            }
            if (filters?.farmer_id) {
                query = query.eq('farmer_id', filters.farmer_id);
            }
            if (filters?.year) {
                query = query
                    .gte('harvest_date', `${filters.year}-01-01`)
                    .lt('harvest_date', `${filters.year + 1}-01-01`);
            }

            const { data, error } = await query;
            if (error) throw error;

            return (data || []).map((record: any) => mapHarvestRecord(record));
        } catch (fallbackError) {
            console.error('getHarvests fallback:', fallbackError);
            return [];
        }
    },

    async getBatches(filters?: { honey_type?: string; year?: number; limit?: number }): Promise<BatchView[]> {
        try {
            const params: any = {};
            if (filters?.honey_type) params.honey_type = filters.honey_type;
            if (filters?.year) params.year = filters.year;
            if (filters?.limit) params.limit = filters.limit;
            const data = await apiGet<BatchView[]>('beeyield/batches', params);
            if (Array.isArray(data) && data.length > 0) {
                return data.map((record: any) => mapBatchRecord(record));
            }
        } catch (error) {
            console.error('getBatches:', error);
        }

        const deriveFromHarvests = async () => {
            let derived = deriveBatchViewsFromHarvests(await this.getHarvests(filters?.year ? { year: filters.year } : undefined));
            if (filters?.honey_type) {
                derived = derived.filter((batch) => batch.honey_type === filters.honey_type);
            }
            if (filters?.limit) {
                derived = derived.slice(0, filters.limit);
            }
            return derived;
        };

        if (!sb) return deriveFromHarvests();

        try {
            let query = sb
                .from('honey_batches')
                .select('*')
                .order('harvest_date', { ascending: false })
                .limit(filters?.limit || 1000);

            if (filters?.honey_type) {
                query = query.eq('honey_type', filters.honey_type);
            }
            if (filters?.year) {
                query = query
                    .gte('harvest_date', `${filters.year}-01-01`)
                    .lt('harvest_date', `${filters.year + 1}-01-01`);
            }

            const { data, error } = await query;
            if (error) throw error;

            if (data && data.length > 0) {
                return data.map((record: any) => mapBatchRecord(record));
            }

            return deriveFromHarvests();
        } catch (fallbackError) {
            console.error('getBatches fallback:', fallbackError);
            return deriveFromHarvests();
        }
    },

    // ========== REAL-TIME SUBSCRIPTIONS (PULSE) ==========
    subscribeToWeightAlerts(hiveId: string, callback: (payload: any) => void) {
        if (!sb) return null;
        return sb
            .channel(`hive-alerts-${hiveId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `hive_id=eq.${hiveId}` },
                (payload) => { if (payload.new && (payload.new as any).weight_kg < -1.5) callback(payload); }
            ).subscribe();
    },

    subscribeToGatewayStatus(gatewayId: string, callback: (payload: any) => void) {
        if (!sb) return null;
        return sb
            .channel(`gateway-status-${gatewayId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'devices', filter: `serial_number=eq.${gatewayId}` },
                (payload) => callback(payload)
            ).subscribe();
    },

    // ========== CALCULATOR LOGS ==========
    async getCalculatorLogs(type?: string): Promise<CalculatorLog[]> {
        try {
            const params: any = {};
            if (type) params.calculation_type = type;
            return await apiGet<CalculatorLog[]>('/beeyield/calculator-logs', params);
        } catch (error) {
            console.error('getCalculatorLogs:', error);
            return [];
        }
    },

    async logCalculation(input: CalculatorLogCreateInput): Promise<{ data: CalculatorLog | null; error: any }> {
        try {
            const data = await apiPost<CalculatorLog>('/beeyield/calculator-logs', input as any);
            toast.success('Calculation persisted to Cloud');
            return { data, error: null };
        } catch (error) {
            console.error('logCalculation:', error);
            toast.error('Failed to sync calculation');
            return { data: null, error };
        }
    },

    async logHarvestBatch(input: HarvestBatchInput): Promise<{ data: any | null; error: any }> {
        try {
            if (!input.apiary_id) {
                const error = new Error('Missing apiary_id for harvest batch');
                toast.error('Please select an apiary.');
                return { data: null, error };
            }
            const payload: any = {
                hive_id: input.hive_id,
                apiary_id: input.apiary_id,
                harvest_date: input.harvest_date || new Date().toISOString().slice(0, 10),
                quantity_kg: input.quantity_kg,
                honey_type: input.honey_type,
                florage_type: input.florage_type,
                notes: input.notes,
            };
            const headers = await getAuthHeaders();
            const data = await apiPost<any>('/beeyield/harvests/log', payload, { headers });
            toast.success('Harvest batch recorded');
            return { data, error: null };
        } catch (error) {
            console.error('logHarvestBatch:', error);
            toast.error('Failed to log batch');
            return { data: null, error };
        }
    },

    async createHarvest(input: HarvestCreateInput): Promise<{ data: Harvest | null; error: any }> {
        try {
            if (!input.apiary_id) {
                const error = new Error("Missing apiary_id for harvest creation");
                toast.error('Please select an apiary.');
                return { data: null, error };
            }
            if (!input.hive_id) {
                const error = new Error("Missing hive_id for harvest creation");
                toast.error('Please select a hive.');
                return { data: null, error };
            }
            const headers = await getAuthHeaders();
            // Backend validates hive belongs to apiary and enriches response with hive/apiary/farmer.
            const payload = {
                hive_id: input.hive_id,
                apiary_id: input.apiary_id,
                farmer_id: input.farmer_id,
                harvest_date: input.harvest_date,
                quantity_kg: input.quantity_kg,
                quantity_left_for_bees_kg: input.quantity_left_for_bees_kg,
                extraction_method: input.extraction_method,
                honey_type: input.honey_type,
                color_grade: input.color_grade,
                batch_code: input.batch_code,
                weather_conditions: input.weather_conditions,
                moisture_content_percent: input.moisture_content_percent,
                florage_type: input.florage_type,
                notes: input.notes,
                is_verified: input.is_verified,
            };

            const data = await apiPost<Harvest>('/beeyield/harvests', payload as any, { headers });
            return { data, error: null };
        } catch (error) {
            console.error('createHarvest:', error);
            // Do not silently fall back to local storage for financial/traceability records.
            // If persistence fails, surface the error so the UI can notify the user.
            return { data: null, error };
        }

        // F5: Activity Log
        // (kept in backend activity log / trigger; frontend no longer writes directly)
    },

    async updateHarvest(id: string, updates: Partial<HarvestCreateInput>): Promise<{ data: Harvest | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            
            // Map only the allowed fields to avoid sending nested objects (apiary, hive, farmer) 
            // or computed fields that would cause a 422 Unprocessable Entity error.
            const payload: any = {};
            const allowedFields: (keyof HarvestCreateInput)[] = [
                'hive_id', 'apiary_id', 'farmer_id', 'harvest_date', 'quantity_kg', 
                'quantity_left_for_bees_kg', 'extraction_method', 'nectar_source',
                'honey_type', 'color_grade', 'batch_code', 'weather_conditions', 
                'moisture_content_percent', 'florage_type', 'notes', 'is_verified'
            ];

            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    payload[field] = updates[field];
                }
            });

            const data = await apiPut<Harvest>(`beeyield/harvests/${id}`, payload, { headers });
            toast.success('Harvest updated!');
            return { data, error: null };
        } catch (error) {
            console.error('updateHarvest:', error);
            // toast.error is already handled by the hook usually, but keeping consistency
            return { data: null, error };
        }
    },

    async deleteHarvest(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`beeyield/harvests/${id}`);
            toast.success('Harvest removed');
            return { error: null };
        } catch (error) {
            console.error('deleteHarvest:', error);
            toast.error('Failed to delete harvest');
            return { error };
        }
    },

    // ========== TASKS ==========
    async getTasks(): Promise<Task[]> {
        try {
            return await apiGet<Task[]>('beeyield/tasks');
        } catch (error) {
            console.error('getTasks:', error);
            return [];
        }
    },

    async createTask(task: TaskCreateInput): Promise<{ data: Task | null; error: any }> {
        try {
            const data = await apiPost<Task>('beeyield/tasks', task);
            toast.success('Task created successfully');
            return { data, error: null };
        } catch (error) {
            console.error('createTask:', error);
            toast.error('Failed to create task');
            return { data: null, error };
        }
    },

    async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<{ data: Task | null; error: any }> {
        try {
            const data = await apiPut<Task>(`beeyield/tasks/${id}`, updates);
            toast.success('Task updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateTask:', error);
            toast.error('Failed to update task');
            return { data: null, error };
        }
    },

    async deleteTask(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`beeyield/tasks/${id}`);
            toast.success('Task deleted');
            return { error: null };
        } catch (error) {
            console.error('deleteTask:', error);
            toast.error('Failed to delete task');
            return { error };
        }
    },

    // ========== INSPECTIONS ==========
    async getInspections(hiveId?: string): Promise<Inspection[]> {
        try {
            const rows = await apiGet<any[]>('inspections', hiveId ? { hive_id: hiveId } : undefined);
            return (rows || []).map(normalizeInspection);
        } catch (error) {
            console.error('getInspections:', error);
            return [];
        }
    },

    async getInspectionById(id: string): Promise<Inspection | null> {
        try {
            return normalizeInspection(await apiGet<any>(`inspections/${id}`));
        } catch (error) {
            console.error('getInspectionById:', error);
            return null;
        }
    },

    async createInspection(inspection: InspectionCreateInput): Promise<{ data: Inspection | null; error: any }> {
        try {
            const data = normalizeInspection(await apiPost<any>('inspections', inspection));
            toast.success('Inspection saved successfully');
            return { data, error: null };
        } catch (error) {
            console.error('createInspection:', error);
            toast.error('Failed to save inspection');
            return { data: null, error };
        }
    },

    async updateInspection(id: string, updates: Partial<InspectionCreateInput>): Promise<{ data: Inspection | null; error: any }> {
        try {
            const data = normalizeInspection(await apiPut<any>(`inspections/${id}`, updates));
            toast.success('Inspection updated successfully');
            return { data, error: null };
        } catch (error) {
            console.error('updateInspection:', error);
            toast.error('Failed to update inspection');
            return { data: null, error };
        }
    },

    async deleteInspection(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`inspections/${id}`);
            toast.success('Inspection deleted');
            return { error: null };
        } catch (error) {
            console.error('deleteInspection:', error);
            toast.error('Failed to delete inspection');
            return { error };
        }
    },

    // ========== SETTINGS ==========
    async getSettings(): Promise<UserSettings | null> {
        // Legacy alias: return preferences + global thresholds from /settings/full.
        try {
            const headers = await getAuthHeaders();
            const full = await apiGet<any>('/settings/full', undefined, { headers });
            const prefs = full?.preferences || {};
            const global = full?.global_thresholds || {};
            return {
                ...prefs,
                temp_threshold_high: global?.temp_high,
                temp_threshold_low: global?.temp_low,
                weight_drop_threshold: global?.weight_drop,
            } as any;
        } catch (error) {
            console.error('getSettings:', error);
            return null;
        }
    },

    async updateSettings(settings: UserSettingsUpdate): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPut<any>('/settings/preferences', settings as any, { headers });
            toast.success('Preferences updated');
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateSettings:', error);
            toast.error('Failed to update preferences');
            return { data: null, error };
        }
    },

    async updateNotificationConfig(_eventType: string, config: NotificationConfigUpdate): Promise<{ data: any; error: any }> {
        // Legacy adapter: map to PRD notification settings endpoint.
        try {
            const headers = await getAuthHeaders();
            const res = await apiPatch<any>(
                '/settings/notifications',
                {
                    email_alerts_enabled: config.email_enabled,
                    push_notifications_enabled: config.push_enabled,
                    sms_alerts_enabled: config.sms_enabled,
                } as any,
                { headers }
            );
            toast.success('Notification updated');
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateNotificationConfig:', error);
            toast.error('Failed to update notification settings');
            return { data: null, error };
        }
    },

    async updateHiveThresholds(hiveId: string, thresholds: { temp_high?: number; temp_low?: number; weight_drop?: number }): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPost<any>(`/settings/hives/${hiveId}/thresholds`, thresholds as any, { headers });
            toast.success('Hive thresholds updated');
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateHiveThresholds:', error);
            toast.error('Failed to update hive thresholds');
            return { data: null, error };
        }
    },

    async getHiveSettings(): Promise<any[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/settings/hives', undefined, { headers });
        } catch (error) {
            console.error('getHiveSettings:', error);
            return [];
        }
    },

    async getFullSettings(): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            const [full, hiveSettings, notifSettings] = await Promise.all([
                apiGet<any>('/settings/full', undefined, { headers }),
                apiGet<any[]>('/settings/hives', undefined, { headers }),
                apiGet<UserNotificationSettings>('/settings/notifications', undefined, { headers }).catch(() => null),
            ]);
            return { ...full, hive_settings: hiveSettings, notification_settings: notifSettings };
        } catch (error) {
            console.error('getFullSettings:', error);
            return null;
        }
    },

    async getNotificationSettings(): Promise<UserNotificationSettings | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<UserNotificationSettings>('/settings/notifications', undefined, { headers });
        } catch (error) {
            console.error('getNotificationSettings:', error);
            return null;
        }
    },

    async updateNotificationSettings(settings: Partial<UserNotificationSettings>): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPatch<any>('/settings/notifications', settings as any, { headers });
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateNotificationSettings:', error);
            return { data: null, error };
        }
    },

    async getIoTSettings(): Promise<IoTSettings | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<IoTSettings>('/settings/iot', undefined, { headers });
        } catch (error) {
            console.error('getIoTSettings:', error);
            return null;
        }
    },

    async updateIoTSettings(settings: Partial<IoTSettings>): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const res = await apiPatch<any>('/settings/iot', settings as any, { headers });
            return { data: res?.data ?? res, error: null };
        } catch (error) {
            console.error('updateIoTSettings:', error);
            return { data: null, error };
        }
    },

    // ========== REPORTS ==========
    async getGeneratedReports(): Promise<GeneratedReport[]> {
        try {
            return await apiGet<GeneratedReport[]>("/reports");
        } catch (error) {
            console.error("getGeneratedReports:", error);
            return [];
        }
    },

    async getRequests(): Promise<SupportRequest[]> {
        try {
            return await apiGet<SupportRequest[]>('beeyield/requests');
        } catch (error) {
            console.error('getRequests:', error);
            return [];
        }
    },

    async getRequestById(id: string): Promise<SupportRequest | null> {
        try {
            return await apiGet<SupportRequest>(`beeyield/requests/${id}`);
        } catch (error) {
            console.error('getRequestById:', error);
            return null;
        }
    },

    async createRequest(input: RequestCreateInput): Promise<{ data: SupportRequest | null; error: any }> {
        try {
            const pRaw = String(input.priority || 'Medium').trim().toLowerCase();
            const priority =
                pRaw === 'low' ? 'Low' :
                pRaw === 'high' ? 'High' :
                pRaw === 'critical' ? 'Critical' :
                'Medium';
            const statusRaw = String(input.status || 'Open').trim().toLowerCase();
            const requestStatus = statusRaw === 'draft' ? 'Draft' : 'Open';
            const payload: any = {
                subject: input.subject.trim(),
                description: input.description.trim(),
                type: input.type || 'support',
                apiary_id: input.apiary_id || undefined,
                hive_id: input.hive_id || undefined,
                category: input.category || input.type || 'General',
                priority,
                status: requestStatus,
            };
            const data = await apiPost<SupportRequest>('beeyield/requests', payload);
            toast.success('Request submitted');
            return { data, error: null };
        } catch (error) {
            console.error('createRequest:', error);
            toast.error('Failed to submit request');
            return { data: null, error };
        }
    },

    async updateRequest(
        id: string,
        patch: Partial<{ subject: string; description: string; type: string; apiary_id: string; hive_id: string; category: string; priority: string; status: string }>
    ): Promise<{ data: SupportRequest | null; error: any }> {
        try {
            const priorityRaw = patch.priority ? String(patch.priority).trim().toLowerCase() : undefined;
            const normalizedPriority =
                priorityRaw === undefined ? undefined :
                priorityRaw === 'low' ? 'Low' :
                priorityRaw === 'high' ? 'High' :
                priorityRaw === 'critical' ? 'Critical' :
                'Medium';
            const statusRaw = patch.status ? String(patch.status).trim().toLowerCase() : undefined;
            const normalizedStatus =
                statusRaw === undefined ? undefined :
                statusRaw === 'draft' ? 'Draft' :
                statusRaw === 'resolved' ? 'Resolved' :
                statusRaw === 'in progress' || statusRaw === 'in_progress' ? 'In Progress' :
                'Open';
            const data = await apiPatch<SupportRequest>(`beeyield/requests/${id}`, {
                ...patch,
                subject: patch.subject?.trim(),
                description: patch.description?.trim(),
                apiary_id: patch.apiary_id || undefined,
                hive_id: patch.hive_id || undefined,
                priority: normalizedPriority,
                status: normalizedStatus,
            } as any);
            toast.success('Request updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateRequest:', error);
            toast.error('Failed to update request');
            return { data: null, error };
        }
    },

    async deleteRequest(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`beeyield/requests/${id}`);
            toast.success('Request deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteRequest:', error);
            toast.error('Failed to delete request');
            return { success: false, error };
        }
    },

    async getRequestComments(requestId: string): Promise<RequestComment[]> {
        try {
            return await apiGet<RequestComment[]>(`beeyield/requests/${requestId}/comments`);
        } catch (error) {
            console.error('getRequestComments:', error);
            return [];
        }
    },

    async addRequestComment(requestId: string, message: string): Promise<{ data: RequestComment | null; error: any }> {
        try {
            const data = await apiPost<RequestComment>(`beeyield/requests/${requestId}/comments`, { message } as any);
            return { data, error: null };
        } catch (error) {
            console.error('addRequestComment:', error);
            return { data: null, error };
        }
    },

    // ========== ACTIVITY LOGS ==========
    async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
        try {
            return await apiGet<ActivityLog[]>('/beeyield/activity-logs', { limit });
        } catch (error) {
            console.error('getActivityLogs error:', error);
            return [];
        }
    },

    async logActivity(input: Partial<ActivityLog>): Promise<void> {
        try {
            await apiPost('/beeyield/activity-logs', input as any);
        } catch (error) {
            console.warn('logActivity failed:', error);
        }
    },

    // ========== SENSOR ALERTS ==========
    async getSensorAlerts(resolved = false, limit = 50): Promise<SensorAlert[]> {
        try {
            return await apiGet<SensorAlert[]>('/iot/alerts', { resolved, limit });
        } catch (error) {
            console.error('getSensorAlerts error:', error);
            return [];
        }
    },

    async resolveSensorAlert(alertId: string, notes?: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiPatch(`/iot/alerts/${alertId}`, {
                resolved: true,
                resolved_at: new Date().toISOString(),
                metadata: { resolution_notes: notes }
            } as any);

            await this.logActivity({
                event_type: 'alert_resolved',
                entity_type: 'alert',
                entity_id: alertId,
                title: 'Critical Breach Resolved',
                subtitle: `Incident Response: ${notes || 'Manual override complete'}`,
                metadata: { alert_id: alertId }
            });

            toast.success('Alert resolved');
            return { success: true, error: null };
        } catch (error) {
            console.error('resolveSensorAlert error:', error);
            return { success: false, error };
        }
    },

    // ========== PRECISION POLLINATION ==========
    async optimizePollinationPlacement(inputs: {
        orchard_geojson: any;
        hive_count: number;
        target_crop: string;
        bee_flight_radius_km: number;
        ahp_weights?: any;
    }): Promise<any[]> {
        try {
            const placements = await apiPost<any[]>('/pollination/optimize', inputs as any);

            // F5: Activity Log
            await this.logActivity({
                event_type: 'pollination_optimized',
                entity_type: 'orchard',
                title: 'Pollination Strategy Generated',
                subtitle: `${inputs.hive_count} units optimized for ${inputs.target_crop}`,
                metadata: { hive_count: inputs.hive_count, crop: inputs.target_crop }
            });

            return Array.isArray(placements) ? placements : [];
        } catch (err) {
            console.error('optimizePollinationPlacement error:', err);
            return [];
        }
    },

    async getPollinationDeployments(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/pollination/deployments');
        } catch (error) {
            console.error('getPollinationDeployments:', error);
            return [];
        }
    },

    async getPollinationContractAnalytics(): Promise<PollinationAnalytics | null> {
        try {
            const [contracts, deployments] = await Promise.all([
                apiGet<any[]>('/pollination/contracts'),
                apiGet<any[]>('/pollination/deployments'),
            ]);
            if (!Array.isArray(contracts)) return null;

            return {
                total_contracts: contracts.length,
                active_contracts: contracts.filter((c: any) => String(c.status || '').toLowerCase() === 'active').length,
                total_hives_deployed: Array.isArray(deployments) ? deployments.length : 0,
                total_acres_covered: contracts.reduce((s: number, c: any) => s + (Number(c.farm_size_acres) || 0), 0),
                average_fpa: 0,
                coverage_health_percent: 0,
                healthy_hives: Array.isArray(deployments) ? deployments.length : 0,
                warning_hives: 0,
                critical_hives: 0,
                total_revenue: contracts.reduce((s: number, c: any) => s + (Number(c.payment_amount) || 0), 0),
            };
        } catch (error) {
            console.error('getPollinationContractAnalytics:', error);
            return null;
        }
    },

    async generateReport(input: ReportCreateInput): Promise<{ data: GeneratedReport | null; error: any }> {
        try {
            const parameters = input.parameters || {};
            const resp = await apiPost<{ job_id: string; status: string }>("/reports/generate", {
                type: input.report_type,
                parameters,
                file_format: input.file_format || "PDF",
            });

            const placeholder: GeneratedReport = {
                id: resp.job_id,
                user_id: (input as any).user_id ?? "unknown",
                report_type: input.report_type,
                parameters,
                file_format: input.file_format || "PDF",
                status: (resp.status || "pending") as any,
                file_url: undefined,
                file_name: undefined,
                created_at: new Date().toISOString(),
            };

            return { data: placeholder, error: null };
        } catch (error) {
            console.error("generateReport:", error);
            return { data: null, error };
        }
    },

    async getReportStatus(jobId: string): Promise<GeneratedReport | null> {
        try {
            const resp = await apiGet<{
                job_id: string;
                status: GeneratedReport["status"];
                file_url?: string | null;
                file_name?: string | null;
                file_format?: string | null;
                report_type?: string;
                created_at?: string;
            }>(`/reports/status/${jobId}`);

            return {
                id: resp.job_id,
                user_id: "unknown",
                report_type: resp.report_type || "unknown",
                status: resp.status || "pending",
                file_format: (resp.file_format as any) || "PDF",
                file_url: resp.file_url || undefined,
                file_name: resp.file_name || undefined,
                created_at: resp.created_at || new Date().toISOString(),
            };
        } catch (error) {
            console.error("getReportStatus:", error);
            return null;
        }
    },

    async waitForReport(jobId: string, opts?: { timeoutMs?: number; pollMs?: number }): Promise<GeneratedReport | null> {
        const timeoutMs = opts?.timeoutMs ?? 120_000;
        const pollMs = opts?.pollMs ?? 1500;
        const started = Date.now();

        while (Date.now() - started < timeoutMs) {
            const status = await this.getReportStatus(jobId);
            if (!status) return null;
            if (status.status === 'completed' || status.status === 'failed') return status;
            await new Promise((r) => setTimeout(r, pollMs));
        }
        return await this.getReportStatus(jobId);
    },

    async downloadReport(report: Pick<GeneratedReport, 'file_url' | 'file_name'>): Promise<{ ok: boolean; error?: any }> {
        try {
            if (report.file_url) {
                globalThis.open(report.file_url, '_blank', 'noopener,noreferrer');
                return { ok: true };
            }

            if (!report.file_name) {
                throw new Error('Report file not available yet.');
            }

            const authHeaders = await getAuthHeaders();
            const base = getBaseUrl('/reports');
            const url = `${base}/reports/download/${encodeURIComponent(report.file_name)}`;

            const res = await fetch(url, { method: 'GET', headers: { ...authHeaders } });
            if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
            const blob = await res.blob();

            const objUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = report.file_name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(objUrl);

            return { ok: true };
        } catch (error) {
            console.error('downloadReport:', error);
            return { ok: false, error };
        }
    },

    async getScheduledReports(): Promise<ScheduledReport[]> {
        try {
            return await apiGet<ScheduledReport[]>("/reports/scheduled");
        } catch (error) {
            console.error("getScheduledReports:", error);
            return [];
        }
    },

    async createScheduledReport(input: ScheduledReportCreateInput): Promise<{ data: ScheduledReport | null; error: any }> {
        try {
            const data = await apiPost<ScheduledReport>("/reports/scheduled", input);
            return { data, error: null };
        } catch (error) {
            console.error("createScheduledReport:", error);
            return { data: null, error };
        }
    },

    async updateScheduledReport(id: string, input: Partial<ScheduledReportCreateInput>): Promise<{ data: ScheduledReport | null; error: any }> {
        try {
            const data = await apiPatch<ScheduledReport>(`/reports/scheduled/${id}`, input as any);
            return { data, error: null };
        } catch (error) {
            console.error("updateScheduledReport:", error);
            return { data: null, error };
        }
    },

    async deleteScheduledReport(id: string): Promise<{ error: any }> {
        try {
            await apiDelete<void>(`/reports/scheduled/${id}`);
            return { error: null };
        } catch (error) {
            console.error("deleteScheduledReport:", error);
            return { error };
        }
    },

    // ========== ACOUSTIC READINGS (Sound Analysis) ==========
    async getAcousticReadings(hiveId?: string, days: number = 30): Promise<any[]> {
        try {
            if (!hiveId) return [];
            const time_range = days <= 1 ? '24h' : days <= 7 ? '7d' : '30d';
            return await apiGet<any[]>(`/measurements/hive/${hiveId}`, { time_range });
        } catch (error) {
            console.error('getAcousticReadings:', error);
            return [];
        }
    },

    async createAcousticReading(input: {
        hive_id: string;
        frequency_hz: number;
        amplitude_db?: number;
        health_index?: number;
        spectral_profile?: any;
        tags?: string[];
    }): Promise<{ data: any; error: any }> {
        // Sound readings are persisted server-side (acoustic inferences/readings). Client should not write raw sensor rows.
        return { data: null, error: new Error('createAcousticReading is not supported via client-side CRUD') };
    },

    // ========== VARROA READINGS & TREATMENTS ==========
    async getVarroaReadings(hiveId?: string): Promise<VarroaReading[]> {
        try {
            const rows = await apiGet<any[]>('/varroa/readings', hiveId ? { hive_id: hiveId } : undefined);
            return (rows || []).map(normalizeVarroaReading);
        } catch (error) {
            console.error('getVarroaReadings:', error);
            return [];
        }
    },

    async createVarroaReading(input: VarroaReadingCreateInput): Promise<{ data: VarroaReading | null; error: any }> {
        try {
            const data = normalizeVarroaReading(await apiPost<any>('/varroa/readings', {
                ...input,
                method: input.method || 'alcohol_wash',
                sample_size: input.sample_size || 300,
            }));
            toast.success('Varroa reading recorded');
            return { data, error: null };
        } catch (error) {
            console.error('createVarroaReading:', error);
            toast.error('Failed to record varroa reading');
            return { data: null, error };
        }
    },

    async updateVarroaReading(id: string, updates: Partial<VarroaReadingCreateInput>): Promise<{ data: VarroaReading | null; error: any }> {
        try {
            const data = normalizeVarroaReading(await apiPut<any>(`/varroa/readings/${id}`, updates));
            toast.success('Varroa reading updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateVarroaReading:', error);
            toast.error('Failed to update varroa reading');
            return { data: null, error };
        }
    },

    async deleteVarroaReading(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/varroa/readings/${id}`);
            toast.success('Varroa reading deleted');
            return { error: null };
        } catch (error) {
            console.error('deleteVarroaReading:', error);
            toast.error('Failed to delete varroa reading');
            return { error };
        }
    },

    async simulateVarroaModel(input: {
        start_mode?: 'observed' | 'default';
        initial_mite_count?: number;
        simulation_days?: number;
        adult_bee_population?: number;
        collapse_threshold?: number;
        mites_per_day?: number;
        colony_multiplier?: number;
        brood_mode?: string;
        colony_strength?: string;
        treatment_day?: number;
        treatment_type?: string;
        temperature_c?: number;
        measurement_type?: string;
    }): Promise<VarroaSimulationResponse | null> {
        try {
            return await apiPost<VarroaSimulationResponse>('/measurements/varroa/simulate', input);
        } catch (error) {
            console.error('simulateVarroaModel:', error);
            return null;
        }
    },

    async getVarroaTreatments(hiveId?: string): Promise<VarroaTreatment[]> {
        try {
            const rows = await apiGet<any[]>('/varroa/treatments', hiveId ? { hive_id: hiveId } : undefined);
            return (rows || []).map(normalizeVarroaTreatment);
        } catch (error) {
            console.error('getVarroaTreatments:', error);
            return [];
        }
    },

    async createVarroaTreatment(input: VarroaTreatmentCreateInput): Promise<{ data: VarroaTreatment | null; error: any }> {
        try {
            const data = normalizeVarroaTreatment(await apiPost<any>('/varroa/treatments', input));
            toast.success('Treatment recorded');
            return { data, error: null };
        } catch (error) {
            console.error('createVarroaTreatment:', error);
            toast.error('Failed to record treatment');
            return { data: null, error };
        }
    },

    async updateVarroaTreatment(id: string, updates: Partial<VarroaTreatmentCreateInput>): Promise<{ data: VarroaTreatment | null; error: any }> {
        try {
            const data = normalizeVarroaTreatment(await apiPut<any>(`/varroa/treatments/${id}`, updates));
            toast.success('Treatment updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateVarroaTreatment:', error);
            toast.error('Failed to update treatment');
            return { data: null, error };
        }
    },

    async deleteVarroaTreatment(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/varroa/treatments/${id}`);
            toast.success('Treatment deleted');
            return { error: null };
        } catch (error) {
            console.error('deleteVarroaTreatment:', error);
            toast.error('Failed to delete treatment');
            return { error };
        }
    },

    // ========== BILLING & SUBSCRIPTIONS ==========
    async getBillingOverview(): Promise<BillingOverview | null> {
        try {
            return await apiGet<BillingOverview>('/beeyield/billing/overview');
        } catch (error) {
            console.error('getBillingOverview:', error);
            return null;
        }
    },

    async getSubscriptionPlans(): Promise<any[]> {
        return [
            { id: 'starter', name: 'Starter Hive', price: 0, currency: 'KES', features: ['1 Hive Monitor', 'Basic Alerts'] },
            { id: 'pro', name: 'Pro Apiary', price: 2500, currency: 'KES', features: ['10 Hive Monitors', 'Acoustic Intelligence', 'Satellite Forage Maps'] },
            { id: 'enterprise', name: 'Commercial Fleet', price: 15000, currency: 'KES', features: ['Unlimited Monitors', 'Custom ML Models', 'White-label Reports'] }
        ];
    },

    async checkout(input: { user_id: string; idempotency_key: string; checkout_data: any }): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPost<any>('/shop/checkout/init', input);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getCheckoutStatus(idempotencyKey: string): Promise<{ paid: boolean; status: string; transaction_id?: string }> {
        try {
            return await apiGet<any>(`/shop/checkout/status/${idempotencyKey}`);
        } catch (error) {
            return { paid: false, status: 'error' };
        }
    },

    async sendOrderInvoice(orderId: string, email?: string): Promise<{ success: boolean; message: string }> {
        try {
            const res = await apiPost<{ status: string; message: string }>('/payments/invoice/send', {
                order_id: orderId,
                recipient_email: email,
                include_traceability: true
            });
            return { success: res.status === 'success', message: res.message };
        } catch (error: any) {
            console.error('sendOrderInvoice error:', error);
            return { success: false, message: error.message || 'Failed to send invoice' };
        }
    },

    async getTransactions(): Promise<Transaction[]> {
        try {
            const data = await apiGet<any[]>('/beeyield/billing/ledger', { limit: 50 });
            return (data || []).map((t: any) => ({
                ...t,
                type: t.transaction_type,
                category: t.module_type,
                status: t.etims_status === 'synced' ? 'completed' : 'pending',
                etims_qr_url: t.metadata?.etims_qr_url || null
            })) as Transaction[];
        } catch (error) {
            console.error('getTransactions:', error);
            return [];
        }
    },

    async createTransaction(input: {
        type: 'income' | 'expense';
        amount: number;
        currency: string;
        category: string;
        date: string;
        description: string;
        status: string;
        entity_id?: string;
    }): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPost<any>('/beeyield/billing/ledger', {
                transaction_type: input.type,
                module_type: input.category,
                description: input.description,
                amount: input.amount,
                currency: input.currency,
                date: input.date,
                etims_status: 'pending',
            });

            await this.logActivity({
                event_type: 'transaction_created',
                entity_type: 'transaction',
                entity_id: data?.id,
                title: input.type === 'income' ? 'Revenue Captured' : 'Expense Recorded',
                subtitle: `${input.currency} ${input.amount.toLocaleString()} - ${input.category}`,
                metadata: { amount: input.amount, type: input.type }
            });

            return { data, error: null };
        } catch (error) {
            console.error('createTransaction:', error);
            return { data: null, error };
        }
    },

    async updateTransaction(id: string, input: {
        type?: 'income' | 'expense';
        amount?: number;
        currency?: string;
        category?: string;
        date?: string;
        description?: string;
        status?: string;
        metadata?: any;
    }): Promise<{ data: Transaction | null; error: any }> {
        try {
            const data = await apiPatch<Transaction>(`/beeyield/billing/ledger/${id}`, {
                transaction_type: input.type,
                amount: input.amount,
                currency: input.currency,
                module_type: input.category,
                date: input.date,
                description: input.description,
                etims_status: input.status,
                metadata: input.metadata,
            } as any);
            toast.success('Transaction updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateTransaction:', error);
            toast.error('Failed to update transaction');
            return { data: null, error };
        }
    },

    async deleteTransaction(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/beeyield/billing/ledger/${id}`);

            await this.logActivity({
                event_type: 'transaction_deleted',
                entity_type: 'transaction',
                entity_id: id,
                title: 'Financial Ledger Corrected',
                subtitle: `Transaction #${id.slice(0, 8)} removed from records.`,
            });

            toast.success('Transaction removed');
            return { success: true, error: null };
        } catch (error: any) {
            console.error('deleteTransaction:', error);
            toast.error(error?.message || 'Failed to remove transaction');
            return { success: false, error };
        }
    },

    async submitToETIMS(id: string): Promise<{ success: boolean; etims_id?: string; error?: any }> {
        try {
            const result = await apiPost<any>(`/beeyield/billing/sync-etims/${id}`, {});
            return result;
        } catch (error) {
            console.error('submitToETIMS error:', error);
            return { success: false, error };
        }
    },

    async getFinancialAggregate(groupBy: 'month' | 'category' = 'month'): Promise<any[]> {
        const txs = await this.getTransactions();

        if (groupBy === 'month') {
            const months: Record<string, any> = {};
            txs.forEach(t => {
                const m = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
                if (!months[m]) months[m] = { name: m, revenue: 0, costs: 0, net: 0 };
                if (t.transaction_type === 'income') months[m].revenue += t.amount;
                else months[m].costs += t.amount;
                months[m].net = months[m].revenue - months[m].costs;
            });
            return Object.values(months);
        } else {
            const categories: Record<string, any> = {};
            txs.forEach(t => {
                const c = t.module_type || 'General';
                if (!categories[c]) categories[c] = { category: c, total: 0 };
                categories[c].total += t.transaction_type === 'income' ? t.amount : -t.amount;
            });
            return Object.values(categories);
        }
    },

    // ========== BLUETOOTH DEVICES ==========
    async getBluetoothDevices(): Promise<BluetoothDeviceRecord[]> {
        try {
            return await apiGet<BluetoothDeviceRecord[]>('/beeyield/bluetooth/devices');
        } catch (error) {
            console.error('getBluetoothDevices:', error);
            return [];
        }
    },

    async registerBluetoothDevice(input: BluetoothDeviceCreateInput): Promise<BluetoothDeviceRecord | null> {
        try {
            const data = await apiPost<BluetoothDeviceRecord>('/beeyield/bluetooth/devices', input);
            toast.success('Bluetooth device registered');
            return data;
        } catch (error) {
            console.error('registerBluetoothDevice:', error);
            toast.error('Failed to register device');
            return null;
        }
    },

    async updateBluetoothDevice(macAddress: string, input: BluetoothDeviceUpdateInput): Promise<BluetoothDeviceRecord | null> {
        try {
            const data = await apiPatch<BluetoothDeviceRecord>(`/beeyield/bluetooth/devices/${encodeURIComponent(macAddress)}`, input);
            toast.success('Bluetooth device updated');
            return data;
        } catch (error) {
            console.error('updateBluetoothDevice:', error);
            toast.error('Failed to update Bluetooth device');
            return null;
        }
    },

    async deleteBluetoothDevice(macAddress: string): Promise<{ success: boolean; error?: any }> {
        try {
            await apiDelete<void>(`/beeyield/bluetooth/devices/${encodeURIComponent(macAddress)}`);
            toast.success('Bluetooth device deleted');
            return { success: true };
        } catch (error) {
            console.error('deleteBluetoothDevice:', error);
            toast.error('Failed to delete Bluetooth device');
            return { success: false, error };
        }
    },

    async uploadBluetoothReadings(readings: BluetoothReadingUpload[]): Promise<{ status: string; count: number }> {
        const payload = { readings };
        return apiPost<{ status: string; count: number }>('/beeyield/bluetooth/sync', payload);
    },

    async syncBluetoothReadings(payload: { readings: BluetoothReadingUpload[] }): Promise<{ ok: boolean; count: number; error?: any }> {
        try {
            const data = await apiPost<{ status: string; count: number }>('/beeyield/bluetooth/sync', payload);
            return { ok: true, count: data.count ?? payload.readings.length };
        } catch (error) {
            console.error('syncBluetoothReadings:', error);
            return { ok: false, count: 0, error };
        }
    },

    // ========== ACTIVITY FEED ==========
    async getActivityLogs2(limit = 10): Promise<ActivityLog[]> {
        try {
            return await apiGet<ActivityLog[]>('/beeyield/activity-logs', { limit });
        } catch (error) {
            console.error('getActivityLogs2:', error);
            return [];
        }
    },

    async logActivity2(input: Partial<ActivityLog>): Promise<{ data: ActivityLog | null; error: any }> {
        try {
            const data = await apiPost<ActivityLog>('/beeyield/activity-logs', input as any);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // ========== ACCOUNT & DEVICES ==========
    async getIotDevices(): Promise<any[]> {
        return this.getDevices();
    },

    // ========== USB DEVICE PAIRING ==========
    async getPairedUsbDevices(): Promise<UsbHubDeviceRecord[]> {
        try {
            return await apiGet<UsbHubDeviceRecord[]>('/hub/devices');
        } catch (error) {
            console.error('getPairedUsbDevices:', error);
            return [];
        }
    },

    async pairUsbDevice(input: {
        device_uid: string;
        device_type?: string;
        serial_number?: string;
        firmware_version?: string;
        config?: any;
        status?: string;
    }): Promise<{ data: UsbHubDeviceRecord | null; error: any }> {
        try {
            const payload = {
                serial_number: input.serial_number || input.device_uid,
                firmware_version: input.firmware_version,
                config_json: input.config || {},
                status: input.status || 'paired',
            };
            const data = await apiPost<UsbHubDeviceRecord>('/hub/devices', payload);
            toast.success('Device paired successfully');
            return { data, error: null };
        } catch (error) {
            console.error('pairUsbDevice:', error);
            toast.error('Failed to pair device');
            return { data: null, error };
        }
    },

    async updatePairedUsbDevice(serialNumber: string, input: UsbHubDeviceUpdateInput): Promise<{ data: UsbHubDeviceRecord | null; error: any }> {
        try {
            const data = await apiPatch<UsbHubDeviceRecord>(`/hub/devices/${encodeURIComponent(serialNumber)}`, input);
            toast.success('USB device updated');
            return { data, error: null };
        } catch (error) {
            console.error('updatePairedUsbDevice:', error);
            toast.error('Failed to update USB device');
            return { data: null, error };
        }
    },

    async unpairUsbDevice(id: string): Promise<{ error: any }> {
        try {
            await apiDelete<void>(`/hub/devices/${encodeURIComponent(id)}`);
            toast.success('Device unpaired');
            return { error: null };
        } catch (error) {
            console.error('unpairUsbDevice:', error);
            toast.error('Failed to unpair device');
            return { error };
        }
    },

    // ========== SENSOR CALIBRATION ==========
    async tareSensor(deviceId: string): Promise<{ success: boolean; error?: any }> {
        try {
            // Compute offset via backend readings endpoint (admin-only in some setups)
            const readings = await apiGet<any[]>('/iot/readings', { device_id: deviceId, hours: 24 });
            const latest = Array.isArray(readings) && readings.length > 0 ? readings[0] : null;
            const offset = latest?.weight_kg ?? latest?.readings?.hive_weight ?? 0;
            await apiPatch(`/beeyield/infrastructure-registry/${deviceId}`, { calibration_offset: -Number(offset || 0) } as any);
            toast.success(`Sensor ${deviceId} tared to 0.00kg`);
            return { success: true };
        } catch (error) {
            console.error('tareSensor error:', error);
            return { success: false, error };
        }
    },

    async setOffsetCorrection(deviceId: string, offsetValue: number): Promise<{ success: boolean; error?: any }> {
        try {
            await apiPatch(`/beeyield/infrastructure-registry/${deviceId}`, { calibration_offset: offsetValue } as any);
            toast.success(`Calibration offset set to ${offsetValue}kg`);
            return { success: true };
        } catch (error) {
            console.error('setOffsetCorrection error:', error);
            return { success: false, error };
        }
    },

    // ========== PRECISION POLLINATION ==========
    async getPollinationDeployments2(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/pollination/deployments');
        } catch (error) {
            console.error('getPollinationDeployments2:', error);
            return [];
        }
    },

    async getCropRequirements(cropName?: string): Promise<CropPollinationRequirement[]> {
        try {
            const data = await apiGet<CropPollinationRequirement[]>('/pollination/crops', { crop_name: cropName });
            const normalized = normalizeCropRequirements(data);
            if (!cropName) return normalized;
            return normalized.filter((crop) => crop.crop_name === cropName);
        } catch (error) {
            console.error('getCropRequirements:', error);
            if (!cropName) return DASHBOARD_CROP_REQUIREMENTS;
            return DASHBOARD_CROP_REQUIREMENTS.filter((crop) => crop.crop_name === cropName);
        }
    },

    async calculatePollination(input: PollinationCalculatorInput): Promise<PollinationCalculatorResult> {
        return apiPost<PollinationCalculatorResult>('/pollination/calculate', input);
    },

    async optimizePollinationPlacement2(input: {
        orchard_geojson: any;
        hive_count: number;
        target_crop: string;
        bee_flight_radius_km?: number;
        ahp_weights?: { bloom?: number; roads?: number; water?: number };
        bloom_intensity?: number;
        forage_condition?: number;
    }): Promise<any[]> {
        return apiPost<any[]>('/pollination/optimize', input);
    },

    async getPollinationDashboard(): Promise<any> {
        return apiGet<any>('/pollination/dashboard');
    },

    async createPollinationContract(contract: any): Promise<any> {
        try {
            const data = await apiPost<any>('/pollination/contracts', contract);
            toast.success('Pollination contract created');
            return data;
        } catch (error) {
            console.error('createPollinationContract:', error);
            return { error };
        }
    },

    async getPollinationContracts(): Promise<PollinationContract[]> {
        try {
            return await apiGet<PollinationContract[]>('/pollination/contracts');
        } catch (error) {
            console.error('getPollinationContracts:', error);
            return [];
        }
    },

    async getPollinationAnalytics(): Promise<PollinationAnalytics | null> {
        const contracts = await this.getPollinationContracts();
        if (!contracts.length) return null;
        const active = contracts.filter(c => c.status === 'active');
        return {
            total_contracts: contracts.length,
            active_contracts: active.length,
            total_hives_deployed: active.reduce((s, c) => s + (c.hive_count_deployed || 0), 0),
            total_acres_covered: active.reduce((s, c) => s + (c.farm_size_acres || 0), 0),
            average_fpa: active.length ? active.reduce((s, c) => s + (c.actual_fpa || c.target_fpa || 0), 0) / active.length : 0,
            coverage_health_percent: 85,
            healthy_hives: 0, warning_hives: 0, critical_hives: 0,
            total_revenue: contracts.reduce((s, c) => s + (c.payment_amount || 0), 0),
        };
    },

    async getPollinationActivityLogs(): Promise<any[]> {
        try {
            const tasks = await apiGet<any[]>('beeyield/tasks');
            return (tasks || []).filter((t: any) => String(t?.category || '').toLowerCase() === 'pollination').slice(0, 20);
        } catch (error) {
            console.error('getPollinationActivityLogs:', error);
            return [];
        }
    },

    async savePollinationDeployment(input: any): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPost<any>('/pollination/deployments', input as any);
            toast.success('Pollination deployment saved');
            return { data, error: null };
        } catch (error) {
            console.error('savePollinationDeployment:', error);
            return { data: null, error };
        }
    },

    async logExport(payload: { export_type: string; entity_scope: string; file_name: string; record_count: number }): Promise<void> {
        await this.logActivity({
            event_type: 'export_generated',
            entity_type: payload.entity_scope,
            title: `Export: ${payload.export_type}`,
            subtitle: `${payload.record_count} records`,
            metadata: payload,
        });
    },

    // ========== API USAGE / SERVER STATUS ==========
    async getApiUsageStats(_days: number = 30): Promise<any> {
        // No dedicated table — return stub
        return { total_requests: 0, avg_latency_ms: 45, uptime_percent: 99.9, last_checked: new Date().toISOString() };
    },

    // ========== SATELLITE / AGRO INTELLIGENCE ==========
    async getSatelliteIndices(apiaryId?: string, days: number = 90): Promise<any[]> {
        try {
            if (!apiaryId) return [];
            const time_range = days <= 1 ? '24h' : days <= 7 ? '7d' : '30d';
            return await apiGet<any[]>(`/measurements/land/${apiaryId}`, { time_range });
        } catch (error) {
            console.error('getSatelliteIndices:', error);
            return [];
        }
    },

    async getWeatherHistory(apiaryId?: string, days: number = 30): Promise<any[]> {
        try {
            const hours = Math.max(1, Math.floor(days * 24));
            const rows = await apiGet<any[]>('/iot/readings', { hours });
            // Best-effort mapping (field names vary across deployments)
            return (rows || []).map((r: any) => ({
                temp_external: r?.temp_external ?? r?.temperature ?? r?.temp_internal ?? null,
                humidity_external: r?.humidity_external ?? r?.humidity ?? r?.humidity_internal ?? null,
                recorded_at: r?.recorded_at ?? r?.timestamp ?? r?.created_at ?? null,
                hive_id: r?.hive_id ?? null,
                apiary_id: apiaryId ?? r?.apiary_id ?? null,
            }));
        } catch (error) {
            console.error('getWeatherHistory:', error);
            return [];
        }
    },

    // ========== FORAGE ZONES (Flight Map) ==========
    async getForageZones(apiaryId?: string): Promise<ForageZone[]> {
        try {
            return await apiGet<ForageZone[]>('/forage/zones', apiaryId ? { apiary_id: apiaryId } : undefined);
        } catch (error) {
            console.error('getForageZones:', error);
            return [];
        }
    },

    async getForageZone(id: string): Promise<ForageZone | null> {
        try {
            return await apiGet<ForageZone>(`/forage/zones/${id}`);
        } catch (error) {
            console.error('getForageZone:', error);
            return null;
        }
    },

    async createForageZone(input: {
        apiary_id: string;
        zone_name?: string;
        flora_type?: string;
        latitude?: number;
        longitude?: number;
        radius_km?: number;
        density_score?: number;
        season?: string;
        geojson?: any;
        notes?: string;
    }): Promise<{ data: ForageZone | null; error: any }> {
        try {
            const data = await apiPost<ForageZone>('/forage/zones', input as any);
            toast.success('Forage zone added');
            return { data, error: null };
        } catch (error) {
            console.error('createForageZone:', error);
            toast.error('Failed to add forage zone');
            return { data: null, error };
        }
    },

    async updateForageZone(id: string, patch: Partial<ForageZone>): Promise<{ data: ForageZone | null; error: any }> {
        try {
            const data = await apiPatch<ForageZone>(`/forage/zones/${id}`, patch as any);
            toast.success('Forage zone updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateForageZone:', error);
            toast.error('Failed to update forage zone');
            return { data: null, error };
        }
    },

    async deleteForageZone(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/forage/zones/${id}`);
            toast.success('Forage zone deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteForageZone:', error);
            toast.error('Failed to delete forage zone');
            return { success: false, error };
        }
    },

    async getOrchards(apiaryId?: string): Promise<Orchard[]> {
        try {
            return await apiGet<Orchard[]>('/forage/orchards', apiaryId ? { apiary_id: apiaryId } : undefined);
        } catch (error) {
            console.error('getOrchards:', error);
            return [];
        }
    },

    async getOrchard(id: string): Promise<Orchard | null> {
        try {
            return await apiGet<Orchard>(`/forage/orchards/${id}`);
        } catch (error) {
            console.error('getOrchard:', error);
            return null;
        }
    },

    async createOrchard(input: {
        name: string;
        apiary_id?: string;
        location_name?: string;
        boundary_geojson?: any;
        acreage?: number;
        crop_type?: string;
        notes?: string;
    }): Promise<{ data: Orchard | null; error: any }> {
        try {
            const data = await apiPost<Orchard>('/forage/orchards', input as any);
            toast.success('Orchard saved');
            return { data, error: null };
        } catch (error) {
            console.error('createOrchard:', error);
            toast.error('Failed to save orchard');
            return { data: null, error };
        }
    },

    async updateOrchard(id: string, patch: Partial<Orchard>): Promise<{ data: Orchard | null; error: any }> {
        try {
            const data = await apiPatch<Orchard>(`/forage/orchards/${id}`, patch as any);
            toast.success('Orchard updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateOrchard:', error);
            toast.error('Failed to update orchard');
            return { data: null, error };
        }
    },

    async deleteOrchard(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/forage/orchards/${id}`);
            toast.success('Orchard deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteOrchard:', error);
            toast.error('Failed to delete orchard');
            return { success: false, error };
        }
    },

    async getGeofences(apiaryId?: string): Promise<Geofence[]> {
        try {
            return await apiGet<Geofence[]>('/forage/geofences', apiaryId ? { apiary_id: apiaryId } : undefined);
        } catch (error) {
            console.error('getGeofences:', error);
            return [];
        }
    },

    async getGeofence(id: string): Promise<Geofence | null> {
        try {
            return await apiGet<Geofence>(`/forage/geofences/${id}`);
        } catch (error) {
            console.error('getGeofence:', error);
            return null;
        }
    },

    async createGeofence(input: {
        name: string;
        apiary_id?: string;
        center_latitude?: number;
        center_longitude?: number;
        radius_meters?: number;
        boundary_geojson?: any;
        notes?: string;
        alert_triggered?: boolean;
    }): Promise<{ data: Geofence | null; error: any }> {
        try {
            const data = await apiPost<Geofence>('/forage/geofences', input as any);
            toast.success('Geofence saved');
            return { data, error: null };
        } catch (error) {
            console.error('createGeofence:', error);
            toast.error('Failed to save geofence');
            return { data: null, error };
        }
    },

    async updateGeofence(id: string, patch: Partial<Geofence>): Promise<{ data: Geofence | null; error: any }> {
        try {
            const data = await apiPatch<Geofence>(`/forage/geofences/${id}`, patch as any);
            toast.success('Geofence updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateGeofence:', error);
            toast.error('Failed to update geofence');
            return { data: null, error };
        }
    },

    async deleteGeofence(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/forage/geofences/${id}`);
            toast.success('Geofence deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteGeofence:', error);
            toast.error('Failed to delete geofence');
            return { success: false, error };
        }
    },

    async getMapViews(apiaryId?: string, viewType?: string): Promise<MapView[]> {
        try {
            const params: Record<string, string> = {};
            if (apiaryId) params.apiary_id = apiaryId;
            if (viewType) params.view_type = viewType;
            return await apiGet<MapView[]>('/forage/map-views', Object.keys(params).length ? params : undefined);
        } catch (error) {
            console.error('getMapViews:', error);
            return [];
        }
    },

    async getMapView(id: string): Promise<MapView | null> {
        try {
            return await apiGet<MapView>(`/forage/map-views/${id}`);
        } catch (error) {
            console.error('getMapView:', error);
            return null;
        }
    },

    async createMapView(input: {
        name: string;
        apiary_id?: string;
        description?: string;
        view_type?: string;
        center_latitude?: number;
        center_longitude?: number;
        zoom_level?: number;
        active_layers?: string[];
        filters?: Record<string, any>;
        viewport_state?: Record<string, any>;
        is_default?: boolean;
    }): Promise<{ data: MapView | null; error: any }> {
        try {
            const data = await apiPost<MapView>('/forage/map-views', input as any);
            toast.success('Map view saved');
            return { data, error: null };
        } catch (error) {
            console.error('createMapView:', error);
            toast.error('Failed to save map view');
            return { data: null, error };
        }
    },

    async updateMapView(id: string, patch: Partial<MapView>): Promise<{ data: MapView | null; error: any }> {
        try {
            const data = await apiPatch<MapView>(`/forage/map-views/${id}`, patch as any);
            toast.success('Map view updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateMapView:', error);
            toast.error('Failed to update map view');
            return { data: null, error };
        }
    },

    async deleteMapView(id: string): Promise<{ success: boolean; error: any }> {
        try {
            await apiDelete<void>(`/forage/map-views/${id}`);
            toast.success('Map view deleted');
            return { success: true, error: null };
        } catch (error) {
            console.error('deleteMapView:', error);
            toast.error('Failed to delete map view');
            return { success: false, error };
        }
    },

    // ========== HEALTH KNOWLEDGE BASE ==========
    async getHealthGuide(kind: 'diseases' | 'species', q?: string): Promise<any[]> {
        try {
            const resp = await apiGet<{ items: any[] }>(
                "/beeyield/health/knowledge",
                { kind, q }
            );
            return Array.isArray(resp?.items) ? resp.items : [];
        } catch (error) {
            console.error("getHealthGuide:", error);
            return [];
        }
    },

    // ========== GENERATION (Python backend — kept as-is) ==========
    async generateLabelBlurb(input: {
        floral_type: string;
        location: string;
        harvest_year: string;
        tone?: string;
        use_ai?: boolean;
    }): Promise<{ blurb: string }> {
        try {
            const payload = {
                floral_type: input.floral_type,
                location: input.location,
                harvest_year: input.harvest_year,
                tone: input.tone || 'luxury'
            };
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/v1/ai/generate-blurb`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                // If user is logged out or backend denies, fail-soft so UI stays empty/usable
                return { blurb: '' };
            }
            return response.json();
        } catch (error) {
            console.error('Error generating blurb:', error);
            return { blurb: '' };
        }
    },

    async generateLabelPack(input: {
        floral_type: string;
        location: string;
        harvest_year: string;
        product_name?: string;
        tone?: string;
    }): Promise<{
        product_name: string;
        short_blurb: string;
        long_story: string;
        tasting_notes: string[];
        origin: string;
        harvest_date_range: string;
        sustainability_claims: string[];
        pairings: string[];
        allergen_notes: string;
        qr_landing_copy: string;
        tone: string;
    }> {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const headers = await getAuthHeaders();
        const response = await fetch(`${apiUrl}/api/v1/ai/generate-label-pack`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                floral_type: input.floral_type,
                location: input.location,
                harvest_year: input.harvest_year,
                product_name: input.product_name,
                tone: input.tone || 'luxury',
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.error || 'Label pack generation failed');
        }
        return response.json();
    },

    // ========== MODELS (Python backend) ==========
    async getIntelligenceModels(): Promise<any[]> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/v1/intelligence/models`, { headers });
            if (!response.ok) return [];
            return response.json();
        } catch (error) {
            console.error('Error fetching intelligence models:', error);
            return [];
        }
    },

    // ========== ACOUSTIC ANALYSIS (Python backend) ==========
    async analyzeAcoustic(file: File, hiveId?: string): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (hiveId) formData.append('hive_id', hiveId);

            const { getAuthHeaders: getHeaders } = await import('./api');
            const headers = await getHeaders();
            delete headers['Content-Type'];

            const { getBaseUrl } = await import('./api');
            const baseUrl = getBaseUrl('/acoustic/analyze');

            const response = await fetch(`${baseUrl}/acoustic/analyze`, {
                method: 'POST',
                headers: headers as any,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Analysis failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Error analyzing acoustic data:', error);
            throw error;
        }
    },


    // ========== STATS ==========
    async getStats(): Promise<{
        total_apiaries: number;
        total_hives: number;
        active_hives: number;
        total_harvests: number;
        total_honey_kg: number;
        total_acres: number;
        total_tasks: number;
        pending_tasks: number;
        active_apiaries: number;
    }> {
        if (!sb) return { total_apiaries: 0, total_hives: 0, active_hives: 0, total_harvests: 0, total_honey_kg: 0, total_acres: 0, total_tasks: 0, pending_tasks: 0, active_apiaries: 0 };
        const [apiaries, hives, harvests, tasks] = await Promise.all([
            sb.from('apiaries').select('id, status', { count: 'exact' }),
            sb.from('hives').select('id, status', { count: 'exact' }),
            sb.from('harvests').select('quantity_kg'),
            sb.from('tasks').select('id, status, is_completed', { count: 'exact' }),
        ]);
        const harvestData = harvests.data || [];
        const hiveData = hives.data || [];
        const taskData = tasks.data || [];
        const apiaryData = apiaries.data || [];
        return {
            total_apiaries: apiaries.count || 0,
            total_hives: hives.count || 0,
            active_hives: hiveData.filter((h: any) => h.status === 'active' || !h.status).length,
            total_harvests: harvestData.length,
            total_honey_kg: harvestData.reduce((s, h: any) => s + (h.quantity_kg || 0), 0),
            total_acres: 0,
            total_tasks: tasks.count || 0,
            pending_tasks: taskData.filter((t: any) => !t.is_completed && t.status !== 'completed').length,
            active_apiaries: apiaryData.filter((a: any) => a.status === 'active' || !a.status).length,
        };
    },

    // ========== ANALYTICS ==========
    async getComparisonData(params: {
        medium: string;
        range: string;
        apiary_id?: string;
        user_id?: string;
    }): Promise<any[]> {
        if (!sb) return [];
        let query = sb.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(100);
        if (params.apiary_id) {
            const { data: hives } = await sb.from('hives').select('id').eq('apiary_id', params.apiary_id);
            if (hives?.length) {
                query = query.in('hive_id', hives.map(h => h.id));
            }
        }
        const { data, error } = await query;
        if (error) { console.error('getComparisonData:', error); return []; }
        return (data || []) as any[];
    },

    // ========== REAL-TIME SUBSCRIPTIONS (PULSE) ==========
    // Generic listeners removed in favor of ID-specific listeners (see lines 802-818)

    // ========== ML MICROSERVICE INTEGRATION ==========
    async analyzeHiveImage(payload: { image: File; hiveId?: string; apiaryId?: string }): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('image', payload.image);
            if (payload.hiveId) formData.append('hive_id', payload.hiveId);
            if (payload.apiaryId) formData.append('apiary_id', payload.apiaryId);

            const { getAuthHeaders, getBaseUrl } = await import('./api');
            const headers = await getAuthHeaders();
            // Do not set Content-Type for FormData
            delete (headers as any)['Content-Type'];
            const baseUrl = getBaseUrl('/image/analyze');

            const response = await fetch(`${baseUrl}/image/analyze`, {
                method: 'POST',
                headers: headers as any,
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.detail || 'Image analysis failed');
            }
            const raw = await response.json();

            // Normalize the backend response into legacy-friendly fields.
            const result = {
                analysis_id: raw?.analysis_id,
                status: raw?.status,
                image_url: raw?.image_url,
                annotated_image_url: raw?.annotated_image_url,
                bee_count: raw?.results?.bee_count ?? 0,
                health_score: raw?.results?.health_score ?? 0,
                health_status: raw?.results?.health_status ?? raw?.results?.health_status ?? 'Unknown',
                confidence: raw?.results?.confidence ?? 0,
                detections: raw?.results?.detections ?? [],
                disease_indicators: raw?.results?.disease_indicators ?? [],
                recommendations: raw?.results?.recommendations ?? [],
                raw,
            };

            await this.logActivity({
                event_type: 'health_audit_vision',
                entity_type: 'hive',
                entity_id: payload.hiveId,
                title: 'Image health audit completed',
                subtitle: result.health_status,
                metadata: {
                    hive_id: payload.hiveId,
                    bee_count: result.bee_count,
                    health_score: result.health_score,
                    confidence: result.confidence,
                },
            });
            return result;
        } catch (error) {
            console.error('analyzeHiveImage:', error);
            throw error;
        }
    },

    async analyzeHiveAudio(payload: { file: File; hiveId?: string }): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', payload.file);
            if (payload.hiveId) formData.append('hive_id', payload.hiveId);

            const { getAuthHeaders, getBaseUrl } = await import('./api');
            const headers = await getAuthHeaders();
            delete (headers as any)['Content-Type'];
            const baseUrl = getBaseUrl('/acoustic/analyze');

            const response = await fetch(`${baseUrl}/acoustic/analyze`, {
                method: 'POST',
                headers: headers as any,
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.detail || 'Audio analysis failed');
            }
            const raw = await response.json();

            // Normalize for existing UI expectations (prediction/probability).
            const result = {
                analysis_id: raw?.analysis_id,
                prediction: raw?.verdict,
                probability: raw?.confidence,
                alert: raw?.alert,
                message: raw?.message,
                raw,
            };

            await this.logActivity({
                event_type: 'health_audit_acoustic',
                entity_type: 'hive',
                entity_id: payload.hiveId,
                title: 'Acoustic health audit completed',
                subtitle: String(result.prediction || ''),
                metadata: {
                    hive_id: payload.hiveId,
                    prediction: result.prediction,
                    probability: result.probability,
                    alert: result.alert,
                },
            });
            return result;
        } catch (error) {
            console.error('analyzeHiveAudio:', error);
            throw error;
        }
    },

    async predictYield(hiveId: string, historicalGdd: number, weightFlux: number): Promise<any> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const formData = new FormData();
            formData.append('hive_id', hiveId);
            formData.append('historical_gdd', historicalGdd.toString());
            formData.append('weight_flux', weightFlux.toString());

            const response = await fetch(`${apiUrl}/ml/predict-yield`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Yield Prediction failed');
            return await response.json();
        } catch (error) {
            console.error('predictYield:', error);
            throw error;
        }
    },

    // ========== JOBS (External API) ==========
    async getUserProfile(): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const full = await apiGet<any>('/settings/full', undefined, { headers });
            return { data: full?.profile ?? null, error: null };
        } catch (error) {
            console.error('getUserProfile:', error);
            return { data: null, error };
        }
    },

    async processPayment(payload: { amount: number; currency: string; payment_method: string; subscription_tier: string }): Promise<{ success: boolean; transaction_id?: string; error?: any }> {
        if (!sb) return { success: false, error: 'No client' };
        const { data, error } = await sb.functions.invoke('process-payment', {
            body: payload
        });
        if (error) {
            console.error('processPayment error:', error);
            return { success: false, error };
        }
        return data;
    },

    async submitJobApplication(formData: FormData): Promise<{ data: any; error: any }> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/v1/jobs/apply`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Application submission failed');
            }
            const data = await response.json();
            return { data, error: null };
        } catch (error: any) {
            console.error('Error submitting application:', error);
            return { data: null, error };
        }
    },
    async getInfrastructureRegisters(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/infrastructure-registry');
        } catch (error) {
            console.error('getInfrastructureRegisters:', error);
            return [];
        }
    },

    async logIntegrationAudit(platform: string, eventType: string, status: string, metrics: any): Promise<void> {
        await this.logActivity({
            event_type: 'integration_audit',
            entity_type: platform,
            title: `${platform}: ${eventType}`,
            subtitle: status,
            metadata: metrics,
        });
    },

    async getIntegrationAuditLogs(platform: string, limit: number = 25): Promise<any[]> {
        const CACHE_TTL = 60000; // 60 seconds
        const now = Date.now();
        if (this._auditLogsCache[platform] && (now - (this._auditLogsCacheTime[platform] || 0) < CACHE_TTL)) {
            return this._auditLogsCache[platform];
        }

        if (!sb) return [];
        let logs: any[] = [];
        try {
            // Primary: if a view/table exists, read it.
            const { data, error } = await sb
                .from('integration_audit_logs')
                .select('*')
                .eq('platform', platform)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (!error && data) logs = data;
        } catch {
            // ignore and fall through to RPC
        }

        if (logs.length === 0) {
            // Fallback: if only RPC exists (log_integration_event), try a paired fetch RPC.
            try {
                const { data, error } = await sb.rpc('get_integration_events', {
                    p_platform: platform,
                    p_limit: limit
                });
                if (!error && data) logs = data;
            } catch {
                // ignore
            }
        }

        this._auditLogsCache[platform] = logs;
        this._auditLogsCacheTime[platform] = now;
        return logs;
    },

    // ========== FLIGHT & ROUTING (PRD v2) ==========
    async getFlightAreaDashboard(apiaryId: string, landType?: string): Promise<any> {
        try {
            return await apiGet<any>('/forage/flight-area', {
                apiary_id: apiaryId,
                land_type: landType,
            });
        } catch (error) {
            console.error('getFlightAreaDashboard:', error);
            return null;
        }
    },

    async getFlightPotential(apiaryId: string): Promise<any> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/v1/forage/potential?apiary_id=${apiaryId}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch potential');
            return response.json();
        } catch (error) {
            console.error('getFlightPotential:', error);
            return { score: 0, status: 'Unknown', active_sources: [] };
        }
    },

    async getWeatherData(lat: number, lng: number): Promise<any> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/v1/forage/weather?lat=${lat}&lng=${lng}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch weather');
            return response.json();
        } catch (error) {
            console.error('getWeatherData:', error);
            return null;
        }
    },

    async getApiaryWeatherSummary(apiaryId: string): Promise<ApiaryWeatherSummary | null> {
        try {
            return await apiGet<ApiaryWeatherSummary>('/forage/weather-summary', { apiary_id: apiaryId });
        } catch (error) {
            console.error('getApiaryWeatherSummary:', error);
            return null;
        }
    },

    async getPublicLiveFlightMap(locationSlug: string = 'kibwezi-kenya'): Promise<PublicFlightMapPayload | null> {
        try {
            return await apiGet<PublicFlightMapPayload>('/forage/public-live-map', {
                location_slug: locationSlug,
            });
        } catch (error) {
            console.error('getPublicLiveFlightMap:', error);
            return null;
        }
    },

    async runYieldForecast(input: YieldForecastRequest): Promise<YieldForecastResponse> {
        return apiPost<YieldForecastResponse>('beeyield/yield-forecast/run', input);
    },

    async planRoute(startPoint: { lat: number, lng: number }, selectedHiveIds: string[]): Promise<any> {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/v1/routing/plan`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ start_point: startPoint, selected_hive_ids: selectedHiveIds })
            });
            if (!response.ok) throw new Error('Failed to plan route');
            return response.json();
        } catch (error) {
            console.error('planRoute:', error);
            return { path: [] };
        }
    },

    // ========== QUEENS ==========
    async getQueens(hiveId?: string): Promise<Queen[]> {
        try {
            return await apiGet<Queen[]>('beeyield/queens', hiveId ? { hive_id: hiveId } : undefined);
        } catch (error) {
            console.error('getQueens:', error);
            return [];
        }
    },

    async createQueen(input: QueenCreateInput): Promise<{ data: Queen | null; error: any }> {
        try {
            const data = await apiPost<Queen>('beeyield/queens', input);
            toast.success('Queen added successfully');
            return { data, error: null };
        } catch (error) {
            console.error('createQueen:', error);
            toast.error('Failed to add queen');
            return { data: null, error };
        }
    },

    async updateQueen(id: string, input: Partial<QueenCreateInput>): Promise<{ data: Queen | null; error: any }> {
        try {
            const data = await apiPut<Queen>(`beeyield/queens/${id}`, input);
            toast.success('Queen updated');
            return { data, error: null };
        } catch (error) {
            console.error('updateQueen:', error);
            toast.error('Failed to update queen');
            return { data: null, error };
        }
    },

    async deleteQueen(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`beeyield/queens/${id}`);
            toast.success('Queen removed');
            return { error: null };
        } catch (error) {
            console.error('deleteQueen:', error);
            toast.error('Failed to delete queen');
            return { error };
        }
    },

    // ========== QUEEN REARING BATCHES ==========
    async getQueenRearingBatches(hiveId?: string): Promise<QueenRearingBatch[]> {
        try {
            return await apiGet<QueenRearingBatch[]>('beeyield/queen-rearing-batches', hiveId ? { hive_id: hiveId } : undefined);
        } catch (error) {
            console.error('getQueenRearingBatches:', error);
            return [];
        }
    },

    async createQueenRearingBatch(input: QueenRearingBatchCreateInput): Promise<{ data: QueenRearingBatch | null; error: any }> {
        try {
            const data = await apiPost<QueenRearingBatch>('beeyield/queen-rearing-batches', input);
            toast.success('Queen rearing batch created');
            return { data, error: null };
        } catch (error) {
            console.error('createQueenRearingBatch:', error);
            toast.error('Failed to create queen rearing batch');
            return { data: null, error };
        }
    },

    async deleteQueenRearingBatch(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`beeyield/queen-rearing-batches/${id}`);
            toast.success('Batch deleted');
            return { error: null };
        } catch (error) {
            console.error('deleteQueenRearingBatch:', error);
            toast.error('Failed to delete batch');
            return { error };
        }
    },

    // ========== HIVE DETAIL (aggregate) ==========
    async getHiveDetail(hiveId: string): Promise<HiveDetailData | null> {
        try {
            return await apiGet<HiveDetailData>(`beeyield/hives/${hiveId}/detail`);
        } catch (error) {
            console.error('getHiveDetail:', error);
            return null;
        }
    },
};

// ========== QUEEN TYPES ==========
export interface Queen {
    id: string;
    hive_id?: string | null;
    user_id?: string;
    name?: string;
    breed?: string;
    origin?: string;
    marking_color?: string;
    year_introduced?: number;
    status?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface QueenCreateInput {
    hive_id?: string;
    name?: string;
    breed?: string;
    origin?: string;
    marking_color?: string;
    year_introduced?: number;
    status?: string;
    notes?: string;
}

// ========== QUEEN REARING BATCH TYPES ==========
export interface QueenRearingBatch {
    id: string;
    hive_id: string;
    user_id?: string;
    batch_name: string;
    method?: string;
    start_date: string;
    planned_units?: number;
    notebook?: string;
    generate_calendar?: boolean;
    generate_units?: boolean;
    generate_reminders?: boolean;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface QueenRearingBatchCreateInput {
    hive_id: string;
    batch_name: string;
    method?: string;
    start_date: string;
    planned_units?: number;
    notebook?: string;
    generate_calendar?: boolean;
    generate_units?: boolean;
    generate_reminders?: boolean;
}

// ========== HIVE DETAIL AGGREGATE TYPE ==========
export interface HiveDetailData {
    hive: Hive;
    apiary: Apiary | null;
    queen: Queen | null;
    last_inspection: Inspection | null;
    inspections: Inspection[];
    harvests: Harvest[];
    requests: any[];
    queen_rearing_batches: QueenRearingBatch[];
}

export default beeyieldService;
