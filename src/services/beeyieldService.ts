import { supabase } from '@/integrations/supabase/client';

export interface Apiary {
  id: string;
  name: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  size_acres?: number;
  type?: string;
  forage_type?: string;
  notes?: string;
  expected_hives?: number;
  created_at?: string;
}

export interface Hive {
  id: string;
  hive_code: string;
  name?: string;
  apiary_id?: string;
  hive_type?: string;
  frame_count?: number;
  status?: string;
  installation_date?: string;
  queen_status?: string;
  created_at?: string;
}

export interface IoTDevice {
  id?: string;
  serial: string;
  device_kind: string;
  link_type: string;
  label?: string;
  apiary_id?: string;
  hive_id?: string;
  status?: string;
  created_at?: string;
}

export interface Harvest {
  id?: string;
  hive_id?: string;
  apiary_id?: string;
  batch_number?: string;
  quantity_kg?: number;
  harvest_date?: string;
  honey_type?: string;
  moisture_content?: number;
  grade?: string;
  notes?: string;
  created_at?: string;
}

export interface SensorAlert {
  id: string;
  hive_id?: string;
  hive_code?: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  created_at: string;
}

export interface PublicFlightMapPayload {
  apiary: Apiary;
  hives: Hive[];
  flightRadiusKm: number;
}

const STORAGE_KEYS = {
  apiaries: 'beeyield_user_apiaries',
  hives: 'beeyield_user_hives',
  devices: 'beeyield_user_devices',
  harvests: 'beeyield_user_harvests',
};

function getLocal<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn(`Failed to write local storage key ${key}:`, err);
  }
}

export const beeyieldService = {
  async getApiaries(): Promise<Apiary[]> {
    try {
      const { data, error } = await (supabase as any).from('apiaries').select('*');
      if (!error && data && data.length > 0) return data;
    } catch {}
    return getLocal<Apiary>(STORAGE_KEYS.apiaries, [
      {
        id: 'apiary-kibwezi',
        name: 'Kibwezi Commercial Apiary',
        location_name: 'Kibwezi, Makueni County, Kenya',
        latitude: -2.409,
        longitude: 37.967,
        size_acres: 5,
        type: 'Stationary Farm Yard',
        forage_type: 'Acacia Tortilis, Desert Date & Citrus Blossom',
        notes: 'Lead Beekeeper: Timothy Nduva. 5-acre commercial apiculture site.',
      },
    ]);
  },

  async createApiary(payload: Partial<Apiary>): Promise<{ data: Apiary; error: any }> {
    const newApiary: Apiary = {
      id: payload.id || `apiary-${Date.now()}`,
      name: payload.name || 'New Apiary',
      location_name: payload.location_name || 'Kibwezi, Kenya',
      latitude: payload.latitude ?? -2.409,
      longitude: payload.longitude ?? 37.967,
      size_acres: payload.size_acres ?? 5,
      type: payload.type || 'Stationary Farm Yard',
      forage_type: payload.forage_type || 'Acacia & Desert Blossom',
      notes: payload.notes || '',
      expected_hives: payload.expected_hives ?? 10,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase as any).from('apiaries').insert(newApiary).select().single();
      if (!error && data) {
        const local = getLocal<Apiary>(STORAGE_KEYS.apiaries, []);
        saveLocal(STORAGE_KEYS.apiaries, [data, ...local.filter((a) => a.id !== data.id)]);
        return { data, error: null };
      }
    } catch {}

    const local = getLocal<Apiary>(STORAGE_KEYS.apiaries, []);
    saveLocal(STORAGE_KEYS.apiaries, [newApiary, ...local.filter((a) => a.id !== newApiary.id)]);
    return { data: newApiary, error: null };
  },

  async getHives(apiaryId?: string): Promise<Hive[]> {
    try {
      let q = (supabase as any).from('hives').select('*');
      if (apiaryId) q = q.eq('apiary_id', apiaryId);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data;
    } catch {}
    const local = getLocal<Hive>(STORAGE_KEYS.hives, []);
    return apiaryId ? local.filter((h) => h.apiary_id === apiaryId) : local;
  },

  async createHive(payload: Partial<Hive>): Promise<{ data: Hive; error: any }> {
    const newHive: Hive = {
      id: payload.id || `hive-${Date.now()}`,
      hive_code: payload.hive_code || `HIVE-${Date.now().toString().slice(-4)}`,
      name: payload.name || payload.hive_code || 'Colony',
      apiary_id: payload.apiary_id || 'apiary-kibwezi',
      hive_type: payload.hive_type || 'Langstroth 10-Frame',
      frame_count: payload.frame_count ?? 10,
      status: payload.status || 'Active',
      installation_date: payload.installation_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase as any).from('hives').insert(newHive).select().single();
      if (!error && data) {
        const local = getLocal<Hive>(STORAGE_KEYS.hives, []);
        saveLocal(STORAGE_KEYS.hives, [data, ...local.filter((h) => h.id !== data.id)]);
        return { data, error: null };
      }
    } catch {}

    const local = getLocal<Hive>(STORAGE_KEYS.hives, []);
    saveLocal(STORAGE_KEYS.hives, [newHive, ...local.filter((h) => h.id !== newHive.id)]);
    return { data: newHive, error: null };
  },

  async getDevices(): Promise<IoTDevice[]> {
    try {
      const { data, error } = await (supabase as any).from('devices').select('*');
      if (!error && data && data.length > 0) return data;
    } catch {}
    return getLocal<IoTDevice>(STORAGE_KEYS.devices, []);
  },

  async createDevice(payload: Partial<IoTDevice>): Promise<{ data: IoTDevice; error: any }> {
    const newDevice: IoTDevice = {
      id: payload.id || `device-${Date.now()}`,
      serial: payload.serial || `APISENSE-${Date.now().toString().slice(-4)}`,
      device_kind: payload.device_kind || 'vitalsensor',
      link_type: payload.link_type || 'cellular',
      label: payload.label || 'Hive Core Telemetry Node',
      apiary_id: payload.apiary_id,
      hive_id: payload.hive_id,
      status: payload.status || 'active',
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase as any).from('devices').insert(newDevice).select().single();
      if (!error && data) {
        const local = getLocal<IoTDevice>(STORAGE_KEYS.devices, []);
        saveLocal(STORAGE_KEYS.devices, [data, ...local.filter((d) => d.id !== data.id)]);
        return { data, error: null };
      }
    } catch {}

    const local = getLocal<IoTDevice>(STORAGE_KEYS.devices, []);
    saveLocal(STORAGE_KEYS.devices, [newDevice, ...local.filter((d) => d.id !== newDevice.id)]);
    return { data: newDevice, error: null };
  },

  async createHarvest(payload: Partial<Harvest>): Promise<{ data: Harvest; error: any }> {
    const newHarvest: Harvest = {
      id: payload.id || `harvest-${Date.now()}`,
      hive_id: payload.hive_id,
      apiary_id: payload.apiary_id,
      batch_number: payload.batch_number || `BATCH-${new Date().getFullYear()}-01`,
      quantity_kg: payload.quantity_kg ?? 18.5,
      harvest_date: payload.harvest_date || new Date().toISOString().split('T')[0],
      honey_type: payload.honey_type || 'Raw Acacia Blossom',
      moisture_content: payload.moisture_content ?? 17.2,
      grade: payload.grade || 'Grade A Raw Verified',
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase as any).from('harvests').insert(newHarvest).select().single();
      if (!error && data) {
        const local = getLocal<Harvest>(STORAGE_KEYS.harvests, []);
        saveLocal(STORAGE_KEYS.harvests, [data, ...local.filter((h) => h.id !== data.id)]);
        return { data, error: null };
      }
    } catch {}

    const local = getLocal<Harvest>(STORAGE_KEYS.harvests, []);
    saveLocal(STORAGE_KEYS.harvests, [newHarvest, ...local.filter((h) => h.id !== newHarvest.id)]);
    return { data: newHarvest, error: null };
  },

  async getSensorAlerts(unreadOnly = false, limit = 5): Promise<SensorAlert[]> {
    return [
      {
        id: 'alert-1',
        hive_code: 'KIB-001',
        alert_type: 'acoustic_varroa',
        severity: 'info',
        message: 'On-device acoustic analysis shows normal colony hum (245 Hz baseline).',
        created_at: new Date().toISOString(),
      },
    ];
  },

  async getPublicLiveFlightMap(locationSlug = 'kibwezi-kenya'): Promise<PublicFlightMapPayload> {
    const apiaries = await this.getApiaries();
    const primary = apiaries[0];
    const hives = await this.getHives(primary.id);
    return {
      apiary: primary,
      hives,
      flightRadiusKm: 3.2,
    };
  },

  async getFlightAreaDashboard(apiaryId?: string, landTypeId?: string) {
    return {
      activeBeesEstimate: 420000,
      averageFlightRadiusKm: 2.8,
      forageCoveragePct: 88,
    };
  },

  async planRoute(start: [number, number], end: [number, number]) {
    return {
      distanceKm: 1.4,
      estimatedFlightMinutes: 4.2,
      forageEnRoute: 'Acacia Tortilis Canopy',
    };
  },
};

export default beeyieldService;
