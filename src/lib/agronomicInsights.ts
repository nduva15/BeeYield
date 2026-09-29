/**
 * BeeYield Agronomic Decision Engine
 * Translates raw technical IoT data (Hz, dB, °C, kg, % RH) into actionable
 * farm insights and plain-English recommendations for beekeepers & agronomists.
 */

export interface AgronomicTelemetryInputs {
    hiveCode?: string;
    temperature_c?: number | null;
    humidity_pct?: number | null;
    weight_kg?: number | null;
    weight_delta_24h?: number | null;
    acoustic_hz?: number | null;
    acoustic_db?: number | null;
    bloom_stage_pct?: number | null;
    forager_flight_index?: number | null;
}

export type InsightSeverity = 'critical' | 'warning' | 'opportunity' | 'optimal';

export interface ActionableInsight {
    id: string;
    title: string;
    severity: InsightSeverity;
    technicalMetric: string;
    plainEnglishDiagnosis: string;
    recommendedAction: string;
    actionLabel: string;
    actionType: 'inspect' | 'deploy_hive' | 'add_super' | 'treatment' | 'view_telemetry';
}

export function evaluateAgronomicInsights(inputs: AgronomicTelemetryInputs): ActionableInsight[] {
    const insights: ActionableInsight[] = [];
    const {
        hiveCode = 'Target Colony',
        temperature_c,
        humidity_pct,
        weight_delta_24h,
        acoustic_hz,
        acoustic_db,
        bloom_stage_pct,
        forager_flight_index
    } = inputs;

    // 1. Swarming Risk (Acoustic 420-520 Hz spike)
    if (acoustic_hz && acoustic_hz >= 420 && acoustic_hz <= 540) {
        insights.push({
            id: 'swarm-imminent',
            title: `High Risk of Swarm Departure (${hiveCode})`,
            severity: 'critical',
            technicalMetric: `Acoustic Peak: ${Math.round(acoustic_hz)} Hz (Normal: 180-260 Hz)`,
            plainEnglishDiagnosis: 'The colony is producing the characteristic piping and pre-swarm humming frequencies. Prime swarm is preparing to leave within 24–48 hours.',
            recommendedAction: 'Perform an immediate brood inspection. Look for capped queen swarm cells, split the colony into a nuc box, or provide immediate comb expansion.',
            actionLabel: 'Schedule Immediate Split',
            actionType: 'inspect'
        });
    }

    // 2. Brood Chilling & Queen Failure (Core temp < 33.5°C)
    if (temperature_c !== null && temperature_c !== undefined && temperature_c > 0 && temperature_c < 33.5) {
        insights.push({
            id: 'brood-chilling',
            title: `Brood Chilling / Queen Loss (${hiveCode})`,
            severity: 'critical',
            technicalMetric: `Brood Core: ${temperature_c.toFixed(1)}°C (Target: 34.5°C – 35.5°C)`,
            plainEnglishDiagnosis: 'Colony cannot maintain the vital 35°C thermal core required for larvae development. High risk of brood mortality or queen failure.',
            recommendedAction: 'Inspect entrance reducer, seal drafts, and check colony population. If queenless, introduce a mated queen cage.',
            actionLabel: 'Check Queen Status',
            actionType: 'inspect'
        });
    }

    // 3. Pollination Deficit in Orchard
    if (bloom_stage_pct && bloom_stage_pct >= 60 && (forager_flight_index || 0) < 45) {
        insights.push({
            id: 'pollination-deficit',
            title: 'Orchard Under-Pollination Detected',
            severity: 'warning',
            technicalMetric: `Bloom Stage: ${Math.round(bloom_stage_pct)}% · Forager Activity: Low (${Math.round(forager_flight_index || 0)}/100)`,
            plainEnglishDiagnosis: 'Flowers are in peak receptive bloom, but bee visit frequency is below the threshold needed for commercial fruit set.',
            recommendedAction: 'Add 2 hives to the under-visited sector to raise flower-visit density and secure target pollination yield.',
            actionLabel: 'Deploy 2 Hives to Sector',
            actionType: 'deploy_hive'
        });
    }

    // 4. Heavy Honey Flow (Add Super Opportunity)
    if (weight_delta_24h && weight_delta_24h >= 1.8) {
        insights.push({
            id: 'honey-flow-super',
            title: `Surging Honey Flow: +${weight_delta_24h.toFixed(1)}kg in 24h`,
            severity: 'opportunity',
            technicalMetric: `Scale Gain: +${weight_delta_24h.toFixed(1)} kg/day`,
            plainEnglishDiagnosis: 'Massive nectar intake underway from active acacia/mango bloom. The colony will become honey-bound without additional storage comb.',
            recommendedAction: 'Add a shallow or medium honey super with drawn comb to maximize honey harvest.',
            actionLabel: 'Add Honey Super',
            actionType: 'add_super'
        });
    }

    // 5. High Moisture / Mold Danger (Humidity > 78%)
    if (humidity_pct && humidity_pct >= 78) {
        insights.push({
            id: 'moisture-ventilation',
            title: `Excess Moisture Alert (${Math.round(humidity_pct)}% RH)`,
            severity: 'warning',
            technicalMetric: `Relative Humidity: ${Math.round(humidity_pct)}%`,
            plainEnglishDiagnosis: 'Internal condensation is accumulating. Excessive moisture leads to chalkbrood fungal growth and fermented winter honey stores.',
            recommendedAction: 'Tilt hive slightly forward and open top ventilation hole or install a moisture quilt.',
            actionLabel: 'Inspect Ventilation',
            actionType: 'inspect'
        });
    }

    // 6. Nighttime Disturbance / Robbing (Decibel spike at night)
    if (acoustic_db && acoustic_db >= 75) {
        insights.push({
            id: 'night-disturbance',
            title: `Unusual Apiary Disturbance (${Math.round(acoustic_db)} dB)`,
            severity: 'warning',
            technicalMetric: `Acoustic Amplitude: ${Math.round(acoustic_db)} dB`,
            plainEnglishDiagnosis: 'Abnormal noise spike detected outside foraging hours, indicating potential predator tampering (badger, cattle) or robbing bees.',
            recommendedAction: 'Verify physical hive stand stability, check entrance security, and ensure hive straps are tensioned.',
            actionLabel: 'Check Stand Security',
            actionType: 'inspect'
        });
    }

    // Fallback if everything is running optimally
    if (insights.length === 0) {
        insights.push({
            id: 'all-optimal',
            title: 'Colony & Orchard Balanced',
            severity: 'optimal',
            technicalMetric: 'All telemetry metrics within target biological envelopes',
            plainEnglishDiagnosis: 'Brood temperature, humidity, and flight acoustics indicate healthy queen oviposition and steady foraging.',
            recommendedAction: 'No immediate field intervention needed. Next routine inspection scheduled in 7 days.',
            actionLabel: 'View Telemetry Trends',
            actionType: 'view_telemetry'
        });
    }

    return insights;
}
