import { supabase } from '@/lib/supabase';
import { apiGet } from './api';

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

// Mock data for fallback
export const mockDevices: IoTDevice[] = [
    {
        id: '1',
        device_code: 'INF-001',
        device_name: 'Field Sensor A',
        device_type: 'infield',
        status: 'active',
        battery_level: 85,
        firmware_version: '1.2.0',
        last_ping: new Date().toISOString(),
        location_name: 'North Orchard'
    },
    {
        id: '2',
        device_code: 'INL-001',
        device_name: 'Hive Monitor 1',
        device_type: 'inland',
        status: 'active',
        battery_level: 92,
        firmware_version: '1.1.5',
        last_ping: new Date().toISOString(),
        location_name: 'Hive 01'
    },
    {
        id: '3',
        device_code: 'DIS-001',
        device_name: 'Health Monitor X',
        device_type: 'disease',
        status: 'active',
        battery_level: 78,
        firmware_version: '2.0.1',
        last_ping: new Date().toISOString(),
        location_name: 'Apiary Section B'
    }
];

export const generateMockReadings = (): SensorReading[] => {
    const readings: SensorReading[] = [];
    const types: ('infield' | 'inland' | 'disease')[] = ['infield', 'inland', 'disease'];

    for (let i = 0; i < 20; i++) {
        const type = types[i % 3];
        let specificReadings: InfieldReadings | InlandReadings | DiseaseReadings;

        if (type === 'infield') {
            specificReadings = {
                temperature: 24 + Math.random() * 8,
                humidity: 45 + Math.random() * 20,
                soil_moisture: 30 + Math.random() * 30
            };
        } else if (type === 'inland') {
            specificReadings = {
                hive_weight: 40 + Math.random() * 15,
                internal_temp: 34 + Math.random() * 3,
                bee_activity: 70 + Math.random() * 25
            };
        } else {
            specificReadings = {
                colony_health_score: 80 + Math.random() * 15,
                pest_detection: Math.random() > 0.8 ? 'low' : 'none',
                treatment_status: 'none'
            };
        }

        readings.push({
            id: `r-${i}`,
            device_id: (i % 3 + 1).toString(),
            sensor_type: type,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            status: 'ok',
            readings: specificReadings
        });
    }

    return readings;
};

export const mockClientHives: ClientHive[] = [
    {
        id: 'h1',
        user_id: 'demo',
        hive_name: 'Golden Hive',
        hive_code: 'BY-H-001',
        crop_type: 'Avocado',
        farm_location: 'Kibwezi',
        status: 'active',
        contract_start: '2025-01-01',
        contract_end: '2025-06-01'
    },
    {
        id: 'h2',
        user_id: 'demo',
        hive_name: 'Blueberry Hive',
        hive_code: 'BY-H-002',
        crop_type: 'Blueberries',
        farm_location: 'Uasin Gishu',
        status: 'pending',
        contract_start: '2025-02-15',
        contract_end: '2025-08-15'
    }
];

export const beeyieldService = {
    // Get all IoT devices
    async getDevices(): Promise<IoTDevice[]> {
        try {
            const headers = await getAuthHeaders();
            const devices = await apiGet<IoTDevice[]>('/iot/devices', {}, { headers });
            return devices.length ? devices : mockDevices;
        } catch (error) {
            console.warn('Backend API failed, using mock devices:', error);
            return mockDevices;
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
            return readings.length ? readings : (type ? generateMockReadings().filter(r => r.sensor_type === type) : generateMockReadings());
        } catch (error) {
            console.warn('Backend API failed, using mock readings:', error);
            const readings = generateMockReadings();
            return type ? readings.filter(r => r.sensor_type === type) : readings;
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
            return hives.length ? hives : mockClientHives.map(h => ({ ...h, user_id: userId || 'demo' }));
        } catch (error) {
            console.warn('Backend API failed, using mock client hives:', error);
            return mockClientHives.map(h => ({ ...h, user_id: userId || 'demo' }));
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
            console.warn('Backend API failed, using client-side calculation:', error);
            // Fallback to client-side calc if backend fails
            const devices = await this.getDevices();
            const readings = await this.getSensorReadings();

            const activeDevices = devices.filter(d => d.status === 'active').length;
            const infieldReadings = readings.filter(r => r.sensor_type === 'infield');
            const inlandReadings = readings.filter(r => r.sensor_type === 'inland');
            const diseaseReadings = readings.filter(r => r.sensor_type === 'disease');

            const avgTemp = infieldReadings.length > 0
                ? infieldReadings.reduce((sum, r) => sum + (r.readings as InfieldReadings).temperature, 0) / infieldReadings.length
                : 28.5; // Demo default

            const avgHumidity = infieldReadings.length > 0
                ? infieldReadings.reduce((sum, r) => sum + (r.readings as InfieldReadings).humidity, 0) / infieldReadings.length
                : 55;

            const avgWeight = inlandReadings.length > 0
                ? inlandReadings.reduce((sum, r) => sum + (r.readings as InlandReadings).hive_weight, 0) / inlandReadings.length
                : 42;

            const healthScore = diseaseReadings.length > 0
                ? diseaseReadings.reduce((sum, r) => sum + (r.readings as DiseaseReadings).colony_health_score, 0) / diseaseReadings.length
                : 85;

            return {
                totalDevices: devices.length,
                activeDevices,
                totalReadings: readings.length,
                lastUpdate: readings[0]?.timestamp || new Date().toISOString(),
                avgTemperature: Math.round(avgTemp * 10) / 10,
                avgHumidity: Math.round(avgHumidity * 10) / 10,
                avgHiveWeight: Math.round(avgWeight * 10) / 10,
                healthScore: Math.round(healthScore)
            };
        }
    }
};

export default beeyieldService;
