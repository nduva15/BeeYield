declare global {
    interface Navigator {
        bluetooth: any;
    }
}

import React from 'react';
import { beeyieldService, Apiary, Hive } from '@/services/beeyieldService';
import {
    Bluetooth as BluetoothIcon,
    X,
    Search,
    Battery,
    Thermometer,
    Scale,
    Droplet,
    Save,
    RefreshCw,
    Smartphone,
    ChevronRight,
    Cpu,
    ShieldCheck,
    Terminal,
    Loader2,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

// Service UUID from PRD
const BEEYIELD_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

interface BluetoothDevice {
    mac_address: string;
    name: string;
    device_type: string;
    assigned_hive_id?: string;
    last_sync_at?: string;
    battery_volts?: number;
}

export const BluetoothConnectivityView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    const [connectedDevice, setConnectedDevice] = React.useState<any>(null);
    const [gattServer, setGattServer] = React.useState<any>(null);
    const [status, setStatus] = React.useState<'IDLE' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
    const [logs, setLogs] = React.useState<string[]>([]);
    const [liveData, setLiveData] = React.useState<{ temp?: number, weight?: number, humidity?: number, battery?: number }>({});
    const [syncProgress, setSyncProgress] = React.useState(0);
    const [isSyncing, setIsSyncing] = React.useState(false);

    // DB state
    const [knownDevice, setKnownDevice] = React.useState<BluetoothDevice | null>(null);
    const [showSetupModal, setShowSetupModal] = React.useState(false);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);

    // Setup form
    const [setupName, setSetupName] = React.useState('New Sensor');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('');

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [apiariesData, hivesData] = await Promise.all([
                beeyieldService.getApiaries(),
                beeyieldService.getHives()
            ]);
            setApiaries(apiariesData || []);
            setHives(hivesData || []);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
    };

    const handleSearch = async () => {
        if (!navigator.bluetooth) {
            toast.error("Bluetooth is not supported in this browser.");
            return;
        }

        try {
            setStatus('SCANNING');
            addLog("Searching for sensors...");

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'BeeYield' }],
                optionalServices: ['battery_service', BEEYIELD_SERVICE_UUID]
            });

            addLog(`Found: ${device.name}`);
            setConnectedDevice(device);
            setStatus('CONNECTING');

            device.addEventListener('gattserverdisconnected', onDisconnected);

            addLog("Connecting...");
            const server = await device.gatt.connect();
            setGattServer(server);
            setStatus('CONNECTED');
            addLog("Connected.");

            checkDeviceInDB(device.id, device.name || 'BeeYield Device');
            startMonitoring(server);

        } catch (error: any) {
            console.error(error);
            setStatus('ERROR');
            addLog(`Error: ${error.message}`);
            if (error.name !== 'NotFoundError' && error.name !== 'UserCancelledError') {
                toast.error(`Bluetooth Error: ${error.message}`);
            }
        }
    };

    const onDisconnected = () => {
        setStatus('IDLE');
        setConnectedDevice(null);
        setGattServer(null);
        addLog("Disconnected.");
        toast.info("Sensor disconnected");
    };

    const checkDeviceInDB = async (id: string, name: string) => {
        const devices = await beeyieldService.getBluetoothDevices();
        const found = devices.find(d => d.mac_address === id);

        if (found) {
            setKnownDevice(found);
            addLog(`Recognized: ${found.name}`);
            toast.success(`Connected to ${found.name}`);
        } else {
            addLog("New sensor found. Setup required.");
            setKnownDevice(null);
            setSetupName(name);
            setShowSetupModal(true);
        }
    };

    const startMonitoring = async (server: any) => {
        try {
            const batteryService = await server.getPrimaryService('battery_service');
            const batteryChar = await batteryService.getCharacteristic('battery_level');
            const batteryVal = await batteryChar.readValue();
            setLiveData(prev => ({ ...prev, battery: batteryVal.getUint8(0) }));

            const byService = await server.getPrimaryService(BEEYIELD_SERVICE_UUID);
            const characteristics = await byService.getCharacteristics();

            const notifyChar = characteristics.find((c: any) => c.properties.notify);
            if (notifyChar) {
                await notifyChar.startNotifications();
                notifyChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    const value = event.target.value;
                    const temp = value.getUint8(0) + value.getUint8(1) / 100;
                    const weight = (value.getUint8(2) << 8 | value.getUint8(3)) / 10;
                    const humidity = value.getUint8(4);

                    setLiveData(prev => ({ ...prev, temp, weight, humidity }));
                });
                addLog("Live data stream active.");
            }
        } catch (error) {
            addLog("Could not start monitoring.");
            console.error(error);
        }
    };

    const handleSync = async () => {
        if (!gattServer) return;

        setIsSyncing(true);
        setSyncProgress(0);
        addLog("Syncing saved data...");

        try {
            const mac = connectedDevice?.id;
            if (!mac) {
                throw new Error('No connected device id available');
            }

            // Best-effort: sync at least the current live reading (and battery if present).
            // If/when sensor memory download is implemented, this payload can become a batch.
            const nowIso = new Date().toISOString();
            const reading = {
                device_mac: mac,
                recorded_at: nowIso,
                temp_c: typeof liveData.temp === 'number' ? liveData.temp : null,
                weight_kg: typeof liveData.weight === 'number' ? liveData.weight : null,
                humidity: typeof liveData.humidity === 'number' ? liveData.humidity : null,
            };

            const hasAnyMetric = Object.values(reading).some((v) => typeof v === 'number');
            if (!hasAnyMetric) {
                addLog("No telemetry yet. Wait for live values, then sync again.");
                toast.info('No telemetry received yet');
                return;
            }

            setSyncProgress(20);
            addLog("Packaging readings…");

            const res = await beeyieldService.syncBluetoothReadings({ readings: [reading] });
            setSyncProgress(100);

            if (!res.ok) {
                throw res.error || new Error('Sync failed');
            }

            addLog(`Sync complete. Uploaded ${res.count} reading(s).`);
            toast.success(`Synced ${res.count} reading(s)`);
        } catch (error: any) {
            addLog(`Sync error: ${error.message}`);
            toast.error("Sync failed");
        } finally {
            setIsSyncing(false);
            setSyncProgress(100);
        }
    };

    const handleSetupSubmit = async () => {
        if (!connectedDevice) return;

        const res = await beeyieldService.registerBluetoothDevice({
            mac_address: connectedDevice.id,
            name: setupName,
            device_type: 'scale',
            assigned_hive_id: selectedHiveId
        });

        if (res) {
            setKnownDevice(res);
            setShowSetupModal(false);
            addLog(`Sensor saved as ${setupName}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header Section */}
            <PageHeader
                icon={BluetoothIcon}
                label="Wireless_Interface_Protocol"
                title={<>Device <span className="text-[#F4D03F]">Link</span></>}
                subtitle="Establish industrial Bluetooth bridge for real-time telemetry."
                actions={
                    <div className="flex gap-3">
                        <AnimatePresence mode="wait">
                            {status === 'CONNECTED' ? (
                                <motion.button
                                    key="disconnect"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    onClick={() => gattServer?.device.gatt.disconnect()}
                                    className={cn(glass.btnSecondary, "h-8 px-4 text-red-500 border-red-500/10 hover:bg-red-500/10 font-black uppercase text-[9px] tracking-[0.2em] rounded-xl shadow-sm flex items-center gap-2")}
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Disconnect_Link
                                </motion.button>
                            ) : (
                                <motion.button
                                    key="search"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    onClick={handleSearch}
                                    disabled={status === 'SCANNING' || status === 'CONNECTING'}
                                    className={glass.btnPrimary}
                                >
                                     {status === 'SCANNING' ? (
                                         <>
                                             <Loader2 className="w-4 h-4 animate-spin" />
                                             Scanning...
                                         </>
                                     ) : (
                                         <>
                                             <Search className="w-4 h-4" />
                                             Detect Devices
                                         </>
                                     )}
                                 </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                }
            />

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Network status', value: status === 'IDLE' ? 'READY' : status.toUpperCase(), icon: Smartphone, color: status === 'CONNECTED' ? 'bg-[#1B9157]/10 text-[#1B9157]' : 'bg-[#F4D03F]/10 text-[#F4D03F]', sub: connectedDevice ? connectedDevice.id : 'Waiting...' },
                    { label: 'Battery Level', value: liveData.battery ? `${liveData.battery}%` : '0%', icon: Battery, color: liveData.battery && liveData.battery < 20 ? 'bg-red-500/10 text-red-500' : 'bg-[#1B9157]/10 text-[#1B9157]', progress: liveData.battery || 0 },
                    { label: 'Hive Sync', value: knownDevice?.assigned_hive_id ? hives.find(h => h.id === knownDevice.assigned_hive_id)?.hive_code || 'Active' : 'Not Linked', icon: Activity, color: 'bg-[#F4D03F]/10 text-[#F4D03F]', action: () => status === 'CONNECTED' && setShowSetupModal(true) }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={glass.card + " p-5 transition-all duration-300"}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700"><stat.icon className="w-12 h-12" /></div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border transition-all shadow-sm", stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <p className={glass.microLabel}>{stat.label}</p>
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-medium text-gray-400 truncate">{stat.sub || 'Standby'}</p>
                        
                        {stat.progress !== undefined && (
                            <div className="mt-5 w-full h-1.5 bg-white/60 rounded-full overflow-hidden border border-white/40 shadow-inner p-0.5">
                                <motion.div
                                    className={cn("h-full rounded-full relative", stat.progress < 20 ? 'bg-red-500' : 'bg-[#1B9157]')}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.progress}%` }}
                                />
                            </div>
                        )}
                        {stat.action && (
                            <button
                                onClick={stat.action}
                                className="mt-5 h-8 px-3.5 rounded-lg border border-[#F4D03F]/20 text-sm font-semibold text-[#D4AC0D] hover:bg-[#F4D03F]/10 transition-all flex items-center gap-2 group/btn"
                            >
                                Configure <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Live Data & Sync Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12 space-y-6">
                    <div className={glass.section + " p-6"}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Live readings</h3>
                                <p className="text-sm text-gray-500">Live stream of environmental metrics from the sensor.</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#1B9157] rounded-full text-xs font-semibold border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                Live
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                            {[
                                { label: 'Temperature', val: liveData.temp?.toFixed(1) || '0.0', unit: '°C', icon: Thermometer, color: 'text-red-500', bg: 'bg-red-500/5', max: 60, stroke: '#EF4444' },
                                { label: 'Weight', val: liveData.weight?.toFixed(1) || '0.0', unit: 'kg', icon: Scale, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/5', max: 100, stroke: '#F4D03F' },
                                { label: 'Humidity', val: liveData.humidity || '0', unit: '%', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-500/5', max: 100, stroke: '#3B82F6' }
                            ].map((gauge, i) => (
                                <div key={i} className="flex flex-col items-center gap-5 group/gauge">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90 absolute">
                                            <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="5" />
                                            <motion.circle
                                                cx="56" cy="56" r="50" fill="none"
                                                stroke={gauge.stroke} strokeWidth="5"
                                                strokeDasharray="314"
                                                initial={{ strokeDashoffset: 314 }}
                                                animate={{ strokeDashoffset: 314 - (314 * (Math.min(Number(gauge.val), gauge.max) / gauge.max)) }}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center relative z-10">
                                            <span className="text-lg font-bold tabular-nums leading-none tracking-tight mb-0.5 text-[#1A1A1A]">{gauge.val}</span>
                                            <span className="text-[9px] font-bold opacity-40 uppercase">{gauge.unit}</span>
                                        </div>
                                    </div>
                                    <div className={glass.badge}>
                                        {gauge.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={glass.section + " p-5"}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                        <RefreshCw className={cn("w-5 h-5 text-[#F4D03F]", isSyncing && "animate-spin")} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1A1A1A]">Cloud Synchronization</h3>
                                        <p className="text-sm text-gray-500">Manual data ingest to BeeYield Cloud.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSync}
                                    disabled={!gattServer || isSyncing}
                                    className={glass.btnPrimary}
                                >
                                    <Save className="w-4 h-4" />
                                    Sync Data
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="bg-white/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-white/60 shadow-inner gap-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
                                            <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                                        </div>
                                        <div>
                                            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">LAST_SYNCHRONIZATION</p>
                                            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-tighter">{knownDevice?.last_sync_at || 'NO_RECORD'}</p>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-400">INGEST_STATE</p>
                                        <span className="text-[9px] font-black text-[#1B9157] uppercase tracking-widest">READY_FOR_EGRESS</span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isSyncing && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex justify-between items-end px-1">
                                                <span className="text-[9px] font-black text-[#F4D03F] uppercase tracking-widest animate-pulse">Sync_In_Progress...</span>
                                                <span className="text-lg font-black tabular-nums tracking-tighter text-[#1A1A1A]">{syncProgress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden border border-white/40 p-0.5">
                                                <motion.div
                                                    className="h-full bg-[#F4D03F] rounded-full shadow-sm"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${syncProgress}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className={glass.section + " p-5 flex flex-col"}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#F9F7F2] rounded-lg flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                        <Terminal className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <span className="text-sm font-bold text-[#1A1A1A]">Event Log</span>
                                </div>
                                <button
                                    onClick={() => setLogs([])}
                                    className={glass.btnSecondary + " h-8 px-3 text-[10px]"}
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="h-40 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-2 thin-scrollbar pr-2 flex-1">
                                {logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin-slow" />
                                        <p className="text-[8px] font-black tracking-[0.3em] uppercase">LINK_IDLE_AWAIT_FRAME</p>
                                    </div>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className="flex gap-3 pb-1 border-b border-white/10 last:border-0 hover:bg-white/40 px-2 rounded-lg transition-colors">
                                            <span className="text-[#F4D03F]/40 shrink-0 font-black text-[8px]">0{logs.length - i}</span>
                                            <span className={cn("font-bold tracking-tight lowercase", log.includes('Error') ? 'text-red-500' : 'text-gray-500')}>
                                                {log.split('] ')[1]}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                <DialogContent className="max-w-[400px] bg-transparent border-none p-0 shadow-none overflow-visible">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative bg-white/90 border-white/20")}
                    >
                         <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        
                        <div className="px-6 py-5 border-b border-[#F4D03F]/10 relative z-10">
                            <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 mb-3 inline-block')}>
                                Add sensor
                            </div>
                            <h2 className={cn(glass.sectionTitle, "uppercase leading-none mb-1")}>Add <span className="text-[#F4D03F]">sensor</span></h2>
                            <p className={glass.microLabel}>Link a sensor to a hive.</p>
                        </div>

                        <div className="p-6 space-y-5 relative z-10">
                            <div className="space-y-2">
                                <Label className={glass.microLabel}>Sensor_Alias</Label>
                                <Input
                                    id="name"
                                    value={setupName}
                                    onChange={(e) => setSetupName(e.target.value)}
                                    className={cn(glass.input, "w-full h-10 uppercase font-black tracking-[0.2em] text-[10px] bg-white/50 border-white/40 focus:bg-white")}
                                    placeholder="e.g. ALPHA_SCALE_01"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className={glass.microLabel}>Hive</Label>
                                <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                                    <SelectTrigger className={cn(glass.select, "w-full h-10 uppercase font-black tracking-[0.2em] text-[10px] bg-white/50 border-white/40 focus:bg-white")}>
                                        <SelectValue placeholder="Select a hive…" />
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {hives.map(hive => (
                                            <SelectItem key={hive.id} value={hive.id} className="uppercase font-black text-[10px] tracking-[0.1em]">
                                                {hive.hive_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-[#F4D03F]/10">
                                <button
                                    className={cn(glass.btnPrimary, "w-full h-10 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl")}
                                    onClick={handleSetupSubmit}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                                <button
                                    className={cn(glass.btnSecondary, "w-full h-10 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl")}
                                    onClick={() => setShowSetupModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 3px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </motion.div>
    );
};
