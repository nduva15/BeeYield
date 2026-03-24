import { useQuery } from '@tanstack/react-query';
import { beeyieldService } from '@/services/beeyieldService';

export const potentialKeys = {
    all: ['flight-potential'] as const,
    detail: (apiaryId: string) => [...potentialKeys.all, apiaryId] as const,
};

export function useFlightPotential(apiaryId?: string) {
    return useQuery({
        queryKey: potentialKeys.detail(apiaryId || ''),
        queryFn: () => beeyieldService.getFlightPotential(apiaryId!),
        enabled: !!apiaryId,
        staleTime: 1000 * 60 * 15, // Potential doesn't change too fast
    });
}
