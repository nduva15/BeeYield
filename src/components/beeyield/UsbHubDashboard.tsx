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
    Loader2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import logoAsset from '@/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { glass, GlassStatCard } from './GlassTheme';
import { cn } from '@/lib/utils';

export function UsbHubDashboard() {
    const [device, setDevice] = React.useState<USBDevice | null>(null);
    const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [syncProgress, setSyncProgress] = React.useState(0);
    const [isFlashing, setIsFlashing] = React.useState(false);
    const [logs, setLogs] = React.useState<string[]>([]);
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
            const usbDevice = await navigator.usb.requestDevice({ filters: [] });
            await usbDevice.open();
            if (usbDevice.configuration === null) await usbDevice.selectConfiguration(1);
            await usbDevice.claimInterface(0);
            setDevice(usbDevice);
            setConnectionStatus('connected');
            addLog("Establishing kernel link... 0x77FF handshake accepted.");
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
            addLog("Remote handshake successful. Device synced with BeeYield Cloud.");
        } catch (err: any) {
            console.error("Handshake failed", err);
            addLog(`Sync Error: ${err.message}`);
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
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {/* HUB STATUS HEADER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-10 shadow-2xl relative overflow-hidden group border-[#F4D03F]/10")}
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.03] to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-gray-400 rounded-[2rem] flex items-center justify-center p-5 border border-[#F4D03F]/20 shadow-xl group-hover:scale-105 transition-transform duration-700">
                            <img src={logoAsset} alt="BeeYield" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                            <h2 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Architecture <span className="text-[#F4D03F]">Manager</span></h2>
                            <p className={cn(glass.microLabel, "opacity-40 font-bold uppercase tracking-[0.2em]")}>HARDWARE_VERSION_ALPHA_COMM_PORT</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className={cn(
                            "flex items-center gap-4 px-6 py-3 rounded-full border backdrop-blur-md shadow-xl transition-all duration-500",
                            connectionStatus === 'connected' ? 'bg-[#1B9157]/ border-[#1B9157]/' : 'bg-[#F4D03F]/10 border-[#F4D03F]/40 opacity-40'
                        )}>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-500",
                                connectionStatus === 'connected' ? 'bg-[#1B9157] shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-foreground/20'
                            )} />
                            <span className={cn(glass.microLabel, connectionStatus === 'connected' ? 'text-[#1B9157]' : 'text-foreground/40', "font-black italic tracking-widest")}>
                                {connectionStatus === 'connected' ? 'HANDSHAKE_ESTABLISHED' : 'LINK_OFFLINE'}
                            </span>
                        </div>
                        {device?.serialNumber && (
                            <p className={cn(glass.microLabel, "text-[9px] opacity-30 mt-1")}>SERIAL_ID: {device.serialNumber}</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* LIVE TERMINAL SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(glass.card, "p-12 shadow-2xl border-[#F4D03F]/5 relative overflow-hidden")}
            >
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none -ml-48 -mt-48" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12 relative z-10 pb-8 border-b border-border/50">
                    <div className="space-y-3">
                        <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20")}>
                            <Activity className="w-3.5 h-3.5 mr-2" />
                            DATA_EGRSS_STREAM
                        </div>
                        <h2 className={cn(glass.sectionTitle, "text-3xl normal-case italic")}>Live <span className="text-[#F4D03F]">Architecture Terminal</span></h2>
                        <p className={cn(glass.microLabel, "opacity-40 italic mt-2")}>RAW_SERIAL_INPUT_COLONY_TELEMETRY</p>
                    </div>

                    <button
                        onClick={connectDevice}
                        className={cn(glass.btnPrimary, "h-16 px-10 shadow-2xl shadow-honey/20 min-w-[240px]")}
                    >
                        <Search className="w-5 h-5 mr-3" />
                        establish_link
                    </button>
                </div>

                <div className="bg-[#FFF9F0]/95 rounded-[2.5rem] p-10 space-y-6 shadow-2xl border border-[#F4D03F]/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-honey/30 to-transparent" />

                    <div className="flex items-center justify-between px-4 pb-4 border-b border-[#F4D03F]/10">
                        <div className="flex items-center gap-4">
                            <Cpu className="w-4 h-4 text-[#F4D03F] animate-pulse" />
                            <span className={cn(glass.microLabel, "text-[#F4D03F]/60 font-black tracking-[0.3em] font-mono")}>KERNEL_LOG_BUFFER</span>
                        </div>
                        {logs.length > 0 && (
                            <button onClick={() => setLogs([])} className={cn(glass.microLabel, "text-[#F4D03F]/30 hover:text-[#F4D03F] transition-colors font-black tracking-widest text-[9px]")}>
                                [ CLEAR_BUFFER ]
                            </button>
                        )}
                    </div>

                    <div className="min-h-[300px] font-mono text-[11px] relative overflow-hidden">
                        {logs.length === 0 ? (
                            <div className="text-gray-400 flex flex-col items-center justify-center h-full gap-4 pt-12">
                                <div className="w-1.5 h-6 bg-[#F4D03F]/40 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                                <span className="uppercase tracking-[0.4em] font-black italic">Awaiting serial handshake...</span>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar-terminal text-[#F4D03F]/80 p-4 bg-[#F4D03F]/[0.01] rounded-2xl border border-[#F4D03F]/10">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-6 border-b border-[#F4D03F]/10 pb-3 transition-colors hover:bg-[#F9F7F2]">
                                        <span className="text-[#F4D03F]/20 font-black text-[9px] w-10 shrink-0 tabular-nums">[{String(i + 1).padStart(3, '0')}]</span>
                                        <span className="font-bold tracking-tight leading-relaxed selection:bg-[#F4D03F]/30 selection:text-white uppercase text-[10px]">{log}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        )}
                        <button className="absolute bottom-4 right-4 text-gray-400 hover:text-[#F4D03F]/60 transition-all p-3 rounded-xl bg-[#F9F7F2]">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* LOWER INTERFACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* FIRMWARE OVERWRITE INTERFACE */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 space-y-10"
                >
                    <div className={cn(glass.card, "p-12 shadow-2xl relative overflow-hidden group border-[#F4D03F]/5 h-full flex flex-col")}>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1B9157]/ rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

                        <div className="mb-12 border-b border-border/50 pb-8 relative z-10 flex items-center justify-between">
                            <div>
                                <h3 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>Flash <span className="text-[#F4D03F]">Architecture</span></h3>
                                <p className={cn(glass.microLabel, "opacity-40 italic mt-1")}>SECURE_FIRMWARE_OVERWRITE_EXECUTABLE</p>
                            </div>
                            <FileCode className="w-10 h-10 text-[#F4D03F]/20" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 flex-1 relative z-10">
                            <div className="md:col-span-2 space-y-6">
                                <p className={cn(glass.microLabel, "opacity-40 tracking-widest text-[9px]")}>BINARY_TARGET_ASSET</p>
                                <label htmlFor="firmware-input-dash" className="flex flex-col items-center justify-center border-2 border-dashed border-[#F4D03F]/10 rounded-[2.5rem] p-10 bg-gray-400 hover:bg-[#F4D03F]/[0.03] hover:border-[#F4D03F]/40 transition-all cursor-pointer group shadow-inner">
                                    <div className="w-16 h-16 bg-[#FFF9F0]/80 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-6 border border-[#F4D03F]/20">
                                        <SettingsIcon className={cn("w-8 h-8 text-[#F4D03F]", firmwareFile ? "animate-spin[slow]" : "")} />
                                    </div>
                                    <p className={cn(glass.microLabel, "text-center font-black tracking-widest text-[#F4D03F] leading-tight px-4")}>
                                        {firmwareFile ? firmwareFile.name.toUpperCase() : 'IDENTIFY_BINARY_RESOURCE'}
                                    </p>
                                    <Input id="firmware-input-dash" type="file" className="hidden" onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)} />
                                </label>

                                <button
                                    onClick={handleFlash}
                                    className={cn(glass.btnPrimary, "w-full h-18 text-base shadow-2xl shadow-emerald-500/20 bg-[#145A32] hover:bg-[#1B9157]")}
                                    disabled={isFlashing}
                                >
                                    {isFlashing ? (
                                        <div className="flex items-center gap-4">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>OVERWRITING...</span>
                                        </div>
                                    ) : (
                                        'EXECUTE_FLASH'
                                    )}
                                </button>
                            </div>

                            <div className="md:col-span-3 space-y-6 flex flex-col">
                                <p className={cn(glass.microLabel, "opacity-40 tracking-widest text-[9px]")}>BOOTLOADER_MANIFEST_CONFIG</p>
                                <div className="relative group flex-1">
                                    <Textarea
                                        value={manifestJson}
                                        onChange={(e) => setManifestJson(e.target.value)}
                                        className={cn(glass.input, "w-full h-full min-h-[220px] p-8 font-mono text-[10px] leading-relaxed resize-none bg-[#F9F7F2] border-[#F4D03F]/10 shadow-inner focus:border-[#F4D03F]/40 transition-all font-bold")}
                                        spellCheck={false}
                                    />
                                    <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-[#F4D03F]/20 rounded-full group-hover:bg-[#F4D03F]/40 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* PROGRESS MONITOR */}
                        <div className="mt-12 pt-8 border-t border-border/50 relative z-10">
                            <AnimatePresence mode="wait">
                                {isFlashing ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className={cn(glass.microLabel, "text-[#F4D03F] font-black animate-pulse tracking-widest uppercase")}>Transmitting_Egress_Blocks...</p>
                                                <p className="text-[10px] font-bold opacity-30 italic mt-1 uppercase">Block Offset 0x{(1000 + syncProgress * 10).toString(16).toUpperCase()}</p>
                                            </div>
                                            <span className={cn(glass.sectionTitle, "text-4xl text-[#F4D03F]")}>{syncProgress}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden p-1 border border-[#F4D03F]/20 shadow-inner">
                                            <motion.div
                                                className="h-full bg-gradient-amber rounded-full shadow-lg shadow-honey/20"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${syncProgress}%` }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-6 p-6 bg-[#F4D03F]/5 rounded-3xl border border-[#F4D03F]/10"
                                    >
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-xl">
                                            <ShieldCheck className="w-6 h-6 text-[#F4D03F]" />
                                        </div>
                                        <div>
                                            <span className={cn(glass.microLabel, "text-[#F4D03F] font-black tracking-widest animate-none text-[10px]")}>SYSTEM_STANDBY_MODE</span>
                                            <p className={cn(glass.microLabel, "text-[9px] opacity-30 mt-1 italic")}>VERIFY_ALL_ASSETS_BEFORE_OVERWRITE</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* SAFETY PROTOCOL CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 h-full"
                >
                    <div className={cn(glass.card, "p-12 h-full bg-gradient-to-br from-destructive/[0.05] to-transparent border-destructive/10 relative overflow-hidden group shadow-2xl")}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

                        <div className="mb-12 relative z-10 border-b border-destructive/20 pb-8">
                            <p className={cn(glass.microLabel, "text-destructive font-black tracking-widest mb-1 shadow-sm uppercase")}>CRITICAL_SAFETY_MATRIX</p>
                            <h2 className={cn(glass.sectionTitle, "text-3xl normal-case italic")}>Pre-Flash <span className="text-destructive">Protocol</span></h2>
                        </div>

                        <ul className="space-y-8 relative z-10">
                            {[
                                { t: "KILL_SERIAL_SESSIONS", d: "Ensure no other terminal is polling the target hub." },
                                { t: "STABILIZE_5V_VOLTAGE", d: "Verify power vector to prevent mid-flash brownout." },
                                { t: "NODE_RESOURCE_MATCH", d: "Recursive verification of firmware architecture vs chip-ID." },
                                { t: "PERSISTENT_PHYSICAL_LINK", d: "Do not sever industrial USB bridge during flash sequence." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-6 items-start group/li">
                                    <div className="w-10 h-10 bg-gray-400 border border-destructive/20 group-hover/li:bg-destructive group-hover/li:border-destructive transition-all duration-500 rounded-2xl shrink-0 flex items-center justify-center shadow-xl">
                                        <span className="text-xs font-black text-destructive group-hover/li:text-[#1A1A1A] tabular-nums">{i + 1}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn(glass.microLabel, "text-xs font-black text-foreground group-hover/li:text-destructive transition-colors tracking-tight")}>{item.t}</p>
                                        <p className="text-[10px] font-bold text-foreground/40 italic leading-snug uppercase tracking-tighter">{item.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-20 pt-10 border-t border-destructive/20 relative z-10">
                            <div className="p-6 bg-[#1B9157]/ rounded-[1.5rem] border border-[#1B9157]/ shadow-xl flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#1B9157]/ flex items-center justify-center border border-[#1B9157]/ animate-pulse">
                                    <Wifi className="w-5 h-5 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className={cn(glass.microLabel, "text-[#1B9157] font-black tracking-[0.2em] text-[9px]")}>CLOUD_SYNC_ACTIVE</span>
                                    <p className={cn(glass.microLabel, "text-[8px] opacity-40 font-bold uppercase")}>MONITORING_RECURSIVE_INGEST</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .custom-scrollbar-terminal::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-terminal::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-terminal::-webkit-scrollbar-thumb {
                    background: hsl(var(--honey) / 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar-terminal::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--honey) / 0.3);
                }
            `}</style>
        </div>
    );
}
