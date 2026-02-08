import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, UserSettings, UserSettingsUpdate, NotificationConfigUpdate } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const settingsKeys = {
    all: ['settings'] as const,
};

export function useUserSettings() {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: async () => {
            return await beeyieldService.getSettings();
        },
        staleTime: 1000 * 60 * 5, // Settings are fairly static, 5 mins stale time
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: UserSettingsUpdate) => {
            const { data, error } = await beeyieldService.updateSettings(settings);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useUpdateNotificationConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventType, config }: { eventType: string; config: NotificationConfigUpdate }) => {
            const { data, error } = await beeyieldService.updateNotificationConfig(eventType, config);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useUpdateHiveThresholds() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ hiveId, thresholds }: { hiveId: string; thresholds: any }) => {
            const { data, error } = await beeyieldService.updateHiveThresholds(hiveId, thresholds);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate hives query to refresh table data
            queryClient.invalidateQueries({ queryKey: ['hives'] });
        },
    });
}
