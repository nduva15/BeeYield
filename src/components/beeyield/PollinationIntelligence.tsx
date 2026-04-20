import React from 'react';
import {
  Activity,
  AlertCircle,
  Brain,
  ChevronRight,
  Clock,
  Cpu,
  FileDown,
  Hexagon,
  Loader2,
  MapPin,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useApiaries, useHives } from '@/hooks/useHives';
import { useDevices } from '@/hooks/useDevices';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { useSensorAlerts } from '@/hooks/useSensorAlerts';
import { useTasks } from '@/hooks/useTasks';
import { beeyieldService } from '@/services/beeyieldService';
import {
  buildTelemetrySeries,
  deriveCoverageMetrics,
  extractReadingTimestamp,
  filterAlertsByApiary,
  filterDevicesByApiary,
  filterHivesByApiary,
  filterReadingsByApiary,
  filterTasksByApiary,
} from '@/lib/pollinationInsights';
import { cn } from '@/lib/utils';
import {
  BeeYieldBadge,
  BeeYieldEmptyState,
  BeeYieldLoading,
  BeeYieldPageHeader,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import { glass } from './GlassTheme';

interface PollinationIntelligenceProps {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const EMPTY_APIARIES: any[] = [];
const EMPTY_HIVES: any[] = [];
const EMPTY_DEVICES: any[] = [];
const EMPTY_READINGS: any[] = [];
const EMPTY_ALERTS: any[] = [];
const EMPTY_TASKS: any[] = [];

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
  const [activeHub, setActiveHub] = React.useState<string>('');
  const [exporting, setExporting] = React.useState(false);

  const apiariesQuery = useApiaries();
  const hivesQuery = useHives();
  const devicesQuery = useDevices();
  const readingsQuery = useSensorReadings(undefined, 24);
  const alertsQuery = useSensorAlerts(false);
  const tasksQuery = useTasks();

  const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
  const hives = hivesQuery.data ?? EMPTY_HIVES;
  const devices = devicesQuery.data ?? EMPTY_DEVICES;
  const readings = readingsQuery.data ?? EMPTY_READINGS;
  const alerts = alertsQuery.data ?? EMPTY_ALERTS;
  const tasks = tasksQuery.data ?? EMPTY_TASKS;

  React.useEffect(() => {
    if (!activeHub && apiaries.length > 0) {
      setActiveHub(apiaries[0].id);
    }
  }, [activeHub, apiaries]);

  const activeApiary = React.useMemo(
    () => apiaries.find((apiary) => apiary.id === activeHub) || null,
    [activeHub, apiaries],
  );

  const apiaryHives = React.useMemo(
    () => filterHivesByApiary(hives, activeHub),
    [activeHub, hives],
  );

  const apiaryDevices = React.useMemo(
    () => filterDevicesByApiary(devices, activeHub, apiaryHives),
    [activeHub, apiaryHives, devices],
  );

  const apiaryReadings = React.useMemo(
    () => filterReadingsByApiary(readings, apiaryHives, apiaryDevices),
    [apiaryDevices, apiaryHives, readings],
  );

  const apiaryAlerts = React.useMemo(
    () => filterAlertsByApiary(alerts, activeHub, apiaryHives),
    [activeHub, alerts, apiaryHives],
  );

  const apiaryTasks = React.useMemo(
    () => filterTasksByApiary(tasks, activeHub, apiaryHives),
    [activeHub, apiaryHives, tasks],
  );

  const coverage = React.useMemo(
    () => deriveCoverageMetrics(activeApiary, apiaryHives, apiaryAlerts),
    [activeApiary, apiaryAlerts, apiaryHives],
  );

  const telemetrySeries = React.useMemo(
    () => buildTelemetrySeries(apiaryReadings, 8, 24),
    [apiaryReadings],
  );

  const latestReading = React.useMemo(
    () =>
      [...apiaryReadings]
        .sort((left, right) => {
          const leftTime = extractReadingTimestamp(left)?.getTime() || 0;
          const rightTime = extractReadingTimestamp(right)?.getTime() || 0;
          return rightTime - leftTime;
        })
        .at(0) || null,
    [apiaryReadings],
  );

  const openTasks = React.useMemo(
    () => apiaryTasks.filter((task) => task.status !== 'completed'),
    [apiaryTasks],
  );

  const activeWindow = React.useMemo(() => {
    const activeBuckets = telemetrySeries.filter((bucket) => bucket.activity > 0);
    if (!activeBuckets.length) return 'Waiting for live telemetry';
    return `${activeBuckets[0].time} - ${activeBuckets[activeBuckets.length - 1].time}`;
  }, [telemetrySeries]);

  const lastSyncLabel = React.useMemo(() => {
    const timestamp = latestReading ? extractReadingTimestamp(latestReading) : null;
    if (!timestamp) return 'No recent telemetry';
    return timestamp.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }, [latestReading]);

  const loading =
    apiariesQuery.isLoading ||
    hivesQuery.isLoading ||
    devicesQuery.isLoading ||
    readingsQuery.isLoading ||
    alertsQuery.isLoading ||
    tasksQuery.isLoading;

  const handleRefresh = () => {
    apiariesQuery.refetch();
    hivesQuery.refetch();
    devicesQuery.refetch();
    readingsQuery.refetch();
    alertsQuery.refetch();
    tasksQuery.refetch();
  };

  const handleGetReport = async () => {
    if (exporting) return;
    if (!activeHub) {
      toast.error('Select an apiary first.');
      return;
    }

    const toastId = toast.loading('Generating pollination insights report...');
    setExporting(true);

    try {
      const { data, error } = await beeyieldService.generateReport({
        report_type: 'season',
        parameters: {
          scope_days: 90,
          place_id: activeHub,
          sections: ['overview', 'apiaries', 'hives', 'harvests', 'inspections'],
        },
        file_format: 'PDF',
      } as any);

      if (error || !data?.id) throw error || new Error('Report job failed');

      const status = await beeyieldService.waitForReport(String(data.id), { timeoutMs: 90_000 });
      if (status?.file_url) window.open(status.file_url, '_blank');

      await beeyieldService.logExport({
        export_type: 'PDF',
        entity_scope: 'Pollination intelligence',
        file_name:
          status?.file_name ||
          `Pollination_Intelligence_${activeHub}_${new Date().toISOString().slice(0, 10)}.pdf`,
        record_count: 1,
      });

      toast.success('Pollination report ready.', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Could not generate the report.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <BeeYieldPageShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <BeeYieldPageHeader
          icon={Brain}
          label="Pollination Insights"
          title={
            <>
              Pollination <span className="text-[#1B9157]">Insights</span>
            </>
          }
          subtitle="Live telemetry, alert pressure, and field coverage for the selected apiary."
          onRefresh={handleRefresh}
          actions={
            activeApiary ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/ bg-muted/ px-3 py-2 shadow-sm">
                <MapPin className="h-4 w-4 text-[#1B9157]" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Active apiary</p>
                  <p className="text-xs font-bold text-foreground">{activeApiary.name}</p>
                </div>
              </div>
            ) : null
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4">
            <div className={cn(glass.section, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-border/ px-5 py-4 bg-muted/">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/ bg-[#F4D03F]/10">
                    <MapPin className="h-5 w-5 text-[#1B9157]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-foreground">Tracked Apiaries</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                      {apiaries.length} synced locations
                    </p>
                  </div>
                </div>
                <BeeYieldBadge variant="success">{coverage.activeHives} active hives</BeeYieldBadge>
              </div>

              <div className="space-y-3 p-4">
                {loading && apiaries.length === 0 ? (
                  <BeeYieldLoading label="Loading apiaries..." />
                ) : apiaries.length === 0 ? (
                  <BeeYieldEmptyState
                    icon={MapPin}
                    title="No apiaries available"
                    description="Add an apiary to unlock pollination insights for a live field."
                    action={onTabChange ? { label: 'Open Apiaries', onClick: () => onTabChange('places') } : undefined}
                  />
                ) : (
                  apiaries.map((apiary) => {
                    const isActive = apiary.id === activeHub;
                    const hiveCount = hives.filter((hive) => hive.apiary_id === apiary.id).length;

                    return (
                      <button
                        key={apiary.id}
                        type="button"
                        onClick={() => setActiveHub(apiary.id)}
                        className={cn(
                          'w-full rounded-2xl border p-4 text-left transition-all',
                          isActive
                            ? 'border-[#1B9157]/25 bg-[#1B9157]/5 shadow-sm'
                            : 'border-transparent bg-muted/ hover:border-border/ hover:bg-muted/',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-black tracking-tight text-foreground">{apiary.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {apiary.location_name || apiary.region || 'Location not set'}
                            </p>
                          </div>
                          <ChevronRight className={cn('h-4 w-4', isActive ? 'text-[#1B9157]' : 'text-gray-300')} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <BeeYieldBadge>{hiveCount} hives</BeeYieldBadge>
                          <BeeYieldBadge variant={apiary.status === 'active' ? 'success' : 'warning'}>
                            {apiary.status || 'monitoring'}
                          </BeeYieldBadge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Coverage',
                  value: `${coverage.coveragePercent.toFixed(0)}%`,
                  hint: `${coverage.activeFpa.toFixed(1)} FPA live`,
                  icon: Activity,
                  accent: 'text-[#1B9157]',
                },
                {
                  label: 'Live Devices',
                  value: apiaryDevices.length.toString(),
                  hint: `${apiaryReadings.length} readings / 24h`,
                  icon: Cpu,
                  accent: 'text-foreground',
                },
                {
                  label: 'Open Alerts',
                  value: apiaryAlerts.filter((alert) => !alert.resolved).length.toString(),
                  hint: `${coverage.criticalAlerts} critical`,
                  icon: AlertCircle,
                  accent: coverage.criticalAlerts > 0 ? 'text-red-600' : 'text-[#F4D03F]',
                },
                {
                  label: 'Open Tasks',
                  value: openTasks.length.toString(),
                  hint: `${apiaryTasks.length} total tasks`,
                  icon: ClipboardList,
                  accent: 'text-[#F4D03F]',
                },
              ].map((item) => (
                <div key={item.label} className={cn(glass.card, 'p-5')}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/ bg-muted/">
                      <item.icon className={cn('h-5 w-5', item.accent)} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">{item.label}</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className={cn('text-3xl font-black tracking-tight', item.accent)}>{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn(glass.section, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-border/ px-5 py-4 bg-muted/">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1B9157]/20 bg-[#1B9157]/10">
                    <Activity className="h-5 w-5 text-[#1B9157]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-foreground">Foraging Dynamics</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                      Last 24 hours of telemetry
                    </p>
                  </div>
                </div>
                <BeeYieldBadge variant={telemetrySeries.some((bucket) => bucket.sampleCount > 0) ? 'success' : 'warning'}>
                  {telemetrySeries.reduce((sum, bucket) => sum + bucket.sampleCount, 0)} samples
                </BeeYieldBadge>
              </div>

              <div className="h-[360px] p-5">
                {loading && !telemetrySeries.some((bucket) => bucket.sampleCount > 0) ? (
                  <BeeYieldLoading label="Loading telemetry..." />
                ) : !telemetrySeries.some((bucket) => bucket.sampleCount > 0) ? (
                  <BeeYieldEmptyState
                    icon={Activity}
                    title="No telemetry for this apiary"
                    description="Sensor readings will appear here once devices report data for the selected location."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetrySeries} margin={{ top: 16, right: 16, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pollination-activity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1B9157" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="pollination-temp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#1A1A1A" opacity={0.06} strokeDasharray="3 3" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 700 }} />
                      <Tooltip
                        cursor={{ stroke: '#1B9157', strokeWidth: 1.5, strokeDasharray: '6 6' }}
                        contentStyle={{
                          borderRadius: '16px',
                          border: '1px solid rgba(244, 208, 63, 0.2)',
                          backgroundColor: 'rgba(255, 249, 240, 0.96)',
                          boxShadow: '0 24px 48px rgba(26, 26, 26, 0.08)',
                        }}
                      />
                      <Area type="monotone" dataKey="activity" stroke="#1B9157" strokeWidth={3} fill="url(#pollination-activity)" />
                      <Area type="monotone" dataKey="temp" stroke="#F4D03F" strokeWidth={3} fill="url(#pollination-temp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={cn(glass.section, 'p-5')}>
                <div className="flex items-center justify-between border-b border-border/ pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-foreground">Live Warnings</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                        Sensor and pollination risks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {apiaryAlerts.filter((alert) => !alert.resolved).length === 0 ? (
                    <BeeYieldEmptyState
                      icon={ShieldCheck}
                      title="No open alerts"
                      description="This apiary does not have unresolved pollination or telemetry alerts right now."
                    />
                  ) : (
                    apiaryAlerts
                      .filter((alert) => !alert.resolved)
                      .slice(0, 3)
                      .map((alert) => (
                        <div key={alert.id} className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-red-700">{alert.alert_type} alert</p>
                            <BeeYieldBadge variant={alert.severity === 'critical' ? 'error' : 'warning'}>
                              {alert.severity}
                            </BeeYieldBadge>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-red-700/80">{alert.message}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className={cn(glass.section, 'p-5 bg-[#1A1A1A] text-white')}>
                <div className="flex items-center justify-between border-b border-border/ pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/ bg-muted/">
                      <ShieldCheck className="h-5 w-5 text-[#1B9157]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">Field Status</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                        Live sync summary
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border/ bg-muted/ px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#F4D03F]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Active window</span>
                    </div>
                    <span className="text-sm font-black">{activeWindow}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/ bg-muted/ px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Hexagon className="h-4 w-4 text-[#1B9157]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Target FPA</span>
                    </div>
                    <span className="text-sm font-black">{coverage.targetFpa.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/ bg-muted/ px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#F4D03F]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Last sync</span>
                    </div>
                    <span className="text-right text-sm font-black">{lastSyncLabel}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetReport}
                    disabled={exporting || !activeHub}
                    className={cn(
                      glass.btnPrimary,
                      'mt-2 h-12 w-full rounded-2xl bg-[#1B9157] text-white hover:bg-[#157347]',
                      (exporting || !activeHub) && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                    <span>{exporting ? 'Preparing report...' : 'Export field report'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </BeeYieldPageShell>
  );
};

export default PollinationIntelligence;

