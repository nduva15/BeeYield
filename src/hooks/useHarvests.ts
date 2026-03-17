import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Harvest, HarvestCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const harvestKeys = {
    all: ['harvests'] as const,
    lists: () => [...harvestKeys.all, 'list'] as const,
    list: (filters?: any) => [...harvestKeys.lists(), { filters }] as const,
    details: () => [...harvestKeys.all, 'detail'] as const,
    detail: (id: string) => [...harvestKeys.details(), id] as const,
    summary: () => [...harvestKeys.all, 'summary'] as const,
};

export function useHarvests(filters?: any) {
    return useQuery({
        queryKey: harvestKeys.list(filters),
        queryFn: async () => {
            return await beeyieldService.getHarvests(filters);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: HarvestCreateInput) => {
            const { data, error } = await beeyieldService.createHarvest(input);
            if (error) throw error;
            return data as Harvest;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
            queryClient.invalidateQueries({ queryKey: harvestKeys.summary() });
            toast.success('Harvest recorded', {
                description: data.batch_code ? `Batch: ${data.batch_code}` : undefined
            });
        },
        onError: (error: any) => {
            console.error('Create harvest error:', error);
            toast.error('Failed to record harvest');
        },
    });
}

export function useUpdateHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<HarvestCreateInput> }) => {
            const { data: updated, error } = await beeyieldService.updateHarvest(id, data);
            if (error) throw error;
            return updated as Harvest;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
            queryClient.invalidateQueries({ queryKey: harvestKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: harvestKeys.summary() });
            toast.success('Harvest record updated');
        },
        onError: (error: any) => {
            console.error('Update harvest error:', error);
            toast.error('Failed to update harvest');
        },
    });
}

export function useDeleteHarvest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await beeyieldService.deleteHarvest(id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
            queryClient.invalidateQueries({ queryKey: harvestKeys.summary() });
            toast.success('Harvest record deleted');
        },
        onError: (error: any) => {
            console.error('Delete harvest error:', error);
            toast.error('Failed to delete harvest');
        },
    });
}

/**
 * Hook to get yearly aggregate for the current calendar year
 */
export function useYearlyHarvestSummary(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const { data: harvests, isLoading } = useHarvests();

    // Calculate totals client-side for now to leverage cache
    const yearHarvests = harvests?.filter(h =>
        new Date(h.harvest_date).getFullYear() === currentYear
    ) || [];

    const totalKg = yearHarvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0);
    const count = yearHarvests.length;

    return {
        totalKg,
        count,
        isLoading
    };
}
