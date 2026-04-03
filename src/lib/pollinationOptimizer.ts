import { CalculationInputs } from './pollinationCalculations';

type LatLng = [number, number];

export interface ForageZone {
    lat: number;
    lng: number;
    ndvi?: number;
    soil_moisture?: number;
}

export interface PlacementSuggestion {
    lat: number;
    lng: number;
    score: number;
    coverage_radius_km: number;
    source: 'api' | 'local';
}

export interface PlacementOptimizerInput {
    orchardPolygon: LatLng[];
    hiveCount: number;
    flightRadiusKm?: number;
    zones?: ForageZone[];
    windDirectionDeg?: number; // 0 = north
    calcInputs?: CalculationInputs;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const haversineKm = (a: LatLng, b: LatLng) => {
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLng = ((b[1] - a[1]) * Math.PI) / 180;
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const c = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
};

const pointInPolygon = (point: LatLng, vs: LatLng[]) => {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][1], yi = vs[i][0];
        const xj = vs[j][1], yj = vs[j][0];
        const intersect = ((yi > point[0]) !== (yj > point[0])) &&
            (point[1] < (xj - xi) * (point[0] - yi) / (yj - yi + 1e-9) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const samplePoints = (polygon: LatLng[], targetCount: number): LatLng[] => {
    if (!polygon.length) return [];
    const lats = polygon.map(p => p[0]);
    const lngs = polygon.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const samples: LatLng[] = [];
    const gridSize = Math.max(12, Math.ceil(Math.sqrt(targetCount * 12)));
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const lat = minLat + (maxLat - minLat) * (i + 0.3) / gridSize;
            const lng = minLng + (maxLng - minLng) * (j + 0.7) / gridSize;
            const pt: LatLng = [lat, lng];
            if (pointInPolygon(pt, polygon)) {
                samples.push(pt);
            }
        }
    }
    return samples;
};

const normalizeNdvi = (v?: number) => {
    if (v === undefined || v === null) return 0.5;
    return clamp((v - 0.1) / 0.6, 0, 1);
};

const bearingScore = (center: LatLng, candidate: LatLng, windDeg: number) => {
    // Reward slight upwind placement (10-40 degrees offset)
    const toPointDeg = Math.atan2(
        Math.sin((candidate[1] - center[1]) * Math.PI / 180) * Math.cos(candidate[0] * Math.PI / 180),
        Math.cos(center[0] * Math.PI / 180) * Math.sin(candidate[0] * Math.PI / 180) -
        Math.sin(center[0] * Math.PI / 180) * Math.cos(candidate[0] * Math.PI / 180) * Math.cos((candidate[1] - center[1]) * Math.PI / 180)
    ) * 180 / Math.PI;
    const delta = Math.abs(((toPointDeg - windDeg + 540) % 360) - 180);
    // ideal delta around 30-60 degrees
    const diff = Math.abs(delta - 45);
    return clamp(1 - diff / 90, 0, 1);
};

export const optimizeHivePlacementLocal = (input: PlacementOptimizerInput): PlacementSuggestion[] => {
    const { orchardPolygon, hiveCount, flightRadiusKm = 1.2, zones = [], windDirectionDeg = 90, calcInputs } = input;
    if (!orchardPolygon || orchardPolygon.length < 3 || hiveCount <= 0) return [];

    const centroid: LatLng = [
        orchardPolygon.reduce((s, p) => s + p[0], 0) / orchardPolygon.length,
        orchardPolygon.reduce((s, p) => s + p[1], 0) / orchardPolygon.length,
    ];

    const candidates = samplePoints(orchardPolygon, hiveCount * 8);
    if (!candidates.length) return [];

    const baseScores = candidates.map((pt) => {
        const zoneBoost = zones.length
            ? zones.reduce((best, z) => {
                const d = haversineKm(pt, [z.lat, z.lng]);
                const ndviScore = normalizeNdvi(z.ndvi);
                const proximity = Math.exp(-(d / Math.max(0.1, flightRadiusKm)) ** 2);
                return Math.max(best, ndviScore * proximity);
            }, 0)
            : 0.5;

        const windScore = bearingScore(centroid, pt, windDirectionDeg);
        const distToCenter = haversineKm(pt, centroid);
        const centroidScore = Math.exp(-(distToCenter / (flightRadiusKm * 1.2)) ** 2);

        // Optional bloom / forage multipliers
        const bloom = calcInputs?.bloomIntensity ?? 1;
        const forage = calcInputs?.forageCondition ?? 1;
        const bloomForage = clamp(0.6 + 0.2 * bloom + 0.2 * forage, 0.3, 1.3);

        const score = (0.45 * zoneBoost) + (0.25 * windScore) + (0.3 * centroidScore);
        return { pt, score: score * bloomForage };
    });

    const chosen: PlacementSuggestion[] = [];
    const minSeparationKm = flightRadiusKm * 0.65;

    while (chosen.length < hiveCount && baseScores.length) {
        baseScores.sort((a, b) => b.score - a.score);
        const next = baseScores.shift();
        if (!next) break;

        const spacing = chosen.length
            ? Math.min(...chosen.map(c => haversineKm([c.lat, c.lng], next.pt)))
            : Infinity;

        const spacingScore = spacing === Infinity
            ? 1
            : clamp(Math.log1p(spacing) / Math.log1p(minSeparationKm * 2), 0, 1);

        const combinedScore = 0.7 * next.score + 0.3 * spacingScore;
        if (spacing >= minSeparationKm * 0.6 || chosen.length === 0) {
            chosen.push({
                lat: next.pt[0],
                lng: next.pt[1],
                coverage_radius_km: flightRadiusKm,
                score: Number(combinedScore.toFixed(3)),
                source: 'local'
            });
        }
    }

    if (!chosen.length && candidates.length) {
        const best = baseScores.sort((a, b) => b.score - a.score)[0];
        if (best) {
            chosen.push({
                lat: best.pt[0],
                lng: best.pt[1],
                coverage_radius_km: flightRadiusKm,
                score: Number(best.score.toFixed(3)),
                source: 'local'
            });
        }
    }

    return chosen.sort((a, b) => b.score - a.score).slice(0, hiveCount);
};
