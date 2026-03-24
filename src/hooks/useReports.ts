import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, GeneratedReport, ScheduledReport } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const reportKeys = {
    all: ['reports'] as const,
    generated: () => [...reportKeys.all, 'generated'] as const,
    scheduled: () => [...reportKeys.all, 'scheduled'] as const,
};

export function useGeneratedReports() {
    return useQuery({
        queryKey: reportKeys.generated(),
        queryFn: () => beeyieldService.getGeneratedReports(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useScheduledReports() {
    return useQuery({
        queryKey: reportKeys.scheduled(),
        queryFn: () => beeyieldService.getScheduledReports(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateScheduledReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: any) => beeyieldService.createScheduledReport(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
        },
    });
}

export function useDeleteScheduledReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => beeyieldService.deleteScheduledReport(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.scheduled() });
        },
    });
}
