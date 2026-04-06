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

    async createBuilding(input: Omit<Building, 'id' | 'created_at'>): Promise<Building> {
        return apiPost<Building>('/meters/buildings', input);
    },

    async updateBuilding(id: string, patch: Partial<Building>): Promise<Building> {
        return apiPatch<Building>(`/meters/buildings/${id}`, patch);
    },

    async deleteBuilding(id: string): Promise<void> {
        await apiDelete<void>(`/meters/buildings/${id}`);
    },

    async getApartments(buildingId?: string): Promise<Apartment[]> {
        return apiGet<Apartment[]>('/meters/apartments', buildingId ? { building_id: buildingId } : {});
    },

    async createApartment(input: Omit<Apartment, 'id' | 'created_at'>): Promise<Apartment> {
        return apiPost<Apartment>('/meters/apartments', input);
    },

    async updateApartment(id: string, patch: Partial<Apartment>): Promise<Apartment> {
        return apiPatch<Apartment>(`/meters/apartments/${id}`, patch);
    },

    async deleteApartment(id: string): Promise<void> {
        await apiDelete<void>(`/meters/apartments/${id}`);
    },

    async getMeters(filters?: {
        building_id?: string;
        apartment_id?: string;
        meter_type?: string;
    }): Promise<Meter[]> {
        return apiGet<Meter[]>('/meters/devices', filters || {});
    },

    async getMeter(id: string): Promise<Meter> {
        return apiGet<Meter>(`/meters/devices/${id}`);
    },

    async getReadings(meterId: string, limit: number = 50): Promise<Reading[]> {
        return apiGet<Reading[]>(`/meters/readings/${meterId}`, { limit });
    },

    async createReading(input: Omit<Reading, 'id'>): Promise<Reading> {
        return apiPost<Reading>('/meters/readings', input);
    },

    async getBillingRates(): Promise<BillingRate[]> {
        return apiGet<BillingRate[]>('/meters/billing-rates');
    },

    async getBillingRate(id: string): Promise<BillingRate> {
        return apiGet<BillingRate>(`/meters/billing-rates/${id}`);
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

    async updateBillingRate(id: string, patch: Partial<{
        meter_type: string;
        rate_per_unit: number;
        unit: string;
        currency: string;
        description: string;
        is_active: boolean;
        effective_from: string;
    }>): Promise<BillingRate> {
        return apiPatch<BillingRate>(`/meters/billing-rates/${id}`, patch);
    },

    async deleteBillingRate(id: string): Promise<void> {
        await apiDelete<void>(`/meters/billing-rates/${id}`);
    },

    async getEvents(severity?: string): Promise<MeterEvent[]> {
        return apiGet<MeterEvent[]>('/meters/events', severity ? { severity } : {});
    },

    async createEvent(input: Omit<MeterEvent, 'id'>): Promise<MeterEvent> {
        return apiPost<MeterEvent>('/meters/events', input);
    },

    async resolveEvent(id: string): Promise<MeterEvent> {
        return apiPatch<MeterEvent>(`/meters/events/${id}/resolve`, {});
    },

    async createMeter(input: {
        building_id: string;
        apartment_id?: string;
        meter_type: string;
        meter_number: string;
        meter_code?: string | null;
        status?: string;
        install_date?: string | null;
    }): Promise<Meter> {
        return apiPost<Meter>('/meters/devices', input);
    },

    async updateMeter(id: string, patch: Partial<{
        apartment_id: string | null;
        building_id: string;
        meter_type: string;
        meter_number: string;
        meter_code: string | null;
        status: string;
        has_alarm: boolean;
        install_date: string | null;
        metadata: any;
    }>): Promise<Meter> {
        return apiPatch<Meter>(`/meters/devices/${id}`, patch);
    },

    async deleteMeter(id: string): Promise<void> {
        await apiDelete<void>(`/meters/devices/${id}`);
    },
};
