export type SwarmStatus = 'healthy' | 'missing-queen' | 'swarm-risk';

export interface SwarmTelemetryPoint {
    timestamp: string;
    peakFreqHz: number | null;
    tempC: number | null;
    humidity: number | null;
    amplitudeDb?: number | null;
    healthIndex?: number | null;
}

export interface SwarmPredictionDriver {
    label: string;
    score: number;
    detail: string;
}

export interface SwarmPredictionResult {
    status: SwarmStatus;
    stateLabel: string;
    probability: number;
    confidence: number;
    alert: boolean;
    etaHours: number | null;
    summary: string;
    recommendation: string;
    features: {
        baselineFreqHz: number;
        recentFreqHz: number;
        freqShiftHz: number;
        highFreqHours: number;
        pipingHours: number;
        maxTempC: number;
        thermalSpikeHours: number;
        humidityDrop: number;
        acousticVolatility: number;
        queenlessnessRisk: number;
        swarmRisk: number;
    };
    pollinationImpact: {
        currentForagers: number;
        atRiskForagers: number;
        workforceLossPercent: number;
    };
    drivers: SwarmPredictionDriver[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function mean(values: number[]) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function median(values: number[]) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function stdDev(values: number[]) {
    if (values.length <= 1) return 0;
    const avg = mean(values);
    return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function logisticScore(value: number, midpoint: number, steepness: number) {
    return 1 / (1 + Math.exp(-steepness * (value - midpoint)));
}

function normalizeTelemetry(points: SwarmTelemetryPoint[]) {
    return [...points]
        .filter((point) => point && point.timestamp)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function getForagerCount(frameCount?: number) {
    const frames = Math.max(1, frameCount || 10);
    const foragerRatio = frames >= 10 ? 0.24 : 0.2;
    return Math.round(frames * 3000 * foragerRatio);
}

export function predictSwarmState(
    telemetry: SwarmTelemetryPoint[],
    options?: { frameCount?: number }
): SwarmPredictionResult {
    const rows = normalizeTelemetry(telemetry);
    const currentForagers = getForagerCount(options?.frameCount);
    const atRiskForagers = Math.round(currentForagers * 0.6);

    if (rows.length < 24) {
        return {
            status: 'healthy',
            stateLabel: 'Gathering Baseline Data',
            probability: 0,
            confidence: 38,
            alert: false,
            etaHours: null,
            summary: 'Need at least 24 hours of telemetry to establish a stable acoustic and thermal baseline.',
            recommendation: 'Keep streaming in-hive telemetry. The predictor becomes materially more reliable after 48 hours of hourly data.',
            features: {
                baselineFreqHz: 0,
                recentFreqHz: 0,
                freqShiftHz: 0,
                highFreqHours: 0,
                pipingHours: 0,
                maxTempC: 0,
                thermalSpikeHours: 0,
                humidityDrop: 0,
                acousticVolatility: 0,
                queenlessnessRisk: 0,
                swarmRisk: 0,
            },
            pollinationImpact: {
                currentForagers,
                atRiskForagers,
                workforceLossPercent: 60,
            },
            drivers: [
                {
                    label: 'Telemetry baseline',
                    score: 100,
                    detail: 'Insufficient history is currently the main limitation on prediction quality.',
                },
            ],
        };
    }

    const recent24h = rows.slice(-24);
    const baseline24h = rows.length >= 48 ? rows.slice(-48, -24) : rows.slice(0, Math.min(24, rows.length - 24));

    const baselineFreqs = baseline24h.map((point) => point.peakFreqHz).filter((value): value is number => value !== null);
    const recentFreqs = recent24h.map((point) => point.peakFreqHz).filter((value): value is number => value !== null);
    const baselineTemps = baseline24h.map((point) => point.tempC).filter((value): value is number => value !== null);
    const recentTemps = recent24h.map((point) => point.tempC).filter((value): value is number => value !== null);
    const baselineHumidity = baseline24h.map((point) => point.humidity).filter((value): value is number => value !== null);
    const recentHumidity = recent24h.map((point) => point.humidity).filter((value): value is number => value !== null);
    const recentHealth = recent24h.map((point) => point.healthIndex).filter((value): value is number => value !== null);

    const baselineFreqHz = median(baselineFreqs);
    const recentFreqHz = median(recentFreqs);
    const freqShiftHz = recentFreqHz - baselineFreqHz;
    const maxTempC = recentTemps.length ? Math.max(...recentTemps) : 0;
    const baselineTemp = baselineTemps.length ? mean(baselineTemps) : 33.5;
    const thermalThreshold = Math.max(34.5, baselineTemp + 0.8);
    const thermalSpikeHours = recent24h.filter((point) => (point.tempC ?? baselineTemp) >= thermalThreshold).length;
    const highFreqHours = recent24h.filter((point) => (point.peakFreqHz ?? 0) >= 300).length;
    const pipingHours = recent24h.filter((point) => (point.peakFreqHz ?? 0) >= 380).length;
    const humidityDrop = Math.max(0, mean(baselineHumidity) - mean(recentHumidity));
    const acousticVolatility = stdDev(recentFreqs);
    const healthPenalty = recentHealth.length ? (100 - mean(recentHealth)) / 100 : 0.18;

    const swarmRisk =
        clamp(
            logisticScore(freqShiftHz, 120, 0.03) * 0.24 +
            logisticScore(highFreqHours, 5, 0.9) * 0.24 +
            logisticScore(pipingHours, 3, 1.1) * 0.16 +
            logisticScore(thermalSpikeHours, 4, 0.9) * 0.22 +
            logisticScore(maxTempC, 34.8, 1.5) * 0.08 +
            logisticScore(humidityDrop, 4, 0.4) * 0.03 +
            logisticScore(acousticVolatility, 55, 0.04) * 0.03,
            0,
            1,
        );

    const queenlessnessRisk =
        clamp(
            logisticScore(recentFreqHz, 210, 0.025) * 0.25 +
            logisticScore(acousticVolatility, 70, 0.05) * 0.25 +
            logisticScore(healthPenalty, 0.35, 5) * 0.2 +
            logisticScore(highFreqHours, 2.5, 0.8) * 0.1 +
            (1 - logisticScore(maxTempC, 34.2, 1.3)) * 0.2,
            0,
            1,
        );

    const status: SwarmStatus =
        swarmRisk >= 0.72
            ? 'swarm-risk'
            : queenlessnessRisk >= 0.62
                ? 'missing-queen'
                : 'healthy';

    const probability = status === 'swarm-risk'
        ? swarmRisk * 100
        : status === 'missing-queen'
            ? queenlessnessRisk * 100
            : Math.max(swarmRisk * 55, queenlessnessRisk * 45);

    const confidence = clamp(
        62 +
        Math.min(rows.length, 96) * 0.18 +
        Math.min(baselineFreqs.length, 24) * 0.25 +
        Math.min(recentTemps.length, 24) * 0.18 -
        Math.abs(recentFreqHz - baselineFreqHz) * 0.01,
        45,
        96,
    );

    const etaHours = status === 'swarm-risk'
        ? (pipingHours >= 6 && thermalSpikeHours >= 6 ? 24 : 48)
        : null;

    const summary =
        status === 'swarm-risk'
            ? 'Pre-swarm signature detected: sustained high-frequency piping and elevated brood-zone heat are moving together.'
            : status === 'missing-queen'
                ? 'The hive is acoustically stressed, but without the thermal flight-prep signature of a swarm.'
                : 'Acoustic and thermal telemetry remain inside the colony’s normal homeostatic envelope.';

    const recommendation =
        status === 'swarm-risk'
            ? 'Dispatch a beekeeper for split/intervention now. If no action is taken, the orchard can lose roughly 60% of this hive’s pollination workforce within 24-48 hours.'
            : status === 'missing-queen'
                ? 'Inspect for queenlessness or severe agitation. Confirm brood pattern, queen presence, and congestion before assuming a swarm event.'
                : 'Keep the hive closed and continue non-invasive monitoring. No swarm intervention is indicated from the latest telemetry window.';

    const drivers: SwarmPredictionDriver[] = [
        {
            label: 'Acoustic shift',
            score: Number((clamp(freqShiftHz / 180, 0, 1.2) * 100).toFixed(1)),
            detail: `Median peak frequency shifted by ${freqShiftHz.toFixed(0)} Hz versus baseline.`,
        },
        {
            label: 'High-frequency hours',
            score: Number((clamp(highFreqHours / 8, 0, 1.2) * 100).toFixed(1)),
            detail: `${highFreqHours} of the last 24 hours crossed the 300 Hz swarm-signature band.`,
        },
        {
            label: 'Thermoregulation',
            score: Number((clamp(thermalSpikeHours / 8, 0, 1.2) * 100).toFixed(1)),
            detail: `${thermalSpikeHours} hours exceeded the ${thermalThreshold.toFixed(1)}°C pre-flight threshold.`,
        },
        {
            label: 'Piping intensity',
            score: Number((clamp(pipingHours / 6, 0, 1.2) * 100).toFixed(1)),
            detail: `${pipingHours} recent hours crossed the 380 Hz queen-piping band.`,
        },
    ].sort((a, b) => b.score - a.score);

    return {
        status,
        stateLabel: status === 'swarm-risk' ? 'Pre-Swarm State Detected' : status === 'missing-queen' ? 'Queenlessness / Agitation Watch' : 'Stable Homeostasis',
        probability: Number(probability.toFixed(1)),
        confidence: Number(confidence.toFixed(1)),
        alert: status === 'swarm-risk',
        etaHours,
        summary,
        recommendation,
        features: {
            baselineFreqHz: Number(baselineFreqHz.toFixed(1)),
            recentFreqHz: Number(recentFreqHz.toFixed(1)),
            freqShiftHz: Number(freqShiftHz.toFixed(1)),
            highFreqHours,
            pipingHours,
            maxTempC: Number(maxTempC.toFixed(1)),
            thermalSpikeHours,
            humidityDrop: Number(humidityDrop.toFixed(1)),
            acousticVolatility: Number(acousticVolatility.toFixed(1)),
            queenlessnessRisk: Number((queenlessnessRisk * 100).toFixed(1)),
            swarmRisk: Number((swarmRisk * 100).toFixed(1)),
        },
        pollinationImpact: {
            currentForagers,
            atRiskForagers,
            workforceLossPercent: 60,
        },
        drivers,
    };
}
