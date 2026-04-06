import { useQuery } from '@tanstack/react-query';
import { beeyieldService, IoTDevice } from '@/services/beeyieldService';
import { useAuth } from '@/hooks/useAuth';

export const deviceKeys = {
    all: ['devices'] as const,
    list: () => [...deviceKeys.all, 'list'] as const,
};

export function useDevices() {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    return useQuery({
        queryKey: [...deviceKeys.list(), userId],
        queryFn: () => beeyieldService.getDevices(),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
    });
}
