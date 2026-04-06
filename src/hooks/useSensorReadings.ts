import { useQuery } from '@tanstack/react-query';
import { beeyieldService } from '@/services/beeyieldService';
import { useAuth } from '@/hooks/useAuth';

export const sensorKeys = {
    all: ['sensor-readings'] as const,
    list: (hiveId?: string, limit?: number) => [...sensorKeys.all, { hiveId, limit }] as const,
};

export function useSensorReadings(hiveId?: string, limit: number = 50) {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: [...sensorKeys.list(hiveId, limit), userId],
        queryFn: () => (hiveId ? beeyieldService.getReadings(hiveId, limit) : beeyieldService.getSensorReadings(undefined, limit)),
        enabled: !!userId,
        staleTime: 1000 * 60, // Sensor data fresh for 1 minute
        refetchInterval: 1000 * 60, // Poll every 1 minute
        refetchOnWindowFocus: true,
    });
}
