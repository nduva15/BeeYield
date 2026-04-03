import { apiDelete, apiGet, apiPatch, apiPost } from './api';

export interface Building {
    id: string;
    name: string;
    address: string;
    county?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    metadata?: any;
    created_at: string;
}

export interface Apartment {
    id: string;
    building_id: string;
    unit_number: string;
    floor?: string;
    occupant_name?: string;
    metadata?: any;
    created_at: string;
}

export interface Meter {
    id: string;
    apartment_id?: string;
    building_id: string;
    meter_type: string;
    meter_number: string;
    meter_code?: string;
    status: string;
    has_alarm: boolean;
    install_date?: string;
    last_reading_value?: number;
    last_reading_unit?: string;
    last_reading_at?: string;
    metadata?: any;
    created_at: string;
    // UI helpers (joined in frontend or manual)
    building_name?: string;
    apartment_unit?: string;
}

export interface Reading {
    id: string;
    meter_id: string;
    value: number;
    unit: string;
    timestamp: string;
    reading_type: string;
}

export interface BillingRate {
    id: string;
    meter_type: string;
    rate_per_unit: number;
    unit: string;
    currency: string;
    description?: string;
    is_active: boolean;
    effective_from: string;
}

export interface MeterEvent {
    id: string;
    meter_id: string;
    event_type: string;
    severity: string;
    message?: string;
    reason?: string;
    timestamp: string;
    is_resolved: boolean;
    resolved_at?: string;
}

export const meterService = {
    async getBuildings(): Promise<Building[]> {
        return apiGet<Building[]>('/meters/buildings');
    },

    async getApartments(buildingId?: string): Promise<Apartment[]> {
        return apiGet<Apartment[]>('/meters/apartments', buildingId ? { building_id: buildingId } : {});
    },

    async getMeters(filters?: {
        building_id?: string;
        apartment_id?: string;
        meter_type?: string;
    }): Promise<Meter[]> {
        return apiGet<Meter[]>('/meters/devices', filters || {});
    },

    async getReadings(meterId: string, limit: number = 50): Promise<Reading[]> {
        return apiGet<Reading[]>(`/meters/readings/${meterId}`, { limit });
    },

    async getBillingRates(): Promise<BillingRate[]> {
        return apiGet<BillingRate[]>('/meters/billing-rates');
    },

    async createBillingRate(input: {
        meter_type: string;
        rate_per_unit: number;
        unit: string;
        currency?: string;
        description?: string;
        is_active?: boolean;
    }): Promise<BillingRate> {
        return apiPost<BillingRate>('/meters/billing-rates', input);
    },

    async getEvents(severity?: string): Promise<MeterEvent[]> {
        return apiGet<MeterEvent[]>('/meters/events', severity ? { severity } : {});
    },

    async createMeter(input: {
        building_id: string;
        apartment_id?: string;
        meter_type: string;
        meter_number: string;
        status?: string;
    }): Promise<Meter> {
        return apiPost<Meter>('/meters/devices', input);
    },

    async updateMeter(meterId: string, patch: Partial<Pick<Meter, 'apartment_id' | 'building_id' | 'meter_type' | 'meter_number' | 'meter_code' | 'status' | 'has_alarm' | 'install_date'>>): Promise<Meter> {
        return apiPatch<Meter>(`/meters/devices/${meterId}`, patch);
    },

    async deleteMeter(meterId: string): Promise<{ success: boolean }> {
        return apiDelete<{ success: boolean }>(`/meters/devices/${meterId}`);
    },

    async updateBillingRate(rateId: string, patch: Partial<Pick<BillingRate, 'meter_type' | 'rate_per_unit' | 'unit' | 'currency' | 'description' | 'is_active'>>): Promise<BillingRate> {
        return apiPatch<BillingRate>(`/meters/billing-rates/${rateId}`, patch);
    },

    async deleteBillingRate(rateId: string): Promise<{ success: boolean }> {
        return apiDelete<{ success: boolean }>(`/meters/billing-rates/${rateId}`);
    },
};
