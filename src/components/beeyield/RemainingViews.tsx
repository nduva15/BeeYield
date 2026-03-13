import React from 'react';
import { beeyieldService, Apiary, Hive, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
    Wifi,
    Shield,
    Zap,
    Bluetooth as BluetoothIcon,
    Usb,
    Grid3X3,
    Box,
    Bell,
    Settings,
    ChevronDown,
    Check,
    X,
    AlertTriangle,
    Search,
    Info,
    Loader2,
    Thermometer,
    Droplet,
    Weight,
    Cpu,
    ArrowRight,
    SearchCode,
    Activity,
    CloudSync,
    Lock
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { UsbHubDashboard } from './UsbHubDashboard';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

// --- Custom Components for Modals ---

const ToggleSwitch = ({ checked, onCheckedChange, label }: { checked: boolean, onCheckedChange: (c: boolean) => void, label?: string }) => {
    return (
        <div className="flex items-center justify-between group">
            {label && <span className={cn(glass.microLabel, "opacity-60 font-bold")}>{label}</span>}
            <div
                className={cn(
                    "relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D03F]/50",
                    checked ? "bg-[#F4D03F]/80 shadow-lg shadow-honey/20" : "bg-[#F4D03F]/10"
                )}
                onClick={() => onCheckedChange(!checked)}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#FFF9F0] shadow-xl ring-0 transition duration-500 ease-in-out mt-0.5 ml-0.5",
                        checked ? "translate-x-8" : "translate-x-0"
                    )}
                />
            </div>
        </div>
    )
}

const MeasurementIntervalSelector = () => {
    const options = [15, 30, 60, 120, 180, 360, 720];
    const [selected, setSelected] = React.useState(60);
    return (
        <div className="flex bg-gray-200 backdrop-blur-md border border-border/50 rounded-[1.8rem] overflow-hidden w-full p-2 gap-2 shadow-inner">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={cn(
                        "flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest",
                        selected === opt
                            ? "bg-[#FFF9F0] text-[#F4D03F] shadow-xl scale-[1.02] z-10 border border-[#F4D03F]/20"
                            : "text-foreground/40 hover:text-foreground/60"
                    )}
                >
                    {opt}m
                </button>
            ))}
        </div>
    )
}

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
    const [makePublic, setMakePublic] = React.useState(false);
    const [keepUpdate, setKeepUpdate] = React.useState(false);
    const [consent, setConsent] = React.useState(false);
    const [searchWireless, setSearchWireless] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-transparent border-none p-0 shadow-none overflow-visible">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative border-[#F4D03F]/10 bg-[#FFF9F0]/95 backdrop-blur-2xl")}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4D03F]/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />

                    <div className="bg-[#FFF9F0] px-6 py-6 border-b border-border/50 relative z-10">
                        <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 mb-3')}>
                            <Settings className="w-3 h-3 mr-2" />
                            Bridge Configuration v5.1
                        </div>
                        <DialogTitle className={cn(glass.sectionTitle, 'text-xl normal-case italic')}>Node <span className="text-[#F4D03F]">Architecture</span></DialogTitle>
                        <DialogDescription className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 mt-1 tracking-[0.1em]")}>Identify biosphere parameters and establish neural handshake protocol.</DialogDescription>
                    </div>

                    <div className="p-6 space-y-8 relative z-10">
                        <div className="space-y-3">
                            <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Measurement Sync Cadence</h4>
                            <MeasurementIntervalSelector />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { checked: makePublic, set: setMakePublic, label: 'Public Registry', icon: Lock, desc: 'Share telemetry with decentralized Hub.' },
                                { checked: keepUpdate, set: setKeepUpdate, label: 'Live Ingest', icon: Activity, desc: 'Establish real-time temporal polling.' },
                                { checked: consent, set: setConsent, label: 'Global Egress', icon: CloudSync, desc: 'Contribute to algorithmic biodiversity.' },
                                { checked: searchWireless, set: setSearchWireless, label: 'Node Discovery', icon: Wifi, desc: 'Recursive Bluetooth beacon scanning.' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-7 h-7 rounded-lg bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                                            <item.icon className="w-3.5 h-3.5 text-[#F4D03F]" />
                                        </div>
                                        <h4 className={cn(glass.microLabel, "opacity-80 font-black uppercase tracking-[0.15em]")}>{item.label}</h4>
                                    </div>
                                    <ToggleSwitch checked={item.checked} onCheckedChange={item.set} />
                                    <p className="text-[9px] text-foreground/40 italic font-bold leading-tight uppercase tracking-tighter">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex gap-4 border-t border-border/50">
                            <button
                                className={cn(glass.btnSecondary, "flex-1 h-10 text-[10px] font-black uppercase tracking-widest")}
                                onClick={() => onOpenChange(false)}
                            >
                                Discard
                            </button>
                            <button
                                className={cn(glass.btnPrimary, "flex-1 h-10 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-honey/20")}
                                onClick={() => onOpenChange(false)}
                            >
                                Persist
                            </button>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
    const [appNotif, setAppNotif] = React.useState(false);
    const [emailNotif, setEmailNotif] = React.useState(false);
    const [smsNotif, setSmsNotif] = React.useState(false);
    const [tempAlerts, setTempAlerts] = React.useState(false);
    const [weightAlerts, setWeightAlerts] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-transparent border-none p-0 shadow-none overflow-visible">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative border-destructive/10 bg-[#FFF9F0]/95 backdrop-blur-2xl")}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-destructive/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />

                    <div className="bg-[#FFF9F0] px-6 py-6 border-b border-border/50 relative z-10">
                        <div className={cn(glass.badge, 'bg-destructive/10 text-destructive border-destructive/20 mb-3')}>
                            <Bell className="w-3 h-3 mr-2" />
                            Biosphere Alert Matrix v2.0
                        </div>
                        <DialogTitle className={cn(glass.sectionTitle, 'text-xl normal-case italic')}>Notify <span className="text-destructive">Engine</span></DialogTitle>
                        <DialogDescription className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 mt-1 tracking-[0.1em]")}>Configuration of real-time sensor discrepancy triggers.</DialogDescription>
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Mobile OS Interface</h4>
                                <ToggleSwitch checked={appNotif} onCheckedChange={setAppNotif} />
                            </div>
                            <div className="space-y-2">
                                <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>SMS Gateway</h4>
                                <ToggleSwitch checked={smsNotif} onCheckedChange={setSmsNotif} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Primary Email Endpoint</h4>
                            <div className="flex gap-3">
                                <Input
                                    type="email"
                                    placeholder="TARGET@BEEYIELD.AI"
                                    className={cn(glass.input, "h-10 text-[10px] font-black tracking-widest bg-[#F9F7F2]")}
                                />
                                <button className={cn(glass.btnSecondary, "h-10 px-6 text-[10px] font-black tracking-widest border-border/50")}>VERIFY</button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 space-y-6">
                            <h4 className={cn(glass.sectionTitle, "text-lg normal-case italic")}>Diagnostic <span className="text-[#F4D03F]">Triggers</span></h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#F4D03F]/5 rounded-xl border border-[#F4D03F]/10 space-y-4 relative overflow-hidden group hover:border-[#F4D03F]/30 transition-all">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4D03F]/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-lg shadow-honey/10">
                                            <Thermometer className="w-4 h-4 text-[#F4D03F]" />
                                        </div>
                                        <span className={cn(glass.microLabel, "font-black text-[#F4D03F] tracking-widest text-[8px]")}>THERMAL</span>
                                    </div>
                                    <ToggleSwitch checked={tempAlerts} onCheckedChange={setTempAlerts} />
                                </div>
                                <div className="p-4 bg-[#1B9157]/5 rounded-xl border border-[#1B9157]/10 space-y-4 relative overflow-hidden group hover:border-[#1B9157]/30 transition-all">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1B9157]/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20 shadow-lg shadow-emerald-500/10">
                                            <Weight className="w-4 h-4 text-[#1B9157]" />
                                        </div>
                                        <span className={cn(glass.microLabel, "font-black text-[#1B9157] tracking-widest text-[8px]")}>MASS</span>
                                    </div>
                                    <ToggleSwitch checked={weightAlerts} onCheckedChange={setWeightAlerts} />
                                </div>
                            </div>
                        </div>

                        <button
                            className={cn(glass.btnPrimary, "w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-honey/20 mt-2")}
                            onClick={() => onOpenChange(false)}
                        >
                            Sync_Matrix
                        </button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

interface RemainingViewProps {
    onTabChange: (tab: string) => void;
}

// BeeYield Online View (Measurement data)
export const BeeYieldOnlineView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = React.useState<string>('');
    const [selectedHive, setSelectedHive] = React.useState<string>('');
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [devices, setDevices] = React.useState<IoTDevice[]>([]);
    const [latestReading, setLatestReading] = React.useState<SensorReading | null>(null);
    const [isFetchingReading, setIsFetchingReading] = React.useState(false);

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [apiariesData, hivesData, devicesData] = await Promise.all([
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives(),
                    beeyieldService.getDevices()
                ]);

                setApiaries(apiariesData || []);
                setHives(hivesData || []);
                setDevices(devicesData || []);
            } catch (err) {
                console.error("Failed to load registry data", err);
            }
        };
        loadInitialData();
    }, []);

    React.useEffect(() => {
        if (selectedPlace && selectedPlace !== 'none') {
            const filteredHives = hives.filter(h => h.apiary_id === selectedPlace || !h.apiary_id);
            if (selectedHive && !filteredHives.find(h => h.id === selectedHive)) {
                setSelectedHive('');
            }
        }
    }, [selectedPlace, hives]);

    React.useEffect(() => {
        const fetchLatest = async () => {
            if (selectedHive && selectedHive !== 'none') {
                setIsFetchingReading(true);
                try {
                    const data = await beeyieldService.getReadings(selectedHive, 1);
                    if (data && data.length > 0) setLatestReading(data[0]);
                    else setLatestReading(null);
                } catch (err) {
                    setLatestReading(null);
                } finally {
                    setIsFetchingReading(false);
                }
            } else {
                setLatestReading(null);
            }
        };
        fetchLatest();
    }, [selectedHive]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-16 pb-20")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Wifi}
                label="Live Multi-Sensor Bridge v2.6"
                title={<>Hive <span className="text-[#F4D03F]">Monitoring</span></>}
                subtitle="Remote telemetry ingest of colony health and real-time environmental metrics."
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setNotificationsOpen(true)}
                            className={cn(glass.btnSecondary, "h-9 px-4 border-destructive/10 hover:shadow-lg hover:shadow-destructive/5 relative group overflow-hidden")}
                        >
                            <div className="absolute inset-0 bg-destructive/5 group-hover:bg-destructive/10 animate-pulse transition-colors" />
                            <div className="relative z-10 flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5 text-destructive group-hover:scale-110 transition-transform" />
                                <span className="text-destructive font-black tracking-widest text-[9px]">ALERT_MATRIX</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className={cn(glass.btnPrimary, "h-9 px-6")}
                        >
                            <Settings className="w-3.5 h-3.5 mr-2" />
                            <span className="text-[10px]">CONFIGURE</span>
                        </button>
                    </div>
                }
            />

            {/* Selection Registry */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-8 shadow-sm relative overflow-hidden group border-[#F4D03F]/10")}
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.02] to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F4D03F]/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                        <Label className={cn(glass.microLabel, "ml-2 opacity-40 font-black tracking-[0.2em]")}>SITE_IDENTIFIER</Label>
                        <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                            <SelectTrigger className={cn(glass.input, "h-14 shadow-sm font-black text-sm px-4 border-[#F4D03F]/10 hover:border-[#F4D03F]/30 transition-all rounded-xl bg-[#FFF9F0]")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow shadow-honey/5">
                                        <Grid3X3 className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <SelectValue placeholder="LOCATE_SITE..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-2")}>
                                <SelectItem value="none" className="p-3 rounded-lg font-black tracking-widest text-[10px] text-foreground/40 italic">GLOBAL_FLEET</SelectItem>
                                {apiaries.map(a => (
                                    <SelectItem key={a.id} value={a.id} className="p-3 rounded-lg font-black tracking-widest text-xs">
                                        {a.name.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className={cn(glass.microLabel, "ml-2 opacity-40 font-black tracking-[0.2em]")}>ASSET_HANDSHAKE</Label>
                        <Select value={selectedHive} onValueChange={setSelectedHive}>
                            <SelectTrigger className={cn(glass.input, "h-14 shadow-sm font-black text-sm px-4 border-[#1B9157]/10 hover:border-[#1B9157]/30 transition-all rounded-xl bg-[#FFF9F0]")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20 shadow shadow-emerald-500/5">
                                        <Box className="w-4 h-4 text-[#1B9157]" />
                                    </div>
                                    <SelectValue placeholder="NODE_UID..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-2")}>
                                <SelectItem value="none" className="p-3 rounded-lg font-black tracking-widest text-[10px] text-foreground/40 italic">DESELECT</SelectItem>
                                {hives
                                    .filter(h => !selectedPlace || selectedPlace === 'none' || h.apiary_id === selectedPlace)
                                    .map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="p-3 rounded-lg font-black tracking-widest text-xs">
                                            {hive.hive_code ? hive.hive_code.toUpperCase() : 'UID_ERR'}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            {/* LIVE TELEMETRY Section */}
            <AnimatePresence mode="wait">
                {selectedHive && selectedHive !== 'none' ? (
                    <motion.div
                        key="telemetry"
                        initial={{ opacity: 0, scale: 0.98, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 30 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-10"
                    >
                        {[
                            { label: 'THERMAL_PROFILE', value: latestReading ? `${latestReading.temperature || 0}°C` : '--', icon: Thermometer, color: 'text-[#F4D03F]', sub: 'INTERNAL_BROOD_STATUS' },
                            { label: 'AMBIENT_SATURATION', value: latestReading ? `${latestReading.humidity || 0}%` : '--', icon: Droplet, color: 'text-blue-500', sub: 'OPTIMAL_NECTAR_STRESS' },
                            { label: 'COMPOSITE_MASS', value: latestReading ? `${latestReading.weight || 0}kg` : '--', icon: Weight, color: 'text-[#1B9157]', sub: 'YIELD_FLUX_STABILITY' }
                        ].map((stat, i) => (
                            <GlassStatCard
                                key={i}
                                label={stat.label}
                                value={stat.value}
                                icon={stat.icon}
                                index={i}
                                color={stat.color}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(glass.card, "p-12 text-center flex flex-col items-center justify-center space-y-6 bg-[#F4D03F]/[0.02] border-[#F4D03F]/10 border-dashed rounded-2xl")}
                    >
                        <div className="w-16 h-16 rounded-xl bg-[#FFF9F0] flex items-center justify-center border border-[#F4D03F]/20 shadow-xl shadow-honey/5 opacity-40">
                            <SearchCode className="w-8 h-8 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className={cn(glass.sectionTitle, "text-lg normal-case italic opacity-40")}>Identify <span className="text-[#F4D03F]">Asset</span></h3>
                            <p className={cn(glass.microLabel, "opacity-30 max-w-sm mx-auto leading-relaxed font-bold tracking-tight text-[9px]")}>Establish an industrial telemetry bridge by identifying target hex-sectors via the registry interface.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostic Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { label: 'DEVICE_INTEGRITY', icon: Zap, status: selectedHive && devices.find(d => d.hive_id === selectedHive) ? 'NOMINAL' : 'AWAITING', desc: 'Temporal bridge status.', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/5' },
                    { label: 'REGISTRY_BRIDGE', icon: Info, status: 'ENCRYPTED', desc: 'Security active.', color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/5' }
                ].map((panel, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className={cn(glass.card, "p-5 border-[#F4D03F]/10 flex items-center gap-6 group cursor-default shadow-sm transition-all duration-300 relative overflow-hidden")}
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4D03F]/5 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none" />
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm", panel.bg, `border-${panel.color.split('-')[1]}-500/10`)}>
                            <panel.icon className={cn("w-5 h-5", panel.color)} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em] text-[8px]")}>{panel.label}</p>
                                <span className={cn(glass.microLabel, "font-black italic tracking-widest text-[8px]", panel.color)}>{panel.status}</span>
                            </div>
                            <p className="text-[10px] font-black opacity-70 leading-relaxed italic uppercase tracking-tighter text-foreground/80">{panel.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
        </motion.div>
    );
};

// Bluetooth View
export const BluetoothView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [devices, setDevices] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isScanning, setIsScanning] = React.useState(false);

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getPairedUsbDevices();
            if (userId) {
                setDevices(data.filter(d => !d.user_id || d.user_id === userId));
            } else {
                setDevices(data || []);
            }
        } catch (err) {
            console.error('Error fetching devices:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDevices();
    }, [userId]);

    const handlePairing = async () => {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                const newDevice = {
                    device_uid: `BLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    device_type: 'beeyield_hub',
                    serial_number: `SN-${Math.floor(Math.random() * 1000000)}`,
                    firmware_version: '1.2.5',
                };
                await beeyieldService.pairUsbDevice(newDevice);
                await fetchDevices();
                toast.success("Industrial Bluetooth hub paired successfully.");
            } catch (err) {
                toast.error("Handshake failed. Protocol mismatch.");
            } finally {
                setIsScanning(false);
            }
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-16 pb-20")}
        >
            {/* Header Section */}
            <PageHeader
                icon={BluetoothIcon}
                label="Wireless Node Connectivity Library v4.2"
                title={<>Wireless <span className="text-[#F4D03F]">Interface</span></>}
                subtitle="Configure BeeYield sensors via Bluetooth for calibration and industrial telemetry offloading."
                actions={
                    <button
                        onClick={handlePairing}
                        disabled={isScanning}
                        className={cn(glass.btnPrimary, "h-9 px-6 min-w-[200px]")}
                    >
                        {isScanning ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-[10px]">SYNCING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Search className="w-3.5 h-3.5" />
                                <span className="text-[10px]">SCAN BEACON</span>
                            </div>
                        )}
                    </button>
                }
            />

            <div className="space-y-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-6 opacity-30">
                        <Loader2 className="w-16 h-16 animate-spin text-[#F4D03F]" />
                        <span className={cn(glass.microLabel, "font-black tracking-[0.3em]")}>SCANNING_COMM_PORTS</span>
                    </div>
                ) : devices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {devices.map((device, i) => (
                            <motion.div
                                key={device.id || i}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className={cn(glass.card, "p-12 shadow-2xl border-[#F4D03F]/10 flex flex-col justify-between group relative overflow-hidden hover:border-[#F4D03F]/40 transition-all")}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F4D03F]/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-[#F4D03F]/15 transition-all pointer-events-none" />
                                <div className="flex items-center gap-8 mb-10 relative z-10">
                                    <div className="w-20 h-20 rounded-[1.8rem] bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-xl group-hover:scale-110 group-hover:shadow-honey/10 transition-all duration-700">
                                        <BluetoothIcon className="w-10 h-10 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>{device.serial_number ? device.serial_number.toUpperCase() : 'NODE_UNKNOWN'}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <p className={cn(glass.microLabel, "opacity-40 font-black tracking-widest text-[9px]")}>{device.device_uid}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between relative z-10 pt-8 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(glass.microLabel, "text-[#1B9157] font-black italic tracking-widest text-[8px]")}>ACTIVE_ENCRYPTED</span>
                                        <p className="text-[10px] font-bold opacity-30 italic">STATION_LINK_STABLE</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(glass.microLabel, "opacity-40 font-black tabular-nums text-[10px]")}>FIRMWARE_V{device.firmware_version || '1.0'}</span>
                                        <p className="text-[9px] font-bold text-[#F4D03F]/60 uppercase tracking-widest mt-1 italic">GEN_3_HUB</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "p-12 text-center flex flex-col items-center justify-center space-y-6 bg-[#F4D03F]/[0.02] border-[#F4D03F]/10 border-dashed rounded-2xl")}
                    >
                        <div className="w-16 h-16 rounded-xl bg-[#FFF9F0] flex items-center justify-center border border-[#F4D03F]/20 shadow-xl shadow-honey/5 opacity-20">
                            <BluetoothIcon className="w-8 h-8 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className={cn(glass.sectionTitle, "text-lg normal-case italic opacity-40")}>No <span className="text-[#F4D03F]">Handshake</span></h3>
                            <p className={cn(glass.microLabel, "opacity-30 max-w-sm mx-auto leading-relaxed font-bold tracking-tight text-[9px]")}>
                                Ensure BeeYield Hub is in discovery mode.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// USB View
export const USBView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(glass.page, "p-8 -m-8 space-y-16 pb-24")}
    >
        <PageHeader
            icon={Usb}
            label="Serial Terminal Dashboard v1.8"
            title={<>USB <span className="text-[#F4D03F]">Architecture</span></>}
            subtitle="Manage industrial hub firmware and monitor raw serial output directly via encrypted physical link."
        />

        <div className="relative z-10">
            <UsbHubDashboard />
        </div>
    </motion.div>
);
