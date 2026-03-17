import React from 'react';
import { IoTDevice, SensorReading, Apiary, Hive, beeyieldService } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { BeeYieldCard, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ArrowLeft, Cpu, Activity, Battery, MapPin, Hexagon, Signal, Clock, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceDetailViewProps {
  deviceId: string;
  devices: IoTDevice[];
  readings: SensorReading[];
  apiaries: Apiary[];
  hives: Hive[];
  onBack: () => void;
  onRefresh?: () => Promise<void> | void;
}

function timeAgo(dateString?: string) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Online now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DeviceDetailView(props: DeviceDetailViewProps) {
  const { deviceId, devices, readings, apiaries, hives, onBack, onRefresh } = props;
  const [refreshing, setRefreshing] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [liveReadings, setLiveReadings] = React.useState<SensorReading[]>([]);
  const [draft, setDraft] = React.useState<{
    device_name: string;
    device_type: IoTDevice['device_type'];
    linked_apiary_id: string;
    hive_id: string;
  } | null>(null);

  const device = React.useMemo(() => devices.find((d) => d.id === deviceId) || null, [devices, deviceId]);
  const deviceReadings = React.useMemo(
    () => {
      const merged = [...liveReadings, ...readings.filter((r) => r.device_id === deviceId)];
      const unique = new Map<string, SensorReading>();
      for (const r of merged) unique.set(r.id, r);
      return Array.from(unique.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    },
    [readings, deviceId, liveReadings],
  );

  const apiary = React.useMemo(() => {
    const apiaryId = device?.linked_apiary_id || device?.apiary_id;
    return apiaryId ? apiaries.find((a) => a.id === apiaryId) || null : null;
  }, [apiaries, device]);

  const hive = React.useMemo(() => {
    const hiveId = device?.hive_id;
    return hiveId ? hives.find((h) => h.id === hiveId) || null : null;
  }, [hives, device]);

  React.useEffect(() => {
    if (!device || !editOpen) return;
    setDraft({
      device_name: device.device_name || '',
      device_type: device.device_type,
      linked_apiary_id: (device.linked_apiary_id || device.apiary_id || '') as string,
      hive_id: (device.hive_id || '') as string,
    });
  }, [device, editOpen]);

  const filteredHives = React.useMemo(() => {
    const apiaryId = draft?.linked_apiary_id;
    if (!apiaryId) return [];
    return hives.filter((h) => h.apiary_id === apiaryId);
  }, [hives, draft?.linked_apiary_id]);

  React.useEffect(() => {
    if (!deviceId) return;
    const ch: any = beeyieldService.subscribeToDeviceReadings(deviceId, (payload: any) => {
      const row = payload?.new;
      if (!row) return;
      // Normalize timestamp field naming (DB uses recorded_at in many queries; app type uses timestamp)
      const normalized: SensorReading = {
        ...(row as any),
        timestamp: (row.timestamp || row.recorded_at || new Date().toISOString()) as string,
      };
      setLiveReadings((prev) => [normalized, ...prev].slice(0, 100));
    });

    return () => {
      try {
        if (ch?.unsubscribe) ch.unsubscribe();
      } catch (e) {
        console.warn('unsubscribe device readings failed', e);
      }
    };
  }, [deviceId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Minimal refresh if parent didn't provide one
        await beeyieldService.getDevices();
      }
      toast.success('Device data refreshed');
    } catch (e) {
      console.error(e);
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  if (!device) {
    return (
      <BeeYieldPageShell>
        <BeeYieldPageHeader
          icon={Cpu}
          label="DEVICE_VIEW"
          title={<>Device <span className="text-[#F4D03F]">Not Found</span></>}
          subtitle="This device is not available in your current registry."
          actions={
            <Button variant="outline" className={cn(glass.btnSecondary, 'h-10')} onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
        />
        <BeeYieldCard className="p-8 text-center">
          <p className="text-sm text-gray-500">Try refreshing your devices list.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button className={glass.btnPrimary} onClick={handleRefresh}>
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" className={glass.btnSecondary} onClick={onBack}>
              Back to devices
            </Button>
          </div>
        </BeeYieldCard>
      </BeeYieldPageShell>
    );
  }

  const lastPing = device.last_ping || device.last_ping;
  const status = device.status === 'active' ? 'NOMINAL' : 'OFFLINE';
  const latest = deviceReadings[0] || null;

  const handleSave = async () => {
    if (!device || !draft) return;
    if (!draft.device_name?.trim()) {
      toast.error('Device name is required');
      return;
    }
    if (!draft.linked_apiary_id) {
      toast.error('Please select a location');
      return;
    }
    setSaving(true);
    try {
      const { error } = await beeyieldService.updateDevice(device.id, {
        device_name: draft.device_name.trim(),
        device_type: draft.device_type,
        linked_apiary_id: draft.linked_apiary_id,
        apiary_id: draft.linked_apiary_id,
        location_name: apiaries.find((a) => a.id === draft.linked_apiary_id)?.name || device.location_name,
        hive_id: draft.hive_id || undefined,
      });
      if (error) throw error;
      setEditOpen(false);
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save device changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!device) return;
    const ok = confirm(`Delete device ${device.device_code}? This cannot be undone.`);
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await beeyieldService.deleteDevice(device.id);
      if (!res.success) throw res.error;
      await onRefresh?.();
      onBack();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BeeYieldPageShell>
      <BeeYieldPageHeader
        icon={Cpu}
        label="DEVICE_VIEW"
        title={
          <>
            {device.device_code}{' '}
            <span className="text-[#F4D03F]">
              {device.device_type?.toUpperCase?.() || 'DEVICE'}
            </span>
          </>
        }
        subtitle="Full page device view with readings and registry metadata."
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" className={cn(glass.btnSecondary, 'h-10')} onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" className={cn(glass.btnSecondary, 'h-10')} onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button className={cn(glass.btnPrimary, 'h-10')} onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <BeeYieldCard className="space-y-4">
            <div className="flex items-center justify-between">
              <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Status</p>
              <Badge className={cn(glass.badge, status === 'NOMINAL' ? 'border-[#1B9157]/30 bg-[#1B9157]/10 text-[#1B9157]' : 'border-red-500/20 bg-red-500/10 text-red-600')}>
                {status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-[#F4D03F]" />
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Battery</p>
                </div>
                <p className="text-lg font-black tabular-nums text-[#1A1A1A]">{device.battery_level ?? '—'}%</p>
              </div>
              <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F4D03F]" />
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Last ping</p>
                </div>
                <p className="text-sm font-black text-[#1A1A1A]">{timeAgo(lastPing)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1A1A1A]/70">
                <MapPin className="w-4 h-4 text-[#F4D03F]" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {apiary?.name || device.location_name || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/70">
                <Hexagon className="w-4 h-4 text-[#1B9157]" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {hive?.hive_code || 'NO_HIVE_LINK'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/70">
                <Signal className="w-4 h-4 text-[#F4D03F]" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  FW {device.firmware_version || '—'}
                </span>
              </div>
            </div>
          </BeeYieldCard>

          <BeeYieldCard className="space-y-3">
            <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Latest snapshot</p>
            {!latest ? (
              <p className="text-sm text-gray-500">No recent reading payload.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Temp</p>
                  <p className="text-lg font-black tabular-nums">{(latest.temperature ?? (latest.readings as any)?.temperature ?? '—')} </p>
                </div>
                <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Humidity</p>
                  <p className="text-lg font-black tabular-nums">{(latest.humidity ?? (latest.readings as any)?.humidity ?? '—')} </p>
                </div>
                <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Weight</p>
                  <p className="text-lg font-black tabular-nums">{(latest.weight ?? (latest.readings as any)?.weight ?? '—')} </p>
                </div>
                <div className="p-3 rounded-xl border border-white/40 bg-white/30">
                  <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Signal</p>
                  <p className="text-lg font-black tabular-nums">{latest.signal_strength ?? latest.signal_dbm ?? '—'}</p>
                </div>
              </div>
            )}
          </BeeYieldCard>

          <BeeYieldCard className="space-y-3 border border-red-500/20">
            <div className="flex items-center justify-between">
              <p className={cn(glass.microLabel, 'text-[#1A1A1A]/60')}>Danger zone</p>
              <Button
                variant="outline"
                className={cn(glass.btnSecondary, 'h-9 border-red-500/20 text-red-600 hover:text-red-700')}
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className={cn('w-4 h-4 mr-2', deleting && 'animate-pulse')} />
                Delete
              </Button>
            </div>
            <p className="text-xs text-gray-500">Deletes this device from your registry (readings remain in history unless your DB policy cascades).</p>
          </BeeYieldCard>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <BeeYieldCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-white/20 bg-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                  <Activity className="w-4 h-4 text-[#F4D03F]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Recent_Readings</h3>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LAST_50_EVENTS</p>
                </div>
              </div>
              <Badge className="bg-white/40 text-gray-500 border-white/40 rounded-lg font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                {deviceReadings.length}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/30 border-b border-white/40">
                    <th className={glass.tableHead}>Timestamp</th>
                    <th className={glass.tableHead}>Type</th>
                    <th className={glass.tableHead}>Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4D03F]/10">
                  {deviceReadings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-sm text-gray-500">
                        No readings yet for this device.
                      </td>
                    </tr>
                  ) : (
                    deviceReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-white/40 transition-colors">
                        <td className="px-6 py-4 text-[11px] font-bold text-gray-600 tabular-nums">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#1A1A1A]">
                          {r.sensor_type || 'reading'}
                        </td>
                        <td className="px-6 py-4">
                          <pre className="text-[10px] font-mono text-[#1A1A1A]/70 whitespace-pre-wrap break-words">
                            {JSON.stringify(r.readings ?? r, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </BeeYieldCard>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black">Edit device</h3>
              <p className="text-sm text-muted-foreground">Update name, type, and link to a location/hive.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device-edit-name">Device name</Label>
                <Input
                  id="device-edit-name"
                  name="device_name"
                  autoComplete="off"
                  value={draft?.device_name || ''}
                  onChange={(e) => setDraft((d) => d ? { ...d, device_name: e.target.value } : d)}
                />
              </div>
              <div className="space-y-2">
                <Label>Device type</Label>
                <Select value={draft?.device_type} onValueChange={(v: any) => setDraft((d) => d ? { ...d, device_type: v } : d)}>
                  <SelectTrigger id="device-edit-type" aria-label="Device type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inland">Gateway</SelectItem>
                    <SelectItem value="infield">Sensor</SelectItem>
                    <SelectItem value="disease">Health monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={draft?.linked_apiary_id || ''}
                  onValueChange={(v) => setDraft((d) => d ? { ...d, linked_apiary_id: v, hive_id: '' } : d)}
                >
                  <SelectTrigger id="device-edit-location" aria-label="Location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiaries.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hive (optional)</Label>
                <Select
                  value={draft?.hive_id || ''}
                  onValueChange={(v) => setDraft((d) => d ? { ...d, hive_id: v } : d)}
                  disabled={!draft?.linked_apiary_id}
                >
                  <SelectTrigger id="device-edit-hive" aria-label="Hive (optional)">
                    <SelectValue placeholder={draft?.linked_apiary_id ? 'Select hive' : 'Select location first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No hive</SelectItem>
                    {filteredHives.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BeeYieldPageShell>
  );
}

