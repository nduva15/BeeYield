import { useQuery } from '@tanstack/react-query';
import { beeyieldService, SensorReading } from '@/services/beeyieldService';

export const sensorKeys = {
    all: ['sensor-readings'] as const,
    list: (hiveId?: string, limit?: number) => [...sensorKeys.all, { hiveId, limit }] as const,
};

export function useSensorReadings(hiveId?: string, limit: number = 50) {
    return useQuery({
        queryKey: sensorKeys.list(hiveId, limit),
        queryFn: () => hiveId ? beeyieldService.getReadings(hiveId, limit) : beeyieldService.getSensorReadings(undefined, limit),
        staleTime: 1000 * 60, // Sensor data fresh for 1 minute
        refetchInterval: 1000 * 60, // Poll every 1 minute
    });
}
