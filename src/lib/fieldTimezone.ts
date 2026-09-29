/**
 * BeeYield Field Timezone & Solar Telemetry Translation Engine
 * Converts UTC IoT sensor timestamps to local orchard solar time,
 * ensuring diurnal charts (flight hours, temperature curves, acoustic rhythms)
 * peak at solar noon rather than UTC midnight.
 */

export interface FieldTimezoneConfig {
    ianaTimezone: string;
    label: string;
    utcOffsetHours: number;
    solarNoonApprox: string;
}

export const CANONICAL_FIELD_TIMEZONES: Record<string, FieldTimezoneConfig> = {
    'Africa/Nairobi': {
        ianaTimezone: 'Africa/Nairobi',
        label: 'East Africa Time (EAT)',
        utcOffsetHours: 3,
        solarNoonApprox: '12:35 PM'
    },
    'UTC': {
        ianaTimezone: 'UTC',
        label: 'Universal Coordinated Time (UTC)',
        utcOffsetHours: 0,
        solarNoonApprox: '12:00 PM'
    },
    'America/Los_Angeles': {
        ianaTimezone: 'America/Los_Angeles',
        label: 'Pacific Time (PT)',
        utcOffsetHours: -7,
        solarNoonApprox: '13:00 PM'
    },
    'Europe/London': {
        ianaTimezone: 'Europe/London',
        label: 'Greenwich / British Time',
        utcOffsetHours: 1,
        solarNoonApprox: '13:05 PM'
    }
};

const STORAGE_KEY = 'beeyield_selected_timezone';

export function getSelectedFieldTimezone(): string {
    if (typeof window === 'undefined') return 'Africa/Nairobi';
    return window.localStorage.getItem(STORAGE_KEY) || 'Africa/Nairobi';
}

export function setSelectedFieldTimezone(tz: string) {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, tz);
        window.dispatchEvent(new CustomEvent('beeyield:timezone-changed', { detail: tz }));
    }
}

/**
 * Format any UTC timestamp into Orchard Local Time
 */
export function formatOrchardTime(
    utcDate: string | number | Date | null | undefined,
    formatStyle: 'full' | 'time' | 'date' | 'hour' = 'time',
    overrideTz?: string
): string {
    if (!utcDate) return '—';

    const date = new Date(utcDate);
    if (isNaN(date.getTime())) return '—';

    const timeZone = overrideTz || getSelectedFieldTimezone();

    try {
        if (formatStyle === 'time') {
            return new Intl.DateTimeFormat('en-US', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        }

        if (formatStyle === 'hour') {
            return new Intl.DateTimeFormat('en-US', {
                timeZone,
                hour: 'numeric',
                hour12: true
            }).format(date);
        }

        if (formatStyle === 'date') {
            return new Intl.DateTimeFormat('en-US', {
                timeZone,
                month: 'short',
                day: 'numeric'
            }).format(date);
        }

        return new Intl.DateTimeFormat('en-US', {
            timeZone,
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch (e) {
        return date.toLocaleTimeString();
    }
}

/**
 * Converts a UTC hour (0-23) to Orchard Local Hour (0-23).
 * Essential for diurnal bee flight histograms and heatmaps.
 */
export function utcHourToOrchardHour(utcHour: number, timezone: string = getSelectedFieldTimezone()): number {
    const config = CANONICAL_FIELD_TIMEZONES[timezone];
    const offset = config ? config.utcOffsetHours : 3;
    let localHour = (utcHour + offset) % 24;
    if (localHour < 0) localHour += 24;
    return localHour;
}

/**
 * Get current orchard time as a formatted string
 */
export function getCurrentOrchardTimeString(): string {
    const tz = getSelectedFieldTimezone();
    const config = CANONICAL_FIELD_TIMEZONES[tz] || CANONICAL_FIELD_TIMEZONES['Africa/Nairobi'];
    const nowFormatted = formatOrchardTime(new Date(), 'time', tz);
    return `${nowFormatted} (${config.label.split(' ')[0]})`;
}
