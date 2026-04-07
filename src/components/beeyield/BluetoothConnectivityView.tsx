declare global {
    interface Navigator {
        bluetooth: any;
    }
}

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Battery,
    Bluetooth as BluetoothIcon,
    Droplet,
    Edit3,
    Loader2,
    MapPin,
    RefreshCw,
    Save,
    Scale,
    Search,
    ShieldCheck,
    Smartphone,
    Thermometer,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    beeyieldService,
    BluetoothDeviceCreateInput,
    BluetoothDeviceRecord,
    BluetoothReadingUpload,
    Hive,
} from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

const BEEYIELD_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

type ConnectionStatus = 'Idle' | 'Scanning' | 'Connecting' | 'Connected' | 'Error';

interface BluetoothConnectivityViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

export const BluetoothConnectivityView: React.FC<BluetoothConnectivityViewProps> = () => {
    const [connectedDevice, setConnectedDevice] = React.useState<any>(null);
    const [gattServer, setGattServer] = React.useState<any>(null);
    const [status, setStatus] = React.useState<ConnectionStatus>('Idle');
    const [logs, setLogs] = React.useState<string[]>([]);
    const [liveData, setLiveData] = React.useState<{ temp?: number; weight?: number; humidity?: number; battery?: number }>({});
    const [syncProgress, setSyncProgress] = React.useState(0);
    const [isSyncing, setIsSyncing] = React.useState(false);

    const [bluetoothDevices, setBluetoothDevices] = React.useState<BluetoothDeviceRecord[]>([]);
    const [knownDevice, setKnownDevice] = React.useState<BluetoothDeviceRecord | null>(null);
    const [hives, setHives] = React.useState<Hive[]>([]);

    const [showSetupModal, setShowSetupModal] = React.useState(false);
    const [editingDevice, setEditingDevice] = React.useState<BluetoothDeviceRecord | null>(null);
    const [setupMacAddress, setSetupMacAddress] = React.useState('');
    const [setupName, setSetupName] = React.useState('New Sensor');
    const [setupType, setSetupType] = React.useState('scale');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('unassigned');
    const [batteryVolts, setBatteryVolts] = React.useState('');
    const [firmwareVersion, setFirmwareVersion] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        void loadData();
    }, []);

    React.useEffect(() => {
        if (!connectedDevice?.id) {
            setKnownDevice(null);
            return;
        }
        const matched = bluetoothDevices.find((device) => device.mac_address === connectedDevice.id) || null;
        setKnownDevice(matched);
    }, [bluetoothDevices, connectedDevice]);

    const loadData = async () => {
        try {
            const [hivesData, bluetoothData] = await Promise.all([
                beeyieldService.getHives(),
                beeyieldService.getBluetoothDevices(),
            ]);

            setHives(hivesData || []);
            setBluetoothDevices(bluetoothData || []);
        } catch (error) {
            console.error('Failed to load bluetooth dashboard data', error);
            toast.error('Could not load Bluetooth device data');
        }
    };

    const addLog = React.useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 60));
    }, []);

    const resetSetupForm = React.useCallback(() => {
        setEditingDevice(null);
        setSetupMacAddress('');
        setSetupName('New Sensor');
        setSetupType('scale');
        setSelectedHiveId('unassigned');
        setBatteryVolts('');
        setFirmwareVersion('');
    }, []);

    const handleOpenChange = (open: boolean) => {
        setShowSetupModal(open);
        if (!open) {
            resetSetupForm();
        }
    };

    const openCreateModal = React.useCallback(() => {
        resetSetupForm();
        setSetupMacAddress(connectedDevice?.id || '');
        setSetupName(connectedDevice?.name || 'New Sensor');
        setShowSetupModal(true);
    }, [connectedDevice, resetSetupForm]);

    const openEditModal = React.useCallback((device: BluetoothDeviceRecord) => {
        setEditingDevice(device);
        setSetupMacAddress(device.mac_address);
        setSetupName(device.name || 'New Sensor');
        setSetupType(device.device_type || 'scale');
        setSelectedHiveId(device.assigned_hive_id || 'unassigned');
        setBatteryVolts(device.battery_volts != null ? String(device.battery_volts) : '');
        setFirmwareVersion(device.firmware_version || '');
        setShowSetupModal(true);
    }, []);

    const disconnect = () => {
        try {
            gattServer?.device?.gatt?.disconnect?.();
        } catch (error) {
            console.warn('Disconnect failed', error);
        }
        setStatus('Idle');
        setConnectedDevice(null);
        setGattServer(null);
        addLog('Disconnected.');
    };

    const onDisconnected = React.useCallback(() => {
        setStatus('Idle');
        setConnectedDevice(null);
        setGattServer(null);
        addLog('Disconnected.');
        toast.info('Sensor disconnected');
    }, [addLog]);

    const checkDeviceInDB = React.useCallback((id: string, name?: string) => {
        const found = bluetoothDevices.find((device) => device.mac_address === id) || null;
        setKnownDevice(found);
        if (found) {
            addLog(`Recognized saved device: ${found.name}`);
            return;
        }

        addLog('New sensor detected. Save it to your registry.');
        setEditingDevice(null);
        setSetupMacAddress(id);
        setSetupName(name || 'New Sensor');
        setSetupType('scale');
        setSelectedHiveId('unassigned');
        setBatteryVolts('');
        setFirmwareVersion('');
        setShowSetupModal(true);
    }, [addLog, bluetoothDevices]);

    const startMonitoring = async (server: any) => {
        try {
            const batteryService = await server.getPrimaryService('battery_service');
            const batteryChar = await batteryService.getCharacteristic('battery_level');
            const batteryVal = await batteryChar.readValue();
            setLiveData((prev) => ({ ...prev, battery: batteryVal.getUint8(0) }));

            const beeyieldServiceHandle = await server.getPrimaryService(BEEYIELD_SERVICE_UUID);
            const characteristics = await beeyieldServiceHandle.getCharacteristics();
            const notifyChar = characteristics.find((characteristic: any) => characteristic.properties.notify);

            if (!notifyChar) {
                addLog('Live characteristic not available on this sensor.');
                return;
            }

            await notifyChar.startNotifications();
            notifyChar.addEventListener('characteristicvaluechanged', (event: any) => {
                const value = event.target.value;
                const temp = value.getUint8(0) + value.getUint8(1) / 100;
                const weight = ((value.getUint8(2) << 8) | value.getUint8(3)) / 10;
                const humidity = value.getUint8(4);

                setLiveData((prev) => ({ ...prev, temp, weight, humidity }));
            });

            addLog('Live data stream active.');
        } catch (error) {
            console.error('Monitoring failed', error);
            addLog('Could not start monitoring.');
        }
    };

    const handleSearch = async () => {
        if (!navigator.bluetooth) {
            toast.error('Bluetooth is not supported in this browser.');
            return;
        }

        try {
            setStatus('Scanning');
            addLog('Searching for sensors...');

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'BeeYield' }],
                optionalServices: ['battery_service', BEEYIELD_SERVICE_UUID],
            });

            addLog(`Found ${device.name || device.id}`);
            setConnectedDevice(device);
            setStatus('Connecting');
            device.addEventListener('gattserverdisconnected', onDisconnected);

            const server = await device.gatt.connect();
            setGattServer(server);
            setStatus('Connected');
            addLog('Connected.');

            checkDeviceInDB(device.id, device.name);
            await startMonitoring(server);
        } catch (error: any) {
            console.error(error);
            setStatus('Error');
            addLog(`Error: ${error.message}`);
            if (error.name !== 'NotFoundError' && error.name !== 'UserCancelledError') {
                toast.error(`Bluetooth error: ${error.message}`);
            }
        }
    };

    const handleSetupSubmit = async () => {
        if (!setupMacAddress.trim()) {
            toast.error('A Bluetooth device id is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload: BluetoothDeviceCreateInput = {
                mac_address: setupMacAddress.trim(),
                name: setupName.trim() || 'New Sensor',
                device_type: setupType || 'scale',
                assigned_hive_id: selectedHiveId === 'unassigned' ? null : selectedHiveId,
                battery_volts: batteryVolts ? Number(batteryVolts) : null,
                firmware_version: firmwareVersion.trim() || null,
            };

            const saved = editingDevice
                ? await beeyieldService.updateBluetoothDevice(editingDevice.mac_address, {
                    name: payload.name,
                    device_type: payload.device_type,
                    assigned_hive_id: payload.assigned_hive_id,
                    battery_volts: payload.battery_volts,
                    firmware_version: payload.firmware_version,
                })
                : await beeyieldService.registerBluetoothDevice(payload);

            if (!saved) return;

            addLog(`${editingDevice ? 'Updated' : 'Saved'} ${saved.name}.`);
            handleOpenChange(false);
            await loadData();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (device: BluetoothDeviceRecord) => {
        if (!window.confirm(`Delete Bluetooth device "${device.name}"?`)) return;
        const result = await beeyieldService.deleteBluetoothDevice(device.mac_address);
        if (result.success) {
            addLog(`Deleted ${device.name}.`);
            await loadData();
        }
    };

    const handleSync = async () => {
        if (!connectedDevice?.id) {
            toast.error('Connect a device first');
            return;
        }

        const reading: BluetoothReadingUpload = {
            device_mac: connectedDevice.id,
            recorded_at: new Date().toISOString(),
            temp_c: typeof liveData.temp === 'number' ? liveData.temp : null,
            weight_kg: typeof liveData.weight === 'number' ? liveData.weight : null,
            humidity: typeof liveData.humidity === 'number' ? liveData.humidity : null,
        };

        const hasTelemetry = [reading.temp_c, reading.weight_kg, reading.humidity].some((value) => typeof value === 'number');
        if (!hasTelemetry) {
            toast.info('No telemetry received yet');
            addLog('No telemetry available to sync.');
            return;
        }

        setIsSyncing(true);
        setSyncProgress(15);
        addLog('Preparing sync payload...');

        try {
            const result = await beeyieldService.syncBluetoothReadings({ readings: [reading] });
            if (!result.ok) {
                throw result.error || new Error('Sync failed');
            }

            setSyncProgress(100);
            addLog(`Sync complete. Uploaded ${result.count} reading(s).`);
            toast.success(`Synced ${result.count} reading(s)`);
            await loadData();
        } catch (error: any) {
            console.error(error);
            addLog(`Sync error: ${error.message || 'Unknown error'}`);
            toast.error('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const currentHive = knownDevice?.assigned_hive_id
        ? hives.find((hive) => hive.id === knownDevice.assigned_hive_id)
        : null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
            <PageHeader
                icon={BluetoothIcon}
                label="Wireless connection"
                title={<>Device <span className="text-[#F4D03F]">Link</span></>}
                subtitle="Connect BeeYield sensors over Bluetooth, inspect live telemetry, and manage the saved registry from one place."
                actions={
                    <div className="flex gap-3">
                        {status === 'Connected' ? (
                            <button
                                onClick={disconnect}
                                className={cn(glass.btnSecondary, 'h-8 px-4 text-red-500 border-red-500/10 hover:bg-red-500/10 font-black text-[9px] rounded-xl shadow-sm flex items-center gap-2')}
                            >
                                <X className="w-3.5 h-3.5" />
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleSearch}
                                disabled={status === 'Scanning' || status === 'Connecting'}
                                className={glass.btnPrimary}
                            >
                                {status === 'Scanning' || status === 'Connecting' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {status === 'Scanning' ? 'Scanning...' : 'Connecting...'}
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Detect Devices
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    {
                        label: 'Network status',
                        value: status === 'Idle' ? 'Ready' : status.toUpperCase(),
                        icon: Smartphone,
                        sub: connectedDevice ? connectedDevice.id : 'Waiting for a sensor',
                        color: status === 'Connected' ? 'bg-[#1B9157]/10 text-[#1B9157]' : 'bg-[#F4D03F]/10 text-[#F4D03F]',
                    },
                    {
                        label: 'Battery',
                        value: liveData.battery != null ? `${liveData.battery}%` : 'No data',
                        icon: Battery,
                        sub: knownDevice?.battery_volts != null ? `${knownDevice.battery_volts.toFixed(2)}V saved` : 'No saved voltage',
                        color: liveData.battery != null && liveData.battery < 20 ? 'bg-red-500/10 text-red-500' : 'bg-[#1B9157]/10 text-[#1B9157]',
                    },
                    {
                        label: 'Linked hive',
                        value: currentHive?.hive_code || 'Not linked',
                        icon: Activity,
                        sub: knownDevice?.name || 'Save a sensor to assign it',
                        color: 'bg-[#F4D03F]/10 text-[#F4D03F]',
                    },
                ].map((stat) => (
                    <div key={stat.label} className={cn(glass.card, 'p-5')}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm', stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <p className={glass.microLabel}>{stat.label}</p>
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-medium text-gray-400 truncate">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                    <div className={cn(glass.section, 'p-6')}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Live readings</h3>
                                <p className="text-sm text-gray-500">Current telemetry from the connected Bluetooth sensor.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Temperature', value: liveData.temp?.toFixed(1) || '0.0', unit: 'C', icon: Thermometer, accent: 'text-red-500' },
                                { label: 'Weight', value: liveData.weight?.toFixed(1) || '0.0', unit: 'kg', icon: Scale, accent: 'text-[#F4D03F]' },
                                { label: 'Humidity', value: liveData.humidity != null ? String(liveData.humidity) : '0', unit: '%', icon: Droplet, accent: 'text-blue-500' },
                            ].map((metric) => (
                                <div key={metric.label} className="rounded-2xl border border-white/60 bg-white/50 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className={glass.microLabel}>{metric.label}</p>
                                        <metric.icon className={cn('w-4 h-4', metric.accent)} />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black tracking-tight text-[#1A1A1A]">{metric.value}</span>
                                        <span className="text-xs font-bold text-gray-400 pb-1">{metric.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.section, 'p-6')}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Sensor registry</h3>
                                <p className="text-sm text-gray-500">Create, edit, and remove Bluetooth device records tied to your hives.</p>
                            </div>
                            <Button className={glass.btnPrimary} onClick={openCreateModal}>
                                <ShieldCheck className="w-4 h-4" />
                                Add Sensor
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {bluetoothDevices.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#F4D03F]/25 bg-[#FFF9F0] p-6 text-center">
                                    <p className="text-sm font-semibold text-[#1A1A1A]">No Bluetooth devices saved yet.</p>
                                    <p className="text-xs text-gray-500 mt-2">Connect a sensor or create a registry record manually.</p>
                                </div>
                            ) : (
                                bluetoothDevices.map((device) => {
                                    const hive = device.assigned_hive_id ? hives.find((item) => item.id === device.assigned_hive_id) : null;
                                    return (
                                        <div key={device.mac_address} className="rounded-2xl border border-white/60 bg-white/50 p-4">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-bold text-[#1A1A1A]">{device.name}</p>
                                                        <span className={glass.badge}>{device.device_type || 'sensor'}</span>
                                                    </div>
                                                    <p className="text-[10px] font-mono text-gray-500">{device.mac_address}</p>
                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-gray-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-[#F4D03F]" />
                                                            {hive?.hive_code || 'No hive assigned'}
                                                        </span>
                                                        <span>Last sync: {device.last_sync_at ? new Date(device.last_sync_at).toLocaleString() : 'Never'}</span>
                                                        <span>Firmware: {device.firmware_version || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="rounded-xl" onClick={() => openEditModal(device)}>
                                                        <Edit3 className="w-4 h-4" />
                                                        Edit
                                                    </Button>
                                                    <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(device)}>
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className={cn(glass.section, 'p-5')}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#F9F7F2] rounded-lg flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                    <RefreshCw className={cn('w-4 h-4 text-[#F4D03F]', isSyncing && 'animate-spin')} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A]">Cloud sync</h3>
                                    <p className="text-sm text-gray-500">Upload live readings from the connected sensor.</p>
                                </div>
                            </div>
                            <button onClick={handleSync} disabled={!gattServer || isSyncing} className={glass.btnPrimary}>
                                <Save className="w-4 h-4" />
                                Sync Data
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                <p className={glass.microLabel}>Saved device</p>
                                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">{knownDevice?.name || 'Unsaved connection'}</p>
                            </div>
                            <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                <p className={glass.microLabel}>Last sync</p>
                                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">{knownDevice?.last_sync_at ? new Date(knownDevice.last_sync_at).toLocaleString() : 'No sync yet'}</p>
                            </div>
                            {isSyncing && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-[9px] font-black text-[#F4D03F] animate-pulse">Sync in progress...</span>
                                        <span className="text-lg font-black tabular-nums tracking-tighter text-[#1A1A1A]">{syncProgress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden border border-white/40 p-0.5">
                                        <div className="h-full bg-[#F4D03F] rounded-full shadow-sm" style={{ width: `${syncProgress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.section, 'p-5 flex flex-col')}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#F9F7F2] rounded-lg flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                    <Activity className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <span className="text-sm font-bold text-[#1A1A1A]">Event log</span>
                            </div>
                            <button onClick={() => setLogs([])} className={cn(glass.btnSecondary, 'h-8 px-3 text-[10px]')}>
                                Clear
                            </button>
                        </div>

                        <div className="h-64 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-2 thin-scrollbar pr-2 flex-1">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p className="text-[8px] font-black">No activity found</p>
                                </div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={`${log}-${index}`} className="flex gap-3 pb-1 border-b border-white/10 last:border-0 hover:bg-white/40 px-2 rounded-lg transition-colors">
                                        <span className="text-[#F4D03F]/40 shrink-0 font-black text-[8px]">{String(logs.length - index).padStart(2, '0')}</span>
                                        <span className={cn('font-bold tracking-tight', log.includes('Error') ? 'text-red-500' : 'text-gray-500')}>{log}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showSetupModal} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-[420px] bg-transparent border-none p-0 shadow-none overflow-visible">
                    <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={cn(glass.card, 'p-0 overflow-hidden shadow-2xl relative bg-white/90 border-white/20')}>
                        <div className="px-6 py-5 border-b border-[#F4D03F]/10">
                            <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 mb-3 inline-block')}>
                                {editingDevice ? 'Edit sensor' : 'Add sensor'}
                            </div>
                            <h2 className={cn(glass.sectionTitle, 'uppercase leading-none mb-1')}>
                                {editingDevice ? 'Update ' : 'Save '}<span className="text-[#F4D03F]">sensor</span>
                            </h2>
                            <p className={glass.microLabel}>Keep the registry aligned with your connected hardware.</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bluetooth-mac-address" className={glass.microLabel}>Device id</Label>
                                <Input id="bluetooth-mac-address" value={setupMacAddress} onChange={(event) => setSetupMacAddress(event.target.value)} disabled={!!editingDevice} className={cn(glass.input, 'h-10 font-black text-[10px] bg-white/50 border-white/40')} placeholder="BeeYield sensor id" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bluetooth-setup-name" className={glass.microLabel}>Sensor alias</Label>
                                <Input id="bluetooth-setup-name" value={setupName} onChange={(event) => setSetupName(event.target.value)} className={cn(glass.input, 'h-10 font-black text-[10px] bg-white/50 border-white/40')} placeholder="Alpha Scale 01" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Type</Label>
                                    <Select value={setupType} onValueChange={setSetupType}>
                                        <SelectTrigger className={cn(glass.select, 'h-10 font-black text-[10px] bg-white/50 border-white/40')}>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            <SelectItem value="scale">Scale</SelectItem>
                                            <SelectItem value="sensor">Sensor</SelectItem>
                                            <SelectItem value="gateway">Gateway</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bluetooth-firmware" className={glass.microLabel}>Firmware</Label>
                                    <Input id="bluetooth-firmware" value={firmwareVersion} onChange={(event) => setFirmwareVersion(event.target.value)} className={cn(glass.input, 'h-10 font-black text-[10px] bg-white/50 border-white/40')} placeholder="1.0.0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Hive</Label>
                                    <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                                        <SelectTrigger className={cn(glass.select, 'h-10 font-black text-[10px] bg-white/50 border-white/40')}>
                                            <SelectValue placeholder="Select hive" />
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {hives.map((hive) => (
                                                <SelectItem key={hive.id} value={hive.id}>
                                                    {hive.hive_code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bluetooth-battery-volts" className={glass.microLabel}>Battery volts</Label>
                                    <Input id="bluetooth-battery-volts" value={batteryVolts} onChange={(event) => setBatteryVolts(event.target.value)} className={cn(glass.input, 'h-10 font-black text-[10px] bg-white/50 border-white/40')} placeholder="4.10" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-[#F4D03F]/10">
                                <button className={cn(glass.btnPrimary, 'w-full h-10 text-[10px] font-black rounded-xl')} onClick={handleSetupSubmit} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    <span>{editingDevice ? 'Save changes' : 'Save sensor'}</span>
                                </button>
                                <button className={cn(glass.btnSecondary, 'w-full h-10 text-[10px] font-black rounded-xl')} onClick={() => handleOpenChange(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};
