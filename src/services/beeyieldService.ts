import { supabase } from '@/lib/supabase';
import { apiGet } from './api';

// Types for BeeYield Dashboard
// ... (interfaces remain the same)

// ... (mock data remains for fallback)

export const beeyieldService = {
    // Get all IoT devices
    async getDevices(): Promise<IoTDevice[]> {
        try {
            const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
            const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

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
            const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
            const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

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
            const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
            const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

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
            const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
            const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

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
