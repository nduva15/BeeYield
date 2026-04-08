import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Geofence } from '@/services/beeyieldService';

export const geofenceKeys = {
    all: ['geofences'] as const,
    lists: () => [...geofenceKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...geofenceKeys.lists(), apiaryId || 'all'] as const,
    details: () => [...geofenceKeys.all, 'detail'] as const,
    detail: (id: string) => [...geofenceKeys.details(), id] as const,
};

export function useGeofences(apiaryId?: string) {
    return useQuery({
        queryKey: geofenceKeys.list(apiaryId),
        queryFn: () => beeyieldService.getGeofences(apiaryId),
        staleTime: 1000 * 30,
    });
}

export function useGeofenceDetail(id: string) {
    return useQuery({
        queryKey: geofenceKeys.detail(id),
        queryFn: () => beeyieldService.getGeofence(id),
        enabled: !!id,
    });
}

export function useCreateGeofence(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof beeyieldService.createGeofence>[0]) => beeyieldService.createGeofence(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: geofenceKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: geofenceKeys.lists() });
        },
    });
}

export function useUpdateGeofence(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Geofence> }) => beeyieldService.updateGeofence(id, data),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: geofenceKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: geofenceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: geofenceKeys.detail(variables.id) });
        },
    });
}

export function useDeleteGeofence(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteGeofence(id);
            if (!result.success) {
                throw result.error || new Error('Failed to delete geofence');
            }
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: geofenceKeys.list(apiaryId) });
            const previous = queryClient.getQueryData<Geofence[]>(geofenceKeys.list(apiaryId));
            if (previous) {
                queryClient.setQueryData<Geofence[]>(
                    geofenceKeys.list(apiaryId),
                    previous.filter((geofence) => geofence.id !== id)
                );
            }
            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(geofenceKeys.list(apiaryId), context.previous);
            }
        },
        onSettled: (_data, _error, id) => {
            queryClient.invalidateQueries({ queryKey: geofenceKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: geofenceKeys.lists() });
            if (id) {
                queryClient.removeQueries({ queryKey: geofenceKeys.detail(id) });
            }
        },
    });
}
