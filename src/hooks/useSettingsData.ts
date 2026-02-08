
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beeyieldService, UserSettings, UserSettingsUpdate, NotificationConfigUpdate } from '@/services/beeyieldService';
import { toast } from 'sonner';

export const settingsKeys = {
    all: ['settings'] as const,
    full: ['settings-full'] as const,
    hives: ['settings-hives'] as const,
};

// Use the new /full endpoint by default
export function useUserSettings() {
    return useQuery({
        queryKey: settingsKeys.full,
        queryFn: async () => {
            const data = await beeyieldService.getFullSettings();
            // Transform to match old UserSettings if needed, or update consumers
            // For now, let's assume the component will adapt or we provide a compatible structure
            // The backend returns { profile, preferences, global_thresholds }

            // Adapter for legacy compatibility with SettingsView components waiting for "temp_threshold_high" directly
            if (data && data.global_thresholds) {
                return {
                    ...data.preferences,
                    temp_threshold_high: data.global_thresholds.temp_high,
                    temp_threshold_low: data.global_thresholds.temp_low,
                    weight_drop_threshold: data.global_thresholds.weight_drop,
                    notification_configs: [], // prefs specific
                    full_data: data // Keep original
                };
            }
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

// New hook for hive settings list
export function useHiveSettings() {
    return useQuery({
        queryKey: settingsKeys.hives,
        queryFn: async () => {
            return await beeyieldService.getHiveSettings();
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: UserSettingsUpdate) => {
            // This maps to old updateSettings, which updates preferences.
            // If user updates thresholds via "General" tab, we need to handle that too.
            // But for now, let's keep basic prefs correct.

            // Check if we are updating global thresholds
            if (settings.temp_threshold_high !== undefined ||
                settings.temp_threshold_low !== undefined ||
                settings.weight_drop_threshold !== undefined) {

                // Call updateHiveThresholds with 'global'
                await beeyieldService.updateHiveThresholds('global', {
                    temp_high: settings.temp_threshold_high,
                    temp_low: settings.temp_threshold_low,
                    weight_drop: settings.weight_drop_threshold
                });
            }

            // Clean up prefs only fields
            const prefsPayload: any = { ...settings };
            delete prefsPayload.temp_threshold_high;
            delete prefsPayload.temp_threshold_low;
            delete prefsPayload.weight_drop_threshold;

            if (Object.keys(prefsPayload).length > 0) {
                const { data, error } = await beeyieldService.updateSettings(prefsPayload);
                if (error) throw error;
                return data;
            }
            return {};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.full });
            queryClient.invalidateQueries({ queryKey: settingsKeys.hives });
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
            queryClient.invalidateQueries({ queryKey: settingsKeys.full });
        },
    });
}

export function useUpdateHiveThresholds() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ hiveId, thresholds }: { hiveId: string; thresholds: any }) => {
            // Adapter for naming: UI uses temp_threshold_high, Backend uses temp_high
            const payload = {
                temp_high: thresholds.temp_threshold_high ?? thresholds.temp_high,
                temp_low: thresholds.temp_threshold_low ?? thresholds.temp_low,
                weight_drop: thresholds.weight_drop_threshold ?? thresholds.weight_drop
            };

            const { data, error } = await beeyieldService.updateHiveThresholds(hiveId, payload);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.hives });
            queryClient.invalidateQueries({ queryKey: ['hives'] });
        },
    });
}
