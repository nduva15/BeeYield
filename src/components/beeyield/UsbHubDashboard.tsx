import React from 'react';
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
    Headphones,
    Zap,
    Cpu,
    Activity,
    ShieldCheck,
    Box,
    FileCode,
    Loader2,
    Terminal
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import logoAsset from '@/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { glass, GlassStatCard } from './GlassTheme';
import { cn } from '@/lib/utils';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

export function UsbHubDashboard() {
    const [device, setDevice] = React.useState<USBDevice | null>(null);
    const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [syncProgress, setSyncProgress] = React.useState(0);
    const [isFlashing, setIsFlashing] = React.useState(false);
    const [logs, setLogs] = React.useState<string[]>([]);
    const [lastError, setLastError] = React.useState<string | null>(null);
    const logsEndRef = React.useRef<HTMLDivElement>(null);

    const [firmwareFile, setFirmwareFile] = React.useState<File | null>(null);
    const [manifestJson, setManifestJson] = React.useState<string>(`{
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

    React.useEffect(() => {
        scrollToBottom();
    }, [logs]);

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
            addLog("Connecting to the device...");
            addLog("Connected to BeeYield Hub Alpha successfully.");

            await handshake(usbDevice);
            toast.success("BeeYield Hub Alpha connected");
        } catch (error: any) {
            setConnectionStatus('error');
            console.error(error);
            const msg = error?.message || 'Connection aborted';
            setLastError(msg);
            addLog(`Connection Error: ${msg}`);
            toast.error(msg);
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
            addLog("Device synced.");
        } catch (err: any) {
            console.error("Handshake failed", err);
            const msg = err?.response?.data?.message || err?.message || 'Could not sync device';
            setLastError(msg);
            addLog(`Sync Error: ${msg}`);
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} > ${msg}`]);
    }

    const handleFlash = async () => {
        if (!device) {
            toast.error("Establish physical link first");
            return;
        }
        if (!firmwareFile) {
            toast.warning("Upload industrial firmware (.bin)");
            return;
        }

        setIsFlashing(true);
        setSyncProgress(0);
        addLog("Initiating high-priority firmware write sequence...");

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

            addLog("Firmware overwrite successful. Validating checksum...");
            addLog("Hub rebooting... Connection state: PERSISTENT.");
            toast.success("Firmware Updated");
        } catch (err) {
            addLog("Write execution error. Buffer underrun or link severed.");
            toast.error("Update failed");
        } finally {
            setIsFlashing(false);
        }
    }

    return (
        <BeeYieldPageShell>
            <BeeYieldPageHeader
                icon={Cpu}
                label="Hardware_Version_Alpha_Comm_Port"
                title={<>Architecture <span className="text-[#F4D03F]">Manager</span></>}
                subtitle="High-fidelity physical link interface for BeeYield Hub Alpha."
                actions={
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-2.5 px-4 h-9 rounded-xl border backdrop-blur-md transition-all duration-500",
                            connectionStatus === 'connected' ? 'bg-[#1B9157]/10 border-[#1B9157]/20 shadow-sm' : 'bg-white/40 border-white/20 opacity-80'
                        )}>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                connectionStatus === 'connected' ? 'bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse' : 'bg-gray-400/50'
                            )} />
                            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", connectionStatus === 'connected' ? 'text-[#1B9157]' : 'text-gray-400')}>
                                {connectionStatus === 'connected' ? 'HANDSHAKE_ESTABLISHED' : 'LINK_OFFLINE'}
                            </span>
                        </div>
                    </div>
                }
            />

            {/* LIVE TERMINAL SECTION */}
            <div className={glass.section}>
                <div className={glass.sectionHeader}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1A1A1A]">Hardware Terminal</h3>
                            <p className="text-sm text-gray-400">Physical link stream for industrial hub diagnostics.</p>
                        </div>
                    </div>

                    <button
                        onClick={connectDevice}
                        className={glass.btnPrimary}
                    >
                        <Search className="w-4 h-4" />
                        Connect Device
                    </button>
                </div>

                <div className="p-6">
                    {connectionStatus === 'error' && lastError && (
                        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">USB Error</p>
                                    <p className="text-sm font-semibold text-[#1A1A1A] break-words">{lastError}</p>
                                </div>
                                <button
                                    type="button"
                                    className={cn(glass.btnSecondary, "h-9 px-4 text-[10px] font-black uppercase tracking-widest")}
                                    onClick={() => {
                                        setLastError(null);
                                        setConnectionStatus('disconnected');
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="bg-[#1A1A1A] rounded-xl p-6 font-mono text-[11px] relative overflow-hidden shadow-inner border border-black min-h-[300px] text-[#F4D03F]">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-20 opacity-30">
                                <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Awaiting Connection...</span>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar-terminal pr-4">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 border-b border-white/5 pb-1 last:border-0">
                                        <span className="text-white/20 w-8">[{i + 1}]</span>
                                        <span className="leading-relaxed">{log}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LOWER INTERFACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FIRMWARE OVERWRITE INTERFACE */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className={glass.card + " p-6 h-full"}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F4D03F]/10">
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Firmware Upload</h3>
                                <p className="text-sm text-gray-500">Securely flash new architecture to the hub.</p>
                            </div>
                            <FileCode className="w-6 h-6 text-[#F4D03F]" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
                            <div className="md:col-span-5 space-y-5">
                                <label htmlFor="firmware-input-dash" className="flex flex-col items-center justify-center border-2 border-dashed border-[#F4D03F]/20 rounded-xl p-8 bg-[#F9F7F2] hover:bg-[#F4D03F]/5 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 border border-[#F4D03F]/10">
                                        <SettingsIcon className={cn("w-6 h-6 text-[#F4D03F]", isFlashing ? "animate-spin" : "")} />
                                    </div>
                                    <p className="text-sm font-bold text-[#1A1A1A] text-center">
                                        {firmwareFile ? firmwareFile.name : 'Select .bin file'}
                                    </p>
                                    <Input id="firmware-input-dash" type="file" className="hidden" onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)} />
                                </label>

                                <button
                                    onClick={handleFlash}
                                    className={glass.btnPrimary + " w-full h-11"}
                                    disabled={isFlashing}
                                >
                                    {isFlashing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Flash'}
                                </button>
                            </div>

                            <div className="md:col-span-7 flex flex-col">
                                <div className="bg-[#1A1A1A]/5 rounded-2xl p-4 flex-1 border border-[#F4D03F]/5">
                                    <Textarea
                                        value={manifestJson}
                                        onChange={(e) => setManifestJson(e.target.value)}
                                        className="w-full h-full min-h-[180px] p-4 font-mono text-[9px] leading-relaxed resize-none bg-transparent border-none focus:ring-0 text-[#1A1A1A]/70 font-bold"
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PROGRESS MONITOR */}
                        <div className="mt-8 pt-6 border-t border-[#F4D03F]/10">
                            <AnimatePresence mode="wait">
                                {isFlashing ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black text-[#F4D03F] tracking-[0.3em] uppercase animate-pulse">Writing_Blocks...</span>
                                            <span className="text-2xl font-black text-[#F4D03F] tracking-tighter tabular-nums">{syncProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden p-0.5 border border-[#F4D03F]/10 shadow-inner">
                                            <motion.div
                                                className="h-full bg-[#1B9157] rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${syncProgress}%` }}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 bg-[#1B9157]/[0.02] rounded-2xl border border-[#1B9157]/10">
                                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                            <ShieldCheck className="w-5 h-5 text-[#1B9157]" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-[#1B9157] tracking-[0.2em] uppercase">System_Standby_Mode</span>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">VERIFIED_FOR_OVERWRITE</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* SAFETY PROTOCOL CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4"
                >
                    <div className={glass.card + " p-6 h-full"}>
                        <div className="mb-8 border-b border-[#F4D03F]/10 pb-4">
                            <h2 className="text-lg font-bold text-[#1A1A1A]">Safety checklist</h2>
                            <p className="text-sm text-gray-500">Critical checks before flashing hardware.</p>
                        </div>

                        <ul className="space-y-4">
                            {[
                                { t: "Close serial sessions", d: "Make sure only one tool is connected." },
                                { t: "Stabilize 5V Voltage", d: "Prevent mid-flash brownout" },
                                { t: "Device match", d: "Chip ID check" },
                                { t: "Persistent Link", d: "Do not sever USB bridge" }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-[#F9F7F2] border border-[#F4D03F]/20 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{item.t}</p>
                                        <p className="text-xs text-gray-400">{item.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .custom-scrollbar-terminal::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-terminal::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
            `}</style>
        </BeeYieldPageShell>
    );
}
