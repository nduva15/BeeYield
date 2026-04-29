import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Inspection } from '@/services/beeyieldService';

export const inspectionKeys = {
    all: ['inspections'] as const,
    lists: () => [...inspectionKeys.all, 'list'] as const,
    list: (hiveId?: string) => [...inspectionKeys.lists(), { hiveId }] as const,
    details: () => [...inspectionKeys.all, 'detail'] as const,
    detail: (id: string) => [...inspectionKeys.details(), id] as const,
};

export function useInspections(hiveId?: string) {
    return useQuery({
        queryKey: inspectionKeys.list(hiveId),
        queryFn: () => beeyieldService.getInspections(hiveId),
        staleTime: 1000 * 30, // 30 seconds — faster refresh after mutations
    });
}

export function useCreateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: any) => beeyieldService.createInspection(input),
        onSuccess: () => {
            // Service handles toasts; just invalidate cache to refetch the list
            queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
        },
        onError: (error: any) => {
            console.error('Create inspection error:', error);
        },
    });
}

export function useUpdateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => beeyieldService.updateInspection(id, data),
        onSuccess: (response) => {
            // Service handles toasts; just invalidate cache
            queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
            if (response.data) {
                queryClient.invalidateQueries({ queryKey: inspectionKeys.detail(response.data.id) });
            }
        },
    });
}

export function useDeleteInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteInspection(id),
        onSuccess: () => {
            // Service handles toasts; just invalidate cache
            queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
        },
    });
}
