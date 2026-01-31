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
    }
};

export default beeyieldService;
