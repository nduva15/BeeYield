/**
 * BeeYield Offline Field Telemetry Cache & Action Queue
 * Allows farm managers in remote fields without cellular coverage to view
 * last-known hive health and queue inspection logs locally until signal returns.
 */

const OFFLINE_PREFIX = 'beeyield_offline_';
const ACTION_QUEUE_KEY = 'beeyield_offline_actions_queue';

export interface OfflineSnapshot<T> {
    data: T | null;
    timestamp: string | null;
    minutesAgo: number;
    isAvailable: boolean;
}

export interface QueuedFieldAction {
    id: string;
    type: string;
    payload: any;
    queuedAt: string;
}

class OfflineTelemetryCache {
    saveSnapshot<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        try {
            const envelope = {
                data,
                timestamp: new Date().toISOString()
            };
            window.localStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify(envelope));
        } catch (e) {
            console.warn('Failed to save offline snapshot to localStorage:', e);
        }
    }

    getSnapshot<T>(key: string): OfflineSnapshot<T> {
        if (typeof window === 'undefined') {
            return { data: null, timestamp: null, minutesAgo: 999, isAvailable: false };
        }

        try {
            const raw = window.localStorage.getItem(`${OFFLINE_PREFIX}${key}`);
            if (!raw) {
                return { data: null, timestamp: null, minutesAgo: 999, isAvailable: false };
            }

            const parsed = JSON.parse(raw);
            const ts = parsed.timestamp;
            const diffMinutes = ts ? Math.round((Date.now() - new Date(ts).getTime()) / 60000) : 999;

            return {
                data: parsed.data as T,
                timestamp: ts,
                minutesAgo: Math.max(0, diffMinutes),
                isAvailable: true
            };
        } catch (e) {
            return { data: null, timestamp: null, minutesAgo: 999, isAvailable: false };
        }
    }

    queueAction(type: string, payload: any): void {
        if (typeof window === 'undefined') return;
        try {
            const existing = this.getQueuedActions();
            const action: QueuedFieldAction = {
                id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                type,
                payload,
                queuedAt: new Date().toISOString()
            };
            existing.push(action);
            window.localStorage.setItem(ACTION_QUEUE_KEY, JSON.stringify(existing));
            window.dispatchEvent(new CustomEvent('beeyield:offline-action-queued', { detail: action }));
        } catch (e) {
            console.error('Failed to queue offline action:', e);
        }
    }

    getQueuedActions(): QueuedFieldAction[] {
        if (typeof window === 'undefined') return [];
        try {
            const raw = window.localStorage.getItem(ACTION_QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    clearQueuedActions(): void {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(ACTION_QUEUE_KEY);
    }
}

export const offlineTelemetry = new OfflineTelemetryCache();
export default offlineTelemetry;
