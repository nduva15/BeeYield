import { supabase } from '@/lib/supabase';
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { toast } from 'sonner';

let cachedSession: any = null;
let lastSessionFetch = 0;

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
    default_temp_high: number;
    default_temp_low: number;
    default_weight_drop: number;
    updated_at: string;
}

export const beeyieldService = {
    // ========== IoT DEVICES ==========
    async getDevices(): Promise<IoTDevice[]> {
        try {
            return await apiGet<IoTDevice[]>('/iot/devices', {});
        } catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    },

    async createDevice(input: IoTDeviceCreateInput): Promise<{ data: IoTDevice | null; error: any }> {
        try {
            const data = await apiPost<IoTDevice>('/iot/devices', input);
            toast.success('Device linked successfully!');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating device:', error);
            toast.error('Failed to link device');
            return { data: null, error };
        }
    },

    async getDevicesByType(type: 'infield' | 'inland' | 'disease'): Promise<IoTDevice[]> {
        const devices = await this.getDevices();
        return devices.filter(d => d.device_type === type);
    },

    async getSensorReadings(type?: 'infield' | 'inland' | 'disease', hours: number = 24): Promise<SensorReading[]> {
        try {
            const params: Record<string, unknown> = { hours };
            if (type) params.sensor_type = type;
            return await apiGet<SensorReading[]>('/iot/readings', params);
        } catch (error) {
            console.error('Error fetching readings:', error);
            return [];
        }
    },

    async getLatestReadings(): Promise<{ infield: SensorReading | null; inland: SensorReading | null; disease: SensorReading | null }> {
        const readings = await this.getSensorReadings();
        return {
            infield: readings.find(r => r.sensor_type === 'infield') || null,
            inland: readings.find(r => r.sensor_type === 'inland') || null,
            disease: readings.find(r => r.sensor_type === 'disease') || null
        };
    },

    async getClientHives(userId?: string): Promise<ClientHive[]> {
        try {
            return await apiGet<ClientHive[]>('/iot/client-hives', {});
        } catch (error) {
            console.error('Error fetching client hives:', error);
            return [];
        }
    },

    async getDashboardStats(): Promise<DashboardStats> {
        try {
            return await apiGet<DashboardStats>('/iot/stats', {});
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getTelemetryLatest(): Promise<SensorReading[]> {
        try {
            return await apiGet<SensorReading[]>('/beeyield/telemetry/latest', {});
        } catch (error) {
            console.error('Error fetching telemetry:', error);
            return [];
        }
    },

    async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase client not initialized') };
        const { error } = await supabase.auth.updateUser({ data: metadata });
        return { error };
    },

    // ========== APIARIES ==========
    async getApiaries(): Promise<Apiary[]> {
        try {
            const data = await apiGet<any[]>('/beeyield/apiaries?status_filter=active', {});
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

    async createApiary(input: any): Promise<{ data: Apiary | null; error: any }> {
        try {
            const data = await apiPost<any>('/beeyield/apiaries', {
                ...input,
                apiary_type: input.type || 'Permanent',
                primary_forage: input.forage_type || input.primary_forage,
            });
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

    async updateApiary(id: string, input: Partial<ApiaryCreateInput>): Promise<{ data: Apiary | null; error: any }> {
        try {
            const payload: any = { ...input };
            if (input.forage_type) payload.primary_forage = input.forage_type;
            if (input.type) payload.apiary_type = input.type;
            const data = await apiPut<any>(`/beeyield/apiaries/${id}`, payload);
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

    async deleteApiary(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/beeyield/apiaries/${id}`);
            toast.success('Apiary removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteApiary:', error);
            toast.error('Failed to delete apiary');
            return { error };
        }
    },

    // ========== HIVES ==========
    async getHives(apiaryId?: string): Promise<Hive[]> {
        try {
            const params: any = apiaryId ? { apiary_id: apiaryId } : {};
            return await apiGet<Hive[]>('/beeyield/hives', params);
        } catch (error) {
            console.error('Error in getHives:', error);
            return [];
        }
    },

    async createHive(input: HiveCreateInput): Promise<{ data: Hive | null; error: any }> {
        try {
            const data = await apiPost<Hive>('/beeyield/hives', {
                ...input,
                installation_date: input.installation_date || new Date().toISOString().split('T')[0]
            });
            toast.success('Hive added successfully!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in createHive:', error);
            toast.error('Failed to create hive');
            return { data: null, error };
        }
    },

    async updateHive(id: string, input: Partial<HiveCreateInput>): Promise<{ data: Hive | null; error: any }> {
        try {
            const data = await apiPut<Hive>(`/beeyield/hives/${id}`, input);
            toast.success('Hive updated!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in updateHive:', error);
            toast.error('Failed to update hive');
            return { data: null, error };
        }
    },

    async deleteHive(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/beeyield/hives/${id}`);
            toast.success('Hive removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHive:', error);
            toast.error('Failed to delete hive');
            return { error };
        }
    },

    // ========== HARVESTS ==========
    async getHarvests(filters?: { hive_id?: string; farmer_id?: string; year?: number }): Promise<Harvest[]> {
        try {
            const harvests = await apiGet<Harvest[]>('/beeyield/harvests', {});
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
            return [];
        }
    },

    async logHarvestBatch(input: HarvestBatchInput): Promise<{ data: any | null; error: any }> {
        try {
            const data = await apiPost<any>('/beeyield/harvests/log', input);
            toast.success('Batch logged & secured!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in logHarvestBatch:', error);
            toast.error('Failed to log batch');
            return { data: null, error };
        }
    },

    async createHarvest(input: HarvestCreateInput): Promise<{ data: Harvest | null; error: any }> {
        try {
            const response = await apiPost<any>('/beeyield/harvests', {
                ...input,
                extraction_method: input.extraction_method || 'Cold Extraction',
                nectar_source: input.nectar_source || 'Acacia',
                weather_conditions: input.weather_conditions || 'Sunny'
            });
            toast.success('Harvest recorded!');
            return { data: response as Harvest, error: null };
        } catch (error) {
            console.error('Error in createHarvest:', error);
            toast.error('Failed to record harvest');
            return { data: null, error };
        }
    },

    async updateHarvest(id: string, input: Partial<HarvestCreateInput>): Promise<{ data: Harvest | null; error: any }> {
        try {
            const data = await apiPut<Harvest>(`/beeyield/harvests/${id}`, input);
            toast.success('Harvest updated!');
            return { data, error: null };
        } catch (error) {
            console.error('Error in updateHarvest:', error);
            toast.error('Failed to update harvest');
            return { data: null, error };
        }
    },

    async deleteHarvest(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/beeyield/harvests/${id}`);
            toast.success('Harvest removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHarvest:', error);
            toast.error('Failed to delete harvest');
            return { error };
        }
    },

    // ========== TASKS ==========
    async getTasks(): Promise<Task[]> {
        try {
            return await apiGet<Task[]>('/beeyield/tasks', {});
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    async createTask(task: TaskCreateInput): Promise<{ data: Task | null; error: any }> {
        try {
            const data = await apiPost<Task>('/beeyield/tasks', task);
            toast.success('Task created successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Failed to create task');
            return { data: null, error };
        }
    },

    async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<{ data: Task | null; error: any }> {
        try {
            const data = await apiPut<Task>(`/ beeyield / tasks / ${id} `, updates);
            toast.success('Task updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
            return { data: null, error };
        }
    },

    async deleteTask(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/ beeyield / tasks / ${id} `);
            toast.success('Task deleted');
            return { error: null };
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
            return { error };
        }
    },

    // ========== INSPECTIONS ==========
    async getInspections(hiveId?: string): Promise<Inspection[]> {
        try {
            const params: any = {};
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<Inspection[]>('/beeyield/inspections', params);
        } catch (error) {
            console.error('Error fetching inspections:', error);
            return [];
        }
    },

    async getInspectionById(id: string): Promise<Inspection | null> {
        try {
            return await apiGet<Inspection>(`/ beeyield / inspections / ${id} `, {});
        } catch (error) {
            console.error('Error fetching inspection:', error);
            return null;
        }
    },

    async createInspection(inspection: InspectionCreateInput): Promise<{ data: Inspection | null; error: any }> {
        try {
            const data = await apiPost<Inspection>('/beeyield/inspections', inspection);
            toast.success('Inspection saved successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating inspection:', error);
            toast.error('Failed to save inspection');
            return { data: null, error };
        }
    },

    async updateInspection(id: string, updates: Partial<InspectionCreateInput>): Promise<{ data: Inspection | null; error: any }> {
        try {
            const data = await apiPut<Inspection>(`/ beeyield / inspections / ${id} `, updates);
            toast.success('Inspection updated successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating inspection:', error);
            toast.error('Failed to update inspection');
            return { data: null, error };
        }
    },

    async deleteInspection(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/ beeyield / inspections / ${id} `);
            toast.success('Inspection deleted');
            return { error: null };
        } catch (error) {
            console.error('Error deleting inspection:', error);
            toast.error('Failed to delete inspection');
            return { error };
        }
    },

    // ========== POLLINATION ==========
    async calculatePollination(input: { crop_type: string; acreage: number; avg_frames_per_hive: number }): Promise<any> {
        try {
            return await apiPost<any>('/pollination/calculate', input);
        } catch (error) {
            console.error('Error calculating pollination:', error);
            return null;
        }
    },

    async createPollinationContract(contract: any): Promise<any> {
        try {
            return await apiPost<any>('/pollination/contracts', contract);
        } catch (error) {
            console.error('Error creating contract:', error);
            return { error };
        }
    },

    async getPollinationContracts(): Promise<PollinationContract[]> {
        try {
            return await apiGet<PollinationContract[]>('/pollination/contracts', {});
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    },

    async getPollinationAnalytics(): Promise<PollinationAnalytics | null> {
        try {
            return await apiGet<PollinationAnalytics>('/pollination/analytics', {});
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    },

    async getHiveSensorData(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/pollination/hive-sensors', {});
        } catch (error) {
            console.error('Error fetching hive sensors:', error);
            return [];
        }
    },

    async getPollinationActivityLogs(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/pollination/activity-logs', { limit: 20 });
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }
    },

    // ========== SETTINGS ==========
    async getSettings(): Promise<UserSettings | null> {
        try {
            return await apiGet<UserSettings>('/settings', {});
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    async updateSettings(settings: UserSettingsUpdate): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPut<any>('/settings', settings);
            toast.success('Preferences updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update preferences');
            return { data: null, error };
        }
    },

    async updateNotificationConfig(eventType: string, config: NotificationConfigUpdate): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPut<any>(`/ settings / notifications / ${eventType} `, config);
            toast.success(`Notification updated`);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating notification config:', error);
            toast.error('Failed to update notification settings');
            return { data: null, error };
        }
    },

    async updateHiveThresholds(hiveId: string, thresholds: { temp_threshold_high?: number; temp_threshold_low?: number; weight_drop_threshold?: number }): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPut<any>(`/ settings / hives / ${hiveId} `, thresholds);
            toast.success(`Hive thresholds updated`);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating hive thresholds:', error);
            toast.error('Failed to update hive thresholds');
            return { data: null, error };
        }
    },

    async getFullSettings(): Promise<any> {
        try {
            return await apiGet<any>('/settings/full', {});
        } catch (error) {
            console.error('Error fetching full settings:', error);
            return null;
        }
    },

    async getNotificationSettings(): Promise<UserNotificationSettings | null> {
        try {
            return await apiGet<UserNotificationSettings>('/settings/notifications', {});
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            return null;
        }
    },

    async updateNotificationSettings(settings: Partial<UserNotificationSettings>): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPut<any>('/settings/notifications', settings);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating notification settings:', error);
            return { data: null, error };
        }
    },

    async getIoTSettings(): Promise<IoTSettings | null> {
        try {
            return await apiGet<IoTSettings>('/settings/iot', {});
        } catch (error) {
            console.error('Error fetching IoT settings:', error);
            return null;
        }
    },

    async updateIoTSettings(settings: Partial<IoTSettings>): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPut<any>('/settings/iot', settings);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating IoT settings:', error);
            return { data: null, error };
        }
    },

    // ========== REQUESTS ==========
    async getRequests(): Promise<Request[]> {
        try {
            return await apiGet<Request[]>('/beeyield/requests');
        } catch (error) {
            console.error('Error fetching requests:', error);
            return [];
        }
    },

    async createRequest(input: RequestCreateInput): Promise<{ data: Request | null; error: any }> {
        try {
            const data = await apiPost<Request>('/beeyield/requests', input);
            toast.success('Request submitted successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating request:', error);
            toast.error('Failed to submit request');
            return { data: null, error };
        }
    },

    // ========== REPORTS ==========
    async getGeneratedReports(): Promise<GeneratedReport[]> {
        try {
            return await apiGet<GeneratedReport[]>('/beeyield/reports');
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    async generateReport(input: ReportCreateInput): Promise<{ data: GeneratedReport | null; error: any }> {
        try {
            const data = await apiPost<GeneratedReport>('/beeyield/reports', input);
            return { data, error: null };
        } catch (error) {
            console.error('Error generating report:', error);
            return { data: null, error };
        }
    },

    async getScheduledReports(): Promise<ScheduledReport[]> {
        try {
            return await apiGet<ScheduledReport[]>('/beeyield/reports/scheduled');
        } catch (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }
    },

    async createScheduledReport(input: ScheduledReportCreateInput): Promise<{ data: ScheduledReport | null; error: any }> {
        try {
            const data = await apiPost<ScheduledReport>('/beeyield/reports/scheduled', input);
            return { data, error: null };
        } catch (error) {
            console.error('Error creating schedule:', error);
            return { data: null, error };
        }
    },

    async deleteScheduledReport(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/ beeyield / reports / scheduled / ${id} `);
            return { error: null };
        } catch (error) {
            console.error('Error deleting schedule:', error);
            return { error };
        }
    },

    // ========== ACOUSTIC READINGS (Sound Analysis) ==========
    async getAcousticReadings(hiveId?: string, days: number = 30): Promise<any[]> {
        try {
            const params: Record<string, unknown> = { days };
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<any[]>('/beeyield/analytics/acoustics', params);
        } catch (error) {
            console.error('Error fetching acoustic readings:', error);
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
        try {
            const data = await apiPost<any>('/beeyield/analytics/acoustics', input);
            return { data, error: null };
        } catch (error) {
            console.error('Error creating acoustic reading:', error);
            return { data: null, error };
        }
    },

    // ========== VARROA READINGS & TREATMENTS ==========
    async getVarroaReadings(hiveId?: string): Promise<any[]> {
        try {
            const params: Record<string, unknown> = {};
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<any[]>('/beeyield/analytics/varroa', params);
        } catch (error) {
            console.error('Error fetching varroa readings:', error);
            return [];
        }
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
        try {
            const data = await apiPost<any>('/beeyield/analytics/varroa', input);
            toast.success('Varroa reading recorded');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating varroa reading:', error);
            toast.error('Failed to record varroa reading');
            return { data: null, error };
        }
    },

    async getVarroaTreatments(hiveId?: string): Promise<any[]> {
        try {
            const params: Record<string, unknown> = {};
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<any[]>('/beeyield/analytics/varroa/treatments', params);
        } catch (error) {
            console.error('Error fetching varroa treatments:', error);
            return [];
        }
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
        try {
            const data = await apiPost<any>('/beeyield/analytics/varroa/treatments', input);
            toast.success('Treatment recorded');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating varroa treatment:', error);
            toast.error('Failed to record treatment');
            return { data: null, error };
        }
    },

    // ========== BILLING & SUBSCRIPTIONS ==========
    async getBillingOverview(): Promise<{
        subscription: any;
        plan: any;
        recentTransactions: any[];
    } | null> {
        try {
            return await apiGet<any>('/beeyield/billing/overview', {});
        } catch (error) {
            console.error('Error fetching billing overview:', error);
            return null;
        }
    },

    async getSubscriptionPlans(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/billing/plans', {});
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            return [];
        }
    },

    async getTransactions(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/billing/transactions', {});
        } catch (error) {
            console.error('Error fetching transactions:', error);
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
            const data = await apiPost<any>('/beeyield/billing/transactions', input);
            return { data, error: null };
        } catch (error) {
            console.error('Error creating transaction:', error);
            return { data: null, error };
        }
    },

    // ========== BLUETOOTH DEVICES ==========
    async getBluetoothDevices(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/bluetooth/devices', {});
        } catch (error) {
            console.error('Error fetching bluetooth devices:', error);
            return [];
        }
    },

    async registerBluetoothDevice(input: any): Promise<any> {
        try {
            const data = await apiPost<any>('/beeyield/bluetooth/devices', input);
            toast.success('Bluetooth device registered');
            return data;
        } catch (error) {
            console.error('Error registering bluetooth device:', error);
            toast.error('Failed to register device');
            return null;
        }
    },

    async uploadBluetoothReadings(readings: any[]): Promise<any> {
        try {
            const data = await apiPost<any>('/beeyield/bluetooth/sync', { readings });
            return data;
        } catch (error) {
            console.error('Error uploading readings:', error);
            throw error;
        }
    },

    // ========== IOT DEVICES ==========
    async getIotDevices(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/hardware/iot-devices', {});
        } catch (error) {
            console.error('Error fetching IoT devices:', error);
            return [];
        }
    },

    // ========== USB DEVICE PAIRING ==========
    async getPairedUsbDevices(): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/hardware/usb-devices', {});
        } catch (error) {
            console.error('Error fetching paired USB devices:', error);
            return [];
        }
    },

    async pairUsbDevice(input: {
        device_uid: string;
        device_type?: string;
        serial_number?: string;
        firmware_version?: string;
        config?: any;
    }): Promise<{ data: any; error: any }> {
        try {
            const data = await apiPost<any>('/beeyield/hardware/usb-devices', input);
            toast.success('Device paired successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error pairing USB device:', error);
            toast.error('Failed to pair device');
            return { data: null, error };
        }
    },

    async unpairUsbDevice(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/ beeyield / hardware / usb - devices / ${id} `);
            toast.success('Device unpaired');
            return { error: null };
        } catch (error) {
            console.error('Error unpairing device:', error);
            toast.error('Failed to unpair device');
            return { error };
        }
    },

    // ========== API USAGE / SERVER STATUS ==========
    async getApiUsageStats(days: number = 30): Promise<any> {
        try {
            return await apiGet<any>('/beeyield/status/api-usage', { days });
        } catch (error) {
            console.error('Error fetching API usage stats:', error);
            return null;
        }
    },

    // ========== SATELLITE / AGRO INTELLIGENCE ==========
    async getSatelliteIndices(apiaryId?: string, days: number = 90): Promise<any[]> {
        try {
            const params: Record<string, unknown> = { days };
            if (apiaryId) params.apiary_id = apiaryId;
            return await apiGet<any[]>('/beeyield/agro/satellite', params);
        } catch (error) {
            console.error('Error fetching satellite indices:', error);
            return [];
        }
    },

    async getWeatherHistory(apiaryId?: string, days: number = 30): Promise<any[]> {
        try {
            const params: Record<string, unknown> = { days };
            if (apiaryId) params.apiary_id = apiaryId;
            return await apiGet<any[]>('/beeyield/agro/weather', params);
        } catch (error) {
            console.error('Error fetching weather history:', error);
            return [];
        }
    },

    // ========== FORAGE ZONES (Flight Map) ==========
    async getForageZones(apiaryId?: string): Promise<any[]> {
        try {
            const params: Record<string, unknown> = {};
            if (apiaryId) params.apiary_id = apiaryId;
            return await apiGet<any[]>('/beeyield/agro/forage-zones', params);
        } catch (error) {
            console.error('Error fetching forage zones:', error);
            return [];
        }
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
        try {
            const data = await apiPost<any>('/beeyield/agro/forage-zones', input);
            toast.success('Forage zone added');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating forage zone:', error);
            toast.error('Failed to add forage zone');
            return { data: null, error };
        }
    },

    // ========== HEALTH KNOWLEDGE BASE ==========
    async getHealthKnowledgeBase(category?: string): Promise<any[]> {
        try {
            const params: Record<string, unknown> = {};
            if (category) params.category = category;
            return await apiGet<any[]>('/beeyield/health-guide', params);
        } catch (error) {
            console.error('Error fetching health knowledge:', error);
            return [];
        }
    },

    // ========== IMAGE ANALYSIS ==========
    async createImageDetection(input: {
        image_url: string;
        detection_type: string; // 'pest' | 'disease' | 'colony_count'
        confidence_score?: number;
        detected_objects?: any; // JSON
        hive_id?: string;
        metadata?: any;
    }): Promise<{ data: any; error: any }> {
        try {
            const result = await apiPost<any>('/beeyield/analytics/vision', input);
            toast.success('Image analysis result saved');
            return { data: result, error: null };
        } catch (error) {
            console.error('Error saving image detection:', error);
            toast.error('Failed to save analysis');
            return { data: null, error };
        }
    },

    async getImageDetections(hiveId?: string, limit: number = 20): Promise<any[]> {
        try {
            const params: Record<string, unknown> = { limit };
            if (hiveId) params.hive_id = hiveId;
            return await apiGet<any[]>('/beeyield/analytics/vision', params);
        } catch (error) {
            console.error('Error fetching image detections:', error);
            return [];
        }
    },

    // ========== NOTES ==========
    async getNotes(): Promise<Note[]> {
        try {
            return await apiGet<Note[]>('/beeyield/notes', {});
        } catch (error) {
            console.error('Error fetching notes:', error);
            return [];
        }
    },

    async createNote(input: NoteCreateInput): Promise<{ data: Note | null; error: any }> {
        try {
            const data = await apiPost<Note>('/beeyield/notes', input);
            toast.success('Note added successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error creating note:', error);
            toast.error('Failed to create note');
            return { data: null, error };
        }
    },

    async updateNote(id: string, updates: Partial<NoteCreateInput>): Promise<{ data: Note | null; error: any }> {
        try {
            const data = await apiPut<Note>(`/ beeyield / notes / ${id} `, updates);
            toast.success('Note updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error('Failed to update note');
            return { data: null, error };
        }
    },

    async deleteNote(id: string): Promise<{ error: any }> {
        try {
            await apiDelete(`/ beeyield / notes / ${id} `);
            toast.success('Note deleted');
            return { error: null };
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note');
            return { error };
        }
    },

    // ========== ANALYTICS ==========
    async getComparisonData(params: {
        medium: string;
        range: string;
        apiary_id?: string;
        user_id?: string;
    }): Promise<any[]> {
        try {
            return await apiGet<any[]>('/beeyield/analytics/comparisons', params);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            return [];
        }
    },

    // ========== JOBS ==========
    async submitJobApplication(formData: FormData): Promise<{ data: any; error: any }> {
        try {
            // Use API_URL from env or default to relative path proxy
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/v1/jobs/apply`, {
                method: 'POST',
                body: formData, // fetch will automatically set the correct boundary for multipart/form-data
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
};

export default beeyieldService;
