import React from 'react';
import {
    Package, Plus, Calendar, MapPin, Hexagon, TrendingUp, Download, Search, RefreshCw,
    ShieldCheck, Zap, ArrowRight, ChevronLeft, SearchX, Layers, Cpu, Database, Binary,
    FlaskConical, Droplets, Wind, Scale, History, Activity, Lock as LockIcon, FlaskRound, HeartPulse, Shield, Hash, Thermometer
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useHarvests, useBatches, useCreateHarvest, useUpdateHarvest, useDeleteHarvest } from '@/hooks/useHarvests';
import { Harvest } from '@/services/beeyieldService';
import { ApiaryForm } from './ApiaryForm';
import { HiveForm } from './HiveForm';
import { useApiaries } from '@/hooks/useApiaries';
import { useHives } from '@/hooks/useHives';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { glass, GlassStatCard, GlassModal } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSectionHeader } from '@/components/beeyield/BeeYieldUI';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';

interface HarvestsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ initialParams, onTabChange }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterYear, setFilterYear] = React.useState<string>('all');
    const [isAddingHarvest, setIsAddingHarvest] = React.useState(false);
    const [showAddApiary, setShowAddApiary] = React.useState(false);
    const [showAddHive, setShowAddHive] = React.useState(false);
    const [filterApiaryId, setFilterApiaryId] = React.useState<string>('');
    const [filterHiveId, setFilterHiveId] = React.useState<string>('');
    const [formApiaryId, setFormApiaryId] = React.useState<string>('');
    const [formHiveId, setFormHiveId] = React.useState<string>('');
    const [batchYearFilter, setBatchYearFilter] = React.useState('all');
    const [batchHiveFilter, setBatchHiveFilter] = React.useState('');
    const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null);

    const { mutate: updateHarvest, isPending: isUpdating } = useUpdateHarvest();
    const { mutate: deleteHarvest, isPending: isDeleting } = useDeleteHarvest();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState<Partial<Harvest>>({});

    const handleEdit = () => {
        if (selectedHarvest) {
            setEditForm(selectedHarvest);
            setIsEditing(true);
        }
    };

    const handleSaveEdit = () => {
        if (!selectedHarvest) return;
        // Strip null values: HarvestCreateInput uses `string | undefined`, not `string | null`
        const sanitized = Object.fromEntries(
            Object.entries(editForm).filter(([, v]) => v !== null)
        ) as Partial<import('@/services/beeyieldService').HarvestCreateInput>;
        updateHarvest({ id: selectedHarvest.id, data: sanitized }, {
            onSuccess: () => {
                setIsEditing(false);
                setSelectedHarvest(sanitizeHarvest({ ...selectedHarvest, ...editForm } as Harvest));
            }
        });
    };

    const handleDelete = () => {
        if (!selectedHarvest) return;
        if (window.confirm("Are you sure you want to delete this harvest record?")) {
            deleteHarvest(selectedHarvest.id, {
                onSuccess: () => setSelectedHarvest(null)
            });
        }
    };

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingHarvest(true);
        }
    }, [initialParams]);

    const [formData, setFormData] = React.useState<Partial<Harvest>>({
        harvest_date: format(new Date(), 'yyyy-MM-dd'),
        quantity_kg: 0,
        quantity_left_for_bees_kg: 0,
        honey_type: 'Acacia',
        nectar_source: 'Floral',
        florage_type: '',
        extraction_method: 'Cold Extraction',
        color_grade: 'Light Amber',
        weather_conditions: 'Sunny',
        moisture_content_percent: 18.0,
        notes: '',
        batch_code: '',
        is_verified: true
    });

    const { data: harvests = [], isLoading } = useHarvests();
    const { data: batches = [], isLoading: isBatchesLoading } = useBatches();

    // Enrich batches with Hive info from harvests
    const enrichedBatches = React.useMemo(() => {
        return batches.map(b => {
            const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
            return {
                ...b,
                hive_code: h?.hive?.hive_code || 'N/A',
                harvest_year: h?.harvest_date ? new Date(h.harvest_date).getFullYear().toString() : (b.harvest_date ? new Date(b.harvest_date).getFullYear().toString() : 'all')
            };
        });
    }, [batches, harvests]);
    const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();
    const { data: apiaries = [] } = useApiaries();
    const { data: hives = [] } = useHives(filterApiaryId || formApiaryId || undefined);
    const [selectedApiaryId, setSelectedApiaryId] = useSelectedApiary(apiaries[0]?.id);
    const weatherApiaryId = filterApiaryId && filterApiaryId !== 'all' ? filterApiaryId : (selectedApiaryId || apiaries[0]?.id || '');
    const { data: weatherSummary, isLoading: weatherLoading } = useApiaryWeatherSummary(weatherApiaryId || undefined);

    React.useEffect(() => {
        if (filterApiaryId && filterApiaryId !== 'all') {
            setSelectedApiaryId(filterApiaryId);
        }
    }, [filterApiaryId, setSelectedApiaryId]);

    const filteredHives = React.useMemo(() => {
        if (!filterApiaryId) return hives;
        return hives.filter((h: any) => (h.apiary_id || h.apiary?.id) === filterApiaryId);
    }, [hives, filterApiaryId]);

    const formFilteredHives = React.useMemo(() => {
        if (!formApiaryId) return hives;
        return hives.filter((h: any) => (h.apiary_id || h.apiary?.id) === formApiaryId);
    }, [hives, formApiaryId]);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalHarvests = harvests.length;
        const totalHoney = harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0);
        const thisMonth = harvests.filter(h => {
            const harvestDate = new Date(h.harvest_date);
            const now = new Date();
            return harvestDate.getMonth() === now.getMonth() &&
                harvestDate.getFullYear() === now.getFullYear();
        }).length;
        const avgPerHarvest = totalHarvests > 0 ? totalHoney / totalHarvests : 0;

        return {
            totalHarvests,
            totalHoney: totalHoney.toFixed(1),
            thisMonth,
            avgPerHarvest: avgPerHarvest.toFixed(1)
        };
    }, [harvests]);

    // Filter harvests
    const filteredHarvests = React.useMemo(() => {
        return harvests.filter(harvest => {
            const matchesSearch = searchQuery === '' ||
                harvest.batch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                harvest.honey_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = filterYear === 'all' ||
                getSafeDate(harvest.harvest_date)?.getFullYear().toString() === filterYear;

            const matchesApiary = !filterApiaryId || filterApiaryId === 'all' || 
                                 (harvest as any).apiary_id === filterApiaryId || 
                                 (harvest as any).apiary?.id === filterApiaryId;

            const matchesHive = !filterHiveId || filterHiveId === 'all' || 
                               harvest.hive_id === filterHiveId || 
                               (harvest as any).hive?.id === filterHiveId;

            return matchesSearch && matchesYear && matchesApiary && matchesHive;
        });
    }, [filterApiaryId, filterHiveId, filterYear, getSafeDate, harvests, searchQuery]);

    const exportHarvestsCsv = React.useCallback(() => {
        const rows = filteredHarvests.map((h) => ({
            batch_code: h.batch_code || '',
            harvest_date: h.harvest_date || '',
            apiary: (h as any).apiary?.name || '',
            hive_code: (h as any).hive?.hive_code || '',
            quantity_kg: h.quantity_kg ?? '',
            quantity_left_for_bees_kg: h.quantity_left_for_bees_kg ?? '',
            honey_type: h.honey_type || '',
            nectar_source: h.nectar_source || '',
            color_grade: h.color_grade || '',
            extraction_method: h.extraction_method || '',
            moisture_pct: h.moisture_content_percent ?? '',
            weather: h.weather_conditions || '',
            verified: (h as any).is_verified ? 'Yes' : 'No',
            blockchain_hash: h.blockchain_hash || '',
        }));

        if (rows.length === 0) {
            toast.info('No harvests to export');
            return;
        }

        const escapeCsv = (v: unknown) => {
            const s = String(v ?? '');
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };

        const header = Object.keys(rows[0]).join(',');
        const body = rows.map((r) => Object.values(r).map(escapeCsv).join(',')).join('\n');
        const csv = `${header}\n${body}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beeyield-harvests-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success('Harvest export generated');
    }, [filteredHarvests]);

    const getColorGradeStyles = (grade?: string) => {
        const styles: Record<string, string> = {
            'Extra Light Amber': 'bg-[#F4D03F] text-[#F4D03F] border-amber-500/20',
            'Light Amber': 'bg-[#F4D03F] text-[#F4D03F] border-amber-500/40',
            'Amber': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'Dark Amber': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        };
        return styles[grade || ''] || 'bg-foreground/5 text-foreground/40 border-border/50';
    };

    const getSafeDate = React.useCallback((value?: string | null) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }, []);

    const formatHarvestDate = React.useCallback((value?: string | null) => {
        const date = getSafeDate(value);
        return date ? format(date, 'MMM dd, yyyy') : '—';
    }, [getSafeDate]);

    const formatKg = React.useCallback((value?: number | null) => {
        return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '0.0';
    }, []);

    const sanitizeHarvest = React.useCallback((harvest: Harvest): Harvest => ({
        ...harvest,
        harvest_date: getSafeDate(harvest.harvest_date)?.toISOString() ?? '',
        quantity_kg: typeof harvest.quantity_kg === 'number' && Number.isFinite(harvest.quantity_kg) ? harvest.quantity_kg : 0,
    }), [getSafeDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formApiaryId) {
            toast.error('Please select an apiary.');
            return;
        }
        if (!formHiveId) {
            toast.error('Please select a hive.');
            return;
        }
        if (!formData.quantity_kg || formData.quantity_kg <= 0) {
            toast.error('Please enter the amount of honey harvested.');
            return;
        }

        const toastId = toast.loading('Saving harvest information...');
        createHarvest({ ...(formData as any), apiary_id: formApiaryId, hive_id: formHiveId } as any, {
            onSuccess: () => {
                setIsAddingHarvest(false);
                setFormApiaryId('');
                setFormHiveId('');
                setFormData({
                    harvest_date: format(new Date(), 'yyyy-MM-dd'),
                    quantity_kg: 0,
                    honey_type: 'Acacia',
                    nectar_source: 'Floral',
                    extraction_method: 'Cold Extraction',
                    color_grade: 'Light Amber',
                    weather_conditions: 'Sunny',
                    is_verified: true
                });
                toast.success('Harvest saved successfully.', { id: toastId });
            },
            onError: (err: any) => {
                const msg =
                    typeof err?.message === 'string'
                        ? err.message
                        : (typeof err?.detail === 'string' ? err.detail : 'Could not save the harvest. Please try again.');
                toast.error('Could not save the harvest.', { id: toastId, description: msg, duration: 8000 });
            }
        });
    };

    const handleOpenAddHarvest = () => {
        // Pre-fill form state if filter is specific
        if (filterApiaryId && filterApiaryId !== 'all') {
            setFormApiaryId(filterApiaryId);
        }
        if (filterHiveId && filterHiveId !== 'all') {
            setFormHiveId(filterHiveId);
        }
        setIsAddingHarvest(true);
    };

    return (
        <BeeYieldPageShell className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            {/* Header */}
            <BeeYieldPageHeader
                icon={Package}
                label="Harvests"
                onBack={() => onTabChange?.('home')}
                title={<>Harvest <span className="text-[#F4D03F]">list</span></>}
                subtitle="View and record your harvests."
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            aria-label="Refresh harvests"
                            title="Refresh"
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center")}
                        >
                            <span className="sr-only">Refresh</span>
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleOpenAddHarvest}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add harvest
                        </button>
                    </div>
                }
            />

            {/* Stats Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Total honey" value={`${stats.totalHoney}KG`} icon={Zap} index={0} />
                <GlassStatCard label="Total harvests" value={stats.totalHarvests} icon={History} index={1} color="text-[#1A1A1A]" />
                <GlassStatCard label="This month" value={stats.thisMonth} icon={Calendar} index={2} color="text-[#1A1A1A]" />
                <GlassStatCard label="Average yield" value={`${stats.avgPerHarvest}KG`} icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <WeatherTelemetryPanel
                summary={weatherSummary}
                isLoading={weatherLoading}
                title="Harvest weather telemetry"
            />

            <Tabs defaultValue="harvests" className="w-full space-y-6">
                <TabsList className={cn(glass.filterBar, "bg-white/40 backdrop-blur-xl border-white/20 p-1 rounded-xl w-full max-w-sm mx-auto h-auto flex gap-1")}>
                    <TabsTrigger value="harvests" className="flex-1 rounded-lg text-[10px] font-black py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm transition-all h-9 uppercase tracking-tighter">
                        <History className="w-4 h-4 mr-2" />
                        Harvest Logs
                    </TabsTrigger>
                    <TabsTrigger value="batches" className="flex-1 rounded-lg text-[10px] font-black py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm transition-all h-9 uppercase tracking-tighter">
                        <Binary className="w-4 h-4 mr-2" />
                        Traceability Batches
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="harvests" className="space-y-6 mt-0">
            {/* Filter bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.filterBar, "bg-white/40 backdrop-blur-xl border-white/20 p-2 rounded-2xl")}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                    <Input
                        id="harvests-search"
                        name="search_harvests"
                        autoComplete="off"
                        placeholder="Search harvests…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-10 bg-white/50 border border-white/40 rounded-xl text-sm font-semibold text-[#1A1A1A] placeholder:text-gray-400 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto p-1 border-t md:border-t-0 md:border-l border-white/20">
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger id="harvests-filter-year" aria-label="Filter year" className="h-10 w-full md:w-32 bg-white/50 border border-white/40 rounded-xl focus:bg-white text-sm font-semibold text-gray-600 transition-colors">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <SelectValue placeholder="Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all" className="font-bold text-xs">All harvest cycles</SelectItem>
                            {Array.from({ length: 9 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="font-bold text-xs">{year}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <div className="w-px h-4 bg-[#F4D03F]/20 mx-1 hidden md:block" />
                    <button
                        onClick={exportHarvestsCsv}
                        className="h-8 px-3 text-xs font-bold text-gray-500 hover:text-[#F4D03F] transition-all flex items-center gap-2"
                        aria-label="Export filtered harvests as CSV"
                        title="Export CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Harvest table */}
            <div className="mt-4 relative z-10">
                <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/30 border-b border-white/40 backdrop-blur-sm">
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Batch ID</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Date</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Apiary</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Hive</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Farmer</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Type</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Florage</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight text-center">Net Yield</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight text-center">Left for Bees</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight text-center">Grade</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight text-center">Moisture</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Extraction</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight">Weather</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-500 tracking-tight text-center">Verified</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4D03F]/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={14} className="p-10 text-center h-40">
                                                <div className="flex flex-col items-center gap-3">
                                                    <RefreshCw className="w-6 h-6 text-[#F4D03F] animate-spin" />
                                                    <span className="text-xs font-medium text-gray-400">Loading entries...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredHarvests.length === 0 ? (
                                        <tr>
                                            <td colSpan={14} className="p-10 text-center h-40">
                                                <div className="flex flex-col items-center gap-4">
                                                    <SearchX className="w-8 h-8 text-gray-300" />
                                                    <span className="text-sm font-medium text-gray-400">No harvests found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHarvests.map((h, i) => (
                                            <motion.tr
                                                key={h.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                onClick={() => setSelectedHarvest(sanitizeHarvest(h))}
                                                className="hover:bg-white/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-black text-[#1A1A1A] tabular-nums">
                                                        {h.batch_code || `BAT-${h.id.toString().slice(-6).toUpperCase()}`}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                                                        {formatHarvestDate(h.harvest_date)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[11px] font-bold text-[#1A1A1A] truncate max-w-[120px]">
                                                        {h.apiary?.name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-[#1A1A1A]">
                                                        {h.hive?.hive_code || (h as any).hive_code || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        {(h as any).farmer?.name || (h as any).farmer?.full_name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-600">{h.honey_type || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-500">{h.florage_type || h.nectar_source || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[11px] font-black text-[#1B9157] tabular-nums">
                                                        {formatKg(h.quantity_kg)} <span className="text-[9px] font-medium opacity-50">Kg</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                                                        {h.quantity_left_for_bees_kg != null ? `${h.quantity_left_for_bees_kg} Kg` : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant="outline" className="border-[#F4D03F]/20 text-[#F4D03F] font-bold text-[9px] tracking-wider bg-white">
                                                        {h.color_grade || '—'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                                                        {h.moisture_content_percent != null ? `${h.moisture_content_percent}%` : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-500">{h.extraction_method || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-gray-400">{h.weather_conditions || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {h.is_verified ? (
                                                        <Badge variant="outline" className="border-[#1B9157]/20 text-[#1B9157] font-bold text-[9px] bg-[#1B9157]/5">
                                                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-gray-400">Pending</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </TabsContent>

            <TabsContent value="batches" className="space-y-6 mt-0">
            {/* Traceability Batches Section */}
            <div className="mt-12 space-y-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <BeeYieldSectionHeader
                        icon={ShieldCheck}
                        title={<>Traceability <span className="text-[#F4D03F]">records</span></>}
                        subtitle="Immutable digital twins of your honey production."
                    />
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filterApiaryId || 'all'} onValueChange={setFilterApiaryId}>
                            <SelectTrigger className="w-[140px] h-9 rounded-xl border-white/40 bg-white/50 text-[10px] font-bold focus:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-[#F4D03F]/40" />
                                    <SelectValue placeholder="Location" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-tighter">All Locations</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="font-bold text-xs">{a.name.toUpperCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filterHiveId || 'all'} onValueChange={setFilterHiveId}>
                            <SelectTrigger className="w-[120px] h-9 rounded-xl border-white/40 bg-white/50 text-[10px] font-bold focus:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Hexagon className="w-3 h-3 text-[#F4D03F]/40" />
                                    <SelectValue placeholder="Unit" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-tighter">All Units</SelectItem>
                                {filteredHives.map(h => <SelectItem key={h.id} value={h.id} className="font-bold text-xs">{h.hive_code}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={batchYearFilter} onValueChange={setBatchYearFilter}>
                            <SelectTrigger className="w-[100px] h-9 rounded-xl border-white/40 bg-white/50 text-[10px] font-bold focus:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-[#F4D03F]/40" />
                                    <SelectValue placeholder="Year" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-tighter">All Years</SelectItem>
                                {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(y => (
                                    <SelectItem key={y} value={y} className="font-bold text-xs">{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/30 border-b border-white/40 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Batch Code</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Hive</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Harvest Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Honey Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-center">Net (KG)</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-center">Grade</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-right">Blockchain Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4D03F]/5">
                                {isBatchesLoading ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-xs text-gray-400 font-bold">Verifying records...</td></tr>
                                ) : enrichedBatches
                                    .filter(b => batchYearFilter === 'all' || b.harvest_year === batchYearFilter)
                                    .filter(b => {
                                        if (!filterApiaryId || filterApiaryId === 'all') return true;
                                        const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
                                        return (h as any)?.apiary_id === filterApiaryId || (h as any)?.apiary?.id === filterApiaryId;
                                    })
                                    .filter(b => {
                                        if (!filterHiveId || filterHiveId === 'all') return true;
                                        const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
                                        return h?.hive_id === filterHiveId || (h as any)?.hive?.id === filterHiveId;
                                    })
                                    .length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-xs text-gray-400 font-bold">No traceability records found for this selection.</td></tr>
                                ) : enrichedBatches
                                    .filter(b => batchYearFilter === 'all' || b.harvest_year === batchYearFilter)
                                    .filter(b => {
                                        if (!filterApiaryId || filterApiaryId === 'all') return true;
                                        const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
                                        return (h as any)?.apiary_id === filterApiaryId || (h as any)?.apiary?.id === filterApiaryId;
                                    })
                                    .filter(b => {
                                        if (!filterHiveId || filterHiveId === 'all') return true;
                                        const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
                                        return h?.hive_id === filterHiveId || (h as any)?.hive?.id === filterHiveId;
                                    })
                                    .map((batch) => (
                                    <tr key={batch.id} className="hover:bg-white/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-[#1A1A1A] tabular-nums font-mono text-primary/80 uppercase">
                                                {batch.batch_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-[#1B9157] tracking-tighter">
                                                {batch.hive_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                                                {formatHarvestDate(batch.harvest_date)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-semibold text-gray-600">
                                            {batch.honey_type}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[11px] font-black text-[#1A1A1A]">
                                                {batch.quantity_kg} KG
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="outline" className={cn(
                                                "border-none text-[9px] font-black px-2",
                                                batch.quality_grade === 'A' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-[#F4D03F]/10 text-[#F4D03F]"
                                            )}>
                                                GRADE {batch.quality_grade}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                                <code className="text-[8px] font-mono text-gray-400 opacity-60">
                                                    {(batch.block_hash || '0x...').slice(0, 16)}...
                                                </code>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </TabsContent>
            </Tabs>
            {/* Details/Edit Modal */}
            <GlassModal
                isOpen={!!selectedHarvest}
                onClose={() => { setSelectedHarvest(null); setIsEditing(false); }}
                title={isEditing ? "Edit Harvest" : "Harvest Details"}
                subtitle={isEditing ? "Update batch information" : `Traceability record for ${selectedHarvest?.batch_code || 'this batch'}`}
            >
                {selectedHarvest && (
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Batch Code</Label>
                                        <Input
                                            value={editForm.batch_code || ''}
                                            onChange={e => setEditForm({ ...editForm, batch_code: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                            placeholder="Auto-generated"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Date</Label>
                                        <Input
                                            type="date"
                                            value={editForm.harvest_date?.split('T')[0] || ''}
                                            onChange={e => setEditForm({ ...editForm, harvest_date: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Net Yield (KG)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.quantity_kg || ''}
                                            onChange={e => setEditForm({ ...editForm, quantity_kg: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Left for Bees (KG)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.quantity_left_for_bees_kg || ''}
                                            onChange={e => setEditForm({ ...editForm, quantity_left_for_bees_kg: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Honey Type</Label>
                                        <Select
                                            value={editForm.honey_type}
                                            onValueChange={(val) => setEditForm({ ...editForm, honey_type: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, "h-10")}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed', 'Wildflower'].map(v => (
                                                    <SelectItem key={v} value={v} className="text-xs font-semibold">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Color Grade</Label>
                                        <Select
                                            value={editForm.color_grade}
                                            onValueChange={(val) => setEditForm({ ...editForm, color_grade: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, "h-10")}>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                                    <SelectItem key={g} value={g} className="text-xs font-semibold">{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Moisture (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.moisture_content_percent || ''}
                                            onChange={e => setEditForm({ ...editForm, moisture_content_percent: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Weather</Label>
                                        <Input
                                            value={editForm.weather_conditions || ''}
                                            onChange={e => setEditForm({ ...editForm, weather_conditions: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                            placeholder="e.g. Sunny"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Notes</Label>
                                    <Input
                                        value={editForm.notes || ''}
                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                        className={cn(glass.input, "h-10")}
                                        placeholder="Observations..."
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit-harvest-verified"
                                        checked={editForm.is_verified || false}
                                        onChange={e => setEditForm({ ...editForm, is_verified: e.target.checked })}
                                        className="rounded bg-black/40 border-[#F4D03F]/20 text-[#F4D03F] focus:ring-[#F4D03F]/50 w-4 h-4"
                                    />
                                    <Label htmlFor="edit-harvest-verified" className="text-xs font-black text-gray-400 cursor-pointer">
                                        Verified Record
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Batch Code</Label>
                                    <div className="text-sm font-bold truncate tabular-nums">{selectedHarvest.batch_code || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Date</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.harvest_date ? format(new Date(selectedHarvest.harvest_date), 'MMM dd, yyyy') : '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Apiary</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.apiary?.name || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Hive</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.hive?.hive_code || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Net Yield</Label>
                                    <div className="text-sm font-bold text-[#1B9157]">{selectedHarvest.quantity_kg?.toFixed(1)} KG</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Left for Bees</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.quantity_left_for_bees_kg != null ? `${selectedHarvest.quantity_left_for_bees_kg} KG` : '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Honey Type</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.honey_type || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Color Grade</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.color_grade || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Moisture</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.moisture_content_percent != null ? `${selectedHarvest.moisture_content_percent}%` : '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Weather</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.weather_conditions || '—'}</div>
                                </div>
                                {selectedHarvest.notes && (
                                    <div className="col-span-2 space-y-1 pt-2 border-t border-[#F4D03F]/10">
                                        <Label className={glass.microLabel}>Notes</Label>
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{selectedHarvest.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-[#F4D03F]/10 flex gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className={cn(glass.btnSecondary, "flex-1 h-10")}>
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveEdit} disabled={isUpdating} className={cn(glass.btnPrimary, "flex-1 h-10")}>
                                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleDelete} disabled={isDeleting} className="px-4 h-10 rounded-xl text-[11px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button onClick={handleEdit} className={cn(glass.btnSecondary, "flex-1 h-10")}>
                                        Edit
                                    </button>
                                    <button onClick={() => setSelectedHarvest(null)} className={cn(glass.btnPrimary, "flex-1 h-10")}>
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </GlassModal>

            <GlassModal
                isOpen={isAddingHarvest}
                onClose={() => setIsAddingHarvest(false)}
                title="Record Harvest"
                subtitle="Log a new production batch"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className={glass.microLabel}>Select Apiary</Label>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddApiary(true)}
                                    className="text-[10px] font-bold text-[#F4D03F] hover:underline"
                                >
                                    + Add New
                                </button>
                            </div>
                            <Select value={formApiaryId} onValueChange={setFormApiaryId}>
                                <SelectTrigger className={cn(glass.select, "h-10")}>
                                    <SelectValue placeholder="Select Apiary" />
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    {apiaries.map(a => (
                                        <SelectItem key={a.id} value={a.id} className="text-xs font-semibold">{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className={glass.microLabel}>Select Hive</Label>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddHive(true)}
                                    disabled={!formApiaryId}
                                    className="text-[10px] font-bold text-[#F4D03F] hover:underline disabled:opacity-50"
                                >
                                    + Add New
                                </button>
                            </div>
                            <Select value={formHiveId} onValueChange={setFormHiveId} disabled={!formApiaryId}>
                                <SelectTrigger className={cn(glass.select, "h-10")}>
                                    <SelectValue placeholder="Select Hive" />
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    {formFilteredHives.map(h => (
                                        <SelectItem key={h.id} value={h.id} className="text-xs font-semibold">{h.hive_code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    <div className="space-y-2">
                        <Label className={glass.microLabel}>Harvest Date*</Label>
                        <Input
                                type="date"
                                value={formData.harvest_date}
                                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                className={cn(glass.input, "h-10")}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Yield (KG)*</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.quantity_kg || ''}
                                onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "h-10")}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Honey Type</Label>
                            <Select
                                value={formData.honey_type}
                                onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                            >
                                <SelectTrigger className={cn(glass.select, "h-10")}>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    {['Acacia', 'Wildflower', 'Lavender', 'Multi-flower', 'Buckwheat'].map(v => (
                                        <SelectItem key={v} value={v} className="text-xs font-semibold">{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Color Grade</Label>
                            <Select
                                value={formData.color_grade}
                                onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                            >
                                <SelectTrigger className={cn(glass.select, "h-10")}>
                                    <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                        <SelectItem key={g} value={g} className="text-xs font-semibold">{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Left for Bees (KG)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.quantity_left_for_bees_kg || ''}
                                onChange={(e) => setFormData({ ...formData, quantity_left_for_bees_kg: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "h-10")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Moisture (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="18.0"
                                value={formData.moisture_content_percent || ''}
                                onChange={(e) => setFormData({ ...formData, moisture_content_percent: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "h-10")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Florage Type</Label>
                            <Input
                                placeholder="e.g. Wildflower"
                                value={formData.florage_type || ''}
                                onChange={(e) => setFormData({ ...formData, florage_type: e.target.value })}
                                className={cn(glass.input, "h-10")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Batch Override</Label>
                            <Input
                                placeholder="Auto-generated"
                                value={formData.batch_code || ''}
                                onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                                className={cn(glass.input, "h-10")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={glass.microLabel}>Weather</Label>
                            <Input
                                placeholder="e.g. Sunny"
                                value={formData.weather_conditions || ''}
                                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                className={cn(glass.input, "h-10")}
                            />
                        </div>
                        <div className="space-y-2 border border-[#F4D03F]/20 rounded-xl p-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="add-harvest-verified"
                                checked={formData.is_verified}
                                onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                                className="rounded bg-black/40 border-[#F4D03F]/20 text-[#F4D03F] focus:ring-[#F4D03F]/50 w-4 h-4"
                            />
                            <Label htmlFor="add-harvest-verified" className="text-[10px] font-black uppercase text-gray-400 cursor-pointer">
                                Verified Record
                            </Label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className={glass.microLabel}>Notes</Label>
                        <Input
                            placeholder="Observations..."
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className={cn(glass.input, "h-10")}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsAddingHarvest(false)} className={cn(glass.btnSecondary, "flex-1 h-10")}>
                            Discard
                        </button>
                        <button type="submit" disabled={isCreating} className={cn(glass.btnPrimary, "flex-1 h-10")}>
                            {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {isCreating ? 'Saving...' : 'Save Harvest'}
                        </button>
                    </div>
                </form>
            </GlassModal>


            {/* Nested Add Apiary Modal */}
            <GlassModal
                isOpen={showAddApiary}
                onClose={() => setShowAddApiary(false)}
                title="Register New Apiary"
                subtitle="Add a new production site"
            >
                <ApiaryForm 
                    onSuccess={(newApiary) => {
                        setShowAddApiary(false);
                        if (newApiary?.id) {
                            setFormApiaryId(newApiary.id);
                            setFilterApiaryId(newApiary.id);
                        }
                    }} 
                    onCancel={() => setShowAddApiary(false)} 
                />
            </GlassModal>

            {/* Nested Add Hive Modal */}
            <GlassModal
                isOpen={showAddHive}
                onClose={() => setShowAddHive(false)}
                title="Register New Hive"
                subtitle="Add a new hive to this apiary"
            >
                <HiveForm 
                    preselectedApiaryId={formApiaryId}
                    onSuccess={(newHive) => {
                        setShowAddHive(false);
                        if (newHive?.id) {
                            setFormHiveId(newHive.id);
                            setFilterHiveId(newHive.id);
                        }
                    }} 
                    onCancel={() => setShowAddHive(false)} 
                />
            </GlassModal>

            </motion.div>
        </BeeYieldPageShell>
    );
};

export default HarvestsView;
