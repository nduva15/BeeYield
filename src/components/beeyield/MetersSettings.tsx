import React from 'react';
import { Bell, Loader2, Plug, Settings2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import {
    useIoTSettings,
    useNotificationSettings,
    useUpdateIoTSettings,
    useUpdateNotificationSettings,
} from '@/hooks/useSettingsData';

const MetersSettings: React.FC = () => {
    const { data: notificationSettings, isLoading: notificationsLoading } = useNotificationSettings();
    const { data: iotSettings, isLoading: iotLoading } = useIoTSettings();
    const updateNotifications = useUpdateNotificationSettings();
    const updateIoT = useUpdateIoTSettings();

    const [notificationForm, setNotificationForm] = React.useState({
        email_alerts_enabled: true,
        push_notifications_enabled: true,
        notify_on_swarm: true,
        notify_on_theft: true,
        notify_on_low_battery: true,
    });
    const [iotForm, setIotForm] = React.useState({
        temp_min_threshold: '20',
        temp_max_threshold: '38',
        weight_drop_alert_kg: '3',
        humidity_min_threshold: '35',
        humidity_max_threshold: '80',
    });

    React.useEffect(() => {
        if (notificationSettings) {
            setNotificationForm({
                email_alerts_enabled: !!notificationSettings.email_alerts_enabled,
                push_notifications_enabled: !!notificationSettings.push_notifications_enabled,
                notify_on_swarm: !!notificationSettings.notify_on_swarm,
                notify_on_theft: !!notificationSettings.notify_on_theft,
                notify_on_low_battery: !!notificationSettings.notify_on_low_battery,
            });
        }
    }, [notificationSettings]);

    React.useEffect(() => {
        if (iotSettings) {
            setIotForm({
                temp_min_threshold: String(iotSettings.temp_min_threshold ?? 20),
                temp_max_threshold: String(iotSettings.temp_max_threshold ?? 38),
                weight_drop_alert_kg: String(iotSettings.weight_drop_alert_kg ?? 3),
                humidity_min_threshold: String(iotSettings.humidity_min_threshold ?? 35),
                humidity_max_threshold: String(iotSettings.humidity_max_threshold ?? 80),
            });
        }
    }, [iotSettings]);

    const saveNotifications = async () => {
        try {
            await updateNotifications.mutateAsync(notificationForm);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update notification settings');
        }
    };

    const saveThresholds = async () => {
        const payload = {
            temp_min_threshold: Number(iotForm.temp_min_threshold),
            temp_max_threshold: Number(iotForm.temp_max_threshold),
            weight_drop_alert_kg: Number(iotForm.weight_drop_alert_kg),
            humidity_min_threshold: Number(iotForm.humidity_min_threshold),
            humidity_max_threshold: Number(iotForm.humidity_max_threshold),
        };

        if (Object.values(payload).some((value) => !Number.isFinite(value))) {
            toast.error('Enter valid numeric threshold values');
            return;
        }

        try {
            await updateIoT.mutateAsync(payload);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update IoT thresholds');
        }
    };

    const isLoading = notificationsLoading || iotLoading;

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <div className="max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6">
                <BeeYieldPageHeader
                    icon={Settings2}
                    label="Persisted controls"
                    title={<>System <span className="text-[#F4D03F]">Settings</span></>}
                    subtitle="Operational thresholds and notification channels saved through the backend."
                />

                {isLoading ? (
                    <div className={cn(glass.card, 'p-12 flex items-center justify-center gap-3')}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium text-foreground/70">Loading current settings...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={cn(glass.card, 'p-0 overflow-hidden bg-muted/ border-border/')}>
                                <div className="p-5 border-b border-border/ bg-muted/ flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-muted/ flex items-center justify-center border border-border/">
                                        <Bell className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <h3 className="text-[11px] font-black text-foreground">Notification Channels</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {[
                                        ['email_alerts_enabled', 'Email alerts'],
                                        ['push_notifications_enabled', 'Push notifications'],
                                        ['notify_on_swarm', 'Swarm activity'],
                                        ['notify_on_theft', 'Tamper or theft'],
                                        ['notify_on_low_battery', 'Low battery'],
                                    ].map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between rounded-xl border border-border/ bg-muted/ px-4 py-3">
                                            <div>
                                                <div className="text-[10px] font-black text-foreground">{label}</div>
                                                <div className="text-[9px] font-bold text-muted-foreground">Persisted to your BeeYield notification profile</div>
                                            </div>
                                            <Switch
                                                checked={!!notificationForm[key as keyof typeof notificationForm]}
                                                onCheckedChange={(checked) =>
                                                    setNotificationForm((current) => ({ ...current, [key]: checked }))
                                                }
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        className={cn(glass.btnPrimary, 'w-full')}
                                        onClick={saveNotifications}
                                        disabled={updateNotifications.isPending}
                                    >
                                        {updateNotifications.isPending ? 'Saving...' : 'Save notification settings'}
                                    </Button>
                                </div>
                            </div>

                            <div className={cn(glass.card, 'p-0 overflow-hidden bg-muted/ border-border/')}>
                                <div className="p-5 border-b border-border/ bg-muted/ flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-muted/ flex items-center justify-center border border-border/">
                                        <Shield className="w-4 h-4 text-[#1B9157]" />
                                    </div>
                                    <h3 className="text-[11px] font-black text-foreground">Sensor Thresholds</h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        ['temp_min_threshold', 'Min temperature'],
                                        ['temp_max_threshold', 'Max temperature'],
                                        ['weight_drop_alert_kg', 'Weight drop'],
                                        ['humidity_min_threshold', 'Min humidity'],
                                        ['humidity_max_threshold', 'Max humidity'],
                                    ].map(([key, label]) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-[10px] font-black text-foreground/60">{label}</label>
                                            <Input
                                                value={iotForm[key as keyof typeof iotForm]}
                                                onChange={(event) =>
                                                    setIotForm((current) => ({ ...current, [key]: event.target.value }))
                                                }
                                                className={glass.input}
                                                inputMode="decimal"
                                            />
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2">
                                        <Button
                                            className={cn(glass.btnPrimary, 'w-full')}
                                            onClick={saveThresholds}
                                            disabled={updateIoT.isPending}
                                        >
                                            {updateIoT.isPending ? 'Saving...' : 'Save threshold settings'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn(glass.card, 'p-6 bg-muted/ border-border/')}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted/ flex items-center justify-center border border-border/">
                                    <Plug className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[11px] font-black text-foreground">Integration posture</h3>
                                    <p className="text-sm text-muted-foreground/90">
                                        Meter rules now save through the shared backend instead of browser storage, so the same thresholds and alert channels follow your account across reloads and devices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </BeeYieldPageShell>
    );
};

export default MetersSettings;

