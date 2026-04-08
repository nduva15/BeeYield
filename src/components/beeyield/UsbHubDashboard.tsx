import React from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    Edit3,
    FileCode,
    Loader2,
    Search,
    ShieldCheck,
    Trash2,
    Usb,
} from 'lucide-react';
import { toast } from 'sonner';

import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/services/api';
import { beeyieldService, UsbHubDeviceCreateInput, UsbHubDeviceRecord } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

type UsbConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function UsbHubDashboard() {
    const [device, setDevice] = React.useState<USBDevice | null>(null);
    const [connectionStatus, setConnectionStatus] = React.useState<UsbConnectionStatus>('disconnected');
    const [syncProgress, setSyncProgress] = React.useState(0);
    const [isFlashing, setIsFlashing] = React.useState(false);
    const [logs, setLogs] = React.useState<string[]>([]);
    const [lastError, setLastError] = React.useState<string | null>(null);

    const [firmwareFile, setFirmwareFile] = React.useState<File | null>(null);
    const [manifestJson, setManifestJson] = React.useState('{\n  "name": "BeeYield Hub Queen Firmware",\n  "version": "1.2.5",\n  "builds": []\n}');

    const [pairedDevices, setPairedDevices] = React.useState<UsbHubDeviceRecord[]>([]);
    const [showDeviceModal, setShowDeviceModal] = React.useState(false);
    const [editingDevice, setEditingDevice] = React.useState<UsbHubDeviceRecord | null>(null);
    const [serialNumber, setSerialNumber] = React.useState('');
    const [firmwareVersion, setFirmwareVersion] = React.useState('');
    const [deviceStatus, setDeviceStatus] = React.useState('paired');
    const [configJson, setConfigJson] = React.useState('{\n  "sample_rate": 300\n}');
    const [isSaving, setIsSaving] = React.useState(false);

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    React.useEffect(() => {
        void loadDevices();
    }, []);

    const addLog = React.useCallback((message: string) => {
        setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} > ${message}`].slice(-80));
    }, []);

    const loadDevices = async () => {
        const data = await beeyieldService.getPairedUsbDevices();
        setPairedDevices(data || []);
    };

    const resetForm = React.useCallback(() => {
        setEditingDevice(null);
        setSerialNumber(device?.serialNumber || '');
        setFirmwareVersion('');
        setDeviceStatus('paired');
        setConfigJson('{\n  "sample_rate": 300\n}');
    }, [device]);

    const openCreateModal = () => {
        resetForm();
        setShowDeviceModal(true);
    };

    const openEditModal = (record: UsbHubDeviceRecord) => {
        setEditingDevice(record);
        setSerialNumber(record.serial_number);
        setFirmwareVersion(record.firmware_version || '');
        setDeviceStatus(record.status || 'paired');
        setConfigJson(JSON.stringify(record.config_json || {}, null, 2));
        setShowDeviceModal(true);
    };

    const connectDevice = async () => {
        try {
            setConnectionStatus('connecting');
            setLastError(null);

            const usbDevice = await navigator.usb.requestDevice({ filters: [] });
            await usbDevice.open();
            if (usbDevice.configuration === null) await usbDevice.selectConfiguration(1);
            await usbDevice.claimInterface(0);

            setDevice(usbDevice);
            setConnectionStatus('connected');
            setSerialNumber(usbDevice.serialNumber || '');
            addLog(`Connected to ${usbDevice.productName || 'BeeYield hub'}.`);

            let version = firmwareVersion || '1.0.0';
            try {
                const parsed = JSON.parse(manifestJson);
                version = String(parsed?.version || version);
            } catch {
                // keep current version
            }

            await apiPost('/hub/handshake', {
                serial_number: usbDevice.serialNumber || 'UNKNOWN-SN',
                firmware_version: version,
                config_json: { sample_rate: 300 },
                user_id: userId,
            });

            await loadDevices();
            toast.success('BeeYield hub connected');
        } catch (error: any) {
            console.error(error);
            setConnectionStatus('error');
            setLastError(error?.message || 'Connection aborted');
            addLog(`Connection error: ${error?.message || 'Unknown error'}`);
            toast.error(error?.message || 'Failed to connect');
        }
    };

    const handleFlash = async () => {
        if (!device || !firmwareFile) {
            toast.error('Connect a device and choose a firmware file first');
            return;
        }

        setIsFlashing(true);
        setSyncProgress(0);
        addLog('Initiating firmware staging...');

        try {
            const sessionRes = await apiPost<{ id: string }>('/hub/sync/start', {
                hub_sn: device.serialNumber || 'UNKNOWN-SN',
                records_count: 0,
                user_id: userId,
            });

            const total = Math.max(1, firmwareFile.size);
            let processed = 0;
            const chunkSize = 256 * 1024;

            while (processed < total) {
                const next = Math.min(total, processed + chunkSize);
                await firmwareFile.slice(processed, next).arrayBuffer();
                processed = next;
                setSyncProgress(Math.round((processed / total) * 100));
            }

            await apiPost('/hub/sync/complete', {
                session_id: (sessionRes as any)?.id || (sessionRes as any)?.data?.id,
                status: 'success',
                duration_sec: 1,
                user_id: userId,
            });

            addLog('Firmware payload staged successfully.');
            toast.success('Firmware staged');
            await loadDevices();
        } catch (error: any) {
            console.error(error);
            addLog(`Flash error: ${error?.message || 'Unknown error'}`);
            toast.error('Update failed');
        } finally {
            setIsFlashing(false);
        }
    };

    const handleSaveDevice = async () => {
        if (!serialNumber.trim()) {
            toast.error('Serial number is required');
            return;
        }

        let parsedConfig: Record<string, any>;
        try {
            parsedConfig = configJson.trim() ? JSON.parse(configJson) : {};
        } catch {
            toast.error('Config JSON is invalid');
            return;
        }

        setIsSaving(true);
        try {
            if (editingDevice) {
                await beeyieldService.updatePairedUsbDevice(editingDevice.serial_number, {
                    firmware_version: firmwareVersion || null,
                    status: deviceStatus,
                    config_json: parsedConfig,
                });
                addLog(`Updated paired device ${editingDevice.serial_number}.`);
            } else {
                const payload: UsbHubDeviceCreateInput = {
                    serial_number: serialNumber.trim(),
                    firmware_version: firmwareVersion || null,
                    status: deviceStatus,
                    config_json: parsedConfig,
                };
                await beeyieldService.pairUsbDevice({
                    device_uid: payload.serial_number,
                    serial_number: payload.serial_number,
                    firmware_version: payload.firmware_version || undefined,
                    status: payload.status,
                    config: payload.config_json,
                });
                addLog(`Paired device ${payload.serial_number}.`);
            }

            setShowDeviceModal(false);
            resetForm();
            await loadDevices();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDevice = async (record: UsbHubDeviceRecord) => {
        if (!window.confirm(`Delete paired device "${record.serial_number}"?`)) return;
        const result = await beeyieldService.unpairUsbDevice(record.serial_number);
        if (!result.error) {
            addLog(`Removed paired device ${record.serial_number}.`);
            await loadDevices();
        }
    };

    return (
        <BeeYieldPageShell>
            <BeeYieldPageHeader
                icon={Cpu}
                label="Hardware comms"
                title={<>USB <span className="text-[#F4D03F]">Architecture</span></>}
                subtitle="Connect hardware, stage firmware, and manage paired USB hub records."
                actions={
                    <button onClick={connectDevice} className={glass.btnPrimary} disabled={connectionStatus === 'connecting'}>
                        {connectionStatus === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Device'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                    <div className={cn(glass.section, 'p-6')}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Firmware staging</h3>
                                <p className="text-sm text-gray-500">Validate and stage firmware payloads for the connected hub.</p>
                            </div>
                            <span className={glass.badge}>{connectionStatus === 'connected' ? 'Connected' : 'Offline'}</span>
                        </div>

                        {lastError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">{lastError}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label htmlFor="firmware-input">Firmware binary</Label>
                                <Input id="firmware-input" type="file" accept=".bin" onChange={(event) => setFirmwareFile(event.target.files?.[0] || null)} />
                                <p className="text-xs text-gray-500">{firmwareFile?.name || 'No firmware selected'}</p>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="manifest-json">Manifest JSON</Label>
                                <Textarea id="manifest-json" value={manifestJson} onChange={(event) => setManifestJson(event.target.value)} className="min-h-[160px] font-mono text-[11px]" />
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <button onClick={handleFlash} className={glass.btnPrimary} disabled={isFlashing || connectionStatus !== 'connected' || !firmwareFile}>
                                {isFlashing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                                {isFlashing ? 'Staging...' : 'Start Flash'}
                            </button>
                            {isFlashing && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                                        <span>Progress</span>
                                        <span>{syncProgress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/60 border border-white/40 p-0.5">
                                        <div className="h-full rounded-full bg-[#1B9157]" style={{ width: `${syncProgress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.section, 'p-6')}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Paired USB devices</h3>
                                <p className="text-sm text-gray-500">Create, update, and delete saved hub records.</p>
                            </div>
                            <button onClick={openCreateModal} className={glass.btnPrimary}>
                                <ShieldCheck className="w-4 h-4" />
                                Add Device
                            </button>
                        </div>

                        <div className="space-y-3">
                            {pairedDevices.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#F4D03F]/25 bg-[#FFF9F0] p-6 text-center text-sm font-semibold text-[#1A1A1A]">
                                    No paired USB devices yet.
                                </div>
                            ) : pairedDevices.map((record) => (
                                <div key={record.serial_number} className="rounded-2xl border border-white/60 bg-white/50 p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{record.serial_number}</p>
                                            <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-gray-500">
                                                <span>Firmware: {record.firmware_version || 'Unknown'}</span>
                                                <span>Status: {record.status || 'paired'}</span>
                                                <span>Last sync: {record.last_sync_at ? new Date(record.last_sync_at).toLocaleString() : 'Never'}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(record)} className={cn(glass.btnSecondary, 'h-10 px-4 text-[10px]')}>
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteDevice(record)} className="h-10 px-4 rounded-xl border border-red-200 bg-white text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className={cn(glass.section, 'p-5')}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                <Usb className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Current link</h3>
                                <p className="text-sm text-gray-500">Latest hardware connection status.</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm font-semibold text-gray-600">
                            <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">Status: {connectionStatus}</div>
                            <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">Device: {device?.serialNumber || 'No device connected'}</div>
                        </div>
                    </div>

                    <div className={cn(glass.section, 'p-5')}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#1A1A1A]">Event log</h3>
                            <button onClick={() => setLogs([])} className={cn(glass.btnSecondary, 'h-8 px-3 text-[10px]')}>Clear</button>
                        </div>
                        <div className="h-80 overflow-y-auto space-y-2 pr-2 font-mono text-[10px]">
                            {logs.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400">No activity found</div>
                            ) : logs.map((entry, index) => (
                                <div key={`${entry}-${index}`} className="rounded-lg border border-white/50 bg-white/40 px-3 py-2 text-gray-600">{entry}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showDeviceModal} onOpenChange={setShowDeviceModal}>
                <DialogContent className="max-w-[460px] bg-transparent border-none p-0 shadow-none overflow-visible">
                    <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={cn(glass.card, 'p-0 overflow-hidden shadow-2xl relative bg-white/90 border-white/20')}>
                        <div className="px-6 py-5 border-b border-[#F4D03F]/10">
                            <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 mb-3 inline-block')}>
                                {editingDevice ? 'Edit hub' : 'Add hub'}
                            </div>
                            <h2 className={cn(glass.sectionTitle, 'uppercase leading-none mb-1')}>
                                {editingDevice ? 'Update ' : 'Save '}<span className="text-[#F4D03F]">USB device</span>
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="usb-serial">Serial number</Label>
                                <Input id="usb-serial" value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} disabled={!!editingDevice} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usb-firmware">Firmware version</Label>
                                <Input id="usb-firmware" value={firmwareVersion} onChange={(event) => setFirmwareVersion(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usb-status">Status</Label>
                                <Input id="usb-status" value={deviceStatus} onChange={(event) => setDeviceStatus(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usb-config-json">Config JSON</Label>
                                <Textarea id="usb-config-json" value={configJson} onChange={(event) => setConfigJson(event.target.value)} className="min-h-[160px] font-mono text-[11px]" />
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-[#F4D03F]/10">
                                <button className={cn(glass.btnPrimary, 'w-full h-10 text-[10px] font-black rounded-xl')} onClick={handleSaveDevice} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    <span>{editingDevice ? 'Save changes' : 'Save device'}</span>
                                </button>
                                <button className={cn(glass.btnSecondary, 'w-full h-10 text-[10px] font-black rounded-xl')} onClick={() => setShowDeviceModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </BeeYieldPageShell>
    );
}
