
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Hive, HiveCreateInput, SensorReading } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const hiveKeys = {
    all: ['hives'] as const,
    lists: () => [...hiveKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...hiveKeys.lists(), { apiaryId }] as const,
    telemetry: () => ['telemetry', 'latest'] as const,
};

// Fetch hives with real-time updates
export function useHives(apiaryId?: string) {
    return useQuery({
        queryKey: hiveKeys.list(apiaryId),
        queryFn: async () => {
            const data = await beeyieldService.getHives(apiaryId);
            return data;
        },
        staleTime: 1000 * 30,
        refetchInterval: 1000 * 30, // 30s poll
    });
}

// Separate hook for high-frequency telemetry
export function useTelemetry() {
    return useQuery({
        queryKey: hiveKeys.telemetry(),
        queryFn: async () => {
            return await beeyieldService.getTelemetryLatest();
        },
        staleTime: 1000 * 10, // Telemetry fresh for 10s
        refetchInterval: 1000 * 30, // Poll every 30s (sync with hives)
    });
}

// Combined hook: Hives + Telemetry
// Merges static hive data with dynamic sensor readings
export function useHivesWithTelemetry(apiaryId?: string) {
    const hivesQuery = useHives(apiaryId);
    const telemetryQuery = useTelemetry();

    const hives = hivesQuery.data || [];
    const readings = telemetryQuery.data || [];

    const enrichedHives = hives.map(hive => {
        // Find reading for this hive using device mapping logic
        // Assuming implicit link via location or if hive.has_sensors is true
        // In a real scenario, we'd match reading.device_id to hive.device_id
        // For now, we'll try to match by some heuristic or just return as is

        // IF we had a device_id on hive, we'd do:
        // const reading = readings.find(r => r.device_id === hive.device_id);

        // Since we don't have explicit link in frontend model yet, we leave it for now.
        // The previous beeyield.py logic didn't return sensor data in get_hives.

        return hive;
    });

    return {
        hives: enrichedHives,
        readings: readings, // Return raw readings too for mapping
        isLoading: hivesQuery.isLoading || telemetryQuery.isLoading,
        isError: hivesQuery.isError || telemetryQuery.isError,
        refetch: () => { hivesQuery.refetch(); telemetryQuery.refetch(); }
    };
}

// Mutations
export function useCreateHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: HiveCreateInput) => {
            const { data, error } = await beeyieldService.createHive(input);
            if (error) throw error;
            return data as Hive;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hiveKeys.lists() });
            toast.success('Hive deployed successfully');
        },
        onError: () => toast.error('Failed to create hive'),
    });
}

export function useUpdateHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<HiveCreateInput> }) => {
            const { data: updated, error } = await beeyieldService.updateHive(id, data);
            if (error) throw error;
            return updated as Hive;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hiveKeys.lists() });
            toast.success('Hive updated');
        },
        onError: () => toast.error('Failed to update hive'),
    });
}

export function useDeleteHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await beeyieldService.deleteHive(id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hiveKeys.lists() });
            toast.success('Hive deleted');
        },
        onError: () => toast.error('Failed to delete hive'),
    });
}
