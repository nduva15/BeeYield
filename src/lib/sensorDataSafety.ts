/**
 * BeeYield Sensor Data Safety & Defensive Extraction Utility
 * Prevents unhandled null/undefined crashes (TypeError: Cannot read properties of undefined)
 * when IoT sensors experience dead batteries, dropped packets, or malformed payloads.
 */

export interface RawSensorTelemetry {
    temperature_c?: number | null;
    temperature?: number | null;
    temp_external?: number | null;
    temp_internal?: number | null;
    humidity_pct?: number | null;
    humidity?: number | null;
    weight_kg?: number | null;
    weight?: number | null;
    battery_pct?: number | null;
    battery?: number | null;
    acoustic_hz?: number | null;
    acoustic_db?: number | null;
    frequency?: number | null;
    signal_rssi?: number | null;
    rssi?: number | null;
    last_ping?: string | null;
    created_at?: string | null;
    status?: string | null;
}

export interface SafeSensorReading {
    temperature: {
        value: number | null;
        formatted: string;
        isAvailable: boolean;
        isOptimal: boolean;
        statusText: string;
    };
    humidity: {
        value: number | null;
        formatted: string;
        isAvailable: boolean;
        isOptimal: boolean;
        statusText: string;
    };
    weight: {
        value: number | null;
        formatted: string;
        isAvailable: boolean;
        deltaFormatted: string;
        statusText: string;
    };
    battery: {
        value: number | null;
        formatted: string;
        isAvailable: boolean;
        isLow: boolean;
        isCritical: boolean;
        statusText: string;
    };
    acoustics: {
        peakHz: number | null;
        dbLevel: number | null;
        formattedHz: string;
        formattedDb: string;
        isAvailable: boolean;
        swarmingRisk: 'normal' | 'elevated' | 'critical';
    };
    signal: {
        rssi: number | null;
        formatted: string;
        quality: 'excellent' | 'good' | 'weak' | 'offline';
    };
    timestamp: {
        raw: string;
        formatted: string;
        isStale: boolean;
        minutesAgo: number;
    };
    isSensorOnline: boolean;
    sensorHealthSummary: string;
}

/**
 * Safely parse a numeric value with bounds and defaults
 */
export function safeNumber(value: unknown, fallback: number | null = null): number | null {
    if (value === null || value === undefined || value === '') return fallback;
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return fallback;
    return num;
}

/**
 * Extract safe, fully guaranteed sensor metrics from any raw payload (even null or undefined).
 */
export function extractSafeSensorTelemetry(raw: RawSensorTelemetry | null | undefined): SafeSensorReading {
    if (!raw || typeof raw !== 'object') {
        return createDegradedSensorFallback('Sensor Disconnected / No Payload');
    }

    // 1. Temperature Extraction (Brood core target: 34.5 - 35.5°C)
    const rawTemp = raw.temperature_c ?? raw.temperature ?? raw.temp_internal ?? raw.temp_external;
    const tempVal = safeNumber(rawTemp);
    const hasTemp = tempVal !== null;
    const isTempOptimal = hasTemp && tempVal >= 34.0 && tempVal <= 36.0;
    const tempStatus = !hasTemp 
        ? 'No data (Sensor offline)' 
        : isTempOptimal 
            ? 'Optimal Brood Core' 
            : tempVal < 34.0 
                ? 'Brood Under-temp (Chilling)' 
                : 'Brood Over-temp (Heat stress)';

    // 2. Humidity Extraction (Target: 50% - 65%)
    const rawHum = raw.humidity_pct ?? raw.humidity;
    const humVal = safeNumber(rawHum);
    const hasHum = humVal !== null;
    const isHumOptimal = hasHum && humVal >= 45 && humVal <= 70;
    const humStatus = !hasHum
        ? 'No data'
        : isHumOptimal
            ? 'Normal Humidity'
            : humVal < 45
                ? 'Dry Colony'
                : 'High Moisture (Condensation risk)';

    // 3. Weight Extraction (Scale in kg)
    const rawWeight = raw.weight_kg ?? raw.weight;
    const weightVal = safeNumber(rawWeight);
    const hasWeight = weightVal !== null;

    // 4. Battery Extraction (%)
    const rawBat = raw.battery_pct ?? raw.battery;
    const batVal = safeNumber(rawBat);
    const hasBat = batVal !== null;
    const isBatCritical = hasBat && batVal <= 10;
    const isBatLow = hasBat && batVal <= 25;
    const batStatus = !hasBat
        ? 'Battery unknown'
        : isBatCritical
            ? 'Critical Battery (<10%)'
            : isBatLow
                ? 'Low Battery - Solar Check Required'
                : 'Battery Healthy';

    // 5. Acoustics (Hz / dB)
    const hzVal = safeNumber(raw.acoustic_hz ?? raw.frequency);
    const dbVal = safeNumber(raw.acoustic_db);
    const hasAcoustic = hzVal !== null;
    let swarmingRisk: 'normal' | 'elevated' | 'critical' = 'normal';
    if (hzVal && hzVal >= 450) {
        swarmingRisk = 'critical';
    } else if (hzVal && hzVal >= 380) {
        swarmingRisk = 'elevated';
    }

    // 6. Signal RSSI (dBm)
    const rawRssi = raw.signal_rssi ?? raw.rssi;
    const rssiVal = safeNumber(rawRssi);
    let signalQuality: 'excellent' | 'good' | 'weak' | 'offline' = 'offline';
    if (rssiVal !== null) {
        if (rssiVal >= -75) signalQuality = 'excellent';
        else if (rssiVal >= -90) signalQuality = 'good';
        else signalQuality = 'weak';
    }

    // 7. Timestamp & Stale Detection (Threshold: 15 minutes)
    const timeStr = raw.last_ping || raw.created_at || new Date().toISOString();
    const parsedTime = new Date(timeStr).getTime();
    const now = Date.now();
    const diffMinutes = isNaN(parsedTime) ? 999 : Math.max(0, Math.round((now - parsedTime) / 60000));
    const isStale = diffMinutes > 15;

    const isOnline = (hasTemp || hasWeight || hasBat) && !isStale && (!raw.status || raw.status.toUpperCase() !== 'OFFLINE');

    return {
        temperature: {
            value: tempVal,
            formatted: hasTemp ? `${tempVal.toFixed(1)}°C` : '—',
            isAvailable: hasTemp,
            isOptimal: isTempOptimal,
            statusText: tempStatus
        },
        humidity: {
            value: humVal,
            formatted: hasHum ? `${Math.round(humVal)}%` : '—',
            isAvailable: hasHum,
            isOptimal: isHumOptimal,
            statusText: humStatus
        },
        weight: {
            value: weightVal,
            formatted: hasWeight ? `${weightVal.toFixed(2)} kg` : '—',
            isAvailable: hasWeight,
            deltaFormatted: hasWeight ? `${weightVal >= 0 ? '+' : ''}${weightVal.toFixed(1)} kg` : '—',
            statusText: hasWeight ? 'Active scale calibrated' : 'Scale telemetry pending'
        },
        battery: {
            value: batVal,
            formatted: hasBat ? `${Math.round(batVal)}%` : '—',
            isAvailable: hasBat,
            isLow: isBatLow,
            isCritical: isBatCritical,
            statusText: batStatus
        },
        acoustics: {
            peakHz: hzVal,
            dbLevel: dbVal,
            formattedHz: hzVal ? `${Math.round(hzVal)} Hz` : '—',
            formattedDb: dbVal ? `${Math.round(dbVal)} dB` : '—',
            isAvailable: hasAcoustic,
            swarmingRisk
        },
        signal: {
            rssi: rssiVal,
            formatted: rssiVal !== null ? `${rssiVal} dBm` : 'No Signal',
            quality: signalQuality
        },
        timestamp: {
            raw: timeStr,
            formatted: diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`,
            isStale,
            minutesAgo: diffMinutes
        },
        isSensorOnline: isOnline,
        sensorHealthSummary: isOnline 
            ? 'Hardware active & transmitting telemetry' 
            : isStale 
                ? `Telemetry stalled (${diffMinutes}m since last packet)` 
                : 'Sensor module offline'
    };
}

/**
 * Creates a degraded fallback object when hardware payload is completely missing
 */
function createDegradedSensorFallback(reason: string): SafeSensorReading {
    return {
        temperature: {
            value: null,
            formatted: '—',
            isAvailable: false,
            isOptimal: false,
            statusText: 'No reading'
        },
        humidity: {
            value: null,
            formatted: '—',
            isAvailable: false,
            isOptimal: false,
            statusText: 'No reading'
        },
        weight: {
            value: null,
            formatted: '—',
            isAvailable: false,
            deltaFormatted: '—',
            statusText: 'Scale disconnected'
        },
        battery: {
            value: null,
            formatted: '—',
            isAvailable: false,
            isLow: false,
            isCritical: false,
            statusText: 'Battery dead / disconnected'
        },
        acoustics: {
            peakHz: null,
            dbLevel: null,
            formattedHz: '—',
            formattedDb: '—',
            isAvailable: false,
            swarmingRisk: 'normal'
        },
        signal: {
            rssi: null,
            formatted: 'Offline',
            quality: 'offline'
        },
        timestamp: {
            raw: new Date().toISOString(),
            formatted: 'Offline',
            isStale: true,
            minutesAgo: 999
        },
        isSensorOnline: false,
        sensorHealthSummary: reason
    };
}
