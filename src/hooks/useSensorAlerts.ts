import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, SensorAlert } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const alertKeys = {
    all: ['sensor-alerts'] as const,
    list: (resolved?: boolean) => [...alertKeys.all, { resolved }] as const,
};

export function useSensorAlerts(resolved?: boolean) {
    return useQuery({
        queryKey: alertKeys.list(resolved),
        queryFn: () => beeyieldService.getSensorAlerts(resolved),
    });
}

export function useResolveAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
            beeyieldService.resolveSensorAlert(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: alertKeys.all });
            toast.success("Alert resolved successfully");
        },
        onError: () => {
            toast.error("Failed to resolve alert");
        }
    });
}
