import { useQuery } from '@tanstack/react-query';
import { beeyieldService, SensorReading } from '@/services/beeyieldService';
import { useAuth } from '@/hooks/useAuth';
import { telemetryCache } from '@/services/telemetryCacheService';
import { offlineTelemetry } from '@/services/offlineTelemetryCache';

export const sensorKeys = {
    all: ['sensor-readings'] as const,
    list: (hiveId?: string, limit?: number) => [...sensorKeys.all, { hiveId, limit }] as const,
};

export function useSensorReadings(hiveId?: string, limit: number = 50) {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: [...sensorKeys.list(hiveId, limit), userId],
        queryFn: async () => {
            const cacheKey = `sensor_readings_${hiveId || 'all'}_${limit}_${userId || 'anon'}`;
            try {
                const res = await telemetryCache.executeQueryWithTimeout<SensorReading[]>(
                    cacheKey,
                    async (signal) => {
                        const data = hiveId 
                            ? await beeyieldService.getReadings(hiveId, limit) 
                            : await beeyieldService.getSensorReadings(undefined, limit);
                        return data || [];
                    },
                    {
                        timeoutMs: 10000,
                        ttlMs: 2 * 60 * 1000,
                    }
                );
                const downsampled = telemetryCache.downsampleTelemetry(res.data || [], 200);
                if (downsampled.length > 0) {
                    offlineTelemetry.saveSnapshot(cacheKey, downsampled);
                }
                return downsampled;
            } catch (err) {
                // Return cached snapshot on HTTP 504 / 500 or network timeout
                const snapshot = offlineTelemetry.getSnapshot<SensorReading[]>(cacheKey);
                if (snapshot.isAvailable && snapshot.data) {
                    return snapshot.data;
                }
                return [];
            }
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // Sensor data fresh for 1 minute
        refetchInterval: 1000 * 60, // Poll every 1 minute
        refetchOnWindowFocus: true,
    });
}

