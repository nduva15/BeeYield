import { supabase } from '@/lib/supabase';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './api';
import { toast } from 'sonner';

// Memory cache for auth session to avoid redundant calls
let cachedSession: { access_token: string } | null = null;
let lastSessionFetch = 0;
const SESSION_CACHE_TTL = 30000; // 30 seconds

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!supabase) return {};

    const now = Date.now();
    // Cache for 60 seconds for performance
    if (cachedSession && (now - lastSessionFetch < 60000)) {
        return { Authorization: `Bearer ${cachedSession.access_token}` };
    }

    try {
        // Use a 5s timeout to prevent hanging while allowing for initial cold-start latency
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: { access_token: string } } };
        const session = result?.data?.session;

        if (session) {
            cachedSession = session;
            lastSessionFetch = now;
            return { Authorization: `Bearer ${session.access_token}` };
        }
    } catch (error) {
        console.warn('Auth headers fetch failed, using cache if available:', error);
    }

    // Return cached session as fallback if auth check fails/times out
    if (cachedSession) {
        return { Authorization: `Bearer ${cachedSession.access_token}` };
    }

    return {};
};

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
    colony_health_score: number;
    pest_detection: string;
    treatment_status: string;
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
    hive_id?: string;
    linked_apiary_id?: string;
}

export interface SensorReading {
    id: string;
    device_id: string;
    hive_id?: string; // Links back to hive
    hive_code?: string;
    sensor_type: 'infield' | 'inland' | 'disease';
    timestamp: string;
    status: string;
    readings: InfieldReadings | InlandReadings | DiseaseReadings;
    // Flat accessors for UI convenience
    temperature?: number;
    humidity?: number;
    weight?: number;
    battery_level?: number;
    is_simulated?: boolean;
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
    user_id?: string; // Optional since it may not exist in schema
    farmer_id?: string | null;
    name: string;
    type?: string; // permanent, migratory, breeding, quarantine
    status?: string | null;
    location_name?: string | null;
    county?: string | null;
    region?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    forage_type?: string;
    expected_hives?: number;
    size_acres?: number; // Added for coverage calculation
    notes?: string;
    created_at?: string;
    updated_at?: string;
    // Joined from farmer
    farmer?: Farmer | null;
    // Computed
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
    sun_exposure?: string;
}

// ========== HIVE TYPES ==========
export interface Hive {
    id: string;
    apiary_id?: string | null;
    farmer_id?: string | null;
    hive_code: string;
    hive_type?: string; // Langstroth, Traditional Log, etc.
    bee_type?: string;
    frame_count?: number;
    material?: string;
    status?: string;
    installation_date?: string;
    has_sensors?: boolean;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    // Joined
    apiary?: Apiary | null;
    farmer?: Farmer | null;
    // From sensor_readings (computed)
    latest_temp?: number;
    latest_humidity?: number;
    latest_weight?: number;
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
    queen_hatched?: string;
    strength?: number;
}

// ========== HARVEST TYPES (Core Traceability Data) ==========
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
    is_verified?: boolean; // HoneyChain™ sealed
    blockchain_hash?: string;
    created_at?: string;
    updated_at?: string;
    // Full linked data - THIS IS THE KEY FOR "everything synced"
    hive?: Hive | null;
    farmer?: Farmer | null;
    apiary?: Apiary | null;
}

export interface HarvestCreateInput {
    hive_id?: string;
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
}

// ========== TASK TYPES ==========
export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed' | 'in_progress';
    priority: 'Low' | 'Medium' | 'High';
    type: 'Inspection' | 'Feeding' | 'Harvest' | 'Treatment' | 'Other';
    category?: string;
    due_date?: string;
    completed_at?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed: boolean;
    recurrence?: string;
    created_at?: string;
    updated_at?: string;
    // Relationships
    apiary?: Apiary;
    hive?: Hive;
}

export interface TaskCreateInput {
    title: string;
    description?: string;
    status?: 'pending' | 'completed' | 'in_progress';
    priority?: 'Low' | 'Medium' | 'High';
    type?: 'Inspection' | 'Feeding' | 'Harvest' | 'Treatment' | 'Other';
    category?: string;
    due_date?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed?: boolean;
    recurrence?: string;
}

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

export interface UserNotificationSettings {
    user_id: string;
    email_alerts_enabled: boolean;
    sms_alerts_enabled: boolean;
    push_notifications_enabled: boolean;
    notify_on_swarm: boolean;
    notify_on_low_battery: boolean;
    notify_on_theft: boolean;
}

export interface IoTSettings {
    user_id: string;
    temp_min_threshold: number;
    temp_max_threshold: number;
    weight_drop_alert_kg: number;
    humidity_min_threshold: number;
    humidity_max_threshold: number;
}

export interface NotificationConfigUpdate {
    email_enabled?: boolean;
    push_enabled?: boolean;
    sms_enabled?: boolean;
}

export interface InteractionPayload {
    name: string;
    email: string;
    message: string;
    subject?: string;
}

// ========== NOTE TYPES ==========
export interface Note {
    id: string;
    user_id: string;
    apiary_id?: string;
    hive_id?: string;
    title?: string;
    content?: string;
    description?: string; // For compatibility
    category?: string;
    priority?: string;
    note_date?: string;
    note_time?: string;
    created_at: string;
    updated_at: string;
    // UI convenience
    place_name?: string;
    hive_code?: string;
}

export interface NoteCreateInput {
    title?: string;
    content?: string;
    description?: string;
    category?: string;
    priority?: string;
    hive_id?: string;
    apiary_id?: string;
    note_date?: string;
    note_time?: string;
}

// ========== SUPPORT REQUEST TYPES ==========
export interface SupportRequest {
    id: string;
    reference_id: string;
    user_id: string;
    subject: string;
    description: string;
    category: 'Hardware' | 'Software' | 'Traceability' | 'General';
    status: string;
    priority: string;
    hive_id?: string;
    created_at: string;
    updated_at: string;
}

export interface SupportRequestCreate {
    subject: string;
    description: string;
    category: string;
    priority: string;
    status?: string;
    hive_id?: string;
}

export interface RequestComment {
    id: string;
    request_id: string;
    user_id: string;
    comment_text: string;
    is_internal: boolean;
    created_at: string;
}

export interface HiveAlertSettingsView {
    hive_id: string;
    hive_name?: string;
    hive_code?: string;
    user_id: string;
    threshold_id?: string;
    override_temp_high?: number;
    override_temp_low?: number;
    override_weight_drop?: number;
    global_temp_high?: number;
    global_temp_low?: number;
    global_weight_drop?: number;
    effective_temp_high?: number;
    effective_temp_low?: number;
    effective_weight_drop?: number;
}

// ========== IMAGE ANALYSIS TYPES ==========

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BeeDetection {
    id: number;
    label: string;
    confidence: number;
    health?: string;
    health_confidence?: number;
    bbox: BoundingBox;
}

export interface DiseaseIndicator {
    disease: string;
    probability: number;
    affected_bees: number[];
    severity: string;
}

export interface AnalysisResults {
    bee_count: number;
    health_status: string;
    health_score: number;
    confidence: number;
    detections: BeeDetection[];
    disease_indicators: DiseaseIndicator[];
    recommendations: string[];
}

export interface ImageAnalysisResponse {
    success: boolean;
    analysis_id: string;
    status: string;
    results: AnalysisResults;
    image_url?: string;
    annotated_image_url?: string;
    created_at: string;
    processing_time_ms: number;
}

export interface AnalysisHistoryItem {
    id: string;
    thumbnail_url?: string;
    bee_count: number;
    health_score: number;
    health_status: string;
    created_at?: string;
    hive_id?: string;
    apiary_id?: string;
}

export interface AnalysisHistoryResponse {
    items: AnalysisHistoryItem[];
    total: number;
}

export interface HealthTrendPoint {
    date?: string;
    health_score: number;
    bee_count: number;
    health_status?: string;
}

export interface HealthTrendsResponse {
    hive_id: string;
    trends: HealthTrendPoint[];
    average_score?: number;
    total_analyses: number;
}


// Data for BeeYield service is fetched directly from the backend API.

export const beeyieldService = {
    // Get all IoT devices
    async getDevices(): Promise<IoTDevice[]> {
        try {
            const headers = await getAuthHeaders();
            const devices = await apiGet<IoTDevice[]>('/iot/devices', {}, { headers });
            return devices;
        } catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    },

    // Get devices by type
    async getDevicesByType(type: 'infield' | 'inland' | 'disease'): Promise<IoTDevice[]> {
        const devices = await this.getDevices();
        return devices.filter(d => d.device_type === type);
    },

    // Get sensor readings
    async getSensorReadings(
        type?: 'infield' | 'inland' | 'disease',
        hours: number = 24
    ): Promise<SensorReading[]> {
        try {
            const headers = await getAuthHeaders();
            const params: Record<string, unknown> = { hours };
            if (type) params.sensor_type = type;

            const readings = await apiGet<SensorReading[]>('/iot/readings', params, { headers });
            return readings;
        } catch (error) {
            console.error('Error fetching readings:', error);
            return [];
        }
    },

    // Get latest reading for each device
    async getLatestReadings(): Promise<{
        infield: SensorReading | null;
        inland: SensorReading | null;
        disease: SensorReading | null;
    }> {
        const readings = await this.getSensorReadings();

        return {
            infield: readings.find(r => r.sensor_type === 'infield') || null,
            inland: readings.find(r => r.sensor_type === 'inland') || null,
            disease: readings.find(r => r.sensor_type === 'disease') || null
        };
    },

    // Get client hives for logged in user
    async getClientHives(userId?: string): Promise<ClientHive[]> {
        try {
            const headers = await getAuthHeaders();
            const hives = await apiGet<ClientHive[]>('/iot/client-hives', {}, { headers });
            return hives;
        } catch (error) {
            console.error('Error fetching client hives:', error);
            return [];
        }
    },

    // Get dashboard stats
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<DashboardStats>('/iot/stats', {}, { headers });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get latest telemetry for user's hives
    async getTelemetryLatest(): Promise<SensorReading[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<SensorReading[]>('/beeyield/telemetry/latest', {}, { headers });
        } catch (error) {
            console.error('Error fetching telemetry:', error);
            return [];
        }
    },

    // Update User Metadata
    async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase client not initialized') };
        const { error } = await supabase.auth.updateUser({
            data: metadata
        });
        return { error };
    },

    // ========== APIARY CRUD OPERATIONS ==========

    // Get all apiaries for the current user
    async getApiaries(): Promise<Apiary[]> {
        try {
            const headers = await getAuthHeaders();
            // Get through backend API which handles ownership and sharing
            const data = await apiGet<any[]>('/beeyield/apiaries?status_filter=active', {}, { headers });

            // Remap fields from backend schema to frontend interface
            return (data || []).map(a => ({
                ...a,
                type: a.apiary_type || a.type || 'permanent',
                forage_type: a.primary_forage || a.forage_type || ''
            })) as Apiary[];
        } catch (error) {
            console.error('Error in getApiaries:', error);
            return [];
        }
    },

    // Create a new apiary
    async createApiary(input: any): Promise<{ data: Apiary | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            // Use the user-centric beeyield endpoint
            const data = await apiPost<any>('/beeyield/apiaries', {
                ...input,
                // These defaults are handled by the backend too, but keeping them here for safety
                apiary_type: input.type || 'Permanent',
                primary_forage: input.forage_type || input.primary_forage,
            }, { headers });

            const remapped = {
                ...data,
                type: data.apiary_type || data.type || 'permanent',
                forage_type: data.primary_forage || data.forage_type || ''
            };

            toast.success('Apiary deployed successfully!');
            return { data: remapped as Apiary, error: null };
        } catch (error) {
            console.error('Error in createApiary:', error);
            toast.error('Failed to create apiary');
            return { data: null, error };
        }
    },

    // Update an existing apiary
    async updateApiary(id: string, input: Partial<ApiaryCreateInput>): Promise<{ data: Apiary | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            // Map forage_type to primary_forage if needed for backend schema
            const payload: any = { ...input };
            if (input.forage_type) payload.primary_forage = input.forage_type;
            if (input.type) payload.apiary_type = input.type;

            const data = await apiPut<any>(`/beeyield/apiaries/${id}`, payload, { headers });

            const remapped = {
                ...data,
                type: data.apiary_type || data.type || 'permanent',
                forage_type: data.primary_forage || data.forage_type || ''
            };

            toast.success('Apiary updated!');
            return { data: remapped as Apiary, error: null };
        } catch (error) {
            console.error('Error in updateApiary:', error);
            toast.error('Failed to update apiary');
            return { data: null, error };
        }
    },

    // Delete an apiary
    async deleteApiary(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/beeyield/apiaries/${id}`, { headers });

            toast.success('Apiary removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteApiary:', error);
            toast.error('Failed to delete apiary');
            return { error };
        }
    },

    // ========== HIVE CRUD OPERATIONS ==========

    // Get all hives for the current user
    async getHives(apiaryId?: string): Promise<Hive[]> {
        try {
            const headers = await getAuthHeaders();
            const params: any = apiaryId ? { apiary_id: apiaryId } : {};
            return await apiGet<Hive[]>('/beeyield/hives', params, { headers });
        } catch (error) {
            console.error('Error in getHives:', error);
            return [];
        }
    },

    // Create a new hive
    async createHive(input: HiveCreateInput): Promise<{ data: Hive | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<Hive>('/beeyield/hives', {
                ...input,
                installation_date: input.installation_date || new Date().toISOString().split('T')[0]
            }, { headers });

            toast.success('Hive added successfully!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in createHive:', error);
            toast.error('Failed to create hive');
            return { data: null, error };
        }
    },

    // Update an existing hive
    async updateHive(id: string, input: Partial<HiveCreateInput>): Promise<{ data: Hive | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<Hive>(`/beeyield/hives/${id}`, input, { headers });

            toast.success('Hive updated!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in updateHive:', error);
            toast.error('Failed to update hive');
            return { data: null, error };
        }
    },

    // Delete a hive
    async deleteHive(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/beeyield/hives/${id}`, { headers });

            toast.success('Hive removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHive:', error);
            toast.error('Failed to delete hive');
            return { error };
        }
    },

    // ========== HARVEST CRUD OPERATIONS (Full Traceability) ==========

    // Get all harvests with FULL linked data (farmer, hive, apiary)
    async getHarvests(filters?: { hive_id?: string; farmer_id?: string; year?: number }): Promise<Harvest[]> {
        try {
            const headers = await getAuthHeaders();
            // Use backend endpoint which handles user-specific data correctly
            const url = '/beeyield/harvests';

            // Note: Filters could be passed as query params here if backend supports them, 
            // but for now we filter client-side to match the TS logic if needed, 
            // although the new backend endpoint returns all recent harvests.

            const harvests = await apiGet<Harvest[]>(url, {}, { headers });

            // Client-side filtering if specific filters requested
            if (filters) {
                return harvests.filter(h => {
                    if (filters.hive_id && h.hive_id !== filters.hive_id) return false;
                    if (filters.farmer_id && h.farmer_id !== filters.farmer_id) return false;
                    if (filters.year) {
                        const hYear = new Date(h.harvest_date).getFullYear();
                        if (hYear !== filters.year) return false;
                    }
                    return true;
                });
            }

            return harvests;
        } catch (error) {
            console.error('Error in getHarvests:', error);
            // Return empty array instead of crashing
            return [];
        }
    },

    // Create a new harvest (with HoneyChain™ verification)
    async createHarvest(input: HarvestCreateInput): Promise<{ data: Harvest | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const response = await apiPost<any>('/beeyield/harvests', {
                ...input,
                extraction_method: input.extraction_method || 'Cold Extraction',
                nectar_source: input.nectar_source || 'Acacia',
                weather_conditions: input.weather_conditions || 'Sunny'
            }, { headers });

            const batchCode = response.batch_code || input.batch_code;
            toast.success('Harvest recorded!', {
                description: `Batch ${batchCode} sealed on HoneyChain™`
            });
            return { data: response as Harvest, error: null };
        } catch (error) {
            console.error('Error in createHarvest:', error);
            toast.error('Failed to record harvest');
            return { data: null, error };
        }
    },

    // Update an existing harvest
    async updateHarvest(id: string, input: Partial<HarvestCreateInput>): Promise<{ data: Harvest | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<Harvest>(`/beeyield/harvests/${id}`, input, { headers });
            toast.success('Harvest updated!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in updateHarvest:', error);
            toast.error('Failed to update harvest');
            return { data: null, error };
        }
    },

    // Delete a harvest
    async deleteHarvest(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/beeyield/harvests/${id}`, { headers });
            toast.success('Harvest removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHarvest:', error);
            toast.error('Failed to delete harvest');
            return { error };
        }
    },

    /** Smart Storyteller: generate marketing blurb (max 140 chars) for label from floral type */
    async generateLabelBlurb(params: {
        floral_type?: string;
        location?: string;
        harvest_year?: string;
        use_ai?: boolean;
    }): Promise<{ blurb: string; length: number }> {
        const headers = await getAuthHeaders();
        const data = await apiPost<{ blurb: string; length: number }>(
            '/beeyield/labels/generate-blurb',
            {
                floral_type: params.floral_type ?? null,
                location: params.location ?? null,
                harvest_year: params.harvest_year ?? null,
                use_ai: params.use_ai ?? true,
            },
            { headers }
        );
        return data;
    },

    // ========== PRD: SETTINGS & NOTIFICATIONS ==========

    async getNotificationSettings(): Promise<UserNotificationSettings> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<UserNotificationSettings>('/settings/notifications', {}, { headers });
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    },

    async updateNotificationSettings(payload: Partial<UserNotificationSettings>): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiPatch<any>('/settings/notifications', payload, { headers });
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    },

    async getIoTSettings(): Promise<IoTSettings> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<IoTSettings>('/settings/iot', {}, { headers });
        } catch (error) {
            console.error('Error fetching IoT settings:', error);
            throw error;
        }
    },

    async updateIoTSettings(payload: Partial<IoTSettings>): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiPatch<any>('/settings/iot', payload, { headers });
        } catch (error) {
            console.error('Error updating IoT settings:', error);
            throw error;
        }
    },

    // ========== TASK CRUD OPERATIONS ==========

    // Get all tasks
    async getTasks(): Promise<Task[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<Task[]>('/beeyield/tasks', {}, { headers });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    // Create a task
    async createTask(task: TaskCreateInput): Promise<{ data: Task | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<Task>('/beeyield/tasks', task, { headers });
            toast.success('Task created successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Failed to create task');
            return { data: null, error };
        }
    },

    // Update a task
    async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<{ data: Task | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<Task>(`/beeyield/tasks/${id}`, updates, { headers });
            toast.success('Task updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
            return { data: null, error };
        }
    },

    // Delete a task
    async deleteTask(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/beeyield/tasks/${id}`, { headers });
            toast.success('Task deleted');
            return { error: null };
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
            return { error };
        }
    },



    // ========== INSPECTION CRUD OPERATIONS ==========

    // Get all inspections
    async getInspections(hiveId?: string): Promise<Inspection[]> {
        try {
            const headers = await getAuthHeaders();
            const params: any = {};
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<Inspection[]>('/beeyield/inspections', params, { headers });
        } catch (error) {
            console.error('Error fetching inspections:', error);
            return [];
        }
    },

    // Get inspection by ID
    async getInspectionById(id: string): Promise<Inspection | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<Inspection>(`/beeyield/inspections/${id}`, {}, { headers });
        } catch (error) {
            console.error('Error fetching inspection:', error);
            return null;
        }
    },

    // Create an inspection
    async createInspection(inspection: InspectionCreateInput): Promise<{ data: Inspection | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<Inspection>('/beeyield/inspections', inspection, { headers });
            toast.success('Inspection saved successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating inspection:', error);
            toast.error('Failed to save inspection');
            return { data: null, error };
        }
    },

    // Update an inspection
    async updateInspection(id: string, updates: Partial<InspectionCreateInput>): Promise<{ data: Inspection | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<Inspection>(`/beeyield/inspections/${id}`, updates, { headers });
            toast.success('Inspection updated successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating inspection:', error);
            toast.error('Failed to update inspection');
            return { data: null, error };
        }
    },

    // Delete an inspection
    async deleteInspection(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/beeyield/inspections/${id}`, { headers });
            toast.success('Inspection deleted');
            return { error: null };
        } catch (error) {
            console.error('Error deleting inspection:', error);
            toast.error('Failed to delete inspection');
            return { error };
        }
    },

    // ========== PRECISION POLLINATION ==========

    // Calculate pollination needs
    async calculatePollination(input: { crop_type: string; acreage: number; avg_frames_per_hive: number }): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/pollination/calculate', input, { headers });
        } catch (error) {
            console.error('Error calculating pollination:', error);
            return null;
        }
    },

    // Create a new pollination contract
    async createPollinationContract(contract: any): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/pollination/contracts', contract, { headers });
        } catch (error) {
            console.error('Error creating contract:', error);
            return { error };
        }
    },

    // Get pollination contracts
    async getPollinationContracts(): Promise<PollinationContract[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<PollinationContract[]>('/pollination/contracts', {}, { headers });
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    },

    // Get pollination analytics
    async getPollinationAnalytics(): Promise<PollinationAnalytics | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<PollinationAnalytics>('/pollination/analytics', {}, { headers });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    },

    // Get hive sensor data (real-time)
    async getHiveSensorData(): Promise<any[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/pollination/hive-sensors', {}, { headers });
        } catch (error) {
            console.error('Error fetching hive sensors:', error);
            return [];
        }
    },

    // Get activity logs
    async getPollinationActivityLogs(): Promise<any[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/pollination/activity-logs', { limit: 20 }, { headers });
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }
    },

    // ========== SETTINGS & PREFERENCES ==========

    // Get user settings and notification configs
    async getSettings(): Promise<UserSettings | null> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<UserSettings>('/settings', {}, { headers });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    // Update user settings
    async updateSettings(settings: UserSettingsUpdate): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<any>('/settings', settings, { headers });
            toast.success('Preferences updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update preferences');
            return { data: null, error };
        }
    },

    // Update specific notification config
    async updateNotificationConfig(
        eventType: string,
        config: NotificationConfigUpdate
    ): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<any>(`/settings/notifications/${eventType}`, config, { headers });
            toast.success(`Notification updated`);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating notification config:', error);
            toast.error('Failed to update notification settings');
            return { data: null, error };
        }
    },

    // Get Full Settings (Profile, Prefs, Global Thresholds)
    async getFullSettings(): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any>('/settings/full', {}, { headers });
        } catch (error) {
            console.error('Error fetching full settings:', error);
            return null;
        }
    },

    // Get Hives with ThresholdsTable
    async getHiveSettings(): Promise<HiveAlertSettingsView[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<HiveAlertSettingsView[]>('/settings/hives', {}, { headers });
        } catch (error) {
            console.error('Error fetching hive settings:', error);
            return [];
        }
    },

    // Update specific hive thresholds (Upsert)
    async updateHiveThresholds(
        hiveId: string,
        thresholds: { temp_high?: number; temp_low?: number; weight_drop?: number }
    ): Promise<{ data: any; error: any }> {
        try {
            const headers = await getAuthHeaders();
            // POST to /settings/hives/{id}/thresholds
            const data = await apiPost<any>(`/settings/hives/${hiveId}/thresholds`, thresholds, { headers });
            toast.success(`Hive thresholds updated`);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating hive thresholds:', error);
            toast.error('Failed to update hive thresholds');
            return { data: null, error };
        }
    },

    // ========== NOTE CRUD OPERATIONS ==========

    // Get all notes for current user
    async getNotes(): Promise<Note[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<Note[]>('/notes', {}, { headers });
        } catch (error) {
            console.error('Error fetching notes:', error);
            return [];
        }
    },

    // Create a new note
    async createNote(input: NoteCreateInput): Promise<{ data: Note | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<Note>('/notes', input, { headers });
            toast.success('Note saved successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating note:', error);
            toast.error('Failed to save note');
            return { data: null, error };
        }
    },

    // Update an existing note
    async updateNote(id: string, input: Partial<NoteCreateInput>): Promise<{ data: Note | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPut<Note>(`/notes/${id}`, input, { headers });
            toast.success('Note updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error('Failed to update note');
            return { data: null, error };
        }
    },

    // Delete a note
    async deleteNote(id: string): Promise<{ error: any }> {
        try {
            const headers = await getAuthHeaders();
            await apiDelete(`/notes/${id}`, { headers });
            toast.success('Note removed');
            return { error: null };
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note');
            return { error };
        }
    },
    // ========== SUPPORT REQUEST OPERATIONS ==========

    // Get all support requests for current user
    async getRequests(): Promise<SupportRequest[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<SupportRequest[]>('/requests', {}, { headers });
        } catch (error) {
            console.error('Error fetching support requests:', error);
            return [];
        }
    },

    // Create a new support request
    async createRequest(input: SupportRequestCreate): Promise<{ data: SupportRequest | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<SupportRequest>('/requests', input, { headers });
            toast.success('Support request submitted!');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating support request:', error);
            toast.error('Failed to submit request');
            return { data: null, error };
        }
    },

    // Get comments for a specific request
    async getRequestComments(requestId: string): Promise<RequestComment[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<RequestComment[]>(`/requests/${requestId}/comments`, {}, { headers });
        } catch (error) {
            console.error('Error fetching request comments:', error);
            return [];
        }
    },

    // Add a comment to a request
    async addRequestComment(requestId: string, commentText: string): Promise<{ data: RequestComment | null; error: any }> {
        try {
            const headers = await getAuthHeaders();
            const data = await apiPost<RequestComment>(`/requests/${requestId}/comments`, { comment_text: commentText }, { headers });
            return { data, error: null };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { data: null, error };
        }
    },

    // ========== BLUETOOTH OPERATIONS ==========

    // Get paired bluetooth devices
    async getBluetoothDevices(): Promise<any[]> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/bluetooth/devices', {}, { headers });
        } catch (error) {
            console.error('Error fetching bluetooth devices:', error);
            return [];
        }
    },

    // Register/update bluetooth device
    async registerBluetoothDevice(device: { mac_address: string; name: string; device_type: string; assigned_hive_id?: string }): Promise<any> {
        try {
            const headers = await getAuthHeaders();
            const result = await apiPost<any>('/bluetooth/devices', device, { headers });
            toast.success(`Device ${device.name} registered`);
            return result;
        } catch (error) {
            console.error('Error registering bluetooth device:', error);
            toast.error('Failed to register device');
            return null;
        }
    },

    // Upload sensor readings via bluetooth
    async uploadBluetoothReadings(readings: any[]): Promise<boolean> {
        try {
            const headers = await getAuthHeaders();
            await apiPost<any>('/bluetooth/sync', { readings }, { headers });
            return true;
        } catch (error) {
            console.error('Error uploading bluetooth readings:', error);
            return false;
        }
    },

    // ========== Reports & Exports ==========
    async generateReport(params: {
        report_type: string;
        file_format: string;
        apiary_id?: string | null;
        start?: string | null;
        end?: string | null;
    }): Promise<{ id: string }> {
        const headers = await getAuthHeaders();
        return apiPost<{ message: string; id: string }>('/beeyield/reports/generate', params, { headers });
    },
    async getReports(): Promise<GeneratedReport[]> {
        const headers = await getAuthHeaders();
        const data = await apiGet<GeneratedReport[]>('/beeyield/reports', {}, { headers });
        return data || [];
    },
    async getReportById(reportId: string): Promise<GeneratedReport> {
        const headers = await getAuthHeaders();
        return apiGet<GeneratedReport>(`/beeyield/reports/${reportId}`, {}, { headers });
    },
    /** Returns the download URL (signed or static) so the UI can open it in a new tab. */
    async getReportDownloadUrl(reportId: string): Promise<string> {
        const headers = await getAuthHeaders();
        const { API_V1_URL } = await import('./api');
        const res = await fetch(`${API_V1_URL}/beeyield/reports/download/${reportId}`, { redirect: 'manual', headers: { ...headers } as HeadersInit });
        if (res.status === 302 || res.status === 301) {
            const location = res.headers.get('Location');
            if (location) return location;
        }
        return `${API_V1_URL}/beeyield/reports/download/${reportId}`;
    },
};

export interface GeneratedReport {
    id: string;
    user_id: string;
    report_type: string;
    parameters?: Record<string, unknown>;
    file_format: string;
    storage_path?: string | null;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export default beeyieldService;
