import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, ForageZone } from '@/services/beeyieldService';

export const forageZoneKeys = {
    all: ['forage-zones'] as const,
    lists: () => [...forageZoneKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...forageZoneKeys.lists(), apiaryId || 'all'] as const,
    details: () => [...forageZoneKeys.all, 'detail'] as const,
    detail: (id: string) => [...forageZoneKeys.details(), id] as const,
};

export function useForageZones(apiaryId?: string) {
    return useQuery({
        queryKey: forageZoneKeys.list(apiaryId),
        queryFn: () => beeyieldService.getForageZones(apiaryId),
        staleTime: 1000 * 30,
    });
}

export function useForageZoneDetail(id: string) {
    return useQuery({
        queryKey: forageZoneKeys.detail(id),
        queryFn: () => beeyieldService.getForageZone(id),
        enabled: !!id,
    });
}

export function useCreateForageZone(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof beeyieldService.createForageZone>[0]) => beeyieldService.createForageZone(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.lists() });
        },
    });
}

export function useUpdateForageZone(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ForageZone> }) => beeyieldService.updateForageZone(id, data),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.lists() });
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.detail(variables.id) });
        },
    });
}

export function useDeleteForageZone(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteForageZone(id);
            if (!result.success) {
                throw result.error || new Error('Failed to delete forage zone');
            }
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: forageZoneKeys.list(apiaryId) });
            const previous = queryClient.getQueryData<ForageZone[]>(forageZoneKeys.list(apiaryId));
            if (previous) {
                queryClient.setQueryData<ForageZone[]>(
                    forageZoneKeys.list(apiaryId),
                    previous.filter((zone) => zone.id !== id)
                );
            }
            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(forageZoneKeys.list(apiaryId), context.previous);
            }
        },
        onSettled: (_data, _error, id) => {
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: forageZoneKeys.lists() });
            if (id) {
                queryClient.removeQueries({ queryKey: forageZoneKeys.detail(id) });
            }
        },
    });
}
