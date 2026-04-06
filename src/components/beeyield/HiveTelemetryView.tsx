import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Cpu,
  Database,
  Download,
  Gauge,
  History,
  RefreshCw,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Waves,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import WeightDynamicsChart from '@/components/telemetry/WeightDynamicsChart';
import AcousticWaveform from '@/components/telemetry/AcousticWaveform';
import { GlassModal, GlassStatCard, glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSectionHeader } from '@/components/beeyield/BeeYieldUI';

interface WeightData {
  time: string;
  weight: number;
  dwdt: number;
  timestamp: number;
}

const pill = 'inline-flex items-center gap-2 rounded-2xl border bg-white/75 px-4 py-2 shadow-sm';
const tile = 'rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm';

const HiveTelemetryView: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<WeightData[]>([]);
  const [gatewayStatus, setGatewayStatus] = React.useState<'Online' | 'Offline' | 'Connecting'>('Online');
  const [recentAlert, setRecentAlert] = React.useState<string | null>(null);
  const [hives, setHives] = React.useState<any[]>([]);
  const [devices, setDevices] = React.useState<any[]>([]);
  const [selectedHiveId, setSelectedHiveId] = React.useState('');
  const [selectedDeviceId, setSelectedDeviceId] = React.useState('');
  const [isTaring, setIsTaring] = React.useState(false);
  const [calibrationOpen, setCalibrationOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [manualOffsetValue, setManualOffsetValue] = React.useState('0.00');
  const [exportFileName, setExportFileName] = React.useState('');

  const latest = data.at(-1) ?? null;
  const first = data[0] ?? null;
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const dwdt = latest && prev ? latest.weight - prev.weight : 0;
  const latestDelta = latest && first ? latest.weight - first.weight : 0;
  const isFlowing = dwdt > 0.05;
  const isAlert = dwdt < -1.5 || recentAlert !== null;

  const selectedHive = React.useMemo(
    () => hives.find((hive) => String(hive.id) === String(selectedHiveId)) ?? null,
    [hives, selectedHiveId],
  );

  const linkedDevice = React.useMemo(() => {
    const byHive = devices.find((device) => {
      const hiveId = device?.assigned_hive_id ?? device?.hive_id ?? device?.hiveId;
      return hiveId && String(hiveId) === String(selectedHiveId);
    });
    return byHive ?? devices.find((device) => String(device.id) === String(selectedDeviceId)) ?? null;
  }, [devices, selectedDeviceId, selectedHiveId]);

  const activeDeviceId = selectedDeviceId || linkedDevice?.id || '';
  const deviceLabel =
    linkedDevice?.serial_number || linkedDevice?.device_name || linkedDevice?.name || (activeDeviceId ? `Sensor ${activeDeviceId}` : 'No linked device');
  const lastSeen = latest
    ? new Date(latest.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Waiting for first sync';
  const totalYield = React.useMemo(() => {
    let sum = 0;
    for (let index = 1; index < data.length; index += 1) {
      const gain = data[index].weight - data[index - 1].weight;
      if (gain > 0) sum += gain;
    }
    return sum.toFixed(2);
  }, [data]);

  const refreshMetadata = React.useCallback(async () => {
    const [loadedHives, loadedDevices] = await Promise.all([beeyieldService.getHives(), beeyieldService.getDevices()]);
    setHives(loadedHives || []);
    setDevices(loadedDevices || []);
    if (!selectedHiveId && loadedHives?.length) setSelectedHiveId(loadedHives[0].id);
  }, [selectedHiveId]);

  const loadSeries = React.useCallback(async () => {
    if (!selectedHiveId) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows: any[] = await beeyieldService.getReadings(selectedHiveId, 240);
      const points = (rows || [])
        .map((row) => {
          const rawTs = row?.recorded_at || row?.timestamp || row?.created_at;
          const timestamp = rawTs ? new Date(rawTs).getTime() : Number.NaN;
          const weight = [row?.weight, row?.weight_kg, row?.hive_weight_kg, row?.mass_kg].find((value) => typeof value === 'number');
          if (!Number.isFinite(timestamp) || typeof weight !== 'number') return null;
          return { timestamp, weight };
        })
        .filter(Boolean) as Array<{ timestamp: number; weight: number }>;

      if (points.length < 2) {
        setData([]);
        return;
      }

      points.sort((a, b) => a.timestamp - b.timestamp);
      setData(
        points.map((point, index) => ({
          time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          weight: parseFloat(point.weight.toFixed(2)),
          dwdt: parseFloat(((index > 0 ? point.weight - points[index - 1].weight : 0)).toFixed(3)),
          timestamp: point.timestamp,
        })),
      );

      const deviceId = rows?.[0]?.device_id ? String(rows[0].device_id) : '';
      if (deviceId) setSelectedDeviceId(deviceId);
    } catch (loadError) {
      console.error(loadError);
      setError((loadError as any)?.message || 'Failed to load telemetry readings.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedHiveId]);

  React.useEffect(() => {
    refreshMetadata().catch((loadError) => {
      console.error(loadError);
      setError((loadError as any)?.message || 'Failed to load hive metadata.');
      setLoading(false);
    });
  }, [refreshMetadata]);

  React.useEffect(() => {
    loadSeries();
    const timer = setInterval(loadSeries, 30_000);
    return () => clearInterval(timer);
  }, [loadSeries]);

  React.useEffect(() => {
    const hiveName = (selectedHive?.hive_code || selectedHive?.name || 'hive').toString().replace(/\s+/g, '-').toLowerCase();
    setExportFileName(`beeyield-${hiveName}-telemetry`);
  }, [selectedHive]);

  React.useEffect(() => {
    const weightSub = beeyieldService.subscribeToWeightAlerts('*', (payload) => {
      setRecentAlert(`Massive drop detected on Hive ${payload.new.hive_id}`);
      toast.error('Critical weight anomaly detected.');
    });
    const gatewaySub = beeyieldService.subscribeToGatewayStatus('*', (payload) => {
      setGatewayStatus(payload.new.status);
      if (payload.new.status === 'Offline') toast.warning('Gateway connectivity lost.');
    });
    return () => {
      if (weightSub && beeyieldService.supabaseBeeYield) beeyieldService.supabaseBeeYield.removeChannel(weightSub);
      if (gatewaySub && beeyieldService.supabaseBeeYield) beeyieldService.supabaseBeeYield.removeChannel(gatewaySub);
    };
  }, []);

  const handleRefresh = async () => {
    const id = toast.loading('Refreshing telemetry...');
    try {
      await refreshMetadata();
      await loadSeries();
      toast.success('Telemetry updated.', { id });
    } catch (refreshError: any) {
      toast.error(refreshError?.message || 'Refresh failed.', { id });
    }
  };

  const handleTare = async () => {
    if (!activeDeviceId) {
      toast.error('No linked device is available for calibration.');
      return false;
    }
    setIsTaring(true);
    const id = toast.loading('Taring sensor...');
    try {
      const result = await beeyieldService.tareSensor(activeDeviceId);
      if (!result.success) {
        toast.error('Tare failed.', { id });
        return false;
      }
      toast.success('Sensor tared.', { id });
      await loadSeries();
      return true;
    } catch {
      toast.error('Calibration error.', { id });
      return false;
    } finally {
      setIsTaring(false);
    }
  };

  const handleSaveOffset = async () => {
    if (!activeDeviceId) return toast.error('No linked device is available for offset correction.');
    const offset = parseFloat(manualOffsetValue);
    if (Number.isNaN(offset)) return toast.error('Enter a valid numeric offset.');
    const id = toast.loading('Saving offset...');
    try {
      const result = await beeyieldService.setOffsetCorrection(activeDeviceId, offset);
      if (!result.success) return toast.error('Offset save failed.', { id });
      toast.success('Offset saved.', { id });
      setCalibrationOpen(false);
      await loadSeries();
    } catch {
      toast.error('Failed to save offset.', { id });
    }
  };

  const handleExport = () => {
    if (!data.length) return toast.error('There is no telemetry data to export yet.');
    const safeName = (exportFileName || `beeyield-${selectedHiveId || 'hive'}-telemetry`).trim().replace(/[^a-z0-9-_]+/gi, '-');
    const csv = `timestamp,time,weight_kg,dwdt\n${data.map((row) => `${new Date(row.timestamp).toISOString()},${row.time},${row.weight},${row.dwdt}`).join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeName || 'beeyield-telemetry'}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('CSV export downloaded.');
  };

  return (
    <BeeYieldPageShell className="relative overflow-hidden">
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#1B9157]/5 blur-[120px] pointer-events-none" />
      <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-[#F4D03F]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-6 pb-20">
        <BeeYieldPageHeader
          icon={Database}
          label="Advanced sensor data"
          title={<>Hive <span className="text-[#F4D03F]">telemetry</span> command center</>}
          subtitle="Aligned with the BeeYield dashboard and AI pages, with polished pop-out actions for calibration and export."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <div className={cn(pill, gatewayStatus === 'Online' ? 'border-[#1B9157]/15' : 'border-red-200')}>
                <span className={cn('h-2.5 w-2.5 rounded-full', gatewayStatus === 'Online' ? 'bg-[#1B9157] animate-pulse' : 'bg-red-500')} />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Gateway {gatewayStatus}</span>
              </div>
              <button type="button" onClick={handleRefresh} disabled={loading} className={cn(glass.btnSecondary, 'h-11 rounded-2xl px-5')}>
                <RefreshCw className={cn('h-4 w-4 text-[#F4D03F]', loading && 'animate-spin')} />
                Refresh
              </button>
              <button type="button" onClick={() => setCalibrationOpen(true)} className={cn(glass.btnPrimary, 'h-11 rounded-2xl px-5 shadow-lg shadow-[#F4D03F]/20')}>
                <SlidersHorizontal className="h-4 w-4" />
                Calibrate
              </button>
              <button type="button" onClick={() => setExportOpen(true)} className={cn(glass.btnSecondary, 'h-11 rounded-2xl px-5')}>
                <Download className="h-4 w-4 text-[#F4D03F]" />
                Export
              </button>
            </div>
          }
        />

        {error && (
          <div className="rounded-[28px] border border-red-200 bg-red-50/80 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-600">Telemetry issue</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{error}</p>
              </div>
              <button type="button" onClick={loadSeries} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-8">
            <div className={cn(glass.section, 'rounded-[36px] border-white/60 bg-gradient-to-br from-[#FFF9F0] via-white/80 to-[#F9F7F2] p-7 shadow-[0_30px_80px_-40px_rgba(26,26,26,0.28)]')}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#1B9157]/15 bg-[#1B9157]/10 px-3 py-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#1B9157]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1B9157]">Live pollination telemetry</span>
                  </div>
                  <h2 className="max-w-2xl text-4xl font-black leading-none tracking-tight text-[#1A1A1A]">
                    Field-ready telemetry with a <span className="text-[#F4D03F]">BeeYield AI</span> finish
                  </h2>
                  <p className="max-w-2xl border-l-4 border-[#F4D03F]/20 pl-5 text-sm font-medium leading-relaxed text-slate-500">
                    The page now uses the same premium hierarchy, spacing, and card language as Home and BeeYield AI.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Hive selection</label>
                  <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                    <SelectTrigger className={cn(glass.select, 'h-12 rounded-2xl border-white/70 bg-white/80 shadow-sm')}>
                      <SelectValue placeholder="Select hive" />
                    </SelectTrigger>
                    <SelectContent className={cn(glass.selectContent, 'rounded-2xl')}>
                      {hives.map((hive) => (
                        <SelectItem key={hive.id} value={hive.id} className="font-black text-[11px]">
                          {(hive.hive_code || hive.name || hive.id).toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
                <div className={tile}>
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Current biomass</p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-6xl font-black leading-none tracking-tight text-[#1A1A1A]">{latest ? latest.weight.toFixed(2) : '0.00'}</span>
                        <span className="pb-1 text-lg font-black uppercase tracking-[0.18em] text-slate-300">kg</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#F4D03F]/20 bg-[#F4D03F]/10 px-3 py-1.5">
                        {latestDelta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 text-[#1B9157]" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
                        <span className={cn('text-[10px] font-black uppercase tracking-[0.18em]', latestDelta >= 0 ? 'text-[#1B9157]' : 'text-red-500')}>
                          Session delta {latestDelta >= 0 ? '+' : ''}{latestDelta.toFixed(2)} kg
                        </span>
                      </div>
                    </div>

                    <div className="grid min-w-[220px] gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#FFF9F0] p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Linked hive</p>
                        <p className="mt-2 text-sm font-black text-[#1A1A1A]">{selectedHive?.hive_code || selectedHive?.name || 'No hive selected'}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">Last seen {lastSeen}</p>
                      </div>
                      <div className="rounded-2xl border border-[#1B9157]/15 bg-white p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sensor endpoint</p>
                        <p className="mt-2 text-sm font-black text-[#1A1A1A]">{deviceLabel}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">{activeDeviceId ? `Device ID ${activeDeviceId}` : 'Awaiting device link'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: 'Flux velocity', value: `${dwdt >= 0 ? '+' : ''}${dwdt.toFixed(3)}` },
                      { label: 'Positive gain', value: `${totalYield} kg` },
                      { label: 'Anomaly state', value: isAlert ? 'Investigate' : 'Stable' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-dashed border-[#F4D03F]/20 bg-gradient-to-r from-[#F4D03F]/10 to-white px-4 py-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                        <p className="mt-1 text-base font-black text-[#1A1A1A]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-[#1A1A1A]/10 bg-[#1A1A1A] p-6 text-white shadow-[0_24px_70px_-35px_rgba(26,26,26,0.75)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Operations rail</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight">Sensor actions</h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><ShieldCheck className="h-5 w-5 text-[#F4D03F]" /></div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { label: 'Calibration', text: 'Tare or set a precision offset', action: () => setCalibrationOpen(true), icon: ChevronRight },
                      { label: 'Reporting', text: 'Prepare a downloadable telemetry pack', action: () => setExportOpen(true), icon: ChevronRight },
                      { label: 'Sync', text: 'Refresh hive, gateway, and readings', action: handleRefresh, icon: RefreshCw },
                    ].map((item) => (
                      <button key={item.label} type="button" onClick={item.action} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:border-[#F4D03F]/30 hover:bg-white/10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                          <p className="mt-1 text-sm font-black text-white">{item.text}</p>
                        </div>
                        <item.icon className={cn('h-5 w-5 text-[#F4D03F]', item.label === 'Sync' && loading && 'animate-spin')} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="xl:col-span-4 space-y-4">
            {[
              { label: 'Live weight', value: latest ? `${latest.weight.toFixed(2)} kg` : '0.00 kg', icon: Scale, color: 'text-[#1A1A1A]' },
              { label: 'Flux velocity', value: `${dwdt >= 0 ? '+' : ''}${dwdt.toFixed(3)}`, icon: Gauge, color: isFlowing ? 'text-[#1B9157]' : 'text-red-500' },
              { label: 'Positive gain', value: `${totalYield} kg`, icon: Zap, color: 'text-[#F4D03F]' },
              { label: 'Security state', value: isAlert ? 'Investigate' : 'Stable', icon: AlertTriangle, color: isAlert ? 'text-red-500' : 'text-[#1B9157]' },
            ].map((card, index) => (
              <GlassStatCard key={card.label} label={card.label} value={card.value} icon={card.icon} index={index} color={card.color} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className={cn(glass.section, 'rounded-[32px] p-6 shadow-sm')}>
            <BeeYieldSectionHeader icon={Scale} title="Weight dynamics" subtitle="Trendline / load curve" />
            <WeightDynamicsChart data={data.map((point) => ({ time: point.time, weight: point.weight, velocity: point.dwdt }))} />
          </div>
          <div className={cn(glass.section, 'rounded-[32px] p-6 shadow-sm')}>
            <BeeYieldSectionHeader icon={Waves} title="Acoustic waveform" subtitle="Colony activity surface" />
            <AcousticWaveform />
          </div>
        </div>

        <div className={cn(glass.section, 'rounded-[32px] overflow-hidden shadow-sm')}>
          <div className="flex flex-col gap-4 border-b border-[#F4D03F]/15 bg-[#F9F7F2]/70 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Telemetry ledger</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#1A1A1A]">Recent history</h3>
              <p className="mt-1 text-sm text-slate-500">A compact, dashboard-native view of the latest telemetry samples.</p>
            </div>
            <div className={pill}>
              <History className="h-4 w-4 text-[#F4D03F]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{data.length} readings in session</span>
            </div>
          </div>

          <div className="divide-y divide-[#F4D03F]/10">
            {loading ? (
              <div className="flex items-center gap-3 px-6 py-8 text-sm font-semibold text-slate-500"><RefreshCw className="h-4 w-4 animate-spin" />Loading readings...</div>
            ) : !data.length ? (
              <div className="px-6 py-10 text-sm font-semibold text-slate-500">No readings are available for this hive yet.</div>
            ) : (
              data.slice(-6).reverse().map((row, index) => (
                <div key={`${row.timestamp}-${index}`} className="grid gap-4 px-6 py-5 transition-colors hover:bg-[#F4D03F]/5 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                  <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Timestamp</p><p className="mt-1 text-sm font-semibold text-slate-600 tabular-nums">{row.time}</p></div>
                  <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Weight</p><p className="mt-1 text-lg font-black text-[#1A1A1A] tabular-nums">{row.weight} kg</p></div>
                  <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Change rate</p><p className={cn('mt-1 text-lg font-black tabular-nums', row.dwdt > 0 ? 'text-[#1B9157]' : 'text-red-500')}>{row.dwdt > 0 ? '+' : ''}{row.dwdt.toFixed(3)}</p></div>
                  <div className="flex items-center justify-start md:justify-end"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F4D03F]/15 bg-white shadow-sm"><ChevronRight className="h-5 w-5 text-[#F4D03F]" /></div></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <GlassModal isOpen={calibrationOpen} onClose={() => setCalibrationOpen(false)} title="Sensor Calibration" subtitle="POP-OUT CONTROL FORM" maxWidth="max-w-2xl">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-[#F4D03F]/15 bg-white/70 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Linked device</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-[#1A1A1A]">{deviceLabel}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedHive?.hive_code || selectedHive?.name || 'No hive selected'} • {activeDeviceId || 'No device id'}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1B9157]/15 bg-[#1B9157]/10 px-3 py-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1B9157]" /><span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1B9157]">{gatewayStatus}</span></div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-[#F4D03F]/15 bg-[#FFF9F0] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick tare</p>
              <h4 className="mt-2 text-lg font-black tracking-tight text-[#1A1A1A]">Zero the active sensor</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Use this when the scale needs a clean baseline before the next field reading arrives.</p>
              <button type="button" onClick={async () => { const success = await handleTare(); if (success) setCalibrationOpen(false); }} disabled={isTaring} className={cn(glass.btnPrimary, 'mt-5 h-11 w-full rounded-2xl shadow-lg shadow-[#F4D03F]/20')}>
                {isTaring ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Tare sensor
              </button>
            </div>

            <div className="rounded-[28px] border border-[#F4D03F]/15 bg-white/80 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manual offset</p>
              <h4 className="mt-2 text-lg font-black tracking-tight text-[#1A1A1A]">Apply a correction value</h4>
              <div className="mt-4 space-y-2">
                <label htmlFor="telemetry-manual-offset" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Offset correction (kg)</label>
                <Input id="telemetry-manual-offset" type="number" step="0.01" value={manualOffsetValue} onChange={(event) => setManualOffsetValue(event.target.value)} className={cn(glass.input, 'h-12 rounded-2xl bg-[#FFF9F0]')} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setCalibrationOpen(false)} className={cn(glass.btnSecondary, 'h-11 rounded-2xl px-5')}>Cancel</button>
                <button type="button" onClick={handleSaveOffset} className={cn(glass.btnPrimary, 'h-11 rounded-2xl px-5 shadow-lg shadow-[#F4D03F]/20')}><SlidersHorizontal className="h-4 w-4" />Save offset</button>
              </div>
            </div>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="Export Telemetry" subtitle="POP-OUT DELIVERY FORM" maxWidth="max-w-xl">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-[#F4D03F]/15 bg-white/80 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Export bundle</p>
            <h4 className="mt-2 text-lg font-black tracking-tight text-[#1A1A1A]">Prepare a clean CSV package</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Hive</p><p className="mt-1 text-sm font-black text-[#1A1A1A]">{selectedHive?.hive_code || selectedHive?.name || 'No hive selected'}</p></div>
              <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Rows</p><p className="mt-1 text-sm font-black text-[#1A1A1A]">{data.length} telemetry records</p></div>
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="telemetry-export-name" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">File name</label>
              <Input id="telemetry-export-name" value={exportFileName} onChange={(event) => setExportFileName(event.target.value)} className={cn(glass.input, 'h-12 rounded-2xl bg-[#FFF9F0]')} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setExportOpen(false)} className={cn(glass.btnSecondary, 'h-11 rounded-2xl px-5')}>Cancel</button>
            <button type="button" onClick={handleExport} className={cn(glass.btnPrimary, 'h-11 rounded-2xl px-5 shadow-lg shadow-[#F4D03F]/20')}><Download className="h-4 w-4" />Download CSV</button>
          </div>
        </div>
      </GlassModal>
    </BeeYieldPageShell>
  );
};

export default HiveTelemetryView;
