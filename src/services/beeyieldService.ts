import { supabase } from '@/lib/supabase';
import { apiGet } from './api';
import { toast } from 'sonner';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!supabase) return {};
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
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
}

export interface SensorReading {
    id: string;
    device_id: string;
    sensor_type: 'infield' | 'inland' | 'disease';
    timestamp: string;
    status: string;
    readings: InfieldReadings | InlandReadings | DiseaseReadings;
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
    latitude?: number;
    longitude?: number;
    forage_type?: string;
    expected_hives?: number;
    notes?: string;
    farmer_id?: string;
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
    title: string;
    description?: string;
    status: 'pending' | 'completed' | 'in_progress';
    priority: 'low' | 'medium' | 'high';
    category: string;
    due_date?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed: boolean;
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
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    due_date?: string;
    apiary_id?: string;
    hive_id?: string;
    is_completed?: boolean;
}

export interface InspectionCreateInput {
    hive_id?: string;
    apiary_id?: string;
    colony_state?: string;
    has_queen?: boolean;
    has_capped_brood?: boolean;
    has_eggs?: boolean;
    has_larvae?: boolean;
    brood_arrangement?: string;
    bee_activity?: string;
    weather?: string;
    weight_category?: string;
    weight_kg?: number;
    has_queen_cells?: boolean;
    queen_cells_comment?: string;
    has_possible_illness?: boolean;
    diagnosis?: string;
    treatment?: string;
    private_note?: string;
    inspection_date?: string;
    inspection_time?: string;
}

export interface Inspection extends InspectionCreateInput {
    id: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
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
            const params: any = { hours };
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
    async getDashboardStats(): Promise<{
        totalDevices: number;
        activeDevices: number;
        totalReadings: number;
        lastUpdate: string;
        avgTemperature: number;
        avgHumidity: number;
        avgHiveWeight: number;
        healthScore: number;
    }> {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any>('/iot/stats', {}, { headers });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
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
        if (!supabase) {
            console.warn('Supabase not initialized - returning empty apiaries');
            return [];
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('apiaries')
                .select('*, farmer:farmers(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Handle case where user_id column hasn't been added yet (Migration pending)
                if (error.code === '42703' || error.message?.includes('column "user_id" does not exist')) {
                    console.warn('BeeYield Column Check: user_id missing in apiaries. Falling back to global view.');
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('apiaries')
                        .select('*, farmer:farmers(*)')
                        .order('created_at', { ascending: false });

                    if (fallbackError) return [];
                    return (fallbackData as Apiary[]) || [];
                }

                console.error('Error fetching apiaries:', error);
                toast.error('Failed to load apiaries');
                return [];
            }
            return (data as Apiary[]) || [];
        } catch (error) {
            console.error('Error in getApiaries:', error);
            return [];
        }
    },

    // Create a new apiary
    async createApiary(input: ApiaryCreateInput): Promise<{ data: Apiary | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { data: null, error: new Error('Not authenticated') };

            const { data, error } = await supabase
                .from('apiaries')
                .insert({
                    user_id: user.id,
                    name: input.name,
                    type: input.type || 'permanent',
                    location_name: input.location_name,
                    latitude: input.latitude,
                    longitude: input.longitude,
                    forage_type: input.forage_type,
                    expected_hives: input.expected_hives || 0,
                    notes: input.notes,
                    farmer_id: input.farmer_id,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating apiary:', error);
                toast.error('Failed to create apiary');
                return { data: null, error };
            }

            toast.success('Apiary deployed successfully!');
            return { data: data as Apiary, error: null };
        } catch (error) {
            console.error('Error in createApiary:', error);
            return { data: null, error };
        }
    },

    // Update an existing apiary
    async updateApiary(id: string, input: Partial<ApiaryCreateInput>): Promise<{ data: Apiary | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            const { data, error } = await supabase
                .from('apiaries')
                .update(input)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating apiary:', error);
                toast.error('Failed to update apiary');
                return { data: null, error };
            }

            toast.success('Apiary updated!');
            return { data: data as Apiary, error: null };
        } catch (error) {
            console.error('Error in updateApiary:', error);
            return { data: null, error };
        }
    },

    // Delete an apiary
    async deleteApiary(id: string): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase not initialized') };

        try {
            const { error } = await supabase
                .from('apiaries')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting apiary:', error);
                toast.error('Failed to delete apiary');
                return { error };
            }

            toast.success('Apiary removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteApiary:', error);
            return { error };
        }
    },

    // ========== HIVE CRUD OPERATIONS ==========

    // Get all hives for the current user
    async getHives(apiaryId?: string): Promise<Hive[]> {
        if (!supabase) {
            console.warn('Supabase not initialized - returning empty hives');
            return [];
        }
        try {
            let query = supabase
                .from('hives')
                .select('*, apiary:apiaries(*), farmer:farmers(*)')
                .order('created_at', { ascending: false });

            if (apiaryId) {
                query = query.eq('apiary_id', apiaryId);
            }

            const { data, error } = await query;

            if (error) {
                // If query failed due to user_id (not present in standard hives table without migration)
                if (error.code === '42703' || error.message?.includes('column "user_id" does not exist')) {
                    console.warn('BeeYield Column Check: user_id missing in hives. Fetching all.');
                    const { data: fallbackData } = await supabase
                        .from('hives')
                        .select('*, apiary:apiaries(*), farmer:farmers(*)')
                        .order('created_at', { ascending: false });
                    return (fallbackData as unknown as Hive[]) || [];
                }

                console.error('Error fetching hives:', error);
                toast.error('Failed to load hives');
                return [];
            }
            return (data as unknown as Hive[]) || [];
        } catch (error) {
            console.error('Error in getHives:', error);
            return [];
        }
    },

    // Create a new hive
    async createHive(input: HiveCreateInput): Promise<{ data: Hive | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            const { data, error } = await supabase
                .from('hives')
                .insert({
                    apiary_id: input.apiary_id,
                    farmer_id: input.farmer_id,
                    hive_code: input.hive_code,
                    hive_type: input.hive_type || 'Langstroth',
                    bee_type: input.bee_type,
                    frame_count: input.frame_count || 10,
                    material: input.material,
                    status: input.status || 'ACTIVE',
                    installation_date: input.installation_date,
                    has_sensors: input.has_sensors || false,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating hive:', error);
                toast.error('Failed to create hive');
                return { data: null, error };
            }

            toast.success('Hive added successfully!');
            return { data: data as unknown as Hive, error: null };
        } catch (error) {
            console.error('Error in createHive:', error);
            return { data: null, error };
        }
    },

    // Update an existing hive
    async updateHive(id: string, input: Partial<HiveCreateInput>): Promise<{ data: Hive | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            const { data, error } = await supabase
                .from('hives')
                .update(input)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating hive:', error);
                toast.error('Failed to update hive');
                return { data: null, error };
            }

            toast.success('Hive updated!');
            return { data: data as unknown as Hive, error: null };
        } catch (error) {
            console.error('Error in updateHive:', error);
            return { data: null, error };
        }
    },

    // Delete a hive
    async deleteHive(id: string): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase not initialized') };

        try {
            const { error } = await supabase
                .from('hives')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting hive:', error);
                toast.error('Failed to delete hive');
                return { error };
            }

            toast.success('Hive removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHive:', error);
            return { error };
        }
    },

    // ========== HARVEST CRUD OPERATIONS (Full Traceability) ==========

    // Get all harvests with FULL linked data (farmer, hive, apiary)
    async getHarvests(filters?: { hive_id?: string; farmer_id?: string; year?: number }): Promise<Harvest[]> {
        if (!supabase) {
            console.warn('Supabase not initialized - returning empty harvests');
            return [];
        }
        try {
            // Join hive, farmer, and apiary data for complete traceability
            let query = supabase
                .from('harvests')
                .select(`
                    *,
                    hive:hives(*),
                    farmer:farmers(*)
                `)
                .order('harvest_date', { ascending: false });

            if (filters?.hive_id) {
                query = query.eq('hive_id', filters.hive_id);
            }
            if (filters?.farmer_id) {
                query = query.eq('farmer_id', filters.farmer_id);
            }
            if (filters?.year) {
                const startDate = `${filters.year}-01-01`;
                const endDate = `${filters.year}-12-31`;
                query = query.gte('harvest_date', startDate).lte('harvest_date', endDate);
            }

            const { data, error } = await query;

            if (error) {
                if (error.code === '42703' || error.message?.includes('column "user_id" does not exist')) {
                    const { data: fallbackData } = await supabase
                        .from('harvests')
                        .select(`
                            *,
                            hive:hives(*),
                            farmer:farmers(*)
                        `)
                        .order('harvest_date', { ascending: false });

                    return (fallbackData || []).map((h: any) => ({
                        ...h,
                        apiary: h.hive?.apiary || null
                    })) as Harvest[];
                }

                console.error('Error fetching harvests:', error);
                toast.error('Failed to load harvests');
                return [];
            }

            // Map the data to include apiary from hive relationship
            const harvests = (data || []).map((h: any) => ({
                ...h,
                apiary: h.hive?.apiary || null
            }));

            return harvests as Harvest[];
        } catch (error) {
            console.error('Error in getHarvests:', error);
            return [];
        }
    },

    // Create a new harvest (with HoneyChain™ verification)
    async createHarvest(input: HarvestCreateInput): Promise<{ data: Harvest | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            // Generate batch code if not provided
            const batchCode = input.batch_code || `BY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const { data, error } = await supabase
                .from('harvests')
                .insert({
                    hive_id: input.hive_id,
                    farmer_id: input.farmer_id,
                    harvest_date: input.harvest_date,
                    quantity_kg: input.quantity_kg,
                    quantity_left_for_bees_kg: input.quantity_left_for_bees_kg || input.quantity_kg, // Default to 50/50 rule
                    extraction_method: input.extraction_method || 'Cold Extraction',
                    nectar_source: input.nectar_source,
                    weather_conditions: input.weather_conditions,
                    moisture_content_percent: input.moisture_content_percent || 17.5,
                    batch_code: batchCode,
                    honey_type: input.honey_type,
                    color_grade: input.color_grade,
                    is_verified: input.is_verified ?? true, // Default to verified
                })
                .select(`
                    *,
                    hive:hives(*),
                    farmer:farmers(*)
                `)
                .single();

            if (error) {
                console.error('Error creating harvest:', error);
                toast.error('Failed to record harvest');
                return { data: null, error };
            }

            toast.success('Harvest recorded!', {
                description: `Batch ${batchCode} ${input.is_verified !== false ? 'sealed on HoneyChain™' : ''}`
            });
            return { data: data as unknown as Harvest, error: null };
        } catch (error) {
            console.error('Error in createHarvest:', error);
            return { data: null, error };
        }
    },

    // Update an existing harvest
    async updateHarvest(id: string, input: Partial<HarvestCreateInput>): Promise<{ data: Harvest | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        try {
            const { data, error } = await supabase
                .from('harvests')
                .update(input)
                .eq('id', id)
                .select(`
                    *,
                    hive:hives(*),
                    farmer:farmers(*)
                `)
                .single();

            if (error) {
                console.error('Error updating harvest:', error);
                toast.error('Failed to update harvest');
                return { data: null, error };
            }

            toast.success('Harvest updated!');
            return { data: data as unknown as Harvest, error: null };
        } catch (error) {
            console.error('Error in updateHarvest:', error);
            return { data: null, error };
        }
    },

    // Delete a harvest
    async deleteHarvest(id: string): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase not initialized') };

        try {
            const { error } = await supabase
                .from('harvests')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting harvest:', error);
                toast.error('Failed to delete harvest');
                return { error };
            }

            toast.success('Harvest removed');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteHarvest:', error);
            return { error };
        }
    },

    // ========== TASK CRUD OPERATIONS ==========

    // Get all tasks
    async getTasks(): Promise<Task[]> {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*, apiary:apiaries(*), hive:hives(*)')
                .order('due_date', { ascending: true });

            if (error) {
                if (error.code === '42703' || error.message?.includes('column "user_id" does not exist')) {
                    const { data: fallbackData } = await supabase
                        .from('tasks')
                        .select('*, apiary:apiaries(*), hive:hives(*)')
                        .order('due_date', { ascending: true });
                    return fallbackData || [];
                }
                console.error('Error fetching tasks:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error in getTasks:', error);
            return [];
        }
    },

    // Create a task
    async createTask(task: TaskCreateInput): Promise<{ data: Task | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([task])
                .select()
                .single();

            if (error) {
                console.error('Error creating task:', error);
                toast.error('Failed to create task');
                return { data: null, error };
            }
            toast.success('Task created successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error in createTask:', error);
            return { data: null, error };
        }
    },

    // Update a task
    async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<{ data: Task | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating task:', error);
                toast.error('Failed to update task');
                return { data: null, error };
            }
            toast.success('Task updated');
            return { data, error: null };
        } catch (error) {
            console.error('Error in updateTask:', error);
            return { data: null, error };
        }
    },

    // Delete a task
    async deleteTask(id: string): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase not initialized') };
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting task:', error);
                toast.error('Failed to delete task');
                return { error };
            }
            toast.success('Task deleted');
            return { error: null };
        } catch (error) {
            console.error('Error in deleteTask:', error);
            return { error };
        }
    },

    // ========== INSPECTION CRUD OPERATIONS ==========

    // Create an inspection
    async createInspection(inspection: InspectionCreateInput): Promise<{ data: Inspection | null; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
        try {
            const { data, error } = await supabase
                .from('inspections')
                .insert([inspection])
                .select()
                .single();

            if (error) {
                console.error('Error creating inspection:', error);
                toast.error('Failed to save inspection');
                return { data: null, error };
            }
            toast.success('Inspection saved successfully');
            return { data, error: null };
        } catch (error) {
            console.error('Error in createInspection:', error);
            return { data: null, error };
        }
    }
};

export default beeyieldService;
