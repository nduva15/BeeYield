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
    Lock as LockIcon
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { UsbHubDashboard } from './UsbHubDashboard';
import { glass, PageHeader, GlassStatCard, GlassModal } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

// --- Custom Components for Modals ---

const ToggleSwitch = ({ checked, onCheckedChange, label }: { checked: boolean, onCheckedChange: (c: boolean) => void, label?: string }) => {
    return (
        <div className="flex items-center justify-between group">
            {label && <span className={cn(glass.microLabel, "opacity-60 font-bold")}>{label}</span>}
            <div
                className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D03F]/50",
                    checked ? "bg-[#F4D03F] shadow-lg shadow-[#F4D03F]/20" : "bg-black/20"
                )}
                onClick={() => onCheckedChange(!checked)}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out mt-0.5 ml-0.5",
                        checked ? "translate-x-5" : "translate-x-0"
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
                        "flex-1 py-2 text-[9px] font-black rounded-lg transition-all",
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
        <GlassModal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Bridge Configuration"
            subtitle="v5.1 • Choose what data to share and how often to sync."
        >
            <div className="space-y-8">
                <div className="space-y-3">
                    <h4 className={glass.microLabel}>Measurement Sync Cadence</h4>
                    <MeasurementIntervalSelector />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {[
                        { checked: makePublic, set: setMakePublic, label: 'Public sharing', icon: LockIcon, desc: 'Share summary data publicly.' },
                        { checked: keepUpdate, set: setKeepUpdate, label: 'Live updates', icon: Activity, desc: 'Keep page updated live.' },
                        { checked: consent, set: setConsent, label: 'Research sharing', icon: CloudSync, desc: 'Help improve anonymous stats.' },
                        { checked: searchWireless, set: setSearchWireless, label: 'Bluetooth scan', icon: Wifi, desc: 'Nearby Bluetooth discovery.' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10">
                                    <item.icon className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <h4 className={cn(glass.microLabel, "opacity-80")}>{item.label}</h4>
                            </div>
                            <ToggleSwitch checked={item.checked} onCheckedChange={item.set} />
                            <p className="text-[10px] text-gray-400 italic font-medium leading-tight">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex gap-4 border-t border-[#F4D03F]/10">
                    <button
                        className={cn(glass.btnSecondary, "flex-1 h-10")}
                        onClick={() => onOpenChange(false)}
                    >
                        Discard
                    </button>
                    <button
                        className={cn(glass.btnPrimary, "flex-1 h-10")}
                        onClick={() => onOpenChange(false)}
                    >
                        Persist Changes
                    </button>
                </div>
            </div>
        </GlassModal>
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
        <GlassModal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Notify Engine"
            subtitle="Biosphere Alert Matrix v2.0 • Sensor discrepancy triggers."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h4 className={glass.microLabel}>Mobile OS Interface</h4>
                        <ToggleSwitch checked={appNotif} onCheckedChange={setAppNotif} />
                    </div>
                    <div className="space-y-2">
                        <h4 className={glass.microLabel}>SMS Gateway</h4>
                        <ToggleSwitch checked={smsNotif} onCheckedChange={setSmsNotif} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className={glass.microLabel}>Primary Email Endpoint</h4>
                    <div className="flex gap-3">
                        <Input
                            type="email"
                            placeholder="target@beeyield.com"
                            className={cn(glass.input, "h-10 text-[10px] font-black")}
                        />
                        <button className={cn(glass.btnSecondary, "h-10 px-6 text-[11px]")}>Verify</button>
                    </div>
                </div>

                <div className="pt-6 border-t border-[#F4D03F]/10 space-y-4">
                    <h4 className={glass.sectionTitle}>Diagnostic <span className="text-[#F4D03F]">Triggers</span></h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#F4D03F]/5 rounded-xl border border-[#F4D03F]/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                                    <Thermometer className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <span className={cn(glass.microLabel, "text-[#F4D03F]")}>Thermal</span>
                            </div>
                            <ToggleSwitch checked={tempAlerts} onCheckedChange={setTempAlerts} />
                        </div>
                        <div className="p-4 bg-[#1B9157]/5 rounded-xl border border-[#1B9157]/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/10 shadow-sm">
                                    <Weight className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <span className={cn(glass.microLabel, "text-[#1B9157]")}>Mass</span>
                            </div>
                            <ToggleSwitch checked={weightAlerts} onCheckedChange={setWeightAlerts} />
                        </div>
                    </div>
                </div>

                <button
                    className={cn(glass.btnPrimary, "w-full h-10 shadow-xl shadow-[#F4D03F]/10 mt-2")}
                    onClick={() => onOpenChange(false)}
                >
                    Sync Alert Matrix
                </button>
            </div>
        </GlassModal>
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
                    // Backend-gated fetch (Supabase + JWT via API)
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
            className={glass.page}
        >
            {/* Header Section */}
            <PageHeader
                icon={Wifi}
                label="BeeYield Online"
                title={<>Hive <span className="text-[#F4D03F]">Monitoring</span></>}
                subtitle="Remote telemetry and real-time environmental metrics for your colony."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setNotificationsOpen(true)}
                            className={glass.btnSecondary}
                        >
                            <Bell className="w-4 h-4 text-red-500" />
                            Alerts
                        </button>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className={glass.btnPrimary}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>
                }
            />

            {/* Selection */}
            <div className={glass.section}>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className={cn(glass.microLabel, "ml-2 opacity-70 font-semibold")}>Apiary</Label>
                        <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                            <SelectTrigger className={glass.select}>
                                <div className="flex items-center gap-2">
                                    <Grid3X3 className="w-4 h-4 text-[#F4D03F]" />
                                    <SelectValue placeholder="Select Apiary" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-2")}>
                                <SelectItem value="none" className="p-3 rounded-lg text-sm font-semibold text-foreground/60 italic">All apiaries</SelectItem>
                                {apiaries.map(a => (
                                    <SelectItem key={a.id} value={a.id} className="p-3 rounded-lg text-sm font-semibold">
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className={cn(glass.microLabel, "ml-2 opacity-40 font-black")}>Asset Handshake</Label>
                        <Select value={selectedHive} onValueChange={setSelectedHive}>
                            <SelectTrigger className={glass.select}>
                                <div className="flex items-center gap-2">
                                    <Box className="w-4 h-4 text-[#1B9157]" />
                                    <SelectValue placeholder="Select Hive" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "p-2")}>
                                <SelectItem value="none" className="p-3 rounded-lg font-black text-[10px] text-foreground/40 italic">Deselect</SelectItem>
                                {hives
                                    .filter(h => !selectedPlace || selectedPlace === 'none' || h.apiary_id === selectedPlace)
                                    .map(hive => (
                                        <SelectItem key={hive.id} value={hive.id} className="p-3 rounded-lg font-black text-xs">
                                            {hive.hive_code ? hive.hive_code.toUpperCase() : 'Uid Err'}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    </div>
                </div>
            </div>

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
                            { label: 'Thermal Profile', value: latestReading ? `${latestReading.temperature || 0}°C` : '--', icon: Thermometer, color: 'text-[#F4D03F]', sub: 'Internal Brood Status' },
                            { label: 'Ambient Saturation', value: latestReading ? `${latestReading.humidity || 0}%` : '--', icon: Droplet, color: 'text-blue-500', sub: 'Optimal Nectar Stress' },
                            { label: 'Composite Mass', value: latestReading ? `${latestReading.weight || 0}kg` : '--', icon: Weight, color: 'text-[#1B9157]', sub: 'Yield Flux Stability' }
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
                    <div className={glass.emptyState}>
                        <div className="w-12 h-12 rounded-xl bg-[#F9F7F2] flex items-center justify-center mb-4">
                            <SearchCode className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-[#1A1A1A]">Select a Hive</h3>
                        <p className="text-gray-500 mt-1 max-w-sm font-medium">
                            Establish a telemetry link by selecting a hive from the registry.
                        </p>
                    </div>
                )}
            </AnimatePresence>

            {/* Diagnostic Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { label: 'Device Integrity', icon: Zap, status: selectedHive && devices.find(d => d.hive_id === selectedHive) ? 'Nominal' : 'Awaiting', desc: 'Temporal bridge status.', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/5' },
                    { label: 'Registry Bridge', icon: Info, status: 'Encrypted', desc: 'Security active.', color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/5' }
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
                                <p className={cn(glass.microLabel, "opacity-40 font-black text-[8px]")}>{panel.label}</p>
                                <span className={cn(glass.microLabel, "font-black italic text-[8px]", panel.color)}>{panel.status}</span>
                            </div>
                            <p className="text-[10px] font-black opacity-70 leading-relaxed italic tracking-tighter text-foreground/80">{panel.desc}</p>
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

    const fetchDevices = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getBluetoothDevices();
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
    }, [userId]);

    React.useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const handlePairing = async () => {
        if (isScanning) return;
        setIsScanning(true);
        const tid = toast.loading('Scanning for Bluetooth devices…');
        try {
            if (!('bluetooth' in navigator)) {
                toast.error('Web Bluetooth is not available in this browser.', { id: tid });
                return;
            }

            // Best-effort discovery via Web Bluetooth.
            // Note: requires HTTPS + user gesture; if blocked, we surface a clear error.
            const btDevice = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [],
            });

            const mac_address = String(btDevice?.id || '');
            if (!mac_address) throw new Error('Bluetooth device id missing');

            const created = await beeyieldService.registerBluetoothDevice({
                mac_address,
                name: String(btDevice?.name || 'BeeYield Sensor'),
                device_type: 'scale',
                assigned_hive_id: null
            });

            if (!created) throw new Error('Registration failed');
            await fetchDevices();
            toast.success('Bluetooth device registered', { id: tid });
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Bluetooth scan failed', { id: tid });
        } finally {
            setIsScanning(false);
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
                label="Bluetooth"
                title={<>Wireless <span className="text-[#F4D03F]">Interface</span></>}
                subtitle="Configure BeeYield sensors via Bluetooth for calibration and telemetry offloading."
                actions={
                    <button
                        onClick={handlePairing}
                        disabled={isScanning}
                        className={glass.btnPrimary}
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Scan for Devices
                            </>
                        )}
                    </button>
                }
            />

            <div className="space-y-6">
                {loading ? (
                    <div className={glass.skeleton + " h-64"} />
                ) : devices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device, i) => (
                            <motion.div
                                key={device.id || i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={glass.card}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                            <BluetoothIcon className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                        <div className={glass.badge}>Active</div>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-1">
                                        {device.serial_number ? device.serial_number.toUpperCase() : 'Unknown Device'}
                                    </h4>
                                    <p className={glass.microLabel}>{device.device_uid}</p>
                                    
                                    <div className="mt-6 pt-4 border-t border-[#F4D03F]/10 flex justify-between items-center text-[10px] font-bold text-[#1A1A1A]/40">
                                        <span>Firmware v{device.firmware_version || '1.0'}</span>
                                        <span className="text-[#1B9157]">Encrypted</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className={glass.emptyState}>
                        <div className="w-12 h-12 rounded-xl bg-[#F9F7F2] flex items-center justify-center mb-4">
                            <BluetoothIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-[#1A1A1A]">No Devices Found</h3>
                        <p className="text-gray-500 mt-1 max-w-sm font-medium">
                            Ensure your BeeYield Hub is in discovery mode and try scanning again.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// USB View
export const USBView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <BeeYieldPageShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <BeeYieldPageHeader
                icon={Usb}
                label="Serial Terminal Dashboard v1.8"
                title={<>Usb<span className="text-[#F4D03F]">Architecture</span></>}
                subtitle="Manage industrial hub firmware and monitor raw serial output directly via encrypted physical link."
            />

            <div className="relative z-10">
                <UsbHubDashboard />
            </div>
        </motion.div>
    </BeeYieldPageShell>
);
