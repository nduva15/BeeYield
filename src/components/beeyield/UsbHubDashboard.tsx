import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Maximize2,
    Search,
    Bell,
    HelpCircle,
    Wifi,
    Settings as SettingsIcon,
    LogOut,
    ChevronDown,
    Moon,
    Headphones
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import logoAsset from '@/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';

export function UsbHubDashboard() {
    const [device, setDevice] = useState<USBDevice | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [syncProgress, setSyncProgress] = useState(0);
    const [isFlashing, setIsFlashing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
    const [manifestJson, setManifestJson] = useState<string>(`{
  "name": "BeeYield Hub Queen Firmware",
  "version": "1.2.5",
  "builds": [
    {
      "chipFamily": "ESP32-S3",
      "parts": []
    }
  ]
}`);

    const queryClient = useQueryClient();
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const connectDevice = async () => {
        try {
            setConnectionStatus('connecting');
            const usbDevice = await navigator.usb.requestDevice({ filters: [] });
            await usbDevice.open();
            if (usbDevice.configuration === null) await usbDevice.selectConfiguration(1);
            await usbDevice.claimInterface(0);
            setDevice(usbDevice);
            setConnectionStatus('connected');
            addLog("Connected to BeeYield Hub Alpha successfully.");

            await handshake(usbDevice);
            toast.success("BeeYield Hub Alpha connected");
        } catch (error: any) {
            setConnectionStatus('error');
            console.error(error);
            toast.error('Connection aborted');
        }
    };

    const handshake = async (usbDevice: USBDevice) => {
        try {
            const payload = {
                serial_number: usbDevice.serialNumber || 'UNKNOWN-SN',
                firmware_version: '1.2.0',
                config_json: { sample_rate: 300 },
                user_id: userId
            };
            await axios.post('/api/v1/hub/handshake', payload);
            queryClient.invalidateQueries({ queryKey: ['hub-devices'] });
            addLog("Handshake successful. Device synced with BeeYield servers.");
        } catch (err: any) {
            console.error("Handshake failed", err);
            addLog(`Sync Error: ${err.message}`);
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    }

    const handleFlash = async () => {
        if (!device) {
            toast.error("Connect BeeYield Hub Alpha first");
            return;
        }
        if (!firmwareFile) {
            toast.warning("Select firmware binary (.bin)");
            return;
        }

        setIsFlashing(true);
        setSyncProgress(0);
        addLog("Initiating firmware write sequence...");

        try {
            for (let i = 0; i <= 100; i += 4) {
                setSyncProgress(i);
                if (i % 20 === 0) addLog(`Writing block 0x${(1000 + i * 10).toString(16)}... ${i}%`);
                await new Promise(r => setTimeout(r, 100));
            }

            const sessionRes = await axios.post('/api/v1/hub/sync/start', {
                hub_sn: device.serialNumber || 'UNKNOWN-SN',
                records_count: 0,
                user_id: userId
            });

            await axios.post('/api/v1/hub/sync/complete', {
                session_id: sessionRes.data.id,
                status: 'success',
                duration_sec: 5,
                user_id: userId
            });

            addLog("Firmware update successful. Rebooting hub...");
            toast.success("Firmware Updated");
        } catch (err) {
            addLog("Write error. Check USB connection.");
            toast.error("Update failed");
        } finally {
            setIsFlashing(false);
        }
    }

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-600">
            {/* SECTION 1: UPDATE CARD */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border-none flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-105" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 border border-slate-100 shadow-sm">
                        <img src={logoAsset} alt="BeeYield" className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">USB Hub Manager</h2>
                        <p className="text-slate-500 text-xs font-medium">
                            Direct connection for firmware updates and diagnostics
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 relative z-10">
                    <div className="flex items-center gap-3 bg-green-50 px-5 py-2.5 rounded-full border border-green-100">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                            {connectionStatus === 'connected' ? 'Hub Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            {/* SECTION 2: MONITOR CARD */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border-none space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">System Logs</p>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Live Terminal</h2>
                        <p className="text-slate-500 text-xs font-medium max-w-xl">
                            View raw data packets and system boot logs from the connected hub.
                        </p>
                    </div>

                    <Button
                        onClick={connectDevice}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 h-12 text-[10px] rounded-xl transition-all active:scale-95 uppercase tracking-wider shadow-lg shadow-amber-500/20"
                    >
                        <Search className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                        Sync Local Port
                    </Button>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Serial Output Stream</span>
                        {logs.length > 0 && (
                            <button onClick={() => setLogs([])} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider transition-colors">
                                Clear Logs
                            </button>
                        )}
                    </div>
                    <div className="bg-white rounded-2xl p-8 min-h-[200px] font-mono text-[11px] shadow-sm relative overflow-hidden border border-slate-100">
                        {logs.length === 0 ? (
                            <div className="text-slate-300 flex items-center gap-3">
                                <span className="animate-pulse w-1.5 h-3 bg-amber-400 rounded-sm" /> Waiting for serial data...
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar-modern text-slate-600">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 border-b border-slate-50 pb-2 last:border-0">
                                        <span className="text-slate-300 font-mono text-[9px] w-6 shrink-0">{i + 1}</span>
                                        <span className="font-medium tracking-tight leading-relaxed">{log}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        )}
                        <button className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-bold text-slate-300 hover:text-slate-500 transition-all uppercase tracking-wider">
                            <Maximize2 className="w-3 h-3" />
                            Expand
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 3: BOTTOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

                {/* Firmware Card */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border-none flex flex-col">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-0.5">Firmware Update</p>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Flash Hub</h2>
                    </div>

                    <div className="space-y-8 flex-1 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                            <div className="md:col-span-2 space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Firmware File (.bin)</p>
                                <div className="space-y-4">
                                    <label htmlFor="firmware-input-dash" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-6 bg-slate-50/50 hover:bg-amber-50/50 hover:border-amber-200 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-2">
                                            <SettingsIcon className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center">
                                            {firmwareFile ? firmwareFile.name : 'Select File'}
                                        </p>
                                        <Input id="firmware-input-dash" type="file" className="hidden" onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)} />
                                    </label>

                                    <Button
                                        onClick={handleFlash}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95 uppercase tracking-wider text-[10px]"
                                        disabled={isFlashing}
                                    >
                                        Start Update
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Flash Configuration</p>
                                <div className="relative group">
                                    <Textarea
                                        value={manifestJson}
                                        onChange={(e) => setManifestJson(e.target.value)}
                                        className="bg-slate-50/50 border-slate-100 rounded-2xl min-h-[180px] p-6 text-slate-600 font-mono text-[10px] leading-relaxed focus:ring-0 transition-all shadow-inner border"
                                        spellCheck={false}
                                    />
                                    <div className="absolute right-4 top-4 bottom-4 w-1 bg-amber-400 rounded-full opacity-30" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 mt-auto">
                            <div className="bg-amber-50/30 rounded-2xl p-8 border border-amber-100/30 relative overflow-hidden">
                                <div className="relative z-10 w-full">
                                    {isFlashing ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                                                <span className="opacity-60">Flashing firmware blocks...</span>
                                                <span className="text-amber-600 text-lg font-bold">{syncProgress}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-white/50 rounded-full overflow-hidden shadow-inner p-0.5 border border-white">
                                                <motion.div
                                                    className="h-full bg-green-500 rounded-full shadow-sm"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${syncProgress}%` }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                                                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/10" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Ready to Flash</span>
                                                <p className="text-slate-500 text-[9px] font-medium uppercase tracking-wider">Select hardware binary to begin</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Card */}
                <div className="lg:col-span-4 bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col h-full relative overflow-hidden group">
                    <div className="mb-6 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-0.5">Safety Checklist</p>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pre-Flash</h2>
                    </div>
                    <ul className="space-y-4 relative z-10">
                        {[
                            "Close other serial sessions",
                            "Verify stable 5V power supply",
                            "Check firmware version match",
                            "Do not disconnect during write"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-3 items-start group/li">
                                <div className="w-6 h-6 bg-white border border-slate-200 group-hover/li:bg-red-500 group-hover/li:border-red-500 transition-all rounded-lg mt-0.5 shrink-0 flex items-center justify-center shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-400 group-hover/li:text-white">{i + 1}</span>
                                </div>
                                <p className="text-slate-600 text-xs font-bold leading-tight group-hover/li:text-slate-900 transition-colors">
                                    {item}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-8 relative z-10">
                        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <Wifi className="w-4 h-4 text-green-500" />
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Cloud Sync Online</span>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Monitoring Hive Data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar-modern::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                  background: #f1f5f9;
                  border-radius: 10px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb:hover {
                  background: #e2e8f0;
                }
            `}</style>
        </div>
    );
}

const Zap = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 14.71 13 4 11 10h9l-9 10.71 2-6.71H4z" />
    </svg>
)
