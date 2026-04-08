import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Orchard } from '@/services/beeyieldService';

export const orchardKeys = {
    all: ['orchards'] as const,
    lists: () => [...orchardKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...orchardKeys.lists(), apiaryId || 'all'] as const,
    details: () => [...orchardKeys.all, 'detail'] as const,
    detail: (id: string) => [...orchardKeys.details(), id] as const,
};

export function useOrchards(apiaryId?: string) {
    return useQuery({
        queryKey: orchardKeys.list(apiaryId),
        queryFn: () => beeyieldService.getOrchards(apiaryId),
        staleTime: 1000 * 30,
    });
}

export function useOrchardDetail(id: string) {
    return useQuery({
        queryKey: orchardKeys.detail(id),
        queryFn: () => beeyieldService.getOrchard(id),
        enabled: !!id,
    });
}

export function useCreateOrchard(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof beeyieldService.createOrchard>[0]) => beeyieldService.createOrchard(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orchardKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: orchardKeys.lists() });
        },
    });
}

export function useUpdateOrchard(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Orchard> }) => beeyieldService.updateOrchard(id, data),
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: orchardKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: orchardKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orchardKeys.detail(variables.id) });
        },
    });
}

export function useDeleteOrchard(apiaryId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await beeyieldService.deleteOrchard(id);
            if (!result.success) {
                throw result.error || new Error('Failed to delete orchard');
            }
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: orchardKeys.list(apiaryId) });
            const previous = queryClient.getQueryData<Orchard[]>(orchardKeys.list(apiaryId));
            if (previous) {
                queryClient.setQueryData<Orchard[]>(
                    orchardKeys.list(apiaryId),
                    previous.filter((orchard) => orchard.id !== id)
                );
            }
            return { previous };
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(orchardKeys.list(apiaryId), context.previous);
            }
        },
        onSettled: (_data, _error, id) => {
            queryClient.invalidateQueries({ queryKey: orchardKeys.list(apiaryId) });
            queryClient.invalidateQueries({ queryKey: orchardKeys.lists() });
            if (id) {
                queryClient.removeQueries({ queryKey: orchardKeys.detail(id) });
            }
        },
    });
}
