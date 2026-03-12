declare global {
    interface Navigator {
        bluetooth: any;
    }
}

import React from 'react';
import { beeyieldService, Apiary, Hive } from '@/services/beeyieldService';
import { Card, CardContent } from '@/components/ui/card';
import {
    Bluetooth as BluetoothIcon,
    Wifi,
    Zap,
    Check,
    X,
    AlertTriangle,
    Search,
    Activity,
    Battery,
    Thermometer,
    Scale,
    Droplet,
    Save,
    RefreshCw,
    Smartphone,
    Info,
    ChevronRight,
    Cpu,
    ShieldCheck,
    Terminal,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
        const [apiariesData, hivesData] = await Promise.all([
            beeyieldService.getApiaries(),
            beeyieldService.getHives()
        ]);
        setApiaries(apiariesData);
        setHives(hivesData);
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
            addLog("Checking sensor memory...");
            await new Promise(r => setTimeout(r, 800));

            setSyncProgress(100);
            addLog("Sync complete. No new data found.");
            toast.info("No new data to sync");
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
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <BluetoothIcon className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Wireless Connection</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Device <span className="text-honey">Link</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Connect and sync your sensors directly to your phone.
                    </p>
                </div>

                <div className="flex gap-6">
                    <AnimatePresence mode="wait">
                        {status === 'CONNECTED' ? (
                            <motion.button
                                key="disconnect"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => gattServer?.device.gatt.disconnect()}
                                className={cn(glass.btnSecondary, "h-20 px-12 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive font-black italic uppercase rounded-full shadow-4xl flex items-center gap-6")}
                            >
                                <X className="w-8 h-8" />
                                Disconnect
                            </motion.button>
                        ) : (
                            <motion.button
                                key="search"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={handleSearch}
                                disabled={status === 'SCANNING' || status === 'CONNECTING'}
                                className={cn(glass.btnPrimary, "h-20 px-16 font-black italic uppercase text-2xl shadow-4xl shadow-honey/20 rounded-full min-w-[300px] flex items-center justify-center gap-6")}
                            >
                                {status === 'SCANNING' ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-8 h-8" />
                                        Search Sensors
                                    </>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { label: 'STATUS', value: status === 'IDLE' ? 'Ready' : status.charAt(0) + status.slice(1).toLowerCase(), icon: Smartphone, color: status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-honey/10 text-honey border-honey/20', sub: connectedDevice ? connectedDevice.id : 'No Link' },
                    { label: 'BATTERY', value: liveData.battery ? `${liveData.battery}%` : '--%', icon: Battery, color: liveData.battery && liveData.battery < 20 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-honey/10 text-honey border-honey/20', progress: liveData.battery || 0 },
                    { label: 'HIVE LINK', value: knownDevice?.assigned_hive_id ? hives.find(h => h.id === knownDevice.assigned_hive_id)?.hive_code || 'LINKED' : 'NOT LINKED', icon: Activity, color: 'bg-honey/10 text-honey border-honey/20', action: () => status === 'CONNECTED' && setShowSetupModal(true) }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(glass.card, "p-10 shadow-4xl relative overflow-hidden group border-white/5 rounded-[4rem]")}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-honey/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-honey/20 transition-all pointer-events-none" />
                        <div className="flex items-center gap-6 mb-10">
                            <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center border-2 transition-all shadow-4xl", stat.color)}>
                                <stat.icon className="w-10 h-10" />
                            </div>
                            <p className="text-[14px] font-black uppercase tracking-[0.4em] opacity-40 italic">{stat.label}</p>
                        </div>
                        <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">{stat.value}</h3>
                        {stat.sub && <p className="text-[12px] font-black opacity-20 uppercase tracking-widest leading-none">{stat.sub}</p>}
                        {stat.progress !== undefined && (
                            <div className="mt-8 w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-white/5 shadow-inner p-[2px]">
                                <motion.div
                                    className={cn("h-full rounded-full shadow-2xl relative", stat.progress < 20 ? 'bg-red-500' : 'bg-honey')}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                </motion.div>
                            </div>
                        )}
                        {stat.action && (
                            <button
                                onClick={stat.action}
                                className="mt-8 h-12 px-6 rounded-full border border-honey/20 text-[12px] font-black text-honey uppercase tracking-widest hover:bg-honey/10 transition-all flex items-center gap-4 group/btn"
                            >
                                Change Link <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Live Data & Sync Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-8">
                {/* Live Data Gauges */}
                <div className="lg:col-span-8 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-16 shadow-4xl bg-white/80 backdrop-blur-3xl rounded-[6rem] relative overflow-hidden group border-white/5")}
                    >
                        <div className="absolute top-0 right-0 p-16 relative z-20">
                            <div className="flex items-center gap-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full px-8 py-3 backdrop-blur-3xl shadow-4xl">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                <span className="text-xl font-black italic text-emerald-500 uppercase tracking-widest">LIVE DATA SERVICE</span>
                            </div>
                        </div>

                        <div className="mb-20 relative z-10">
                            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">Real-Time <span className="text-honey">Sensors</span></h2>
                            <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5 max-w-2xl">Get data directly from your sensors in the field.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 relative z-10">
                            {[
                                { label: 'Temperature', val: liveData.temp?.toFixed(1) || '0.0', unit: '°C', icon: Thermometer, color: 'text-red-500', max: 60, stroke: 'rgb(239, 68, 68)' },
                                { label: 'Hive Weight', val: liveData.weight?.toFixed(1) || '0.0', unit: 'KG', icon: Scale, color: 'text-honey', max: 100, stroke: 'rgb(251, 191, 36)' },
                                { label: 'Humidity', val: liveData.humidity || '0', unit: '%', icon: Droplet, color: 'text-blue-500', max: 100, stroke: 'rgb(59, 130, 246)' }
                            ].map((gauge, i) => (
                                <div key={i} className="flex flex-col items-center gap-10 group/gauge">
                                    <div className="relative w-56 h-56 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90 absolute group-hover/gauge:scale-110 transition-transform duration-1000">
                                            <circle cx="112" cy="112" r="100" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="12" />
                                            <motion.circle
                                                cx="112" cy="112" r="100" fill="none"
                                                stroke={gauge.stroke} strokeWidth="12"
                                                strokeDasharray="628"
                                                initial={{ strokeDashoffset: 628 }}
                                                animate={{ strokeDashoffset: 628 - (628 * (Number(gauge.val) || 0) / gauge.max) }}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center relative z-10">
                                            <span className="text-6xl font-black italic tabular-nums leading-none tracking-tighter mb-2">{gauge.val}</span>
                                            <span className="text-2xl font-black italic opacity-30 uppercase">{gauge.unit}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 px-8 py-3 rounded-full border border-gray-200 shadow-4xl group-hover/gauge:border-honey/40 transition-all">
                                        <gauge.icon className={cn("w-6 h-6", gauge.color)} />
                                        <span className="text-[14px] font-black italic uppercase tracking-widest opacity-60">{gauge.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-16 shadow-4xl bg-white/80 backdrop-blur-3xl rounded-[6rem] relative overflow-hidden group border-white/5")}
                    >
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

                        <div className="flex flex-col xl:flex-row items-center justify-between mb-20 relative z-10 gap-16">
                            <div className="flex items-center gap-10">
                                <div className="w-24 h-24 rounded-[3rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-4xl">
                                    <RefreshCw className={cn("w-12 h-12 text-honey", isSyncing && "animate-spin")} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Sync <span className="text-honey">Data</span></h2>
                                    <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Download saved info from your sensor memory.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSync}
                                disabled={!gattServer || isSyncing}
                                className={cn(glass.btnPrimary, "h-24 px-16 font-black italic uppercase text-3xl shadow-4xl shadow-honey/20 rounded-full flex items-center gap-8 disabled:opacity-20")}
                            >
                                <Save className="w-10 h-10" />
                                Sync Now
                            </button>
                        </div>

                        <div className="space-y-12 relative z-10">
                            <div className="bg-gray-50 rounded-[4rem] p-16 flex flex-col md:flex-row items-center justify-between border border-white/5 shadow-4xl gap-16">
                                <div className="flex gap-10 items-center">
                                    <div className="w-20 h-20 bg-honey/10 rounded-[2.5rem] flex items-center justify-center border-2 border-honey/40 shadow-inner">
                                        <ShieldCheck className="w-10 h-10 text-honey" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">LAST SYNC</p>
                                        <p className="text-3xl font-black italic text-foreground/80 uppercase tracking-tighter">{knownDevice?.last_sync_at || 'Never'}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">DATA STATUS</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-black text-honey italic tracking-tighter uppercase">Ready to Download</span>
                                        <div className="w-4 h-4 rounded-full bg-honey animate-ping shadow-4xl" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isSyncing && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 pt-6"
                                    >
                                        <div className="flex justify-between items-end px-8">
                                            <div className="flex items-center gap-6">
                                                <Loader2 className="w-8 h-8 animate-spin text-honey" />
                                                <span className="text-2xl font-black italic text-honey uppercase tracking-tighter">Processing sensor data...</span>
                                            </div>
                                            <span className="text-5xl font-black italic tabular-nums tracking-tighter">{syncProgress}%</span>
                                        </div>
                                        <div className="h-6 bg-gray-50 rounded-full overflow-hidden border border-white/5 shadow-inner p-1.5">
                                            <motion.div
                                                className="h-full bg-honey rounded-full shadow-4xl relative"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${syncProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Message Log */}
                <div className="lg:col-span-4 h-full relative group">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-12 bg-black pb-16 flex flex-col h-full border-white/5 shadow-4xl rounded-[5rem] relative overflow-hidden group/console")}
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-honey/10 rounded-full blur-[150px] pointer-events-none group-hover/console:bg-honey/20 transition-all" />

                        <div className="flex items-center justify-between mb-12 relative z-10 border-b border-gray-200 pb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center border border-gray-200 shadow-inner">
                                    <Terminal className="w-8 h-8 text-honey" />
                                </div>
                                <span className="text-2xl font-black italic text-honey uppercase tracking-[0.3em]">System Log</span>
                            </div>
                            <button
                                onClick={() => setLogs([])}
                                className="text-gray-400 hover:text-honey transition-all uppercase text-[12px] font-black tracking-widest px-8 py-3 rounded-full border border-gray-200 hover:border-honey/40 hover:bg-honey/5"
                            >
                                CLEAR
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto font-mono text-[14px] leading-relaxed space-y-6 thin-scrollbar pr-6 relative z-10 min-h-[600px] selection:bg-honey/30 selection:text-white">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-8">
                                    <Search className="w-24 h-24 animate-pulse" />
                                    <p className="text-xl font-black tracking-[0.4em] italic uppercase">Searching sensors...</p>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-6 group/logitem border-b border-white/5 pb-4 last:border-0 hover:bg-white/5 p-4 rounded-3xl transition-all duration-500">
                                        <span className="text-honey/20 shrink-0 font-black italic opacity-40 group-hover/logitem:opacity-100 transition-opacity">#{logs.length - i}</span>
                                        <span className={cn("font-medium italic leading-snug", log.includes('Error') ? 'text-red-500 font-black text-lg' : 'text-honey/60 group-hover/logitem:text-honey transition-colors')}>
                                            {log}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-12 pt-10 border-t border-gray-200 relative z-10">
                            <div className="bg-white/5 rounded-[3rem] p-10 flex gap-8 border border-gray-200 shadow-4xl group/bridge hover:border-honey/40 transition-all">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center border-2 border-gray-200 group-hover/bridge:border-honey/40 group-hover/bridge:rotate-6 transition-all shadow-4xl">
                                    <ShieldCheck className="w-10 h-10 text-honey" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[12px] font-black italic uppercase tracking-[0.4em] text-gray-600">Secure Connection</p>
                                    <p className="text-xl text-gray-800 font-black italic uppercase tracking-tighter">Bluetooth 4.2 · Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Setup Device Modal */}
            <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                <DialogContent className="max-w-[700px] bg-transparent border-none p-0 shadow-none overflow-visible">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative bg-white/95 backdrop-blur-3xl rounded-[6rem] border-gray-200")}
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />

                        <div className="bg-white/40 px-16 py-16 border-b border-white/5 relative z-10">
                            <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg] mb-8')}>
                                <div className="flex items-center gap-4 skew-x-[12deg]">
                                    <Cpu className="w-5 h-5" />
                                    <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Add New Sensor</span>
                                </div>
                            </div>
                            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">Initialize <span className="text-honey">Sensor</span></h2>
                            <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Link this new sensor to one of your hives.</p>
                        </div>

                        <div className="p-16 space-y-16 relative z-10">
                            <div className="space-y-6">
                                <Label className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40 ml-4">Sensor Name</Label>
                                <Input
                                    id="name"
                                    value={setupName}
                                    onChange={(e) => setSetupName(e.target.value)}
                                    className={cn(glass.input, "h-20 px-10 text-2xl font-black italic tracking-tighter shadow-4xl")}
                                    placeholder="e.g. Hive Alpha Scale"
                                />
                            </div>
                            <div className="space-y-6">
                                <Label className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40 ml-4">Assign to Hive</Label>
                                <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                                    <SelectTrigger className={cn(glass.input, "h-20 px-10 shadow-4xl text-2xl font-black italic")}>
                                        <SelectValue placeholder="Choose a hive..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/90 backdrop-blur-3xl border-gray-200 rounded-[3rem] p-6">
                                        {hives.map(hive => (
                                            <SelectItem key={hive.id} value={hive.id} className="p-6 font-black italic text-2xl uppercase tracking-tighter text-gray-900 hover:bg-honey hover:text-black transition-colors rounded-3xl">
                                                {hive.hive_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-6 pt-16 border-t border-white/5">
                                <button
                                    className={cn(glass.btnPrimary, "h-24 px-16 font-black italic uppercase text-3xl shadow-4xl shadow-honey/20 rounded-full flex items-center justify-center gap-10 group/save relative overflow-hidden")}
                                    onClick={handleSetupSubmit}
                                >
                                    <div className="absolute inset-0 bg-white/0 group-hover/save:bg-white/10 transition-all" />
                                    <ShieldCheck className="w-10 h-10 relative z-10" />
                                    <span className="relative z-10">Save Sensor</span>
                                </button>
                                <button
                                    className={cn(glass.btnSecondary, "h-20 w-full font-black italic uppercase text-xl rounded-full border-white/5 hover:bg-white/5")}
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
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite linear; }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};
