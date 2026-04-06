import { useQuery } from '@tanstack/react-query';
import { meterService } from '@/services/meterService';

export const meterKeys = {
    all: ['meters'] as const,
    devices: () => [...meterKeys.all, 'devices'] as const,
    deviceList: (filters?: Record<string, unknown>) => [...meterKeys.devices(), filters || {}] as const,
    events: () => [...meterKeys.all, 'events'] as const,
    eventList: (severity?: string) => [...meterKeys.events(), { severity: severity || 'all' }] as const,
    buildings: () => [...meterKeys.all, 'buildings'] as const,
};

export function useMetersDashboard(enabled: boolean) {
    const metersQuery = useQuery({
        queryKey: meterKeys.deviceList(),
        queryFn: () => meterService.getMeters(),
        enabled,
        staleTime: 1000 * 30,
        refetchInterval: enabled ? 1000 * 30 : false,
    });

    const eventsQuery = useQuery({
        queryKey: meterKeys.eventList(),
        queryFn: () => meterService.getEvents(),
        enabled,
        staleTime: 1000 * 30,
        refetchInterval: enabled ? 1000 * 30 : false,
    });

    const buildingsQuery = useQuery({
        queryKey: meterKeys.buildings(),
        queryFn: () => meterService.getBuildings(),
        enabled,
        staleTime: 1000 * 60,
    });

    return {
        meters: metersQuery.data || [],
        events: eventsQuery.data || [],
        buildings: buildingsQuery.data || [],
        isLoading: metersQuery.isLoading || eventsQuery.isLoading || buildingsQuery.isLoading,
        isFetching: metersQuery.isFetching || eventsQuery.isFetching || buildingsQuery.isFetching,
        error: metersQuery.error || eventsQuery.error || buildingsQuery.error,
        refetch: async () => {
            await Promise.all([
                metersQuery.refetch(),
                eventsQuery.refetch(),
                buildingsQuery.refetch(),
            ]);
        },
    };
}
