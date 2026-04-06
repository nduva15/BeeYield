import { useQuery } from '@tanstack/react-query';
import { beeyieldService } from '@/services/beeyieldService';

export const weatherSummaryKeys = {
    all: ['apiary-weather-summary'] as const,
    detail: (apiaryId?: string | null) => [...weatherSummaryKeys.all, apiaryId || 'none'] as const,
};

export function useApiaryWeatherSummary(apiaryId?: string | null) {
    return useQuery({
        queryKey: weatherSummaryKeys.detail(apiaryId),
        queryFn: () => (apiaryId ? beeyieldService.getApiaryWeatherSummary(apiaryId) : Promise.resolve(null)),
        enabled: !!apiaryId,
        staleTime: 1000 * 60,
        refetchInterval: 1000 * 60,
    });
}
