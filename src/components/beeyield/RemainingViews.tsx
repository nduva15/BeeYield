import React, { useState, useEffect } from 'react';
import { beeyieldService, Apiary, Hive } from '@/services/beeyieldService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Shield, Zap, Bluetooth as BluetoothIcon, Usb, Grid3X3, Box, Bell, Settings, ChevronDown, Check, X, AlertTriangle, Search, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

// Common View Wrapper
const ViewLayout = ({ title, subtitle, icon: Icon, onTabChange, showIcon = true, children }: { title: string, subtitle?: string, icon?: any, onTabChange?: (tab: string) => void, showIcon?: boolean, children: React.ReactNode }) => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex items-center gap-6">
            {showIcon && Icon && (
                <div className="w-16 h-16 bg-[#FF9100] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                    <Icon className="w-8 h-8" />
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{title}</h1>
                {subtitle && <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

// --- Custom Components for Modals ---

const ToggleSwitch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) => {
    return (
        <div
            className="flex items-center border border-slate-100 rounded-full h-11 w-[130px] bg-slate-50 p-1 cursor-pointer transition-all hover:bg-slate-100 shadow-inner"
            onClick={() => onCheckedChange(!checked)}
        >
            <div className={`flex-1 flex items-center justify-center text-[10px] font-bold tracking-[0.2em] rounded-full h-full transition-all ${!checked ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>
                OFF
            </div>
            <div className={`flex-1 flex items-center justify-center text-[10px] font-bold tracking-[0.2em] rounded-full h-full transition-all ${checked ? 'bg-green-600 text-white shadow-sm' : 'text-slate-400'}`}>
                ON
            </div>
        </div>
    )
}

const MeasurementIntervalSelector = () => {
    const options = [15, 30, 60, 120, 180, 360, 720];
    const [selected, setSelected] = useState(60);
    return (
        <div className="flex bg-slate-50 border border-slate-100 rounded-[1.5rem] overflow-hidden w-full p-1.5 gap-1.5 shadow-inner">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={`flex-1 py-3.5 text-[11px] font-bold rounded-xl transition-all ${selected === opt ? 'bg-white text-slate-800 shadow-xl shadow-slate-200/50 scale-[1.05] z-10' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {opt}
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
    const [makePublic, setMakePublic] = useState(false);
    const [keepUpdate, setKeepUpdate] = useState(false);
    const [consent, setConsent] = useState(false);
    const [searchWireless, setSearchWireless] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[3.5rem] p-12 bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/[0.03] rounded-full -mr-20 -mt-20" />

                <div className="flex items-center gap-3 mb-6 relative">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100/50">
                        <Settings className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight leading-none">System Settings</DialogTitle>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Configure sync and health parameters.</p>
                    </div>
                </div>

                <div className="space-y-8 relative">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Sampling Interval (Min)</h4>
                        <MeasurementIntervalSelector />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Public Access</h4>
                            <ToggleSwitch checked={makePublic} onCheckedChange={setMakePublic} />
                            <p className="text-[10px] text-slate-400 font-medium">Share data with the research database.</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Live Updates</h4>
                            <ToggleSwitch checked={keepUpdate} onCheckedChange={setKeepUpdate} />
                            <p className="text-[10px] text-slate-400 font-medium">Enable real-time data polling.</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Data Research</h4>
                            <ToggleSwitch checked={consent} onCheckedChange={setConsent} />
                            <p className="text-[10px] text-slate-400 font-medium">Contribute to apiculture datasets.</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Device Scan</h4>
                            <ToggleSwitch checked={searchWireless} onCheckedChange={setSearchWireless} />
                            <p className="text-[10px] text-slate-400 font-medium">Search for nearby Bluetooth hubs.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 relative">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-14 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="rounded-2xl h-14 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-500/20 uppercase tracking-widest transition-all active:scale-95">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
    const [appNotif, setAppNotif] = useState(false);
    const [emailNotif, setEmailNotif] = useState(false);
    const [smsNotif, setSmsNotif] = useState(false);
    const [tempAlerts, setTempAlerts] = useState(false);
    const [weightAlerts, setWeightAlerts] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[3.5rem] p-12 bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/[0.03] rounded-full -mr-20 -mt-20" />

                <div className="flex items-center gap-3 mb-6 relative">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100/50">
                        <Bell className="w-5 h-5 text-red-500 stroke-[2.5]" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight leading-none">Alert Preferences</DialogTitle>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Configure hive health and sensor notifications.</p>
                    </div>
                </div>

                <div className="space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Push Notifications</h4>
                            <ToggleSwitch checked={appNotif} onCheckedChange={setAppNotif} />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">SMS Alerts</h4>
                            <ToggleSwitch checked={smsNotif} onCheckedChange={setSmsNotif} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Updates</h4>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <ToggleSwitch checked={emailNotif} onCheckedChange={setEmailNotif} />
                            <input
                                type="email"
                                placeholder="primary@beeyield.com"
                                className="flex-1 w-full border border-slate-100 rounded-2xl px-6 py-3 h-11 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-50 bg-slate-50/50"
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] ml-1">Temperature Spikes</h4>
                            <ToggleSwitch checked={tempAlerts} onCheckedChange={setTempAlerts} />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] ml-1">Significant Weight Loss</h4>
                            <ToggleSwitch checked={weightAlerts} onCheckedChange={setWeightAlerts} />
                        </div>
                    </div>
                </div>

                <div className="mt-12 relative flex justify-end">
                    <Button onClick={() => onOpenChange(false)} className="rounded-2xl h-14 bg-amber-500 text-white hover:bg-amber-600 px-10 text-sm font-bold uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all active:scale-95">
                        Save Preferences
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// BeeYield Online View (Measurement data)
export const BeeYieldOnlineView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            const apiariesData = await beeyieldService.getApiaries();
            setApiaries(apiariesData);
            if (apiariesData.length > 0) {
                const hivesData = await beeyieldService.getHives();
                setHives(hivesData);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedPlace && selectedPlace !== 'none') {
            const filteredHives = hives.filter(h => h.apiary_id === selectedPlace || !h.apiary_id);
            if (selectedHive && !filteredHives.find(h => h.id === selectedHive)) {
                setSelectedHive('');
            }
        }
    }, [selectedPlace, hives]);

    const currentPlace = apiaries.find(a => a.id === selectedPlace);
    const currentHive = hives.find(h => h.id === selectedHive);

    return (
        <div className="space-y-12 animate-in fade-in duration-600 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Hive Monitoring
                </h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Remote monitoring of hive health and environmental metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                {/* SELECT HIVE Card */}
                <Card className="lg:col-span-12 rounded-[2.5rem] p-10 border-none bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.01] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="flex-1 space-y-8 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <Grid3X3 className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Setup</p>
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Hardware Identification</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Apiary Location</label>
                                    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-1 focus-within:bg-white transition-all">
                                        <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                            <SelectTrigger className="w-full border-none shadow-none h-14 px-4 focus:ring-0 group/sel">
                                                <div className="flex items-center gap-4 w-full text-left">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover/sel:scale-105 transition-transform">
                                                        <Grid3X3 className="w-4 h-4 text-amber-500" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {currentPlace?.name || 'Select Apiary...'}
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-1 bg-white">
                                                <SelectItem value="none" className="font-semibold py-2 uppercase tracking-wider text-[10px] text-slate-400 text-center">None</SelectItem>
                                                {apiaries.filter(a => a.name.includes('Kibwezi')).map(apiary => (
                                                    <SelectItem key={apiary.id} value={apiary.id} className="font-semibold py-2 text-sm">{apiary.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Hive Identifier</label>
                                    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-1 focus-within:bg-white transition-all">
                                        <Select value={selectedHive} onValueChange={setSelectedHive}>
                                            <SelectTrigger className="w-full border-none shadow-none h-14 px-4 focus:ring-0 group/sel">
                                                <div className="flex items-center gap-4 w-full text-left">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover/sel:scale-105 transition-transform">
                                                        <Box className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {currentHive?.hive_code || 'Select Hive...'}
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-1 bg-white">
                                                <SelectItem value="none" className="font-bold py-2 uppercase tracking-wider text-[10px] text-slate-400 text-center">None</SelectItem>
                                                {hives
                                                    .filter(h => !selectedPlace || selectedPlace === 'none' || h.apiary_id === selectedPlace)
                                                    .slice(0, 184)
                                                    .map(hive => (
                                                        <SelectItem key={hive.id} value={hive.id} className="font-bold py-2 text-sm">{hive.hive_code}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[280px]">
                            <Button
                                onClick={() => setNotificationsOpen(true)}
                                className="flex items-center justify-between w-full h-14 rounded-xl px-5 bg-slate-50 hover:bg-slate-100 border border-slate-100 group/btn transition-all active:scale-95 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover/btn:scale-105 transition-transform">
                                        <Bell className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alerts</span>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                </div>
                            </Button>

                            <Button
                                onClick={() => setSettingsOpen(true)}
                                className="flex items-center justify-between w-full h-14 rounded-xl px-5 bg-amber-500 hover:bg-amber-600 text-white shadow-md group/btn transition-all active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover/btn:rotate-90 transition-transform duration-500">
                                        <Settings className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-white" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Status & Help Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 flex items-center gap-5 group hover:bg-amber-50 transition-all">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                        <AlertTriangle className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Sensor Status</p>
                        <p className="text-slate-700 font-semibold text-xs leading-tight">No device linked. Connect BeeHub hardware.</p>
                    </div>
                </div>

                <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 flex items-center gap-5 group hover:bg-green-50 transition-all">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-green-100 group-hover:scale-105 transition-transform">
                        <Info className="w-5 h-5 text-green-600 stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-0.5">Help & Support</p>
                        <p className="text-slate-700 font-semibold text-xs leading-tight">
                            <a href="#" className="hover:text-green-700 transition-all underline decoration-green-200">User Guide</a> <span className="text-slate-300 mx-2">|</span> <a href="#" className="hover:text-green-700 transition-all underline decoration-green-200">System Logs</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
        </div>
    );
};


import { UsbHubDashboard } from './UsbHubDashboard';

// USB View
export const USBView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24">
        <div className="px-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                USB Dashboard
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage hub firmware and monitor serial output directly.</p>
        </div>
        <UsbHubDashboard />
    </div>
);
