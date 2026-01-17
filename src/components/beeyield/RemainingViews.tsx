import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Shield, Zap, Bluetooth as BluetoothIcon, Usb, Grid3X3, Box, Bell, Settings, ChevronDown, Check, X, AlertTriangle, Search, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

// Common View Wrapper
const ViewLayout = ({ title, subtitle, icon: Icon, onTabChange, showIcon = true, children }: { title: string, subtitle?: string, icon?: any, onTabChange?: (tab: string) => void, showIcon?: boolean, children: React.ReactNode }) => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex items-center gap-4">
            {showIcon && Icon && (
                <div className="w-14 h-14 bg-[#B48428] rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Icon className="w-8 h-8" />
                </div>
            )}
            <div>
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

// --- Custom Components for Modals ---

// Re-writing CustomSegmentedToggle to be closer to screenshot
const ToggleSwitch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) => {
    return (
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full h-8 w-[100px] bg-white dark:bg-black overflow-hidden cursor-pointer" onClick={() => onCheckedChange(!checked)}>
            <div className={`flex-1 flex items-center justify-center text-xs font-bold transition-colors ${!checked ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                OFF
            </div>
            <div className="w-[1px] h-full bg-gray-300 dark:bg-gray-700"></div>
            <div className={`flex-1 flex items-center justify-center text-xs font-bold transition-colors ${checked ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                HE
            </div>
        </div>
    )
}

const MeasurementIntervalSelector = () => {
    const options = [15, 30, 60, 120, 180, 360, 720];
    const [selected, setSelected] = useState(60);
    return (
        <div className="flex border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden w-full">
            {options.map((opt, i) => (
                <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={`flex-1 py-3 text-sm font-medium border-r border-gray-200 dark:border-gray-800 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${selected === opt ? 'bg-gray-100 dark:bg-gray-800 font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
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
    // States
    const [makePublic, setMakePublic] = useState(false);
    const [keepUpdate, setKeepUpdate] = useState(false);
    const [consent, setConsent] = useState(false);
    const [searchWireless, setSearchWireless] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[2.5rem] p-8 bg-white dark:bg-[#09090b] border-none shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-8 h-8 text-black dark:text-white animate-spin-slow" />
                    <DialogTitle className="text-2xl font-bold text-black dark:text-white">BeeYield Settings</DialogTitle>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-3">MEASUREMENT INTERVAL (MIN)</h4>
                        <MeasurementIntervalSelector />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">MAKE DATA PUBLIC</h4>
                            <ToggleSwitch checked={makePublic} onCheckedChange={setMakePublic} />
                        </div>
                        <div>
                            <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">KEEP UPDATE</h4>
                            <ToggleSwitch checked={keepUpdate} onCheckedChange={setKeepUpdate} />
                        </div>
                        <div>
                            <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">CONSENT TO SHARE ANONYMIZED DATA FOR EDUCATIONAL PURPOSES</h4>
                            <ToggleSwitch checked={consent} onCheckedChange={setConsent} />
                        </div>
                        <div>
                            <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">SEARCH WIRELESS BEEYIELD</h4>
                            <ToggleSwitch checked={searchWireless} onCheckedChange={setSearchWireless} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-12 text-base font-medium border-gray-200">
                        Go back
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="rounded-full h-12 text-base font-bold bg-white border-2 border-[#FCD34D] text-[#B48428] hover:bg-[#FEF9E7] hover:border-[#FCD34D] hover:text-[#B48428]">
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
    // States
    const [appNotif, setAppNotif] = useState(false);
    const [emailNotif, setEmailNotif] = useState(false);
    const [smsNotif, setSmsNotif] = useState(false);
    const [tempAlerts, setTempAlerts] = useState(false);
    const [weightAlerts, setWeightAlerts] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[2.5rem] p-8 bg-white dark:bg-[#09090b] border-none shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-3xl">🔔</div>
                    <DialogTitle className="text-2xl font-bold text-black dark:text-white">Notifications -</DialogTitle>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">APP NOTIFICATIONS</h4>
                        <ToggleSwitch checked={appNotif} onCheckedChange={setAppNotif} />
                    </div>

                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">EMAIL NOTIFICATIONS FROM BEEYIELD DEVICES</h4>
                        <div className="space-y-3">
                            <ToggleSwitch checked={emailNotif} onCheckedChange={setEmailNotif} />
                            <input
                                type="email"
                                placeholder="E-mail"
                                className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B48428] bg-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">SMS REPORTING - PREMIUM</h4>
                        <ToggleSwitch checked={smsNotif} onCheckedChange={setSmsNotif} />
                    </div>

                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">TEMPERATURE ALERTS</h4>
                        <ToggleSwitch checked={tempAlerts} onCheckedChange={setTempAlerts} />
                    </div>

                    <div>
                        <h4 className="text-[#B48428] text-xs font-bold uppercase tracking-wider mb-2">WEIGHT ALERTS</h4>
                        <ToggleSwitch checked={weightAlerts} onCheckedChange={setWeightAlerts} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-12 text-base font-medium border-gray-200">
                        Go back
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="rounded-full h-12 text-base font-bold bg-white border-2 border-[#FCD34D] text-[#B48428] hover:bg-[#FEF9E7] hover:border-[#FCD34D] hover:text-[#B48428]">
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

interface RemainingViewProps {
    onTabChange: (tab: string) => void;
}

// BeeYield Online View (Measurement data)
export const BeeYieldOnlineView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Title */}
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">
                Measurement data
            </h1>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SELECT HIVE Card */}
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#E8F4FD] dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Grid3X3 className="w-5 h-5 text-[#B48428]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SELECT HIVE</p>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search wireless BeeYield</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* MY PLACES Dropdown */}
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-xl bg-white dark:bg-[#09090b]">
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="w-full border-none shadow-none h-auto py-3 px-3 focus:ring-0">
                                    <div className="flex items-center gap-3 w-full text-left">
                                        <Grid3X3 className="w-4 h-4 text-[#B48428]" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MY PLACES</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedPlace || 'None'}</span>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* HIVE Dropdown */}
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-xl bg-white dark:bg-[#09090b]">
                            <Select value={selectedHive} onValueChange={setSelectedHive}>
                                <SelectTrigger className="w-full border-none shadow-none h-auto py-3 px-3 focus:ring-0">
                                    <div className="flex items-center gap-3 w-full text-left">
                                        <Box className="w-4 h-4 text-[#B48428]" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">HIVE</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedHive || 'None'}</span>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* SELECTED HIVE Card */}
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-[#F8F6F3] dark:bg-[#1e1e1e] shadow-sm">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SELECTED HIVE</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Search wireless BeeYield</h3>
                    </div>

                    <div className="flex gap-3">
                        {/* Notifications Button */}
                        <Button
                            variant="outline"
                            onClick={() => setNotificationsOpen(true)}
                            className="flex items-center gap-2 rounded-full px-5 py-2 h-auto bg-white dark:bg-[#09090b] border-gray-200 dark:border-[#1e1e1e] hover:bg-gray-50"
                        >
                            <div className="w-8 h-8 bg-[#FEE2E2] rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-[#EF4444]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                        </Button>

                        {/* Settings Button */}
                        <Button
                            variant="outline" // The user asked for "SETTINGS BUTTON OUTPUT THIS" referring to the modal, not changing the button style itself? Steps 0 and 15 show modals.
                            onClick={() => setSettingsOpen(true)}
                            className="flex items-center gap-2 rounded-full px-5 py-2 h-auto bg-white dark:bg-[#09090b] border-gray-200 dark:border-[#1e1e1e] hover:bg-gray-50"
                        >
                            <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4 text-[#B48428]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Warning Message */}
            <div className="bg-[#FEF9E7] dark:bg-amber-900/10 border border-[#FCD34D] dark:border-amber-700/30 rounded-2xl p-4 text-center">
                <p className="text-[#B48428] font-medium">No BeeYield device assigned to this bee hive.</p>
            </div>

            {/* Contact Link */}
            <div className="bg-[#FFFDF5] dark:bg-amber-900/5 border border-[#FEF3C7] dark:border-amber-800/20 rounded-2xl p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    <a href="#" className="text-[#B48428] underline hover:text-[#8A6420] font-medium">Contact us</a>
                    {' '}in order to buy one or{' '}
                    <a href="#" className="text-[#B48428] underline hover:text-[#8A6420] font-medium">learn more about BeeYield</a>.
                </p>
            </div>

            {/* MODALS */}
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
        </div>
    );
};

// Bluetooth View
export const BluetoothView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'canceled'>('idle');

    const handleScan = () => {
        setScanStatus('scanning');
        // Simulate scan or trigger web bluetooth
        setTimeout(() => {
            // checking if navigator.bluetooth is available
            const nav = navigator as any;
            if (nav.bluetooth) {
                nav.bluetooth.requestDevice({ acceptAllDevices: true })
                    .then((device: any) => {
                        console.log('Got device:', device);
                        setScanStatus('idle');
                    })
                    .catch((error: any) => {
                        console.log('Scan canceled:', error);
                        setScanStatus('canceled');
                    });
            } else {
                // Fallback / Mock
                setScanStatus('canceled');
            }
        }, 1000);
    };

    return (
        <ViewLayout title="Bluetooth BeeYield" showIcon={false} onTabChange={onTabChange}>
            {/* Top Card: Connect Info */}
            <Card className="rounded-[2.5rem] p-8 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Connect BeeYield via Bluetooth</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Search for a BeeYield device near you and stream measurement data in real time.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium px-6"
                        onClick={handleScan}
                    >
                        <BluetoothIcon className="w-4 h-4 mr-2" />
                        Search wireless BeeYield
                    </Button>
                </div>
            </Card>

            {/* Main Scan Card */}
            <Card className="rounded-[2.5rem] p-8 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] shadow-sm">
                <div className="mb-8">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">BLUETOOTH</div>
                    <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-4">BeeYield Scan</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Make sure BeeYield is turned on and within range. After clicking the button, select the device from the system list.
                    </p>
                </div>

                <div className="space-y-6">
                    <Button
                        size="lg"
                        className="w-auto rounded-xl px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                        onClick={handleScan}
                    >
                        {scanStatus === 'scanning' ? 'Scanning...' : 'Search wireless BeeYield'}
                    </Button>

                    {scanStatus === 'canceled' && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                            <p className="text-red-500 dark:text-red-400 font-medium">Canceled device selection.</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Web Bluetooth Compatibility Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                        <BluetoothIcon className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Web Bluetooth – where it works (2025)?</h3>
                        <p className="text-sm text-gray-500">Web Bluetooth – where it works (2025)? - Support status</p>
                    </div>
                </div>

                <Card className="rounded-[2rem] overflow-hidden border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-[#1e1e1e]/50">
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-[#1e1e1e]">
                                <TableHead className="font-bold text-gray-900 dark:text-white pl-8">System</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white">Browser</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white">Support Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { sys: 'Windows 10/11', browser: 'Chrome', status: 'full' },
                                { sys: 'Windows 10/11', browser: 'Edge (Chromium)', status: 'full' },
                                { sys: 'Android 8+', browser: 'Chrome Mobile', status: 'full' },
                                { sys: 'Android 8+', browser: 'Samsung Internet', status: 'limited' },
                                { sys: 'ChromeOS', browser: 'Chrome', status: 'full' },
                                { sys: 'Linux', browser: 'Chrome', status: 'full' },
                                { sys: 'macOS', browser: 'Chrome', status: 'limited' },
                                { sys: 'iOS', browser: 'Safari / Chrome / Edge', status: 'no' },
                            ].map((row, i) => (
                                <TableRow key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#1e1e1e]/50 border-gray-100 dark:border-[#1e1e1e]">
                                    <TableCell className="font-medium text-gray-900 dark:text-white pl-8 py-4">{row.sys}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{row.browser}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {row.status === 'full' && (
                                                <>
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-600 dark:text-green-400 font-medium text-sm">Full support</span>
                                                </>
                                            )}
                                            {row.status === 'limited' && (
                                                <>
                                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">Limited support</span>
                                                </>
                                            )}
                                            {row.status === 'no' && (
                                                <>
                                                    <X className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-600 dark:text-red-400 font-medium text-sm">No support</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </ViewLayout>
    );
};

// USB View
export const USBView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <ViewLayout title="USB" subtitle="Firmware updates and data export via wired connection." icon={Usb} onTabChange={onTabChange}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1e1e1e]/10 p-12 text-center col-span-2">
                <Usb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-400">No USB device detected</h3>
                <p className="text-gray-400 text-xs mt-1">Connect your BeeYield device to your computer to perform local actions.</p>
            </Card>
            <div className="space-y-6">
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <h4 className="font-bold text-sm mb-4">Common Actions</h4>
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl text-xs h-10 border-gray-100">Flash Firmware</Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl text-xs h-10 border-gray-100">Debug Logs</Button>
                    </div>
                </Card>
            </div>
        </div>
    </ViewLayout>
);
