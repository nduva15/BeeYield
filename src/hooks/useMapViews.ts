import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, MapView } from '@/services/beeyieldService';

export const mapViewKeys = {
    all: ['map-views'] as const,
    lists: () => [...mapViewKeys.all, 'list'] as const,
    list: (apiaryId?: string, viewType?: string) => [...mapViewKeys.lists(), apiaryId || 'all', viewType || 'all'] as const,
    details: () => [...mapViewKeys.all, 'detail'] as const,
    detail: (id: string) => [...mapViewKeys.details(), id] as const,
};

export function useMapViews(apiaryId?: string, viewType?: string) {
    return useQuery({
        queryKey: mapViewKeys.list(apiaryId, viewType),
        queryFn: () => beeyieldService.getMapViews(apiaryId, viewType),
        staleTime: 1000 * 30,
    });
}

export function useMapViewDetail(id: string) {
    return useQuery({
        queryKey: mapViewKeys.detail(id),
        queryFn: () => beeyieldService.getMapView(id),
        enabled: !!id,
    });
}

export function useCreateMapView(apiaryId?: string, viewType?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof beeyieldService.createMapView>[0]) => beeyieldService.createMapView(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mapViewKeys.list(apiaryId, viewType) });
            queryClient.invalidateQueries({ queryKey: mapViewKeys.lists() });
        },
    });
}

export function useUpdateMapView(apiaryId?: string, viewType?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MapView> }) => beeyieldService.updateMapView(id, data),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: mapViewKeys.list(apiaryId, viewType) });
            queryClient.invalidateQueries({ queryKey: mapViewKeys.lists() });
            queryClient.invalidateQueries({ queryKey: mapViewKeys.detail(variables.id) });
        },
    });
}

export function useDeleteMapView(apiaryId?: string, viewType?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteMapView(id);
            if (!result.success) {
                throw result.error || new Error('Failed to delete map view');
            }
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: mapViewKeys.list(apiaryId, viewType) });
            const previous = queryClient.getQueryData<MapView[]>(mapViewKeys.list(apiaryId, viewType));
            if (previous) {
                queryClient.setQueryData<MapView[]>(
                    mapViewKeys.list(apiaryId, viewType),
                    previous.filter((mapView) => mapView.id !== id)
                );
            }
            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(mapViewKeys.list(apiaryId, viewType), context.previous);
            }
        },
        onSettled: (_data, _error, id) => {
            queryClient.invalidateQueries({ queryKey: mapViewKeys.list(apiaryId, viewType) });
            queryClient.invalidateQueries({ queryKey: mapViewKeys.lists() });
            if (id) {
                queryClient.removeQueries({ queryKey: mapViewKeys.detail(id) });
            }
        },
    });
}
