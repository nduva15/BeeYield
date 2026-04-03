import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Droplet, Flame, Zap, ChevronDown, ChevronUp, FileText, FileSpreadsheet, Search,
    Settings, Info, AlertTriangle, BarChart3, Download, Loader2, Activity,
    LayoutGrid, Box, X, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { meterService, Building, Apartment, Meter } from '@/services/meterService';
import FirstStepsBanner from './FirstStepsBanner';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface MetersListBaseProps {
    meterType: 'Water' | 'Heat' | 'Energy' | 'Other';
    title: string;
    onTabChange: (tab: string) => void;
}

const MetersListBase: React.FC<MetersListBaseProps> = ({ meterType, title, onTabChange }) => {
    // Data States
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [apartments, setApartments] = React.useState<Apartment[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const LS_KEY = React.useMemo(() => `beeyield_meters_local_v1:${meterType.toLowerCase()}`, [meterType]);

    const readLocal = React.useCallback(() => {
        try {
            const raw = globalThis.localStorage?.getItem(LS_KEY);
            if (!raw) return { buildings: [] as Building[], apartments: [] as Apartment[], meters: [] as Meter[] };
            const parsed = JSON.parse(raw);
            return {
                buildings: Array.isArray(parsed?.buildings) ? parsed.buildings : [],
                apartments: Array.isArray(parsed?.apartments) ? parsed.apartments : [],
                meters: Array.isArray(parsed?.meters) ? parsed.meters : [],
            };
        } catch {
            return { buildings: [] as Building[], apartments: [] as Apartment[], meters: [] as Meter[] };
        }
    }, [LS_KEY]);

    const writeLocal = React.useCallback((next: { buildings: Building[]; apartments: Apartment[]; meters: Meter[] }) => {
        try {
            globalThis.localStorage?.setItem(LS_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    }, [LS_KEY]);

    // Filter States
    const [buildingFilter, setBuildingFilter] = React.useState<string>('all');
    const [apartmentFilter, setApartmentFilter] = React.useState<string>('all');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // UI States
    const [buildingsOpen, setBuildingsOpen] = React.useState(true);
    const [apartmentsOpen, setApartmentsOpen] = React.useState(true);
    const [exportOpen, setExportOpen] = React.useState(true);
    const [downloading, setDownloading] = React.useState<string | null>(null);
    const [isAddingMeter, setIsAddingMeter] = React.useState(false);
    const [enrollMeterNumber, setEnrollMeterNumber] = React.useState('');
    const [enrollBuildingId, setEnrollBuildingId] = React.useState<string>('');
    const [enrollApartmentId, setEnrollApartmentId] = React.useState<string>('');
    const [enrolling, setEnrolling] = React.useState(false);

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [bData, mData, aData] = await Promise.all([
                    meterService.getBuildings(),
                    meterService.getMeters({ meter_type: meterType }),
                    meterService.getApartments()
                ]);
                setBuildings(bData);
                setMeters(mData);
                setApartments(aData);
                if (!enrollBuildingId && bData?.length) setEnrollBuildingId(bData[0].id);
                writeLocal({ buildings: bData || [], apartments: aData || [], meters: mData || [] });
            } catch (error) {
                console.error(`Failed to load ${meterType} meters`, error);
                const local = readLocal();
                if ((local.meters || []).length > 0 || (local.buildings || []).length > 0) {
                    setBuildings(local.buildings || []);
                    setApartments(local.apartments || []);
                    setMeters((local.meters || []).filter((m: any) => String(m.meter_type) === String(meterType)));
                    if (!enrollBuildingId && (local.buildings || []).length) setEnrollBuildingId(local.buildings[0].id);
                    toast.info('Loaded meter registry from this device');
                } else {
                    setError(`Meter service unavailable. You can still enroll meters locally.`);
                    toast.error(`Failed to load ${meterType} meter data`);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meterType]);

    React.useEffect(() => {
        if (!enrollBuildingId) return;
        const firstUnit = apartments.find(a => a.building_id === enrollBuildingId);
        setEnrollApartmentId(firstUnit?.id || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrollBuildingId]);

    // Helpers
    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || id;
    const getBuildingAddress = (id: string) => buildings.find(b => b.id === id)?.address || '';
    const getApartmentNumber = (id?: string) => apartments.find(a => a.id === id)?.unit_number || 'N/A';

    // Filter Logic
    const filteredMeters = meters.filter(m => {
        if (buildingFilter !== 'all' && m.building_id !== buildingFilter) return false;
        if (apartmentFilter !== 'all' && m.apartment_id !== apartmentFilter) return false;
        if (statusFilter !== 'all' && m.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return m.meter_number.toLowerCase().includes(q) ||
                getBuildingName(m.building_id).toLowerCase().includes(q);
        }
        return true;
    });

    const filteredUnits = apartments.filter(a => {
        if (buildingFilter !== 'all' && a.building_id !== buildingFilter) return false;
        return true;
    });

    // Color logic
    const themeColor = {
        'Water': 'text-blue-500 fill-blue-500 bg-blue-50',
        'Heat': 'text-orange-500 fill-orange-500 bg-orange-50',
        'Energy': 'text-yellow-500 fill-yellow-500 bg-yellow-50',
        'Other': 'text-gray-500 fill-gray-500 bg-[#F9F7F2]'
    }[meterType];

    const accentColor = {
        'Water': '#2563EB',
        'Heat': '#EA580C',
        'Energy': '#F4D03F',
        'Other': '#4B5563'
    }[meterType];

    const handleExport = (format: 'CSV' | 'XLS' | 'PDF') => {
        setDownloading(format);
        try {
            if (format === 'PDF') {
                generatePDF();
            } else {
                const exportData = filteredMeters.map(meter => ({
                    'Sensor ID': meter.id,
                    'Device Number': meter.meter_number,
                    'Type': meter.meter_type,
                    'Apiary': getBuildingName(meter.building_id),
                    'Apiary Address': getBuildingAddress(meter.building_id),
                    'Hive / Unit': getApartmentNumber(meter.apartment_id),
                    'Last Reading': `${meter.last_reading_value} ${meter.last_reading_unit}`,
                    'Status': meter.status,
                    'Alarm': meter.has_alarm ? 'YES' : 'NO'
                }));

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(exportData);
                XLSX.utils.book_append_sheet(wb, ws, "Meters");
                XLSX.writeFile(wb, `meters_list_${meterType.toLowerCase()}.${format === 'XLS' ? 'xlsx' : 'csv'}`);
                toast.success(`${format} exported successfully`);
            }
        } catch (error) {
            console.error('Export failed', error);
            toast.error(`Failed to export ${format}`);
        } finally {
            setDownloading(null);
        }
    };

    const refreshMeters = async () => {
        try {
            const mData = await meterService.getMeters({ meter_type: meterType });
            setMeters(mData);
            const local = readLocal();
            writeLocal({ buildings: local.buildings, apartments: local.apartments, meters: mData || [] });
        } catch {
            const local = readLocal();
            setMeters((local.meters || []).filter((m: any) => String(m.meter_type) === String(meterType)));
        }
    };

    const handleEnroll = async () => {
        if (enrolling) return;
        const meter_number = enrollMeterNumber.trim();
        if (!meter_number) return toast.error('Serial number is required');
        if (!enrollBuildingId) return toast.error('Select a location');

        setEnrolling(true);
        const tid = toast.loading('Adding meter…');
        try {
            await meterService.createMeter({
                meter_number,
                meter_type: meterType,
                building_id: enrollBuildingId,
                apartment_id: enrollApartmentId || undefined,
                status: 'OK',
            });
            toast.success('Meter added.', { id: tid });
            setEnrollMeterNumber('');
            setIsAddingMeter(false);
            await refreshMeters();
        } catch (e: any) {
            console.error(e);
            // Offline/no backend: persist locally.
            const createdAt = new Date().toISOString();
            const localRow: Meter = {
                id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                meter_type: meterType,
                meter_number,
                meter_code: `LOCAL-${meter_number.slice(-6).toUpperCase()}`,
                building_id: enrollBuildingId,
                apartment_id: enrollApartmentId || undefined,
                status: 'OK',
                has_alarm: false,
                last_reading_value: 0,
                last_reading_unit: meterType === 'Energy' ? 'kWh' : meterType === 'Heat' ? 'GJ' : 'm³',
                last_reading_at: createdAt,
                created_at: createdAt,
            };
            const local = readLocal();
            const nextMeters = [localRow, ...(local.meters || [])];
            setMeters(nextMeters.filter((m: any) => String(m.meter_type) === String(meterType)));
            writeLocal({ buildings: local.buildings, apartments: local.apartments, meters: nextMeters });
            toast.success('Meter enrolled (local)', { id: tid });
            setEnrollMeterNumber('');
            setIsAddingMeter(false);
        } finally {
            setEnrolling(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(accentColor === '#F4D03F' ? '#713F12' : accentColor);
        doc.text(`BeeYield Sensor List - ${meterType}`, 14, 20);

        const tableData = filteredMeters.map(m => [
            m.meter_type,
            getBuildingName(m.building_id),
            getApartmentNumber(m.apartment_id),
            m.meter_number,
            `${m.last_reading_value} ${m.last_reading_unit}`,
            m.status
        ]);

        autoTable(doc, {
            head: [['Type', 'Apiary', 'Hive', 'Sensor #', 'Last Reading', 'Status']],
            body: tableData,
            startY: 35,
            headStyles: { fillColor: accentColor === '#F4D03F' ? [244, 208, 63] : accentColor as any },
        });

        doc.save(`sensors_${meterType.toLowerCase()}.pdf`);
        toast.success('PDF exported successfully');
    };

    if (loading && meters.length === 0) {
        return (
            <BeeYieldPageShell className={glass.page}>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                    <p className="text-gray-500 font-medium">Synchronizing sensor data...</p>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell className={cn(glass.page, "space-y-6")}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <FirstStepsBanner onTabChange={onTabChange} />

                <BeeYieldPageHeader
                    icon={Activity}
                    label="Meters"
                    title={<>Sensor <span className="text-[#F4D03F]">Registry</span> <span className="text-gray-300">·</span> {title}</>}
                    subtitle="Manage meters and view recent readings."
                />

            {error && (
                <div className={cn(glass.card, "p-4 border border-red-200 bg-red-50/60")}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-black text-red-600">Offline mode</div>
                            <div className="text-sm font-semibold text-slate-700 mt-1">{error}</div>
                        </div>
                        <button
                            type="button"
                            onClick={refreshMeters}
                            className={cn(glass.btnSecondary, "h-10 px-4 text-[10px] font-black")}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            )}

            <div className={cn(glass.card, "p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                {!isAddingMeter ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-[11px] font-black text-[#1A1A1A]">Add {meterType} meter</h3>
                            <p className="text-[9px] font-bold text-gray-500 mt-1">Enter the serial number and pick a location.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingMeter(true)}
                            className={cn(glass.btnPrimary, "h-9 px-6 font-black text-[9px]")}
                        >
                            Add meter
                        </button>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-top duration-300 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[11px] font-black text-[#1A1A1A]">Meter details</h3>
                            <button
                                onClick={() => setIsAddingMeter(false)}
                                className="text-gray-400 hover:bg-white/50 hover:text-[#1A1A1A] rounded-xl h-8 w-8 p-0 flex justify-center items-center transition-colors"
                                aria-label="Close"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                                value={enrollMeterNumber}
                                onChange={(e) => setEnrollMeterNumber(e.target.value)}
                                placeholder="Serial number"
                                className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black focus-visible:bg-white"
                            />
                            <Select value={enrollBuildingId} onValueChange={setEnrollBuildingId}>
                                <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buildings.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={enrollApartmentId} onValueChange={setEnrollApartmentId}>
                                <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black">
                                    <SelectValue placeholder="Hive (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {filteredUnits.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.unit_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className={cn(glass.btnPrimary, "h-9 font-black text-[9px]")}
                            >
                                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Add meter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Buildings Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                            <Building2 className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1A1A1A] leading-none">Infrastructure <span className="text-[#1B9157]">Status</span></h3>
                    </div>
                    <button onClick={() => setBuildingsOpen(!buildingsOpen)} className="text-gray-400 font-black text-[8px] gap-1.5 hover:bg-white/40 flex items-center px-2 py-1 rounded-lg">
                        {buildingsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {buildingsOpen ? 'Fold View' : 'Expand View'}
                    </button>
                </div>
                {buildingsOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {buildings.map(b => (
                            <div key={b.id} className={cn(glass.card, "p-4 bg-white/40 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all group overflow-hidden border-l-[6px] border-l-[#1B9157] rounded-2xl flex flex-col justify-between")}>
                                <div>
                                    <h4 className="text-[11px] font-black text-[#1A1A1A] truncate">{b.name}</h4>
                                    <p className="text-[8px] font-black text-gray-400 mt-1 line-clamp-1">{b.address}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="bg-[#1B9157]/10 text-[#1B9157] px-2 py-0.5 border border-[#1B9157]/20 rounded-md text-[8px] font-black">
                                        {meters.filter(m => m.building_id === b.id).length} devices
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center border border-white/40">
                                        <Activity className="w-3 h-3 text-[#1B9157]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className={cn(glass.card, "p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 ml-1">Apiary Area</label>
                        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className=" font-black text-[8px]">All Apiaries</SelectItem>
                                {buildings.map(b => <SelectItem key={b.id} value={b.id} className=" font-black text-[8px]">{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 ml-1">Hive Station</label>
                        <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className=" font-black text-[8px]">All Hives</SelectItem>
                                {filteredUnits.map(a => <SelectItem key={a.id} value={a.id} className=" font-black text-[8px]">{a.unit_number}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 ml-1">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className=" font-black text-[8px]">All</SelectItem>
                                <SelectItem value="ok" className=" font-black text-[8px]">Ok</SelectItem>
                                <SelectItem value="warning" className=" font-black text-[8px]">Warning</SelectItem>
                                <SelectItem value="alert" className=" font-black text-[8px]">Alert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-3 space-y-2">
                        <label className="text-[8px] font-black text-gray-500 ml-1">Search by name or ID</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                                placeholder="Search by sensor ID or coordinates..."
                                className="h-9 rounded-xl pl-9 bg-white/50 border-white/40 font-black text-[9px] focus-visible:bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/30">
                                {['Sensor ID', 'Deployment Location', 'Current reading', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-4 px-5 text-[8px] font-black text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredMeters.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-gray-500">No matching sensors found</td></tr>
                            ) : (
                                filteredMeters.map(meter => (
                                    <tr key={meter.id} className="group hover:bg-white/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-white/40 shadow-sm bg-white/60 text-[#1A1A1A]")}>
                                                    {meterType === 'Water' && <Droplet className="w-4 h-4 text-blue-500" />}
                                                    {meterType === 'Heat' && <Flame className="w-4 h-4 text-[#F4D03F]" />}
                                                    {meterType === 'Energy' && <Zap className="w-4 h-4 text-[#1B9157]" />}
                                                    {meterType === 'Other' && <Box className="w-4 h-4 text-gray-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#1A1A1A]">{meter.meter_number}</p>
                                                    <p className="text-[8px] font-bold text-gray-500 mt-0.5">{meter.meter_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <p className="text-[10px] font-black text-[#1A1A1A]">{getBuildingName(meter.building_id)}</p>
                                            <p className="text-[8px] font-bold text-[#1B9157] mt-0.5">UNIT: {getApartmentNumber(meter.apartment_id)}</p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <p className="text-[10px] font-black text-[#1A1A1A]">{meter.last_reading_value} {meter.last_reading_unit}</p>
                                            <p className="text-[8px] font-bold text-gray-400 mt-0.5">{meter.last_reading_at ? new Date(meter.last_reading_at).toLocaleDateString() : 'No data'}</p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={cn(
                                                "rounded-md border px-2.5 py-1 text-[8px] font-black shadow-sm",
                                                meter.status === 'OK' ? "bg-green-500/10 text-[#1B9157] border-green-500/20" :
                                                    meter.status === 'Warning' ? "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {meter.status === 'OK' ? 'Working' : meter.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex gap-2">
                                                <button
                                                    className="h-8 w-8 rounded-xl bg-white/50 border border-white/40 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[#1A1A1A] transition-colors"
                                                    aria-label="Meter details"
                                                    title="Meter details"
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="h-8 w-8 rounded-xl bg-[#1B9157]/10 border border-[#1B9157]/20 flex items-center justify-center text-[#1B9157] hover:bg-[#1B9157] hover:text-white transition-colors"
                                                    onClick={() => generatePDF()}
                                                    aria-label="Download report"
                                                    title="Download report"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Section */}
            <div className={cn(glass.card, "p-6 shadow-xl bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-[9px] font-black text-gray-500">Sensor data export</h3>
                        <p className="text-[11px] font-black text-[#1A1A1A] mt-1">Export records for your sensors</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => handleExport('CSV')} className={cn(glass.btnSecondary, "h-9 px-5 bg-white/50 border-white/40 text-[9px] font-black gap-2")}>
                            <FileText className="w-3.5 h-3.5" /> CSV report
                        </button>
                        <button onClick={() => handleExport('XLS')} className={cn(glass.btnSecondary, "h-9 px-5 bg-white/50 border-white/40 text-[9px] font-black gap-2")}>
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel sheet
                        </button>
                        <button onClick={() => handleExport('PDF')} className={cn(glass.btnPrimary, "h-9 px-6 text-[9px] font-black gap-2")}>
                            {downloading === 'PDF' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Download className="w-3.5 h-3.5" />}
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default MetersListBase;
