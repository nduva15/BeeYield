/**
 * BeeYield Agronomic Decision Engine
 * Translates raw technical IoT data (Hz, dB, °C, kg, % RH) into actionable
 * farm insights and plain-English recommendations for beekeepers & agronomists.
 */

export interface AgronomicTelemetryInputs {
    hiveCode?: string;
    hasConnectedDevice?: boolean;
    temperature_c?: number | null;
    humidity_pct?: number | null;
    weight_kg?: number | null;
    weight_delta_24h?: number | null;
    acoustic_hz?: number | null;
    acoustic_db?: number | null;
    battery_pct?: number | null;
    varroa_count?: number | null;
    varroa_detected?: boolean;
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
    actionType: 'inspect' | 'deploy_hive' | 'add_super' | 'treatment' | 'view_telemetry' | 'charge_battery' | 'scale_inspection';
}

export function evaluateAgronomicInsights(inputs: AgronomicTelemetryInputs): ActionableInsight[] {
    const insights: ActionableInsight[] = [];
    const {
        hiveCode = 'Target Colony',
        hasConnectedDevice = false,
        temperature_c,
        humidity_pct,
        weight_kg,
        weight_delta_24h,
        acoustic_hz,
        acoustic_db,
        battery_pct,
        varroa_count,
        varroa_detected,
        bloom_stage_pct,
        forager_flight_index
    } = inputs;

    // 1. Varroa Mite Infestation Alert (High Mite count or vision/inspection detector)
    if (varroa_detected || (varroa_count !== null && varroa_count !== undefined && varroa_count > 2)) {
        const countStr = varroa_count !== null && varroa_count !== undefined ? `${varroa_count} mites` : 'High Load';
        insights.push({
            id: 'varroa-infestation',
            title: `Varroa Mite Outbreak Detected (${hiveCode})`,
            severity: 'critical',
            technicalMetric: `Mite Count: ${countStr} (Safe Threshold: ≤2 mites / 300 bees)`,
            plainEnglishDiagnosis: 'Parasitic Varroa destructor mites detected above safety threshold. High risk of Deformed Wing Virus (DWV) transmission and rapid colony collapse.',
            recommendedAction: 'Apply organic oxalic acid vaporization or thymol treatment immediately. Schedule follow-up alcohol wash test in 14 days.',
            actionLabel: 'Log Varroa Treatment',
            actionType: 'treatment'
        });
    }

    // 2. Weight Loss / Feed Starvation / Robbing Alert (Rapid negative weight drop)
    if (weight_delta_24h !== null && weight_delta_24h !== undefined && weight_delta_24h <= -0.8) {
        insights.push({
            id: 'weight-loss-alert',
            title: `Rapid Hive Weight Loss (${hiveCode})`,
            severity: 'critical',
            technicalMetric: `Scale Loss: ${weight_delta_24h.toFixed(1)} kg / 24h`,
            plainEnglishDiagnosis: 'Substantial mass drop detected. Indicates either robbing frenzy by neighboring colonies, severe brood starvation, or prime swarm departure.',
            recommendedAction: 'Reduce hive entrance to 1 bee width to stop robbing, check honey stores immediately, and administer 2:1 sugar syrup feeding if depleted.',
            actionLabel: 'Check Food Stores & Robbing',
            actionType: 'scale_inspection'
        });
    }

    // 3. Sensor Hardware: Battery Critical / Charging Required (< 20%)
    if (battery_pct !== null && battery_pct !== undefined && battery_pct <= 20) {
        insights.push({
            id: 'battery-low-alert',
            title: `Sensor Battery Critical: ${Math.round(battery_pct)}% (${hiveCode})`,
            severity: 'warning',
            technicalMetric: `Battery Level: ${Math.round(battery_pct)}% (Threshold: 20%)`,
            plainEnglishDiagnosis: 'In-hive VitalSensor / Telemetry Scale is low on power. Continued monitoring and alerts will go offline if not charged.',
            recommendedAction: 'Inspect solar charging panel alignment, clean dust from PV surface, or swap sensor battery cell.',
            actionLabel: 'Swap / Charge Battery',
            actionType: 'charge_battery'
        });
    }

    // 4. Swarming Risk (Acoustic 420-520 Hz spike)
    if (acoustic_hz && acoustic_hz >= 420 && acoustic_hz <= 540) {
        insights.push({
            id: 'swarm-imminent',
            title: `High Risk of Swarm Departure (${hiveCode})`,
            severity: 'critical',
            technicalMetric: `Acoustic Peak: ${Math.round(acoustic_hz)} Hz (Normal: 180-260 Hz)`,
            plainEnglishDiagnosis: 'The colony is producing characteristic piping and pre-swarm humming frequencies. Prime swarm is preparing to leave within 24–48 hours.',
            recommendedAction: 'Perform an immediate brood inspection. Look for capped queen swarm cells, split the colony into a nuc box, or provide immediate comb expansion.',
            actionLabel: 'Schedule Immediate Split',
            actionType: 'inspect'
        });
    }

    // 5. Brood Chilling & Queen Failure (Core temp < 33.5°C when telemetry device is present)
    if (hasConnectedDevice && temperature_c !== null && temperature_c !== undefined && temperature_c > 0 && temperature_c < 33.5) {
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

    // 6. Pollination Deficit in Orchard
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

    // 7. Heavy Honey Flow (Add Super Opportunity)
    if (weight_delta_24h && weight_delta_24h >= 1.8) {
        insights.push({
            id: 'honey-flow-super',
            title: `Surging Honey Flow: +${weight_delta_24h.toFixed(1)}kg in 24h`,
            severity: 'opportunity',
            technicalMetric: `Scale Gain: +${weight_delta_24h.toFixed(1)} kg/day`,
            plainEnglishDiagnosis: 'Massive nectar intake underway from active bloom. The colony will become honey-bound without additional storage comb.',
            recommendedAction: 'Add a shallow or medium honey super with drawn comb to maximize honey harvest.',
            actionLabel: 'Add Honey Super',
            actionType: 'add_super'
        });
    }

    // 8. High Moisture / Mold Danger (Humidity > 78%)
    if (hasConnectedDevice && humidity_pct && humidity_pct >= 78) {
        insights.push({
            id: 'moisture-ventilation',
            title: `Excess Moisture Alert (${Math.round(humidity_pct)}% RH)`,
            severity: 'warning',
            technicalMetric: `Relative Humidity: ${Math.round(humidity_pct)}%`,
            plainEnglishDiagnosis: 'Internal condensation is accumulating. Excessive moisture leads to chalkbrood fungal growth and fermented honey stores.',
            recommendedAction: 'Tilt hive slightly forward and open top ventilation hole or install a moisture quilt.',
            actionLabel: 'Inspect Ventilation',
            actionType: 'inspect'
        });
    }

    // 9. Nighttime Disturbance / Robbing (Decibel spike at night)
    if (acoustic_db && acoustic_db >= 75) {
        insights.push({
            id: 'night-disturbance',
            title: `Unusual Apiary Disturbance (${Math.round(acoustic_db)} dB)`,
            severity: 'warning',
            technicalMetric: `Acoustic Amplitude: ${Math.round(acoustic_db)} dB`,
            plainEnglishDiagnosis: 'Abnormal noise spike detected outside foraging hours, indicating potential predator tampering or robbing bees.',
            recommendedAction: 'Verify physical hive stand stability, check entrance security, and ensure hive straps are tensioned.',
            actionLabel: 'Check Stand Security',
            actionType: 'inspect'
        });
    }

    // Fallback if everything is running optimally or devices not yet paired
    if (insights.length === 0) {
        if (!hasConnectedDevice) {
            insights.push({
                id: 'no-device-connected',
                title: 'All Systems Ready · No Diagnostic Anomalies',
                severity: 'optimal',
                technicalMetric: 'Colony biological status healthy · Zero diseases logged',
                plainEnglishDiagnosis: 'No abnormal hive conditions or disease symptoms recorded. You can connect a VitalSensor or Telemetry Scale to receive real-time autonomous alerts.',
                recommendedAction: 'Maintain biweekly physical inspection cadence or pair IoT sensors for automated telemetry diagnostics.',
                actionLabel: 'Pair VitalSensor',
                actionType: 'view_telemetry'
            });
        } else {
            insights.push({
                id: 'all-optimal',
                title: 'Colonies & Sensor Telemetry Optimal',
                severity: 'optimal',
                technicalMetric: 'All connected sensors and colony metrics within biological target range',
                plainEnglishDiagnosis: 'Brood temperature, hive weight, humidity, and acoustics indicate healthy queen egg laying and steady foraging activity.',
                recommendedAction: 'No immediate field intervention needed. Next routine inspection scheduled in 7 days.',
                actionLabel: 'View Telemetry Trends',
                actionType: 'view_telemetry'
            });
        }
    }

    return insights;
}
