import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Inspection } from '@/services/beeyieldService';
import { toast } from 'sonner';

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
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: any) => beeyieldService.createInspection(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
            toast.success('Inspection recorded');
        },
        onError: (error: any) => {
            console.error('Create inspection error:', error);
            toast.error('Failed to record inspection');
        },
    });
}

export function useUpdateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => beeyieldService.updateInspection(id, data),
        onSuccess: (response) => {
            if (response.data) {
                queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
                queryClient.invalidateQueries({ queryKey: inspectionKeys.detail(response.data.id) });
                toast.success('Inspection updated');
            }
        },
    });
}

export function useDeleteInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteInspection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
            toast.success('Inspection removed');
        },
    });
}
