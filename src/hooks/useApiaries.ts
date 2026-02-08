/**
 * TanStack Query hooks for Apiary (My Places) data management
 * Features: background refetching, caching, optimistic updates, mutation handling
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, Apiary, ApiaryCreateInput, Hive } from '@/services/beeyieldService';
import { toast } from 'sonner';

// Query key factory for consistent key management
export const apiaryKeys = {
    all: ['apiaries'] as const,
    lists: () => [...apiaryKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...apiaryKeys.lists(), filters] as const,
    details: () => [...apiaryKeys.all, 'detail'] as const,
    detail: (id: string) => [...apiaryKeys.details(), id] as const,
};

export const hiveKeys = {
    all: ['hives'] as const,
    lists: () => [...hiveKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...hiveKeys.lists(), { apiaryId }] as const,
    details: () => [...hiveKeys.all, 'detail'] as const,
    detail: (id: string) => [...hiveKeys.details(), id] as const,
};

/**
 * Fetch user's apiaries with automatic background refetching
 * PRD: refetchInterval of 30 seconds for real-time dashboard updates
 */
export function useApiaries() {
    return useQuery({
        queryKey: apiaryKeys.lists(),
        queryFn: async () => {
            const data = await beeyieldService.getApiaries();
            return data;
        },
        staleTime: 1000 * 30, // Consider data fresh for 30 seconds
        refetchInterval: 1000 * 30, // Background refetch every 30 seconds per PRD
        refetchOnWindowFocus: true,
        retry: 2,
    });
}

/**
 * Fetch a single apiary by ID with its hives
 */
export function useApiary(id: string | null) {
    return useQuery({
        queryKey: apiaryKeys.detail(id || ''),
        queryFn: async () => {
            if (!id) return null;
            // First get the apiary from the list
            const apiaries = await beeyieldService.getApiaries();
            const apiary = apiaries.find(a => a.id === id);
            if (!apiary) return null;

            // Then fetch its hives
            const hives = await beeyieldService.getHives(id);
            return { ...apiary, hives };
        },
        enabled: !!id,
        staleTime: 1000 * 30,
    });
}

/**
 * Fetch hives for a specific apiary or all user hives
 */
export function useHives(apiaryId?: string) {
    return useQuery({
        queryKey: hiveKeys.list(apiaryId),
        queryFn: async () => {
            return await beeyieldService.getHives(apiaryId);
        },
        staleTime: 1000 * 30,
        refetchInterval: 1000 * 30, // Real-time hive status updates
    });
}

/**
 * Create a new apiary with optimistic update and cache invalidation
 */
export function useCreateApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ApiaryCreateInput) => {
            const { data, error } = await beeyieldService.createApiary(input);
            if (error) throw error;
            return data as Apiary;
        },
        onMutate: async (newApiary) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: apiaryKeys.lists() });

            // Snapshot previous value
            const previousApiaries = queryClient.getQueryData<Apiary[]>(apiaryKeys.lists());

            // Optimistically add new apiary
            if (previousApiaries) {
                const optimisticApiary: Apiary = {
                    id: `temp-${Date.now()}`,
                    name: newApiary.name,
                    type: newApiary.type,
                    location_name: newApiary.location_name,
                    region: newApiary.region,
                    forage_type: newApiary.forage_type,
                    expected_hives: newApiary.expected_hives,
                    size_acres: newApiary.size_acres,
                    notes: newApiary.notes,
                    hive_count: 0,
                    status: 'active',
                };
                queryClient.setQueryData<Apiary[]>(apiaryKeys.lists(), [optimisticApiary, ...previousApiaries]);
            }

            return { previousApiaries };
        },
        onError: (_err, _newApiary, context) => {
            // Rollback on error
            if (context?.previousApiaries) {
                queryClient.setQueryData(apiaryKeys.lists(), context.previousApiaries);
            }
        },
        onSettled: () => {
            // Always refetch after mutation
            queryClient.invalidateQueries({ queryKey: apiaryKeys.lists() });
        },
    });
}

/**
 * Update an existing apiary
 */
export function useUpdateApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ApiaryCreateInput> }) => {
            const { data: updated, error } = await beeyieldService.updateApiary(id, data);
            if (error) throw error;
            return updated as Apiary;
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: apiaryKeys.lists() });

            const previousApiaries = queryClient.getQueryData<Apiary[]>(apiaryKeys.lists());

            if (previousApiaries) {
                queryClient.setQueryData<Apiary[]>(
                    apiaryKeys.lists(),
                    previousApiaries.map(apiary =>
                        apiary.id === id ? { ...apiary, ...data } : apiary
                    )
                );
            }

            return { previousApiaries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousApiaries) {
                queryClient.setQueryData(apiaryKeys.lists(), context.previousApiaries);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: apiaryKeys.lists() });
        },
    });
}

/**
 * Delete an apiary
 */
export function useDeleteApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await beeyieldService.deleteApiary(id);
            if (error) throw error;
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: apiaryKeys.lists() });

            const previousApiaries = queryClient.getQueryData<Apiary[]>(apiaryKeys.lists());

            if (previousApiaries) {
                queryClient.setQueryData<Apiary[]>(
                    apiaryKeys.lists(),
                    previousApiaries.filter(apiary => apiary.id !== id)
                );
            }

            return { previousApiaries };
        },
        onError: (_err, _id, context) => {
            if (context?.previousApiaries) {
                queryClient.setQueryData(apiaryKeys.lists(), context.previousApiaries);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: apiaryKeys.lists() });
        },
    });
}

/**
 * Clear all cached apiaries data (for logout)
 * PRD: Upon logout, execute queryClient.clear() to purge cached data
 */
export function useClearApiaryCache() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.removeQueries({ queryKey: apiaryKeys.all });
        queryClient.removeQueries({ queryKey: hiveKeys.all });
    };
}
