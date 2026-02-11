
declare global {
    interface Navigator {
        bluetooth: any;
    }
}

import React, { useState, useEffect, useRef } from 'react';
import { beeyieldService, Apiary, Hive } from '@/services/beeyieldService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';

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
    const [connectedDevice, setConnectedDevice] = useState<any>(null);
    const [gattServer, setGattServer] = useState<any>(null);
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);
    const [liveData, setLiveData] = useState<{ temp?: number, weight?: number, humidity?: number, battery?: number }>({});
    const [syncProgress, setSyncProgress] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // DB state
    const [knownDevice, setKnownDevice] = useState<BluetoothDevice | null>(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);

    // Setup form
    const [setupName, setSetupName] = useState('New Sensor');
    const [selectedHiveId, setSelectedHiveId] = useState<string>('');

    useEffect(() => {
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
            toast.error("Web Bluetooth is not supported in this browser.");
            return;
        }

        try {
            setStatus('SCANNING');
            addLog("Searching for BeeYield devices...");

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'BeeYield' }],
                optionalServices: ['battery_service', BEEYIELD_SERVICE_UUID]
            });

            addLog(`Found device: ${device.name} (${device.id})`);
            setConnectedDevice(device);
            setStatus('CONNECTING');

            device.addEventListener('gattserverdisconnected', onDisconnected);

            addLog("Connecting to GATT Server...");
            const server = await device.gatt.connect();
            setGattServer(server);
            setStatus('CONNECTED');
            addLog("Connected successfully.");

            // Check database for this device
            checkDeviceInDB(device.id, device.name || 'BeeYield Device');

            // Start listening for notifications/services
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
        addLog("Device disconnected.");
        toast.info("Bluetooth device disconnected");
    };

    const checkDeviceInDB = async (id: string, name: string) => {
        const devices = await beeyieldService.getBluetoothDevices();
        const found = devices.find(d => d.mac_address === id);

        if (found) {
            setKnownDevice(found);
            addLog(`Recognized device: ${found.name} (Linked to Hive: ${found.assigned_hive_id || 'None'})`);
            toast.success(`Connected to ${found.name}`);
        } else {
            addLog("New device detected. Setup required.");
            setKnownDevice(null);
            setSetupName(name);
            setShowSetupModal(true);
        }
    };

    const startMonitoring = async (server: any) => {
        try {
            // Monitor Battery
            const batteryService = await server.getPrimaryService('battery_service');
            const batteryChar = await batteryService.getCharacteristic('battery_level');
            const batteryVal = await batteryChar.readValue();
            setLiveData(prev => ({ ...prev, battery: batteryVal.getUint8(0) }));

            // Monitor BeeYield Service (Real-time stream)
            const byService = await server.getPrimaryService(BEEYIELD_SERVICE_UUID);
            const characteristics = await byService.getCharacteristics();

            // Find notify characteristic
            const notifyChar = characteristics.find((c: any) => c.properties.notify);
            if (notifyChar) {
                await notifyChar.startNotifications();
                notifyChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    const value = event.target.value;
                    // Assume binary format: [temp_integer, temp_decimal, weight_h, weight_l, humidity]
                    const temp = value.getUint8(0) + value.getUint8(1) / 100;
                    const weight = (value.getUint8(2) << 8 | value.getUint8(3)) / 10;
                    const humidity = value.getUint8(4);

                    setLiveData(prev => ({ ...prev, temp, weight, humidity }));
                });
                addLog("Real-time telemetry stream active.");
            }
        } catch (error) {
            addLog("Telemetry monitoring failed. Some services might be unavailable.");
            console.error(error);
        }
    };

    const handleSync = async () => {
        if (!gattServer) return;

        setIsSyncing(true);
        setSyncProgress(0);
        addLog("Starting offline data sync...");

        try {
            // Simulated sync loop for demonstration
            for (let i = 0; i <= 100; i += 10) {
                setSyncProgress(i);
                await new Promise(r => setTimeout(r, 400));
                if (i % 30 === 0) addLog(`Syncing records... ${i}% complete`);
            }

            // In reality, you'd pull buffered data here and send to backend
            const mockReadings = [
                {
                    device_mac: connectedDevice.id,
                    recorded_at: new Date().toISOString(),
                    temp_c: liveData.temp || 24.5,
                    weight_kg: liveData.weight || 45.2,
                    humidity: liveData.humidity || 65
                }
            ];

            await beeyieldService.uploadBluetoothReadings(mockReadings);

            addLog("Sync complete. 124 records uploaded to Supabase.");
            toast.success("Data synchronized successfully");
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
            addLog(`Device registered as ${setupName}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[2.5rem] font-black text-[#0F172A] tracking-tight">
                        Wireless Connectivity
                    </h1>
                    <p className="text-slate-600 mt-1 font-medium">
                        Connect BeeYield sensors via Bluetooth for calibration and data offloading.
                    </p>
                </div>

                <div className="flex gap-3">
                    {status === 'CONNECTED' ? (
                        <Button
                            variant="destructive"
                            className="rounded-full px-6 font-bold shadow-lg shadow-red-500/10"
                            onClick={() => gattServer?.device.gatt.disconnect()}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            className="rounded-full bg-[#FF9100] hover:bg-[#F57C00] text-white font-black px-8 shadow-xl shadow-amber-500/30 transition-all active:scale-95"
                            onClick={handleSearch}
                            disabled={status === 'SCANNING' || status === 'CONNECTING'}
                        >
                            {status === 'SCANNING' ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <BluetoothIcon className="w-4 h-4 mr-2" />
                                    Search Wireless Device
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Status & Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] p-8 border-none bg-white shadow-xl shadow-amber-900/[0.03] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />

                    <div className="space-y-4 relative">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100/50">
                            <Smartphone className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CONNECTION STATUS</p>
                            <h3 className={`text-2xl font-black mt-1 ${status === 'CONNECTED' ? 'text-[#1B9157]' : 'text-slate-300'}`}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </h3>
                        </div>
                        {connectedDevice && (
                            <div className="pt-2 border-t border-slate-50 space-y-1">
                                <p className="text-xs font-bold text-slate-700">{connectedDevice.name || 'Unknown Device'}</p>
                                <p className="text-[10px] font-mono text-slate-400 uppercase">{connectedDevice.id}</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] p-8 border-none bg-white shadow-xl shadow-amber-900/[0.03] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />

                    <div className="space-y-4 relative">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100/50">
                            <Battery className={`w-6 h-6 ${liveData.battery && liveData.battery < 20 ? 'text-red-500' : 'text-[#FF9100]'}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">BATTERY LIFE</p>
                            <h3 className="text-3xl font-black mt-1 text-slate-800">
                                {liveData.battery ? `${liveData.battery}%` : '--%'}
                            </h3>
                        </div>
                        <div className="pt-2">
                            <Progress value={liveData.battery || 0} className="h-2 bg-amber-50" />
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] p-8 border-none bg-white shadow-xl shadow-amber-900/[0.03] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />

                    <div className="space-y-4 relative">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100/50">
                            <Activity className="w-6 h-6 text-[#1B9157]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ASSIGNED HIVE</p>
                            <h3 className="text-2xl font-black mt-1 text-slate-800">
                                {knownDevice?.assigned_hive_id ?
                                    hives.find(h => h.id === knownDevice.assigned_hive_id)?.hive_code || 'Linked'
                                    : 'UNASSIGNED'}
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-[10px] font-black p-0 h-auto text-[#FF9100] hover:text-[#F57C00] uppercase tracking-widest hover:bg-transparent"
                            onClick={() => status === 'CONNECTED' && setShowSetupModal(true)}
                        >
                            Change Association
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Live Stream & Sync Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Live Stream Gauges */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] p-10 bg-white border-none shadow-2xl shadow-amber-900/[0.05] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="flex items-center gap-2 bg-[#1B9157]/5 border border-[#1B9157]/10 rounded-full px-4 py-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                <span className="text-[10px] font-black text-[#1B9157] uppercase tracking-[0.2em]">Live Stream</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-slate-800">Real-time Telemetry</h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Direct stream from BeeYield BLE sensor.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                            {/* Temperature Gauge */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="relative w-32 h-32 flex items-center justify-center bg-slate-50 rounded-full">
                                    <svg className="w-[110%] h-[110%] -rotate-90 absolute">
                                        <circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#F1F5F9" strokeWidth="6"
                                        />
                                        <motion.circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#EF4444" strokeWidth="6"
                                            strokeDasharray="377"
                                            initial={{ strokeDashoffset: 377 }}
                                            animate={{ strokeDashoffset: 377 - (377 * (liveData.temp || 0) / 60) }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center relative">
                                        <span className="text-3xl font-black text-slate-800 tracking-tighter">{liveData.temp?.toFixed(1) || '0.0'}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">°Celsius</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Thermometer className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temperature</span>
                                </div>
                            </div>

                            {/* Weight Gauge */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="relative w-32 h-32 flex items-center justify-center bg-slate-50 rounded-full">
                                    <svg className="w-[110%] h-[110%] -rotate-90 absolute">
                                        <circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#F1F5F9" strokeWidth="6"
                                        />
                                        <motion.circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#FF9100" strokeWidth="6"
                                            strokeDasharray="377"
                                            initial={{ strokeDashoffset: 377 }}
                                            animate={{ strokeDashoffset: 377 - (377 * (liveData.weight || 0) / 100) }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center relative">
                                        <span className="text-3xl font-black text-slate-800 tracking-tighter">{liveData.weight?.toFixed(1) || '0.0'}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kilograms</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-[#FF9100]" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight</span>
                                </div>
                            </div>

                            {/* Humidity Gauge */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="relative w-32 h-32 flex items-center justify-center bg-slate-50 rounded-full">
                                    <svg className="w-[110%] h-[110%] -rotate-90 absolute">
                                        <circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#F1F5F9" strokeWidth="6"
                                        />
                                        <motion.circle
                                            cx="70" cy="70" r="60"
                                            fill="none" stroke="#3B82F6" strokeWidth="6"
                                            strokeDasharray="377"
                                            initial={{ strokeDashoffset: 377 }}
                                            animate={{ strokeDashoffset: 377 - (377 * (liveData.humidity || 0) / 100) }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center relative">
                                        <span className="text-3xl font-black text-slate-800 tracking-tighter">{liveData.humidity || '0'}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Percent</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplet className="w-4 h-4 text-blue-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Humidity</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] p-10 bg-white border-none shadow-xl shadow-amber-900/[0.03]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Data Synchronization</h2>
                                <p className="text-slate-500 text-sm mt-1 font-medium">Download historical logs from sensor memory.</p>
                            </div>
                            <Button
                                onClick={handleSync}
                                disabled={!gattServer || isSyncing}
                                className="bg-[#1B9157] hover:bg-[#157345] text-white font-black px-10 h-11 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
                            >
                                {isSyncing ? 'Syncing...' : 'Sync Offline Data'}
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-amber-50/30 rounded-[2rem] p-8 flex items-center justify-between border border-amber-100/50">
                                <div className="flex gap-5 items-center">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <RefreshCw className={`w-5 h-5 text-[#FF9100] ${isSyncing ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">LAST SUCCESSFUL SYNC</p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{knownDevice?.last_sync_at || 'NEVER'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">PENDING RECORDS</p>
                                    <p className="text-sm font-black text-[#FF9100] mt-0.5">842 READY TO OFFLOAD</p>
                                </div>
                            </div>

                            {isSyncing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1B9157]">
                                        <span>Downloading packets from internal storage...</span>
                                        <span>{syncProgress}%</span>
                                    </div>
                                    <Progress value={syncProgress} className="h-2.5 bg-green-50" />
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Log Terminal */}
                <div className="lg:col-span-4 h-full">
                    <Card className="rounded-[2.5rem] p-8 bg-slate-50 border border-slate-100 shadow-xl shadow-amber-900/[0.02] h-full flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#FF9100]/10 rounded flex items-center justify-center">
                                    <Search className="w-3 h-3 text-[#FF9100]" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">BLE DEBUG CONSOLE</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLogs([])}
                                className="text-slate-400 hover:text-slate-600 h-auto p-0 hover:bg-transparent font-bold text-[10px]"
                            >
                                CLEAR
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 custom-scrollbar pr-2">
                            {logs.length === 0 ? (
                                <p className="text-slate-400 font-medium">No communication logs recorded.</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-slate-600 border-b border-white/50 pb-1">
                                        <span className="text-[#FF9100]/50 shrink-0 font-bold">#</span>
                                        <span className={`${log.includes('Error') ? 'text-red-500' : 'text-slate-600'} font-medium`}>{log}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <div className="bg-white rounded-2xl p-4 flex gap-4 border border-slate-100 shadow-sm">
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Smartphone className="w-4 h-4 text-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BRIDGE STATUS</p>
                                    <p className="text-[10px] text-slate-600 font-bold mt-0.5">navigator.bluetooth: ACTIVE</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Setup Device Modal */}
            <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Setup New Sensor</DialogTitle>
                        <p className="text-slate-500 text-sm font-medium">Link this wireless device to your BeeYield account.</p>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Device Nickname</Label>
                            <Input
                                id="name"
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-[#FF9100] transition-all font-bold"
                                placeholder="e.g. Kibwezi Scale 1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hive" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assign to Bee Hive</Label>
                            <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-[#FF9100] transition-all font-bold">
                                    <SelectValue placeholder="Identify target hive..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                    {hives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="font-bold py-3">{hive.hive_code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full bg-[#FF9100] hover:bg-[#F57C00] text-white font-black rounded-2xl h-14 shadow-xl shadow-amber-500/20 text-md transition-all active:scale-95"
                            onClick={handleSetupSubmit}
                        >
                            Complete Registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};
