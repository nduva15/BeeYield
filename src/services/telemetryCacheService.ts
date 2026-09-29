/**
 * BeeYield Telemetry Query Cache & Downsampling Service
 * Fixes HTTP 504/500 API query timeouts when loading historical telemetry
 * (thousands of continuous audio/vibration/weight points across bloom seasons).
 */

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttlMs: number;
}

export interface DownsampledPoint {
    time: string;
    temperature_c?: number | null;
    humidity_pct?: number | null;
    weight_kg?: number | null;
    acoustic_hz?: number | null;
    battery_pct?: number | null;
}

export interface TelemetryQueryResult<T> {
    data: T;
    isFromCache: boolean;
    isFallbackSnapshot: boolean;
    errorMessage?: string;
    downsampledFrom?: number;
}

class TelemetryCacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
    private readonly TIMEOUT_MS = 12000; // 12 seconds timeout before aborting

    /**
     * Executes an API query with timeout control, caching, and fallback snapshot on 504/500
     */
    async executeQueryWithTimeout<T>(
        cacheKey: string,
        fetcher: (signal: AbortSignal) => Promise<T>,
        options?: {
            ttlMs?: number;
            timeoutMs?: number;
            fallbackSnapshot?: T;
        }
    ): Promise<TelemetryQueryResult<T>> {
        const ttl = options?.ttlMs ?? this.DEFAULT_TTL_MS;
        const timeout = options?.timeoutMs ?? this.TIMEOUT_MS;
        const cached = this.cache.get(cacheKey);

        // Check if fresh cache exists
        if (cached && Date.now() - cached.timestamp < cached.ttlMs) {
            return {
                data: cached.data as T,
                isFromCache: true,
                isFallbackSnapshot: false
            };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const data = await fetcher(controller.signal);
            clearTimeout(timeoutId);

            // Store in cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now(),
                ttlMs: ttl
            });

            return {
                data,
                isFromCache: false,
                isFallbackSnapshot: false
            };
        } catch (error: any) {
            clearTimeout(timeoutId);

            const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
            const isServerError = error?.status === 504 || error?.status === 500 || error?.message?.includes('504');

            console.warn(`[BeeYield Telemetry] Query failed (timeout: ${isTimeout}, status: ${error?.status}):`, error);

            // If we have stale cache, return it immediately as resilient fallback
            if (cached) {
                return {
                    data: cached.data as T,
                    isFromCache: true,
                    isFallbackSnapshot: true,
                    errorMessage: isTimeout 
                        ? 'Historical query timed out. Showing last cached telemetry snapshot.'
                        : 'Remote telemetry server temporarily busy (HTTP 504/500). Showing cached data.'
                };
            }

            // If a caller provided a fallback snapshot, return it
            if (options?.fallbackSnapshot) {
                return {
                    data: options.fallbackSnapshot,
                    isFromCache: false,
                    isFallbackSnapshot: true,
                    errorMessage: 'Network timeout. Displaying safe default snapshot.'
                };
            }

            throw error;
        }
    }

    /**
     * Smart LTTB (Largest-Triangle-Three-Buckets) style downsampling
     * Prevents browser freezing and SVG rendering choke when plotting 50,000 telemetry points.
     */
    downsampleTelemetry<T extends Record<string, any>>(
        data: T[],
        targetCount: number = 200,
        timeKey: keyof T = 'created_at' as keyof T
    ): T[] {
        if (!data || data.length <= targetCount) {
            return data || [];
        }

        const sampled: T[] = [];
        const bucketSize = (data.length - 2) / (targetCount - 2);

        // Always include the first point
        sampled.push(data[0]);

        for (let i = 0; i < targetCount - 2; i++) {
            const bucketStart = Math.floor((i + 1) * bucketSize);
            const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize), data.length - 1);
            
            // Pick the median or representative point in this window
            const representativeIndex = Math.floor((bucketStart + bucketEnd) / 2);
            if (data[representativeIndex]) {
                sampled.push(data[representativeIndex]);
            }
        }

        // Always include the latest point
        sampled.push(data[data.length - 1]);

        return sampled;
    }

    /**
     * Clear specific or all cache entries
     */
    clearCache(keyPattern?: string) {
        if (!keyPattern) {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }
}

export const telemetryCache = new TelemetryCacheService();
export default telemetryCache;
