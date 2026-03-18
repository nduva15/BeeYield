import { supabaseBeeYield } from '@/lib/supabase';
import { getAuthHeaders, getBaseUrl, apiDelete, apiGet, apiPost } from './api';
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
    apiary_id?: string;
    linked_apiary_id?: string;
    hive_id?: string;
}

export interface IoTDeviceCreateInput {
    device_code: string;
    device_name: string;
    device_type: 'infield' | 'inland' | 'disease';
    location_name?: string;
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

export interface Orchard {
    id: string;
    grower_id: string;
    name: string;
    crop_type: string;
    boundaries: any; // GeoJSON
    acreage: number;
    created_at: string;
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
    subject: string;
    description: string;
    status: 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'new';
    priority: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
    type: 'maintenance' | 'support' | 'inspection' | 'other';
    apiary_id?: string;
    hive_id?: string;
    category?: string;
    created_at: string;
    updated_at: string;
}

export type SupportRequest = Request;

export interface RequestCreateInput {
    subject: string;
    description: string;
    type: string;
    priority?: string;
    apiary_id?: string;
    hive_id?: string;
    category?: string;
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
    created_at?: string;
    updated_at?: string;
    hive?: Hive | null;
    farmer?: Farmer | null;
    apiary?: Apiary | null;
}

export interface HarvestCreateInput {
    hive_id?: string;
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

export const beeyieldService = {
    // ========== IoT DEVICES & GATEWAYS ==========
    async getDevices(): Promise<IoTDevice[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('devices').select('*').order('last_sync', { ascending: false });
        if (error) { console.error('getDevices:', error); return []; }
        return (data || []) as any;
    },

    async getDeviceById(id: string): Promise<IoTDevice | null> {
        if (!sb) return null;
        const { data, error } = await sb.from('devices').select('*').eq('id', id).maybeSingle();
        if (error) { console.error('getDeviceById:', error); return null; }
        return (data || null) as any;
    },

    // ========== INTEGRATIONS ==========
    // IMPORTANT: Integrations must work even when the "BeeYield" Supabase client lacks a session.
    // We therefore route reads/writes through FastAPI, authenticated via getAuthHeaders().
    async getIntegrationConfigs(): Promise<any[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/integrations/configs', undefined, { headers });
        } catch (e) {
            console.error('getIntegrationConfigs:', e);
            return [];
        }
    },

    async upsertIntegrationConfig(config: { platform: string; is_active: boolean; store_url?: string; kra_pin?: string; branch_code?: string; device_serial?: string; access_token?: string; config_json?: any }): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/integrations/config', {
                platform: config.platform,
                is_active: config.is_active,
                store_url: config.store_url,
                config_json: config.config_json,
            }, { headers });
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

    async getGateways(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('telemetry_gateways').select('*').order('last_ping', { ascending: false });
        if (error) { console.error('getGateways:', error); return []; }
        return data || [];
    },

    async createDevice(input: IoTDeviceCreateInput): Promise<{ data: IoTDevice | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('devices').insert(input).select().single();
        if (error) { console.error('createDevice:', error); toast.error('Failed to link device'); return { data: null, error }; }
        toast.success('Device linked successfully!');
        return { data: data as any, error: null };
    },

    async updateDevice(id: string, patch: IoTDeviceUpdateInput): Promise<{ data: IoTDevice | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const clean: any = { ...patch };
        // Avoid accidental empty strings for nullable foreign keys
        if (clean.hive_id === '') clean.hive_id = null;
        if (clean.apiary_id === '') clean.apiary_id = null;
        if (clean.linked_apiary_id === '') clean.linked_apiary_id = null;

        const { data, error } = await sb.from('devices').update(clean).eq('id', id).select().single();
        if (error) { console.error('updateDevice:', error); toast.error('Failed to update device'); return { data: null, error }; }
        toast.success('Device updated');
        return { data: data as any, error: null };
    },

    async deleteDevice(id: string): Promise<{ success: boolean; error: any }> {
        if (!sb) return { success: false, error: 'No client' };
        const { error } = await sb.from('devices').delete().eq('id', id);
        if (error) { console.error('deleteDevice:', error); toast.error('Failed to delete device'); return { success: false, error }; }
        toast.success('Device deleted');
        return { success: true, error: null };
    },

    // ========== DEVICE AUDIT LOGS ==========
    async getDeviceAuditLogs(deviceId: string, limit: number = 50): Promise<DeviceAuditLog[]> {
        if (!sb) return [];
        try {
            const { data, error } = await sb
                .from('device_audit_logs')
                .select('*')
                .eq('device_id', deviceId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                // Table may not exist in some deployments; fail gracefully.
                console.warn('getDeviceAuditLogs:', error);
                return [];
            }
            return (data || []) as any;
        } catch (e) {
            console.warn('getDeviceAuditLogs error:', e);
            return [];
        }
    },

    async logDeviceAuditEvent(input: { device_id: string; action: DeviceAuditAction; changes?: any }): Promise<void> {
        if (!sb) return;
        try {
            const { data: auth } = await sb.auth.getUser();
            const user = auth?.user;
            const payload: any = {
                device_id: input.device_id,
                action: input.action,
                changes: input.changes ?? null,
                created_at: new Date().toISOString(),
                user_id: user?.id || null,
                user_email: user?.email || null,
            };
            const { error } = await sb.from('device_audit_logs').insert(payload);
            if (error) {
                // Fail silently if audit log isn't configured yet.
                console.warn('logDeviceAuditEvent:', error);
            }
        } catch (e) {
            console.warn('logDeviceAuditEvent error:', e);
        }
    },

    async getDevicesByType(type: 'infield' | 'inland' | 'disease'): Promise<IoTDevice[]> {
        const devices = await this.getDevices();
        return devices.filter(d => d.device_type === type);
    },

    async getSensorReadings(type?: 'infield' | 'inland' | 'disease', hours: number = 24): Promise<SensorReading[]> {
        if (!sb) return [];
        const since = new Date(Date.now() - hours * 3600000).toISOString();
        const query = sb.from('sensor_readings').select('*').gte('recorded_at', since).order('recorded_at', { ascending: false });
        const { data, error } = await query;
        if (error) { console.error('getSensorReadings:', error); return []; }
        return (data || []) as any;
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
        if (!sb) return [];
        const { data, error } = await sb.from('hives').select('*').order('created_at', { ascending: false });
        if (error) { console.error('getClientHives:', error); return []; }
        return (data || []) as any;
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

    async getImpactStats(): Promise<any> {
        if (!sb) return null;
        const [apiaries, hives, harvests] = await Promise.all([
            sb.from('apiaries').select('id', { count: 'exact', head: true }),
            sb.from('hives').select('id', { count: 'exact', head: true }),
            sb.from('harvests').select('quantity_kg'),
        ]);
        const totalHoney = (harvests.data || []).reduce((s, h) => s + (h.quantity_kg || 0), 0);
        return { total_apiaries: apiaries.count || 0, total_hives: hives.count || 0, total_honey_kg: totalHoney };
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
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const payload: any = {
            id: user.id,
            updated_at: new Date().toISOString(),
            ...input,
        };

        const { data, error } = await sb
            .from('profiles')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('updateUserProfile:', error);
            toast.error('Failed to update profile');
            return { data: null, error };
        }

        toast.success('Profile updated');
        return { data, error: null };
    },

    // ========== APIARIES ==========
    async getApiaries(): Promise<Apiary[]> {
        if (!sb) {
            return _lsRead<Apiary[]>(LS_KEYS.apiaries, []);
        }
        const { data, error } = await sb.from('apiaries').select('*, farmer:farmers(*)').order('created_at', { ascending: false });
        if (error) { console.error('getApiaries:', error); return []; }
        return (data || []).map((a: any) => ({
                ...a,
            type: a.apiary_type || a.type || 'Permanent',
                forage_type: a.primary_forage || a.forage_type || ''
            })) as Apiary[];
    },

    async createApiary(input: any): Promise<{ data: Apiary | null; error: any }> {
        if (!sb) {
            const created: Apiary = {
                id: _uuid(),
                name: input?.name || 'New Apiary',
                type: input?.type || input?.apiary_type || 'Permanent',
                location_name: input?.location_name || null,
                region: input?.region || null,
                forage_type: input?.forage_type || '',
                expected_hives: input?.expected_hives,
                size_acres: input?.size_acres,
                notes: input?.notes,
                status: 'active',
                hive_count: 0,
                created_at: _nowIso(),
                updated_at: _nowIso(),
            } as any;
            _lsUpsert<Apiary>(LS_KEYS.apiaries, created);
            toast.success('Apiary deployed (local)');
            return { data: created, error: null };
        }
        const payload = {
                ...input,
            apiary_type: input.type || input.apiary_type || 'Permanent',
                primary_forage: input.forage_type || input.primary_forage,
        };
        delete payload.type;
        delete payload.forage_type;
        const { data, error } = await sb.from('apiaries').insert(payload).select('*, farmer:farmers(*)').single();
        if (error) { console.error('createApiary:', error); toast.error('Failed to create apiary'); return { data: null, error }; }
        const remapped = { ...data, type: data.apiary_type || 'Permanent', forage_type: data.primary_forage || '' };
            toast.success('Apiary deployed successfully!');
            return { data: remapped as Apiary, error: null };
    },

    async updateApiary(id: string, input: Partial<ApiaryCreateInput>): Promise<{ data: Apiary | null; error: any }> {
        if (!sb) {
            const list = _lsRead<Apiary[]>(LS_KEYS.apiaries, []);
            const existing = list.find((a) => a.id === id);
            if (!existing) return { data: null, error: 'Not found' };
            const updated = _lsUpsert<Apiary>(LS_KEYS.apiaries, { ...(existing as any), ...(input as any), id } as any);
            toast.success('Apiary updated (local)');
            return { data: updated, error: null };
        }
            const payload: any = { ...input };
        if (input.forage_type) { payload.primary_forage = input.forage_type; delete payload.forage_type; }
        if (input.type) { payload.apiary_type = input.type; delete payload.type; }
        const { data, error } = await sb.from('apiaries').update(payload).eq('id', id).select('*, farmer:farmers(*)').single();
        if (error) { console.error('updateApiary:', error); toast.error('Failed to update apiary'); return { data: null, error }; }
        const remapped = { ...data, type: data.apiary_type || 'Permanent', forage_type: data.primary_forage || '' };
            toast.success('Apiary updated!');
            return { data: remapped as Apiary, error: null };
    },

    async deleteApiary(id: string): Promise<{ error: any }> {
        if (!sb) {
            _lsDelete(LS_KEYS.apiaries, id);
            // Cascade delete local hives linked to this apiary
            const hives = _lsRead<any[]>(LS_KEYS.hives, []);
            _lsWrite(LS_KEYS.hives, hives.filter((h) => h?.apiary_id !== id));
            toast.success('Apiary removed (local)');
            return { error: null };
        }
        const { error } = await sb.from('apiaries').delete().eq('id', id);
        if (error) { console.error('deleteApiary:', error); toast.error('Failed to delete apiary'); return { error }; }
            toast.success('Apiary removed');
            return { error: null };
    },

    // ========== HIVES ==========
    async getHives(apiaryId?: string): Promise<Hive[]> {
        if (!sb) {
            const all = _lsRead<Hive[]>(LS_KEYS.hives, []);
            const filtered = apiaryId ? all.filter((h: any) => (h.apiary_id || h.apiary?.id) === apiaryId) : all;
            return filtered;
        }
        let query = sb.from('hives').select('*, apiary:apiaries(id, name)').order('created_at', { ascending: false });
        if (apiaryId) query = query.eq('apiary_id', apiaryId);
        const { data, error } = await query;
        if (error) { console.error('getHives:', error); return []; }
        return (data || []).map((h: any) => ({ ...h, apiary_name: h.apiary?.name })) as Hive[];
    },

    async createHive(input: HiveCreateInput): Promise<{ data: Hive | null; error: any }> {
        if (!sb) {
            const created: Hive = {
                id: _uuid(),
                apiary_id: input.apiary_id || null,
                hive_code: input.hive_code,
                hive_type: input.hive_type,
                bee_type: input.bee_type,
                frame_count: input.frame_count,
                material: input.material,
                status: input.status || 'active',
                installation_date: input.installation_date || new Date().toISOString().split('T')[0],
                has_sensors: input.has_sensors,
                notes: input.notes,
                created_at: _nowIso(),
                updated_at: _nowIso(),
            } as any;
            _lsUpsert<Hive>(LS_KEYS.hives, created);
            toast.success('Hive added (local)');
            return { data: created, error: null };
        }
        const payload = { ...input, installation_date: input.installation_date || new Date().toISOString().split('T')[0] };
        const { data, error } = await sb.from('hives').insert(payload).select().single();
        if (error) { console.error('createHive:', error); toast.error('Failed to create hive'); return { data: null, error }; }
            toast.success('Hive added successfully!');
        return { data: data as Hive, error: null };
    },

    async updateHive(id: string, input: Partial<HiveCreateInput>): Promise<{ data: Hive | null; error: any }> {
        if (!sb) {
            const list = _lsRead<Hive[]>(LS_KEYS.hives, []);
            const existing = list.find((h) => h.id === id);
            if (!existing) return { data: null, error: 'Not found' };
            const updated = _lsUpsert<Hive>(LS_KEYS.hives, { ...(existing as any), ...(input as any), id } as any);
            toast.success('Hive updated (local)');
            return { data: updated, error: null };
        }
        const { data, error } = await sb.from('hives').update(input).eq('id', id).select().single();
        if (error) { console.error('updateHive:', error); toast.error('Failed to update hive'); return { data: null, error }; }
            toast.success('Hive updated!');
        return { data: data as Hive, error: null };
    },

    async deleteHive(id: string): Promise<{ error: any }> {
        if (!sb) {
            _lsDelete(LS_KEYS.hives, id);
            toast.success('Hive removed (local)');
            return { error: null };
        }
        const { error } = await sb.from('hives').delete().eq('id', id);
        if (error) { console.error('deleteHive:', error); toast.error('Failed to delete hive'); return { error }; }
            toast.success('Hive removed');
            return { error: null };
    },

    // ========== HARVESTS ==========
    async getHarvests(filters?: { hive_id?: string; apiary_id?: string; farmer_id?: string; year?: number }): Promise<Harvest[]> {
        if (!sb) {
            let list = _lsRead<Harvest[]>(LS_KEYS.harvests, []);
            if (filters?.hive_id) list = list.filter((h: any) => (h.hive_id || h.hive?.id) === filters.hive_id);
            if (filters?.apiary_id) list = list.filter((h: any) => (h.apiary?.id || (h as any).apiary_id) === filters.apiary_id);
            if (filters?.year) list = list.filter((h) => new Date(h.harvest_date).getFullYear() === filters.year);
            return list;
        }
        // Backend writes `harvest_date` (not legacy `date`).
        let query = sb
            .from('harvests')
            .select('*, hive:hives(id, hive_code), farmer:farmers(id, name), apiary:apiaries(id, name)')
            .order('harvest_date', { ascending: false });
        if (filters?.hive_id) query = query.eq('hive_id', filters.hive_id);
        if (filters?.year) {
            const start = `${filters.year}-01-01`;
            const end = `${filters.year}-12-31`;
            query = query.gte('harvest_date', start).lte('harvest_date', end);
        }
        const { data, error } = await query;
        if (error) { console.error('getHarvests:', error); return []; }
        return (data || []).map((h: any) => ({
            ...h,
            // Keep compatibility if some old rows used `date`
            harvest_date: h.harvest_date || h.date,
            quantity_kg: h.quantity_kg,
        })) as Harvest[];
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

    async updateIoTSettings(settings: Partial<IoTSettings>): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };
        const { data, error } = await sb.from('user_settings').upsert({ user_id: user.id, ...settings }).select().single();
        if (error) { console.error('updateIoTSettings:', error); toast.error('Failed to update IoT settings'); return { data: null, error }; }
        toast.success('IoT settings updated');
        return { data, error: null };
    },

    // ========== CALCULATOR LOGS ==========
    async getCalculatorLogs(type?: string): Promise<CalculatorLog[]> {
        if (!sb) return [];
        let query = sb.from('calculator_logs').select('*').order('created_at', { ascending: false });
        if (type) query = query.eq('calculation_type', type);
        const { data, error } = await query;
        if (error) { console.error('getCalculatorLogs:', error); return []; }
        return (data || []) as CalculatorLog[];
    },

    async logCalculation(input: CalculatorLogCreateInput): Promise<{ data: CalculatorLog | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('calculator_logs').insert(input).select().single();
        if (error) { console.error('logCalculation:', error); toast.error('Failed to sync calculation'); return { data: null, error }; }
        toast.success('Calculation persisted to Cloud');
        return { data: data as CalculatorLog, error: null };
    },

    async logHarvestBatch(input: HarvestBatchInput): Promise<{ data: any | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const payload = {
            hive_id: input.hive_id,
            quantity_kg: input.quantity_kg,
            floral_source: input.florage_type,
            date: input.harvest_date || new Date().toISOString().split('T')[0],
            honey_type: input.honey_type,
            notes: input.notes,
        };
        const { data, error } = await sb.from('harvests').insert(payload).select().single();
        if (error) { console.error('logHarvestBatch:', error); toast.error('Failed to log batch'); return { data: null, error }; }

        // F5: Activity Log
        await this.logActivity({
            event_type: 'harvest_logged',
            entity_type: 'hive',
            entity_id: input.hive_id,
            title: 'Harvest recorded',
            subtitle: `${input.quantity_kg}kg harvested`,
            metadata: { value: `${input.quantity_kg}kg`, type: input.honey_type }
        });

        toast.success('Harvest recorded');
        return { data, error: null };
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

    async updateHarvest(id: string, input: Partial<HarvestCreateInput>): Promise<{ data: Harvest | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const payload: any = { ...input };
        if (input.harvest_date) { payload.date = input.harvest_date; delete payload.harvest_date; }
        if (input.quantity_kg) { payload.quantity_kg = input.quantity_kg; delete payload.quantity_kg; }
        if (input.nectar_source) { payload.floral_source = input.nectar_source; delete payload.nectar_source; }
        const { data, error } = await sb.from('harvests').update(payload).eq('id', id).select().single();
        if (error) { console.error('updateHarvest:', error); toast.error('Failed to update harvest'); return { data: null, error }; }
            toast.success('Harvest updated!');
        return { data: data as any, error: null };
    },

    async deleteHarvest(id: string): Promise<{ error: any }> {
        if (!sb) return { error: 'No client' };
        const { error } = await sb.from('harvests').delete().eq('id', id);
        if (error) { console.error('deleteHarvest:', error); toast.error('Failed to delete harvest'); return { error }; }
            toast.success('Harvest removed');
            return { error: null };
    },

    // ========== TASKS ==========
    async getTasks(): Promise<Task[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('tasks').select('*, apiary:apiaries(id, name), hive:hives(id, hive_code)').order('due_date', { ascending: true });
        if (error) { console.error('getTasks:', error); return []; }
        return (data || []) as Task[];
    },

    async createTask(task: TaskCreateInput): Promise<{ data: Task | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('tasks').insert(task).select().single();
        if (error) { console.error('createTask:', error); toast.error('Failed to create task'); return { data: null, error }; }

        // F5: Activity Log
        await this.logActivity({
            event_type: 'task_created',
            entity_type: 'task',
            entity_id: data.id,
            title: 'Task created',
            subtitle: `Task: ${task.title}`,
            metadata: { priority: task.priority }
        });

        toast.success('Task created successfully');
        return { data: data as Task, error: null };
    },

    async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<{ data: Task | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };

        // Fetch original task to check for recurrence
        const { data: original } = await sb.from('tasks').select('*').eq('id', id).single();

        const { data, error } = await sb.from('tasks').update(updates).eq('id', id).select().single();
        if (error) { console.error('updateTask:', error); toast.error('Failed to update task'); return { data: null, error }; }

        // F4: Task Automation & Recurrence Spawning
        const task = data as Task;
        if (task.status === 'completed' && task.is_recurring && task.recurrence_days && !task.has_spawned_next) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + task.recurrence_days);

            const nextTask: TaskCreateInput = {
                title: task.title,
                description: task.description,
                status: 'pending',
                priority: task.priority,
                type: task.type,
                category: task.category,
                due_date: dueDate.toISOString().split('T')[0],
                apiary_id: task.apiary_id,
                hive_id: task.hive_id,
                is_recurring: true,
                recurrence_days: task.recurrence_days,
                parent_task_id: task.id
            };

            const { error: spawnError } = await sb.from('tasks').insert(nextTask);
            if (!spawnError) {
                await sb.from('tasks').update({ has_spawned_next: true }).eq('id', task.id);
                toast.success('Next recurring task scheduled');
            }
        }

        // F5: Activity Log for Completion
        if (updates.status === 'completed') {
            await this.logActivity({
                event_type: 'task_completed',
                entity_type: 'task',
                entity_id: task.id,
                title: 'Task completed',
                subtitle: `Completed: ${task.title}`,
                metadata: { total_tasks: 1 }
            });
        }

        toast.success('Task updated');
        return { data: task, error: null };
    },

    async deleteTask(id: string): Promise<{ error: any }> {
        if (!sb) return { error: 'No client' };
        const { error } = await sb.from('tasks').delete().eq('id', id);
        if (error) { console.error('deleteTask:', error); toast.error('Failed to delete task'); return { error }; }
        toast.success('Task deleted');
        return { error: null };
    },

    // ========== INSPECTIONS ==========
    async getInspections(hiveId?: string): Promise<Inspection[]> {
        if (!sb) {
            const all = _lsRead<Inspection[]>(LS_KEYS.inspections, []);
            return hiveId ? all.filter((i: any) => i.hive_id === hiveId) : all;
        }
        // Supabase schema uses `inspection_date` (older code used `date`).
        // Ordering by a non-existent column causes PostgREST 400, so prefer `inspection_date`.
        let query = sb.from('inspections').select('*').order('inspection_date', { ascending: false });
        if (hiveId) query = query.eq('hive_id', hiveId);
        const { data, error } = await query;
        if (error) { console.error('getInspections:', error); return []; }
        return (data || []) as Inspection[];
    },

    async getInspectionById(id: string): Promise<Inspection | null> {
        if (!sb) return null;
        const { data, error } = await sb.from('inspections').select('*').eq('id', id).single();
        if (error) { console.error('getInspectionById:', error); return null; }
        return data ? (data as any) : null;
    },

    async createInspection(inspection: InspectionCreateInput): Promise<{ data: Inspection | null; error: any }> {
        if (!sb) {
            const local: Inspection = {
                id: _uuid(),
                hive_id: inspection.hive_id,
                inspection_date: inspection.inspection_date,
                inspector_name: inspection.inspector_name,
                findings: inspection.findings,
                actions_taken: inspection.actions_taken,
                health_status: inspection.health_status,
                temperament: inspection.temperament,
                honey_stores: inspection.honey_stores,
                pollen_stores: inspection.pollen_stores,
                brood_pattern: inspection.brood_pattern,
                eggs_seen: inspection.eggs_seen,
                queen_seen: inspection.queen_seen,
                queen_cells_seen: inspection.queen_cells_seen,
                varroa_mite_count: inspection.varroa_mite_count,
                small_hive_beetles_seen: inspection.small_hive_beetles_seen,
                weather_condition: inspection.weather_condition,
                temperature_celsius: inspection.temperature_celsius,
                notes: inspection.notes,
                created_at: _nowIso(),
                updated_at: _nowIso(),
            } as any;
            _lsUpsert<Inspection>(LS_KEYS.inspections, local);
            toast.success('Inspection saved (local)');
            return { data: local, error: null };
        }
        const payload: any = { ...inspection };
        const { data, error } = await sb.from('inspections').insert(payload).select().single();
        if (error) { console.error('createInspection:', error); toast.error('Failed to save inspection'); return { data: null, error }; }

        // F5: Activity Log
        await this.logActivity({
            event_type: 'inspection_completed',
            entity_type: 'hive',
            entity_id: inspection.hive_id,
            title: 'Site Check Completed',
            subtitle: `Unit #${inspection.hive_id.slice(0, 4)}: Health ${inspection.health_status}`,
            metadata: { status: inspection.health_status }
        });

        toast.success('Inspection saved successfully');
        return { data: data as any, error: null };
    },

    async updateInspection(id: string, updates: Partial<InspectionCreateInput>): Promise<{ data: Inspection | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const payload: any = { ...updates };
        const { data, error } = await sb.from('inspections').update(payload).eq('id', id).select().single();
        if (error) { console.error('updateInspection:', error); toast.error('Failed to update inspection'); return { data: null, error }; }
        toast.success('Inspection updated successfully');
        return { data: data as any, error: null };
    },

    async deleteInspection(id: string): Promise<{ error: any }> {
        if (!sb) return { error: 'No client' };
        const { error } = await sb.from('inspections').delete().eq('id', id);
        if (error) { console.error('deleteInspection:', error); toast.error('Failed to delete inspection'); return { error }; }
        toast.success('Inspection deleted');
        return { error: null };
    },

    // ========== SETTINGS ==========
    async getSettings(): Promise<UserSettings | null> {
        if (!sb) return null;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return null;
        const { data, error } = await sb.from('user_settings').select('*, notification_configs:notification_configs(*)').eq('user_id', user.id).single();
        if (error) { console.error('getSettings:', error); return null; }
        return data as any;
    },

    async updateSettings(settings: UserSettingsUpdate): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };
        const { data, error } = await sb.from('user_settings').upsert({ user_id: user.id, ...settings }).select().single();
        if (error) { console.error('updateSettings:', error); toast.error('Failed to update preferences'); return { data: null, error }; }
        toast.success('Preferences updated');
        return { data, error: null };
    },

    async updateNotificationConfig(eventType: string, config: NotificationConfigUpdate): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };
        const { data, error } = await sb.from('notification_configs').upsert({ user_id: user.id, event_type: eventType, ...config }).select().single();
        if (error) { console.error('updateNotificationConfig:', error); toast.error('Failed to update notification settings'); return { data: null, error }; }
        toast.success('Notification updated');
        return { data, error: null };
    },

    async updateHiveThresholds(hiveId: string, thresholds: { temp_high?: number; temp_low?: number; weight_drop?: number }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('hives').update({
            temp_threshold_high: thresholds.temp_high,
            temp_threshold_low: thresholds.temp_low,
            weight_drop_threshold: thresholds.weight_drop,
        }).eq('id', hiveId).select().single();
        if (error) { console.error('updateHiveThresholds:', error); toast.error('Failed to update hive thresholds'); return { data: null, error }; }
        toast.success('Hive thresholds updated');
        return { data, error: null };
    },

    async getHiveSettings(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('hives').select('id, hive_code, temp_threshold_high, temp_threshold_low, weight_drop_threshold');
        if (error) { console.error('getHiveSettings:', error); return []; }
        return (data || []) as any[];
    },

    async getFullSettings(): Promise<any> {
        const [settings, hiveSettings, notifSettings] = await Promise.all([
            this.getSettings(),
            this.getHiveSettings(),
            this.getNotificationSettings(),
        ]);
        return { ...settings, hive_settings: hiveSettings, notification_settings: notifSettings };
    },

    async getNotificationSettings(): Promise<UserNotificationSettings | null> {
        if (!sb) return null;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return null;
        const { data, error } = await sb.from('notification_configs').select('*').eq('user_id', user.id);
        if (error) { console.error('getNotificationSettings:', error); return null; }
        return data as any;
    },

    async updateNotificationSettings(settings: Partial<UserNotificationSettings>): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };
        const { data, error } = await sb.from('notification_configs').upsert({ user_id: user.id, ...settings }).select().single();
        if (error) { console.error('updateNotificationSettings:', error); return { data: null, error }; }
        return { data, error: null };
    },

    async getIoTSettings(): Promise<IoTSettings | null> {
        if (!sb) return null;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return null;
        const { data, error } = await sb.from('user_settings').select('*').eq('user_id', user.id).single();
        if (error) { console.error('getIoTSettings:', error); return null; }
        return data as any;
    },

    // ========== REQUESTS ==========
    async getRequests(): Promise<Request[]> {
        if (!sb) return _lsRead<Request[]>(LS_KEYS.requests, []);
        const { data, error } = await sb.from('requests').select('*').order('created_at', { ascending: false });
        if (error) { console.error('getRequests:', error); return []; }
        return (data || []) as Request[];
    },

    async createRequest(input: RequestCreateInput): Promise<{ data: Request | null; error: any }> {
        if (!sb) {
            const local: Request = {
                id: _uuid(),
                user_id: 'local',
                subject: input.subject,
                description: input.description,
                status: 'new',
                priority: (input.priority as any) || 'medium',
                type: (input.type as any) || 'support',
                apiary_id: input.apiary_id,
                hive_id: input.hive_id,
                category: input.category,
                created_at: _nowIso(),
                updated_at: _nowIso(),
            };
            _lsUpsert<Request>(LS_KEYS.requests, local);
            toast.success('Request submitted (local)');
            return { data: local, error: null };
        }
        const { data, error } = await sb.from('requests').insert(input).select().single();
        if (error) { console.error('createRequest:', error); toast.error('Failed to submit request'); return { data: null, error }; }
        toast.success('Request submitted successfully');
        return { data: data as Request, error: null };
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

    // ========== ACTIVITY LOGS ==========
    async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) { console.error('getActivityLogs error:', error); return []; }
        return (data || []) as ActivityLog[];
    },

    async logActivity(input: Partial<ActivityLog>): Promise<void> {
        if (!sb) return;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;

        await sb.from('activity_logs').insert({
            user_id: user.id,
            event_type: input.event_type || 'system',
            title: input.title || 'Activity Logged',
            subtitle: input.subtitle,
            entity_type: input.entity_type,
            entity_id: input.entity_id,
            metadata: input.metadata
        });
    },

    // ========== SENSOR ALERTS ==========
    async getSensorAlerts(resolved = false, limit = 50): Promise<SensorAlert[]> {
        if (!sb) return [];
        let query = sb.from('sensor_alerts').select('*').order('created_at', { ascending: false }).limit(limit);
        if (resolved !== undefined) query = query.eq('resolved', resolved);
        const { data, error } = await query;
        if (error) { console.error('getSensorAlerts error:', error); return []; }
        return (data || []) as SensorAlert[];
    },

    async resolveSensorAlert(alertId: string, notes?: string): Promise<{ success: boolean; error: any }> {
        if (!sb) return { success: false, error: 'No client' };
        const { error } = await sb.from('sensor_alerts').update({
            resolved: true,
            resolved_at: new Date().toISOString(),
            metadata: { resolution_notes: notes }
        }).eq('id', alertId);

        if (error) {
            console.error('resolveSensorAlert error:', error);
            return { success: false, error };
        }

        // F5: Activity Log
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
    },

    // ========== PRECISION POLLINATION ==========
    async optimizePollinationPlacement(inputs: {
        orchard_geojson: any;
        hive_count: number;
        target_crop: string;
        bee_flight_radius_km: number;
        ahp_weights?: any;
    }): Promise<any[]> {
        if (!sb) return [];

        // F2: Real-time Calculation Service
        try {
            // Call Supabase Edge Function for the Spatial Genetic Algorithm
            const { data, error } = await sb.functions.invoke('calculate-pollination', {
                body: inputs
            });

            if (error) {
                console.warn('Pollination Edge Function fallback used', error);
                // Fallback deterministic mock for UI continuity if function not deployed
                return Array(inputs.hive_count).fill(null).map((_, i) => ({
                    id: `opt-${i}`,
                    lat: -1.285 + (Math.random() - 0.5) * 0.01,
                    lng: 36.825 + (Math.random() - 0.5) * 0.01,
                    score: 0.85 + Math.random() * 0.1,
                    radius: inputs.bee_flight_radius_km
                }));
            }

            // F5: Activity Log
            await this.logActivity({
                event_type: 'pollination_optimized',
                entity_type: 'orchard',
                title: 'Pollination Strategy Generated',
                subtitle: `${inputs.hive_count} units optimized for ${inputs.target_crop}`,
                metadata: { hive_count: inputs.hive_count, crop: inputs.target_crop }
            });

            return data;
        } catch (err) {
            console.error('optimizePollinationPlacement error:', err);
            return [];
        }
    },

    async getPollinationDeployments(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('pollination_deployments').select('*, hive:hives(*), contract:pollination_contracts(*)').order('created_at', { ascending: false });
        if (error) { console.error('getPollinationDeployments:', error); return []; }
        return data || [];
    },

    async getPollinationContractAnalytics(): Promise<PollinationAnalytics | null> {
        if (!sb) return null;
        // Aggregation logic for the precision dashboard
        const { data: contracts } = await sb.from('pollination_contracts').select('*');
        const { data: deployments } = await sb.from('pollination_deployments').select('*');

        if (!contracts) return null;

        return {
            total_contracts: contracts.length,
            active_contracts: contracts.filter(c => c.status === 'active').length,
            total_hives_deployed: deployments?.length || 0,
            total_acres_covered: contracts.reduce((s, c) => s + (c.farm_size_acres || 0), 0),
            average_fpa: 0,
            coverage_health_percent: 0,
            healthy_hives: deployments?.length || 0,
            warning_hives: 0,
            critical_hives: 0,
            total_revenue: contracts.reduce((s, c) => s + (c.payment_amount || 0), 0)
        };
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
        if (!sb) return [];
        const since = new Date(Date.now() - days * 86400000).toISOString();
        let query = sb.from('sensor_readings').select('*').gte('recorded_at', since).order('recorded_at', { ascending: false });
        if (hiveId) query = query.eq('hive_id', hiveId);
        const { data, error } = await query;
        if (error) { console.error('getAcousticReadings:', error); return []; }
        return (data || []) as any[];
    },

    async createAcousticReading(input: {
        hive_id: string;
        frequency_hz: number;
        amplitude_db?: number;
        health_index?: number;
        spectral_profile?: any;
        tags?: string[];
    }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('sensor_readings').insert(input).select().single();
        if (error) { console.error('createAcousticReading:', error); return { data: null, error }; }
        return { data, error: null };
    },

    // ========== VARROA READINGS & TREATMENTS ==========
    async getVarroaReadings(hiveId?: string): Promise<any[]> {
        if (!sb) return [];
        let query = sb.from('disease_detections').select('*').order('detected_at', { ascending: false });
        if (hiveId) query = query.eq('hive_id', hiveId);
        const { data, error } = await query;
        if (error) { console.error('getVarroaReadings:', error); return []; }
        return (data || []) as any[];
    },

    async createVarroaReading(input: {
        hive_id: string;
        reading_date: string;
        method?: string;
        mite_count: number;
        sample_size?: number;
        inspector_name?: string;
        notes?: string;
    }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('disease_detections').insert({
            hive_id: input.hive_id,
            disease_type: 'varroa',
            detection_method: input.method || 'manual',
            severity: input.mite_count > 3 ? 'high' : input.mite_count > 1 ? 'medium' : 'low',
            notes: input.notes,
        }).select().single();
        if (error) { console.error('createVarroaReading:', error); toast.error('Failed to record varroa reading'); return { data: null, error }; }
        toast.success('Varroa reading recorded');
        return { data, error: null };
    },

    async getVarroaTreatments(hiveId?: string): Promise<any[]> {
        if (!sb) return [];
        let query = sb.from('inspections').select('*').eq('health_status', 'treated').order('inspection_date', { ascending: false });
        if (hiveId) query = query.eq('hive_id', hiveId);
        const { data, error } = await query;
        if (error) { console.error('getVarroaTreatments:', error); return []; }
        return (data || []) as any[];
    },

    async createVarroaTreatment(input: {
        hive_id: string;
        treatment_type: string;
        start_date: string;
        end_date?: string;
        dosage?: string;
        effectiveness_percent?: number;
        notes?: string;
    }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('inspections').insert({
            hive_id: input.hive_id,
            inspection_date: input.start_date,
            health_status: 'treated',
            actions_taken: `${input.treatment_type} - ${input.dosage || 'standard'}`,
            notes: input.notes,
        }).select().single();
        if (error) { console.error('createVarroaTreatment:', error); toast.error('Failed to record treatment'); return { data: null, error }; }
        toast.success('Treatment recorded');
        return { data, error: null };
    },

    // ========== BILLING & SUBSCRIPTIONS ==========
    async getBillingOverview(): Promise<any> {
        if (!sb) return null;
        const { data: txs } = await sb.from('billing_ledger').select('amount, transaction_type');
        const revenue = txs?.filter(t => t.transaction_type === 'income').reduce((s, t) => s + (t.amount || 0), 0) || 0;
        const costs = txs?.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + (t.amount || 0), 0) || 0;

        return {
            total_revenue: revenue,
            total_costs: costs,
            net_result: revenue - costs,
            outstanding_invoices: 0 // Logic for outstanding would go here
        };
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

    async getTransactions(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('billing_ledger').select('*').order('date', { ascending: false }).limit(50);
        if (error) { console.error('getTransactions:', error); return []; }
        return (data || []).map((t: any) => ({
            ...t,
            type: t.transaction_type, // Map for UI expectation
            category: t.module_type,
            status: t.etims_status === 'synced' ? 'completed' : 'pending',
            etims_qr_url: t.metadata?.etims_qr_url || null
        }));
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
        if (!sb) return { data: null, error: 'No client' };

        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const { data, error } = await sb.from('billing_ledger').insert({
            user_id: user.id,
            transaction_type: input.type,
            module_type: input.category,
            description: input.description,
            amount: input.amount,
            currency: input.currency,
            date: input.date,
            etims_status: 'pending'
        }).select().single();

        if (error) { console.error('createTransaction:', error); return { data: null, error }; }

        // F5: Activity Log
        await this.logActivity({
            event_type: 'transaction_created',
            entity_type: 'transaction',
            entity_id: data.id,
            title: input.type === 'income' ? 'Revenue Captured' : 'Expense Recorded',
            subtitle: `${input.currency} ${input.amount.toLocaleString()} — ${input.category}`,
            metadata: { amount: input.amount, type: input.type }
        });

        return { data, error: null };
    },

    async deleteTransaction(id: string): Promise<{ success: boolean; error: any }> {
        if (!sb) return { success: false, error: 'No client' };

        // F1: Compliance Guard
        const { data: tx } = await sb.from('billing_ledger').select('etims_status').eq('id', id).single();
        if (tx?.etims_status === 'synced') {
            const err = 'Cannot delete tax-synced transactions due to eTIMS compliance regulations.';
            toast.error(err);
            return { success: false, error: err };
        }

        const { error } = await sb.from('billing_ledger').delete().eq('id', id);
        if (error) {
            console.error('deleteTransaction:', error);
            toast.error('Failed to remove transaction');
            return { success: false, error };
        }

        // F5: Activity Log
        await this.logActivity({
            event_type: 'transaction_deleted',
            entity_type: 'transaction',
            entity_id: id,
            title: 'Financial Ledger Corrected',
            subtitle: `Transaction #${id.slice(0, 8)} removed from records.`,
        });

        toast.success('Transaction removed');
        return { success: true, error: null };
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
        if (!sb) return [];

        // In a real production SQL, we would use a RPC or specialized view
        // For now, we fetch and aggregate locally to ensure stability with standard PostgREST
        const { data, error } = await sb.from('billing_ledger').select('*');
        if (error) { console.error('getFinancialAggregate:', error); return []; }

        const txs = data || [];

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
    async getBluetoothDevices(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('bluetooth_devices').select('*').order('last_seen', { ascending: false });
        if (error) { console.error('getBluetoothDevices:', error); return []; }
        return (data || []) as any[];
    },

    async registerBluetoothDevice(input: any): Promise<any> {
        if (!sb) return null;
        const { data, error } = await sb.from('bluetooth_devices').insert(input).select().single();
        if (error) { console.error('registerBluetoothDevice:', error); toast.error('Failed to register device'); return null; }
        toast.success('Bluetooth device registered');
        return data;
    },

    async uploadBluetoothReadings(readings: any[]): Promise<any> {
        if (!sb) throw new Error('No client');
        const { data, error } = await sb.from('sensor_readings_buffer').insert(readings).select();
        if (error) { console.error('uploadBluetoothReadings:', error); throw error; }
        return data;
    },

    // ========== ACTIVITY FEED ==========
    async getActivityLogs2(limit = 10): Promise<ActivityLog[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (error) { console.error('getActivityLogs:', error); return []; }
        return (data || []) as ActivityLog[];
    },

    async logActivity2(input: Partial<ActivityLog>): Promise<{ data: ActivityLog | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const payload = {
            user_id: user.id,
            ...input,
            created_at: new Date().toISOString()
        };

        const { data, error } = await sb.from('activity_logs').insert(payload).select().single();
        return { data: data as ActivityLog, error };
    },

    // ========== ACCOUNT & DEVICES ==========
    async getIotDevices(): Promise<any[]> {
        return this.getDevices();
    },

    // ========== USB DEVICE PAIRING ==========
    async getPairedUsbDevices(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('devices').select('*').eq('connection_type', 'usb');
        if (error) { console.error('getPairedUsbDevices:', error); return []; }
        return (data || []) as any[];
    },

    async pairUsbDevice(input: {
        device_uid: string;
        device_type?: string;
        serial_number?: string;
        firmware_version?: string;
        config?: any;
    }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('devices').insert({
            serial_number: input.serial_number || input.device_uid,
            device_type: input.device_type || 'usb',
            firmware_version: input.firmware_version,
            connection_type: 'usb',
            status: 'online',
        }).select().single();
        if (error) { console.error('pairUsbDevice:', error); toast.error('Failed to pair device'); return { data: null, error }; }
        toast.success('Device paired successfully');
            return { data, error: null };
    },

    async unpairUsbDevice(id: string): Promise<{ error: any }> {
        if (!sb) return { error: 'No client' };
        const { error } = await sb.from('devices').delete().eq('serial_number', id);
        if (error) { console.error('unpairUsbDevice:', error); toast.error('Failed to unpair device'); return { error }; }
        toast.success('Device unpaired');
            return { error: null };
    },

    // ========== SENSOR CALIBRATION ==========
    async tareSensor(deviceId: string): Promise<{ success: boolean; error?: any }> {
        if (!sb) return { success: false, error: 'No client' };

        const { data: latestReading } = await sb
            .from('sensor_readings')
            .select('weight_kg')
            .eq('device_id', deviceId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

        const offset = latestReading?.weight_kg || 0;

        const { error } = await sb
            .from('infrastructure_registry')
            .update({ calibration_offset: -offset, updated_at: new Date().toISOString() })
            .eq('serial_number', deviceId);

        if (error) {
            console.error('tareSensor error:', error);
            return { success: false, error };
        }

        toast.success(`Sensor ${deviceId} tared to 0.00kg`);
        return { success: true };
    },

    async setOffsetCorrection(deviceId: string, offsetValue: number): Promise<{ success: boolean; error?: any }> {
        if (!sb) return { success: false, error: 'No client' };

        const { error } = await sb
            .from('infrastructure_registry')
            .update({ calibration_offset: offsetValue, updated_at: new Date().toISOString() })
            .eq('serial_number', deviceId);

        if (error) {
            console.error('setOffsetCorrection error:', error);
            return { success: false, error };
        }

        toast.success(`Calibration offset set to ${offsetValue}kg`);
        return { success: true };
    },

    // ========== PRECISION POLLINATION ==========
    async getPollinationDeployments2(): Promise<any[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('pollination_deployments').select('*').order('created_at', { ascending: false });
        if (error) { console.error('getPollinationDeployments:', error); return []; }
        return data || [];
    },

    async getCropRequirements(cropName?: string): Promise<CropPollinationRequirement[]> {
        return apiGet<CropPollinationRequirement[]>('/pollination/crops', { crop_name: cropName });
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
    }): Promise<any[]> {
        return apiPost<any[]>('/pollination/optimize', input);
    },

    async getPollinationDashboard(): Promise<any> {
        return apiGet<any>('/pollination/dashboard');
    },

    async createPollinationContract(contract: any): Promise<any> {
        if (!sb) return { error: 'No client' };
        const { data, error } = await sb.from('pollination_contracts').insert(contract).select().single();
        if (error) { console.error('createPollinationContract:', error); return { error }; }
        toast.success('Pollination contract created');
        return data;
    },

    async getPollinationContracts(): Promise<PollinationContract[]> {
        if (!sb) return [];
        const { data, error } = await sb.from('pollination_contracts').select('*').order('created_at', { ascending: false });
        if (error) { console.error('getPollinationContracts:', error); return []; }
        return (data || []) as PollinationContract[];
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
        if (!sb) return [];
        const { data, error } = await sb.from('tasks').select('*').eq('category', 'pollination').order('created_at', { ascending: false }).limit(20);
        if (error) { console.error('getPollinationActivityLogs:', error); return []; }
        return (data || []) as any[];
    },

    async savePollinationDeployment(input: any): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const { data, error } = await sb.from('pollination_deployments').insert({
            user_id: user.id,
            ...input
        }).select().single();

        if (error) { console.error('savePollinationDeployment:', error); return { data: null, error }; }
        toast.success('Pollination deployment saved');
        return { data, error: null };
    },

    async logExport(payload: { export_type: string; entity_scope: string; file_name: string; record_count: number }): Promise<void> {
        if (!sb) return;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;

        await sb.from('export_audit_logs').insert({
            user_id: user.id,
            ...payload
        });
    },

    // ========== API USAGE / SERVER STATUS ==========
    async getApiUsageStats(_days: number = 30): Promise<any> {
        // No dedicated table — return stub
        return { total_requests: 0, avg_latency_ms: 45, uptime_percent: 99.9, last_checked: new Date().toISOString() };
    },

    // ========== SATELLITE / AGRO INTELLIGENCE ==========
    async getSatelliteIndices(apiaryId?: string, days: number = 90): Promise<any[]> {
        if (!sb) return [];
        const since = new Date(Date.now() - days * 86400000).toISOString();
        let query = sb.from('land_readings').select('*').gte('recorded_at', since).order('recorded_at', { ascending: false });
        if (apiaryId) query = query.eq('apiary_id', apiaryId);
        const { data, error } = await query;
        if (error) { console.error('getSatelliteIndices:', error); return []; }
        return (data || []) as any[];
    },

    async getWeatherHistory(apiaryId?: string, days: number = 30): Promise<any[]> {
        if (!sb) return [];
        const since = new Date(Date.now() - days * 86400000).toISOString();
        const query = sb.from('sensor_readings').select('temp_external, humidity_external, recorded_at, hive_id').gte('recorded_at', since).order('recorded_at', { ascending: false });
        const { data, error } = await query;
        if (error) { console.error('getWeatherHistory:', error); return []; }
        return (data || []) as any[];
    },

    // ========== FORAGE ZONES (Flight Map) ==========
    async getForageZones(apiaryId?: string): Promise<any[]> {
        if (!sb) return [];
        let query = sb.from('land_readings').select('*').order('recorded_at', { ascending: false });
        if (apiaryId) query = query.eq('apiary_id', apiaryId);
        const { data, error } = await query;
        if (error) { console.error('getForageZones:', error); return []; }
        return (data || []) as any[];
    },

    async createForageZone(input: {
        apiary_id: string;
        zone_name?: string;
        flora_type?: string;
        radius_km?: number;
        density_score?: number;
        season?: string;
        geojson?: any;
        notes?: string;
    }): Promise<{ data: any; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data, error } = await sb.from('land_readings').insert({
            apiary_id: input.apiary_id,
            ndvi: input.density_score,
            soil_moisture: 0,
            notes: `${input.zone_name || ''} - ${input.flora_type || ''} - ${input.notes || ''}`,
        }).select().single();
        if (error) { console.error('createForageZone:', error); toast.error('Failed to add forage zone'); return { data: null, error }; }
        toast.success('Forage zone added');
            return { data, error: null };
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

    // ========== NOTES ==========
    async getNotes(): Promise<Note[]> {
        if (!sb) return _lsRead<Note[]>(LS_KEYS.notes, []);
        const { data: { user } } = await sb.auth.getUser();
        // If not authenticated, return empty to avoid leaking cross-user notes in shared environments.
        if (!user) return [];

        const { data, error } = await sb
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) { console.error('getNotes:', error); return []; }
        return (data || []) as Note[];
    },

    async createNote(input: NoteCreateInput): Promise<{ data: Note | null; error: any }> {
        if (!sb) {
            const local: Note = {
                id: _uuid(),
                user_id: 'local',
                apiary_id: input.apiary_id,
                hive_id: input.hive_id,
                title: input.title,
                content: input.content,
                category: input.category,
                priority: (input.priority as any) || 'medium',
                note_date: input.note_date || new Date().toISOString().split('T')[0],
                created_at: _nowIso(),
                updated_at: _nowIso(),
            };
            _lsUpsert<Note>(LS_KEYS.notes, local);
            toast.success('Note added (local)');
            return { data: local, error: null };
        }
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
            const err = 'Not authenticated';
            toast.error(err);
            return { data: null, error: err };
        }

        const { data, error } = await sb
            .from('notes')
            .insert({ ...input, user_id: user.id })
            .select()
            .single();
        if (error) { console.error('createNote:', error); toast.error('Failed to create note'); return { data: null, error }; }
        toast.success('Note added successfully');
        return { data: data as Note, error: null };
    },

    async updateNote(id: string, updates: Partial<NoteCreateInput>): Promise<{ data: Note | null; error: any }> {
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const { data, error } = await sb
            .from('notes')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();
        if (error) { console.error('updateNote:', error); toast.error('Failed to update note'); return { data: null, error }; }
            toast.success('Note updated');
        return { data: data as Note, error: null };
    },

    async deleteNote(id: string): Promise<{ error: any }> {
        if (!sb) return { error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        const { error } = await sb.from('notes').delete().eq('id', id).eq('user_id', user.id);
        if (error) { console.error('deleteNote:', error); toast.error('Failed to delete note'); return { error }; }
        toast.success('Note deleted');
            return { error: null };
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

            // Persist to Health Audit Logs
            if (sb && payload.hiveId) {
                const { data: { user } } = await sb.auth.getUser();
                if (user) {
                    await sb.from('health_audit_logs').insert({
                        user_id: user.id,
                        hive_id: payload.hiveId,
                        analysis_type: 'vision',
                        mite_count: result.bee_count, // legacy mapping
                        brood_coverage_pct: result.health_score,
                        spectral_classification: result.health_status,
                        confidence_score: result.confidence,
                        result_json: result.raw
                    });
                }
            }
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

            // Persist to Health Audit Logs
            if (sb && payload.hiveId) {
                const { data: { user } } = await sb.auth.getUser();
                if (user) {
                    await sb.from('health_audit_logs').insert({
                        user_id: user.id,
                        hive_id: payload.hiveId,
                        analysis_type: 'acoustic',
                        spectral_classification: result.prediction,
                        confidence_score: result.probability,
                        result_json: result.raw
                    });
                }
            }
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
        if (!sb) return { data: null, error: 'No client' };
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
        return { data, error };
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
        if (!sb) return [];
        const { data, error } = await sb.from('infrastructure_registry').select('*').order('created_at', { ascending: false });
        if (error) { console.error('getInfrastructureRegisters:', error); return []; }
        return data || [];
    },

    async logIntegrationAudit(platform: string, eventType: string, status: string, metrics: any): Promise<void> {
        if (!sb) return;
        await sb.rpc('log_integration_event', {
            p_platform: platform,
            p_event_type: eventType,
            p_status: status,
            p_metrics: metrics
        });
    },

    async getIntegrationAuditLogs(platform: string, limit: number = 25): Promise<any[]> {
        if (!sb) return [];
        try {
            // Primary: if a view/table exists, read it.
            const { data, error } = await sb
                .from('integration_audit_logs')
                .select('*')
                .eq('platform', platform)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (!error) return data || [];
        } catch {
            // ignore and fall through to RPC
        }

        // Fallback: if only RPC exists (log_integration_event), try a paired fetch RPC.
        try {
            const { data, error } = await sb.rpc('get_integration_events', {
                p_platform: platform,
                p_limit: limit
            });
            if (error) return [];
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    },

    // ========== FLIGHT & ROUTING (PRD v2) ==========
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

    // Bluetooth Methods
    async getBluetoothDevices(): Promise<any[]> {
        return _lsRead('beeyield_bluetooth_devices_v1', []);
    },

    async registerBluetoothDevice(deviceData: any): Promise<any> {
        return _lsUpsert('beeyield_bluetooth_devices_v1', {
            ...deviceData,
            id: deviceData.id || _uuid(),
        });
    },

    async syncBluetoothReadings(payload: { readings: any[] }): Promise<any> {
        // Log locally for demo/fallback
        const list = _lsRead('beeyield_bluetooth_readings_v1', []);
        const next = [...payload.readings, ...list].slice(0, 100);
        _lsWrite('beeyield_bluetooth_readings_v1', next);
        return { ok: true, count: payload.readings.length };
    }
};

export default beeyieldService;
