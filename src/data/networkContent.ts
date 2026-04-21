/**
 * networkContent.ts
 * ─────────────────────────────────────────────────────────────────
 * Centralized data for the GlobalHiveNetwork page.
 * Extracts fallback nodes, satellite positions, and static
 * configuration out of the component file.
 * ─────────────────────────────────────────────────────────────────
 */

export interface SatelliteNode {
  id: string;
  lat: number;
  lng: number;
  status: 'Active' | 'Warning';
}

export interface NetworkNode {
  id: string;
  name: string;
  region: string;
  crop: string;
  latitude: number;
  longitude: number;
  hiveCount: number;
  acreage: number;
  readiness: number;
  signal: 'stable' | 'watch' | 'surge';
}

/* ── Kibwezi Hub ───────────────────────────────────────────────── */

export const KIBWEZI_HUB = {
  id: 'kibwezi-hq',
  name: 'Kibwezi HQ',
  lat: -2.4167,
  lng: 37.9667,
} as const;

/* ── Satellite Positions ───────────────────────────────────────── */

export const SATELLITES: SatelliteNode[] = [
  { id: 'API-01', lat: -2.3867, lng: 37.9567, status: 'Active' },
  { id: 'API-02', lat: -2.4367, lng: 37.9867, status: 'Active' },
  { id: 'API-03', lat: -2.4067, lng: 37.9167, status: 'Warning' },
  { id: 'API-04', lat: -2.4467, lng: 37.9467, status: 'Active' },
  { id: 'API-05', lat: -2.3967, lng: 37.9967, status: 'Active' },
  { id: 'API-06', lat: -2.4267, lng: 37.9967, status: 'Active' },
  { id: 'API-07', lat: -2.4367, lng: 37.9267, status: 'Active' },
  { id: 'API-08', lat: -2.3767, lng: 37.9767, status: 'Active' },
  { id: 'API-09', lat: -2.4567, lng: 37.9667, status: 'Active' },
];

/* ── Fallback Nodes (used when no live apiaries exist) ─────────── */

export const FALLBACK_NODES: NetworkNode[] = [
  {
    id: KIBWEZI_HUB.id,
    name: KIBWEZI_HUB.name,
    region: 'Makueni County, Kenya',
    crop: 'Mixed Forage & Acacia',
    latitude: KIBWEZI_HUB.lat,
    longitude: KIBWEZI_HUB.lng,
    hiveCount: 250,
    acreage: 6500,
    readiness: 98,
    signal: 'stable',
  },
  ...SATELLITES.map((sat) => ({
    id: sat.id,
    name: `Node ${sat.id}`,
    region: 'Makueni County, Kenya',
    crop: 'Acacia',
    latitude: sat.lat,
    longitude: sat.lng,
    hiveCount: Math.floor(Math.random() * 50) + 10,
    acreage: 120,
    readiness: sat.status === 'Active' ? 95 : 60,
    signal: (sat.status === 'Active' ? 'surge' : 'watch') as NetworkNode['signal'],
  })),
];

/* ── Node Analytics Messages ───────────────────────────────────── */

export const NODE_ANALYTICS_MESSAGES: Record<NetworkNode['signal'], string> = {
  surge:
    'Hub Connected: Utilizing non-invasive air diagnostics, this node maintains 95% accuracy in detecting early-stage Foulbrood and Varroa.',
  watch:
    'Warning: AI models predict an 85% vector spread potential to adjacent nodes. Apisense recommends immediate hive isolation.',
  stable:
    'Stable Uplink: Continuous acoustic and atmospheric sensors confirm nominal hive activity. Readiness supports premium pollination.',
};
