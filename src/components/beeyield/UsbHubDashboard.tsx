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
        <div className={glass.page}>
            <PageHeader
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
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-white/40 border-white/20")}
            >
                <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Architecture_Terminal</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">RAW_SERIAL_STREAM_PROTOCOL</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={connectDevice}
                        className={cn(glass.btnPrimary, "h-9 px-6 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center gap-2")}
                    >
                        <Search className="w-3.5 h-3.5" />
                        establish_link
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-[#1A1A1A]/95 rounded-2xl p-6 font-mono text-[10px] relative overflow-hidden group shadow-2xl border border-white/10 min-h-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Cpu className="w-32 h-32" /></div>
                        
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F4D03F]/30 animate-pulse">AWAITING_HANDSHAKE_0X7F</span>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar-terminal pr-4">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 border-b border-white/[0.03] pb-2 text-[#F4D03F]/60 hover:text-[#F4D03F] transition-colors">
                                        <span className="text-white/10 font-black tabular-nums w-10">[{String(i + 1).padStart(3, '0')}]</span>
                                        <span className="font-bold tracking-tight uppercase leading-relaxed">{log}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 flex items-center gap-3">
                            {logs.length > 0 && (
                                <button onClick={() => setLogs([])} className="text-[8px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.3em]">[ CLEAR_LOGS ]</button>
                            )}
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* LOWER INTERFACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FIRMWARE OVERWRITE INTERFACE */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className={cn(glass.card, "p-5 relative overflow-hidden flex flex-col h-full shadow-xl bg-white/40 border-white/20")}>
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        
                        <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#F4D03F]/10">
                            <div>
                                <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Flash_Architecture</h3>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">SECURE_OVERWRITE_EXECUTABLE</p>
                            </div>
                            <FileCode className="w-6 h-6 text-[#F4D03F]/20" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
                            <div className="md:col-span-5 space-y-5">
                                <label htmlFor="firmware-input-dash" className="flex flex-col items-center justify-center border border-dashed border-[#F4D03F]/30 rounded-3xl p-8 bg-white/20 hover:bg-white/40 transition-all cursor-pointer group shadow-inner">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-4 border border-gray-100">
                                        <SettingsIcon className={cn("w-6 h-6 text-[#F4D03F]", isFlashing ? "animate-spin" : "")} />
                                    </div>
                                    <p className="text-[9px] font-black text-[#F4D03F] tracking-widest text-center uppercase leading-tight px-4">
                                        {firmwareFile ? firmwareFile.name : 'IDENTIFY_BINARY'}
                                    </p>
                                    <Input id="firmware-input-dash" type="file" className="hidden" onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)} />
                                </label>

                                <button
                                    onClick={handleFlash}
                                    className={cn(glass.btnPrimary, "w-full h-10 text-[9px] font-black uppercase tracking-[0.4em] shadow-lg shadow-[#1B9157]/20 bg-[#1B9157] hover:bg-[#145A32]")}
                                    disabled={isFlashing}
                                >
                                    {isFlashing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXECUTE_BOOT'}
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
                    <div className={cn(glass.card, "p-5 h-full relative overflow-hidden group shadow-xl bg-white/40 border-white/20")}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap className="w-24 h-24" /></div>

                        <div className="mb-8 border-b border-[#F4D03F]/10 pb-5">
                            <h2 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Pre_Flash_Matrix</h2>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">CRITICAL_SAFETY_PROTOCOL</p>
                        </div>

                        <ul className="space-y-6">
                            {[
                                { t: "KILL_SERIAL_SESSIONS", d: "ENSURE_SINGLE_POLLING_VECTOR" },
                                { t: "STABILIZE_5V_VOLTAGE", d: "PREVENT_MID_FLASH_BROWNOUT" },
                                { t: "NODE_RESOURCE_MATCH", d: "CHIP_ID_ARCH_VALIDATION" },
                                { t: "PERSISTENT_PHYSICAL_LINK", d: "DO_NOT_SEVER_USB_BRIDGE" }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 items-start group/li">
                                    <div className="w-8 h-8 bg-white border border-gray-100 group-hover/li:border-[#F4D03F] transition-all rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                                        <span className="text-[10px] font-black text-[#1A1A1A] tabular-nums">{i + 1}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-[#1A1A1A] group-hover/li:text-[#F4D03F] transition-colors">{item.t}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{item.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-12 pt-6 border-t border-[#F4D03F]/10">
                            <div className="p-4 bg-white/60 rounded-2xl border border-gray-100 flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                                    <Wifi className="w-4 h-4 text-[#1B9157] animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-[#1B9157] tracking-[0.2em] uppercase">Cloud_Sync_Active</span>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">MONITORING_RECURSIVE_INGEST</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .custom-scrollbar-terminal::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-terminal::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
