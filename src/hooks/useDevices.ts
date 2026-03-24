import { useQuery } from '@tanstack/react-query';
import { beeyieldService, IoTDevice } from '@/services/beeyieldService';

export const deviceKeys = {
    all: ['devices'] as const,
    list: () => [...deviceKeys.all, 'list'] as const,
};

export function useDevices() {
    return useQuery({
        queryKey: deviceKeys.list(),
        queryFn: () => beeyieldService.getDevices(),
        staleTime: 1000 * 60 * 5,
    });
}
