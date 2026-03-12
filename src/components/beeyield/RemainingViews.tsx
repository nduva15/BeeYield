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
                    "relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey/50",
                    checked ? "bg-honey/80 shadow-lg shadow-honey/20" : "bg-white/10"
                )}
                onClick={() => onCheckedChange(!checked)}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-xl ring-0 transition duration-500 ease-in-out mt-0.5 ml-0.5",
                        checked ? "translate-x-10" : "translate-x-0"
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
        <div className="flex bg-white/20 backdrop-blur-md border border-border/50 rounded-[1.8rem] overflow-hidden w-full p-2 gap-2 shadow-inner">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={cn(
                        "flex-1 py-4 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                        selected === opt
                            ? "bg-white text-honey shadow-xl scale-[1.05] z-10 border border-honey/20"
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
                    className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative border-honey/10 bg-white/95 backdrop-blur-2xl")}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-honey/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />

                    <div className="bg-white/40 px-12 py-12 border-b border-border/50 relative z-10">
                        <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 mb-6')}>
                            <Settings className="w-3.5 h-3.5 mr-2" />
                            Bridge Configuration v5.1
                        </div>
                        <DialogTitle className={cn(glass.sectionTitle, 'text-4xl normal-case italic')}>Node <span className="text-honey">Architecture</span></DialogTitle>
                        <DialogDescription className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 mt-3 tracking-[0.1em]")}>Identify biosphere parameters and establish neural handshake protocol.</DialogDescription>
                    </div>

                    <div className="p-12 space-y-14 relative z-10">
                        <div className="space-y-6">
                            <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Measurement Sync Cadence</h4>
                            <MeasurementIntervalSelector />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[
                                { checked: makePublic, set: setMakePublic, label: 'Public Registry', icon: Lock, desc: 'Share telemetry with decentralized Hub.' },
                                { checked: keepUpdate, set: setKeepUpdate, label: 'Live Ingest', icon: Activity, desc: 'Establish real-time temporal polling.' },
                                { checked: consent, set: setConsent, label: 'Global Egress', icon: CloudSync, desc: 'Contribute to algorithmic biodiversity.' },
                                { checked: searchWireless, set: setSearchWireless, label: 'Node Discovery', icon: Wifi, desc: 'Recursive Bluetooth beacon scanning.' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-5">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-honey/5 flex items-center justify-center border border-honey/10">
                                            <item.icon className="w-4 h-4 text-honey" />
                                        </div>
                                        <h4 className={cn(glass.microLabel, "opacity-80 font-black uppercase tracking-[0.15em]")}>{item.label}</h4>
                                    </div>
                                    <ToggleSwitch checked={item.checked} onCheckedChange={item.set} />
                                    <p className="text-[10px] text-foreground/40 italic font-bold leading-tight uppercase tracking-tighter">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12 flex gap-6 border-t border-border/50">
                            <button
                                className={cn(glass.btnSecondary, "flex-1 h-16 font-black uppercase tracking-widest")}
                                onClick={() => onOpenChange(false)}
                            >
                                Discard_Changes
                            </button>
                            <button
                                className={cn(glass.btnPrimary, "flex-1 h-16 font-black uppercase tracking-widest shadow-xl shadow-honey/20")}
                                onClick={() => onOpenChange(false)}
                            >
                                Persist_Settings
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
                    className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative border-destructive/10 bg-white/95 backdrop-blur-2xl")}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-destructive/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />

                    <div className="bg-white/40 px-12 py-12 border-b border-border/50 relative z-10">
                        <div className={cn(glass.badge, 'bg-destructive/10 text-destructive border-destructive/20 mb-6')}>
                            <Bell className="w-3.5 h-3.5 mr-2" />
                            Biosphere Alert Matrix v2.0
                        </div>
                        <DialogTitle className={cn(glass.sectionTitle, 'text-4xl normal-case italic')}>Notify <span className="text-destructive">Engine</span></DialogTitle>
                        <DialogDescription className={cn(glass.microLabel, "normal-case italic font-bold opacity-40 mt-3 tracking-[0.1em]")}>Configuration of real-time sensor discrepancy triggers.</DialogDescription>
                    </div>

                    <div className="p-12 space-y-12 relative z-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Mobile OS Interface</h4>
                                <ToggleSwitch checked={appNotif} onCheckedChange={setAppNotif} />
                            </div>
                            <div className="space-y-4">
                                <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>SMS Gateway</h4>
                                <ToggleSwitch checked={smsNotif} onCheckedChange={setSmsNotif} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>Primary Email Endpoint</h4>
                            <div className="flex gap-4">
                                <Input
                                    type="email"
                                    placeholder="ENDPOINT_TARGET@BEEYIELD.AI"
                                    className={cn(glass.input, "h-16 font-black tracking-widest bg-gray-50")}
                                />
                                <button className={cn(glass.btnSecondary, "h-16 px-10 font-black tracking-widest border-border/50")}>VERIFY</button>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-border/50 space-y-10">
                            <h4 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>Diagnostic <span className="text-honey">Trigger Sensitivity</span></h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-8 bg-honey/5 rounded-[2rem] border border-honey/10 space-y-6 relative overflow-hidden group hover:border-honey/30 transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-honey/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center border border-honey/20 shadow-lg shadow-honey/10">
                                            <Thermometer className="w-5 h-5 text-honey" />
                                        </div>
                                        <span className={cn(glass.microLabel, "font-black text-honey tracking-widest")}>THERMAL_SPIKE</span>
                                    </div>
                                    <ToggleSwitch checked={tempAlerts} onCheckedChange={setTempAlerts} />
                                </div>
                                <div className="p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 space-y-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                            <Weight className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className={cn(glass.microLabel, "font-black text-emerald-500 tracking-widest")}>MASS_FLUX</span>
                                    </div>
                                    <ToggleSwitch checked={weightAlerts} onCheckedChange={setWeightAlerts} />
                                </div>
                            </div>
                        </div>

                        <button
                            className={cn(glass.btnPrimary, "w-full h-18 py-6 font-black uppercase tracking-[0.2em] shadow-2xl shadow-honey/30 mt-6")}
                            onClick={() => onOpenChange(false)}
                        >
                            Sync_Alert_Matrix_Executable
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
                title={<>Hive <span className="text-honey">Monitoring</span></>}
                subtitle="Remote telemetry ingest of colony health and real-time environmental metrics."
                actions={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setNotificationsOpen(true)}
                            className={cn(glass.btnSecondary, "h-16 px-8 border-destructive/10 hover:shadow-lg hover:shadow-destructive/5 relative group overflow-hidden")}
                        >
                            <div className="absolute inset-0 bg-destructive/5 group-hover:bg-destructive/10 animate-pulse transition-colors" />
                            <div className="relative z-10 flex items-center gap-3">
                                <Bell className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                                <span className="text-destructive font-black tracking-widest text-[10px]">ALERT_MATRIX</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className={cn(glass.btnPrimary, "h-16 px-10")}
                        >
                            <Settings className="w-5 h-5 mr-3" />
                            CONFIGURE_BRIDGE
                        </button>
                    </div>
                }
            />

            {/* Selection Registry */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-14 shadow-2xl relative overflow-hidden group border-honey/10")}
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.02] to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-honey/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 relative z-10">
                    <div className="space-y-6">
                        <Label className={cn(glass.microLabel, "ml-4 opacity-40 font-black tracking-[0.2em]")}>INDUSTRIAL_SECTOR_IDENTIFIER</Label>
                        <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                            <SelectTrigger className={cn(glass.input, "h-24 shadow-2xl font-black text-xl px-10 border-honey/10 hover:border-honey/30 transition-all rounded-[2rem] bg-white/40")}>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-lg shadow-honey/5">
                                        <Grid3X3 className="w-6 h-6 text-honey" />
                                    </div>
                                    <SelectValue placeholder="LOCATE_APIARY_SITE..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-3")}>
                                <SelectItem value="none" className="p-6 rounded-xl font-black tracking-widest text-foreground/40 italic">GLOBAL_FLEET_VIEW</SelectItem>
                                {apiaries.map(a => (
                                    <SelectItem key={a.id} value={a.id} className="p-6 rounded-xl font-black tracking-widest text-lg">
                                        {a.name.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-6">
                        <Label className={cn(glass.microLabel, "ml-4 opacity-40 font-black tracking-[0.2em]")}>NODE_NEURAL_ASSET_ID</Label>
                        <Select value={selectedHive} onValueChange={setSelectedHive}>
                            <SelectTrigger className={cn(glass.input, "h-24 shadow-2xl font-black text-xl px-10 border-emerald-500/10 hover:border-emerald-500/30 transition-all rounded-[2rem] bg-white/40")}>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                        <Box className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <SelectValue placeholder="TARGET_NODE_HEX..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-3")}>
                                <SelectItem value="none" className="p-6 rounded-xl font-black tracking-widest text-foreground/40 italic">DESELECT_NODE</SelectItem>
                                {hives
                                    .filter(h => !selectedPlace || selectedPlace === 'none' || h.apiary_id === selectedPlace)
                                    .map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="p-6 rounded-xl font-black tracking-widest text-lg font-serif">
                                            {hive.hive_code ? hive.hive_code.toUpperCase() : 'ASSET_UID_ERR'}
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
                            { label: 'THERMAL_PROFILE', value: latestReading ? `${latestReading.temperature || 0}°C` : '--', icon: Thermometer, color: 'text-honey', sub: 'INTERNAL_BROOD_STATUS' },
                            { label: 'AMBIENT_SATURATION', value: latestReading ? `${latestReading.humidity || 0}%` : '--', icon: Droplet, color: 'text-blue-500', sub: 'OPTIMAL_NECTAR_STRESS' },
                            { label: 'COMPOSITE_MASS', value: latestReading ? `${latestReading.weight || 0}kg` : '--', icon: Weight, color: 'text-emerald-500', sub: 'YIELD_FLUX_STABILITY' }
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
                        className={cn(glass.card, "p-24 text-center flex flex-col items-center justify-center space-y-10 bg-honey/[0.02] border-honey/10 border-dashed rounded-[4rem]")}
                    >
                        <div className="w-28 h-28 rounded-[2.5rem] bg-white/40 flex items-center justify-center border border-honey/20 shadow-2xl shadow-honey/5 opacity-40 group hover:scale-110 transition-transform duration-700">
                            <SearchCode className="w-14 h-14 text-honey" />
                        </div>
                        <div className="space-y-4">
                            <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic opacity-40")}>Identify <span className="text-honey">Neural Asset</span></h3>
                            <p className={cn(glass.microLabel, "opacity-30 max-w-xl mx-auto leading-relaxed font-bold")}>Establish an industrial telemetry bridge by identifying target hex-sectors via the registry interface.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostic Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { label: 'DEVICE_INTEGRITY', icon: Zap, status: selectedHive && devices.find(d => d.hive_id === selectedHive) ? 'NOMINAL' : 'AWAITING_LINK', desc: selectedHive && devices.find(d => d.hive_id === selectedHive) ? 'High-fidelity temporal bridge established.' : 'Establish node registry connection for deep ingest.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'REGISTRY_BRIDGE', icon: Info, status: 'ENCRYPTED', desc: 'Enterprise-grade end-to-end data security active for all egress ports.', color: 'text-honey', bg: 'bg-honey/10' }
                ].map((panel, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={cn(glass.card, "p-10 border-honey/10 flex items-center gap-10 group cursor-default shadow-2xl transition-all duration-500 relative overflow-hidden")}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-honey/10 transition-all pointer-events-none" />
                        <div className={cn("w-22 h-22 rounded-[1.8rem] flex items-center justify-center border transition-all duration-700 shadow-2xl group-hover:scale-110", panel.bg, `border-${panel.color.split('-')[1]}-500/20`)}>
                            <panel.icon className={cn("w-11 h-11", panel.color)} />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className={cn(glass.microLabel, "opacity-40 font-black uppercase tracking-[0.2em]")}>{panel.label}</p>
                                <span className={cn(glass.microLabel, "font-black italic tracking-widest", panel.color)}>{panel.status}</span>
                            </div>
                            <p className="text-sm font-black opacity-70 leading-relaxed italic uppercase tracking-tighter text-foreground/80">{panel.desc}</p>
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
                title={<>Wireless <span className="text-honey">Interface</span></>}
                subtitle="Configure BeeYield sensors via Bluetooth for calibration and industrial telemetry offloading."
                actions={
                    <button
                        onClick={handlePairing}
                        disabled={isScanning}
                        className={cn(glass.btnPrimary, "h-16 px-12 min-w-[280px]")}
                    >
                        {isScanning ? (
                            <div className="flex items-center gap-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>SYNCHRONIZING_PORT...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Search className="w-5 h-5" />
                                <span>INVERT_SEARCH_BEACON</span>
                            </div>
                        )}
                    </button>
                }
            />

            <div className="space-y-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-6 opacity-30">
                        <Loader2 className="w-16 h-16 animate-spin text-honey" />
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
                                className={cn(glass.card, "p-12 shadow-2xl border-honey/10 flex flex-col justify-between group relative overflow-hidden hover:border-honey/40 transition-all")}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-honey/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-honey/15 transition-all pointer-events-none" />
                                <div className="flex items-center gap-8 mb-10 relative z-10">
                                    <div className="w-20 h-20 rounded-[1.8rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-xl group-hover:scale-110 group-hover:shadow-honey/10 transition-all duration-700">
                                        <BluetoothIcon className="w-10 h-10 text-honey" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>{device.serial_number ? device.serial_number.toUpperCase() : 'NODE_UNKNOWN'}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <p className={cn(glass.microLabel, "opacity-40 font-black tracking-widest text-[9px]")}>{device.device_uid}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between relative z-10 pt-8 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(glass.microLabel, "text-emerald-500 font-black italic tracking-widest text-[8px]")}>ACTIVE_ENCRYPTED</span>
                                        <p className="text-[10px] font-bold opacity-30 italic">STATION_LINK_STABLE</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(glass.microLabel, "opacity-40 font-black tabular-nums text-[10px]")}>FIRMWARE_V{device.firmware_version || '1.0'}</span>
                                        <p className="text-[9px] font-bold text-honey/60 uppercase tracking-widest mt-1 italic">GEN_3_HUB</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "p-32 text-center flex flex-col items-center justify-center space-y-12 bg-honey/[0.02] border-honey/10 border-dashed rounded-[4rem]")}
                    >
                        <div className="w-32 h-32 rounded-[3.5rem] bg-white/40 flex items-center justify-center border border-honey/20 shadow-2xl shadow-honey/5 opacity-20 group hover:scale-110 transition-transform duration-700">
                            <BluetoothIcon className="w-16 h-16 text-honey" />
                        </div>
                        <div className="space-y-6">
                            <h3 className={cn(glass.sectionTitle, "text-5xl normal-case italic opacity-40")}>No Wireless <span className="text-honey">Handshake</span></h3>
                            <p className={cn(glass.microLabel, "opacity-30 max-w-2xl mx-auto leading-relaxed font-bold tracking-widest")}>
                                Ensure industrial BeeYield Hub hardware is in broadcast discovery mode. BLE terminal requires recursive provisioning permissions for provisioning.
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
            title={<>USB <span className="text-honey">Architecture</span></>}
            subtitle="Manage industrial hub firmware and monitor raw serial output directly via encrypted physical link."
        />

        <div className="relative z-10">
            <UsbHubDashboard />
        </div>
    </motion.div>
);
