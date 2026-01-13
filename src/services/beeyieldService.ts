import { supabase } from '@/lib/supabase';

// Types for BeeYield Dashboard
export interface SensorReading {
    id: string;
    created_at: string;
    device_id: string;
    sensor_type: 'infield' | 'inland' | 'disease';
    timestamp: string;
    latitude?: number;
    longitude?: number;
    readings: InfieldReadings | InlandReadings | DiseaseReadings;
    battery_level?: number;
    signal_strength?: number;
    status: string;
}

export interface InfieldReadings {
    temperature: number;
    humidity: number;
    soil_moisture: number;
}

export interface InlandReadings {
    hive_weight: number;
    internal_temp: number;
    bee_activity: number; // 0-100 scale
}

export interface DiseaseReadings {
    colony_health_score: number; // 0-100
    pest_detection: 'none' | 'low' | 'medium' | 'high';
    treatment_status: 'none' | 'scheduled' | 'in_progress' | 'completed';
}

export interface IoTDevice {
    id: string;
    created_at: string;
    device_code: string;
    device_name: string;
    device_type: 'infield' | 'inland' | 'disease';
    location_name?: string;
    latitude?: number;
    longitude?: number;
    farmer_id?: string;
    apiary_id?: string;
    hive_id?: string;
    last_ping?: string;
    battery_level?: number;
    firmware_version?: string;
    status: string;
}

export interface ClientHive {
    id: string;
    created_at: string;
    user_id: string;
    hive_name: string;
    hive_code?: string;
    crop_type?: string;
    farm_location?: string;
    latitude?: number;
    longitude?: number;
    contract_start?: string;
    contract_end?: string;
    status: 'active' | 'inactive' | 'pending';
}

// Mock data for demo purposes (no real sensors yet)
const mockDevices: IoTDevice[] = [
    {
        id: '1',
        created_at: new Date().toISOString(),
        device_code: 'BYS-INF-001',
        device_name: 'Field Sensor Alpha',
        device_type: 'infield',
        location_name: 'Kibwezi Farm Block A',
        latitude: -2.4167,
        longitude: 37.9667,
        last_ping: new Date(Date.now() - 5 * 60000).toISOString(),
        battery_level: 87,
        firmware_version: 'v2.1.3',
        status: 'active'
    },
    {
        id: '2',
        created_at: new Date().toISOString(),
        device_code: 'BYS-INL-001',
        device_name: 'Hive Monitor Beta',
        device_type: 'inland',
        location_name: 'Apiary Station 1',
        latitude: -2.4180,
        longitude: 37.9680,
        last_ping: new Date(Date.now() - 2 * 60000).toISOString(),
        battery_level: 92,
        firmware_version: 'v2.1.3',
        status: 'active'
    },
    {
        id: '3',
        created_at: new Date().toISOString(),
        device_code: 'BYS-DIS-001',
        device_name: 'Health Scanner Gamma',
        device_type: 'disease',
        location_name: 'Apiary Station 1',
        latitude: -2.4175,
        longitude: 37.9670,
        last_ping: new Date(Date.now() - 8 * 60000).toISOString(),
        battery_level: 76,
        firmware_version: 'v2.0.8',
        status: 'active'
    },
    {
        id: '4',
        created_at: new Date().toISOString(),
        device_code: 'BYS-INF-002',
        device_name: 'Field Sensor Delta',
        device_type: 'infield',
        location_name: 'Kibwezi Farm Block B',
        latitude: -2.4200,
        longitude: 37.9690,
        last_ping: new Date(Date.now() - 15 * 60000).toISOString(),
        battery_level: 45,
        firmware_version: 'v2.1.3',
        status: 'active'
    }
];

// Generate mock sensor readings
const generateMockReadings = (): SensorReading[] => {
    const readings: SensorReading[] = [];
    const now = Date.now();

    // Generate readings for past 24 hours (hourly)
    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now - i * 3600000).toISOString();

        // Infield readings
        readings.push({
            id: `inf-${i}`,
            created_at: timestamp,
            device_id: '1',
            sensor_type: 'infield',
            timestamp,
            latitude: -2.4167,
            longitude: 37.9667,
            readings: {
                temperature: 25 + Math.random() * 10,
                humidity: 55 + Math.random() * 25,
                soil_moisture: 30 + Math.random() * 40
            } as InfieldReadings,
            battery_level: 87 - (i * 0.2),
            signal_strength: 85 + Math.random() * 15,
            status: 'active'
        });

        // Inland readings
        readings.push({
            id: `inl-${i}`,
            created_at: timestamp,
            device_id: '2',
            sensor_type: 'inland',
            timestamp,
            latitude: -2.4180,
            longitude: 37.9680,
            readings: {
                hive_weight: 42 + Math.random() * 8,
                internal_temp: 34 + Math.random() * 3,
                bee_activity: 60 + Math.random() * 30
            } as InlandReadings,
            battery_level: 92 - (i * 0.15),
            signal_strength: 90 + Math.random() * 10,
            status: 'active'
        });

        // Disease readings (every 4 hours)
        if (i % 4 === 0) {
            readings.push({
                id: `dis-${i}`,
                created_at: timestamp,
                device_id: '3',
                sensor_type: 'disease',
                timestamp,
                latitude: -2.4175,
                longitude: 37.9670,
                readings: {
                    colony_health_score: 85 + Math.random() * 15,
                    pest_detection: 'none',
                    treatment_status: 'none'
                } as DiseaseReadings,
                battery_level: 76 - (i * 0.3),
                signal_strength: 75 + Math.random() * 20,
                status: 'active'
            });
        }
    }

    return readings;
};

const mockClientHives: ClientHive[] = [
    {
        id: 'ch-1',
        created_at: '2025-01-01T00:00:00Z',
        user_id: '',
        hive_name: 'Kibwezi Pollination Hive A',
        hive_code: 'KIB-POL-001',
        crop_type: 'Mangoes',
        farm_location: 'Kibwezi, Makueni County',
        latitude: -2.4167,
        longitude: 37.9667,
        contract_start: '2025-12-01',
        contract_end: '2026-03-31',
        status: 'active'
    },
    {
        id: 'ch-2',
        created_at: '2025-01-01T00:00:00Z',
        user_id: '',
        hive_name: 'Kibwezi Pollination Hive B',
        hive_code: 'KIB-POL-002',
        crop_type: 'Oranges',
        farm_location: 'Kibwezi, Makueni County',
        latitude: -2.4180,
        longitude: 37.9675,
        contract_start: '2025-12-01',
        contract_end: '2026-03-31',
        status: 'active'
    },
    {
        id: 'ch-3',
        created_at: '2025-02-01T00:00:00Z',
        user_id: '',
        hive_name: 'Machakos Sunflower Hive',
        hive_code: 'MAC-SUN-001',
        crop_type: 'Sunflower',
        farm_location: 'Machakos County',
        latitude: -1.5177,
        longitude: 37.2634,
        contract_start: '2026-01-15',
        contract_end: '2026-04-15',
        status: 'pending'
    }
];

export const beeyieldService = {
    // Get all IoT devices
    async getDevices(): Promise<IoTDevice[]> {
        if (!supabase) {
            return mockDevices;
        }

        try {
            const { data, error } = await supabase
                .from('iot_devices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data?.length ? data : mockDevices;
        } catch (error) {
            console.warn('Using mock devices:', error);
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
        if (!supabase) {
            const readings = generateMockReadings();
            return type ? readings.filter(r => r.sensor_type === type) : readings;
        }

        try {
            const since = new Date(Date.now() - hours * 3600000).toISOString();
            let query = supabase
                .from('sensor_readings')
                .select('*')
                .gte('timestamp', since)
                .order('timestamp', { ascending: false });

            if (type) {
                query = query.eq('sensor_type', type);
            }

            const { data, error } = await query;

            if (error) throw error;

            const readings = generateMockReadings();
            return data?.length ? data : (type ? readings.filter(r => r.sensor_type === type) : readings);
        } catch (error) {
            console.warn('Using mock readings:', error);
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
        if (!supabase || !userId) {
            return mockClientHives.map(h => ({ ...h, user_id: userId || 'demo' }));
        }

        try {
            const { data, error } = await supabase
                .from('client_hives')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data?.length ? data : mockClientHives.map(h => ({ ...h, user_id: userId }));
        } catch (error) {
            console.warn('Using mock client hives:', error);
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
        const devices = await this.getDevices();
        const readings = await this.getSensorReadings();

        const activeDevices = devices.filter(d => d.status === 'active').length;
        const infieldReadings = readings.filter(r => r.sensor_type === 'infield');
        const inlandReadings = readings.filter(r => r.sensor_type === 'inland');
        const diseaseReadings = readings.filter(r => r.sensor_type === 'disease');

        const avgTemp = infieldReadings.length > 0
            ? infieldReadings.reduce((sum, r) => sum + (r.readings as InfieldReadings).temperature, 0) / infieldReadings.length
            : 0;

        const avgHumidity = infieldReadings.length > 0
            ? infieldReadings.reduce((sum, r) => sum + (r.readings as InfieldReadings).humidity, 0) / infieldReadings.length
            : 0;

        const avgWeight = inlandReadings.length > 0
            ? inlandReadings.reduce((sum, r) => sum + (r.readings as InlandReadings).hive_weight, 0) / inlandReadings.length
            : 0;

        const healthScore = diseaseReadings.length > 0
            ? diseaseReadings.reduce((sum, r) => sum + (r.readings as DiseaseReadings).colony_health_score, 0) / diseaseReadings.length
            : 0;

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
};

export default beeyieldService;
