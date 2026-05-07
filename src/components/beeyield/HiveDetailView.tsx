import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, GlassStatCard, GlassModal } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldSectionHeader, BeeYieldEmptyState } from './BeeYieldUI';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft, Hexagon, QrCode, Crown, Calendar, ClipboardList, Wheat, Plus,
    Download, Printer, RefreshCw, X, ChevronLeft, ChevronRight, ExternalLink,
    ShieldCheck, Eye, Bug, Loader2, FileText, Scale, Database, Cpu, Wind
} from 'lucide-react';
import { beeyieldService, Hive, Apiary, Harvest, Inspection, Queen, QueenRearingBatch, HiveDetailData } from '@/services/beeyieldService';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface HiveDetailViewProps {
    hiveId: string;
    onBack: () => void;
    onTabChange: (tab: string) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HiveDetailView: React.FC<HiveDetailViewProps> = ({ hiveId, onBack, onTabChange }) => {
    const [loading, setLoading] = React.useState(true);
    const [detail, setDetail] = React.useState<HiveDetailData | null>(null);
    const qrRef = React.useRef<HTMLCanvasElement>(null);

    // Calendar state
    const [calMonth, setCalMonth] = React.useState(new Date().getMonth());
    const [calYear, setCalYear] = React.useState(new Date().getFullYear());

    // Queen form modal
    const [showQueenForm, setShowQueenForm] = React.useState(false);
    const [queenForm, setQueenForm] = React.useState({
        name: '', breed: '', origin: 'raised', marking_color: 'yellow', year_introduced: new Date().getFullYear(), notes: ''
    });
    const [savingQueen, setSavingQueen] = React.useState(false);

    // Queen Rearing Batch form modal
    const [showRearingForm, setShowRearingForm] = React.useState(false);
    const [rearingForm, setRearingForm] = React.useState({
        batch_name: '', method: 'Grafting', start_date: new Date().toISOString().split('T')[0],
        planned_units: 20, notebook: '',
        generate_calendar: true, generate_units: true, generate_reminders: true
    });
    const [savingBatch, setSavingBatch] = React.useState(false);

    // Harvest form modal
    const [showHarvestForm, setShowHarvestForm] = React.useState(false);
    const [harvestForm, setHarvestForm] = React.useState({
        harvest_date: new Date().toISOString().split('T')[0],
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
    const [savingHarvest, setSavingHarvest] = React.useState(false);
    
    // View detailed harvest modal
    const [selectedHarvest, setSelectedHarvest] = React.useState<any | null>(null);

    const fetchDetail = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getHiveDetail(hiveId);
            setDetail(data);
        } catch (e) {
            console.error('Failed to fetch hive detail:', e);
        } finally {
            setLoading(false);
        }
    }, [hiveId]);

    React.useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // ─── Harvest CRUD ───
    const handleSaveHarvest = async () => {
        if (!detail?.hive || !detail?.apiary) return;
        setSavingHarvest(true);
        try {
            const { data } = await beeyieldService.createHarvest({
                hive_id: detail.hive.id,
                apiary_id: detail.apiary.id,
                ...(harvestForm as any)
            });
            if (data) {
                setShowHarvestForm(false);
                setHarvestForm({
                    harvest_date: new Date().toISOString().split('T')[0],
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
                fetchDetail();
                toast.success('Harvest saved successfully.');
            } else {
                toast.error('Could not save the harvest.');
            }
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save harvest');
        } finally {
            setSavingHarvest(false);
        }
    };

    // ─── QR Code Handlers ───
    React.useEffect(() => {
        if (qrRef.current && detail?.hive) {
            // Generate a trace URL or identifier for the QR code
            const hiveUrl = `${window.location.origin}/trace?hive=${detail.hive.id}`;
            QRCode.toCanvas(qrRef.current, hiveUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1A1A1A',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) console.error('Failed to generate QR code', error);
            });
        }
    }, [detail?.hive]);

    const handleDownloadQR = () => {
        if (!qrRef.current || !detail?.hive) return;
        const url = qrRef.current.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `beeyield-qr-${detail.hive.hive_code}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('QR Code downloaded successfully');
    };

    const handlePrintQR = () => {
        if (!qrRef.current || !detail?.hive) return;
        const dataUrl = qrRef.current.toDataURL('image/png');
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`
                <html>
                    <head><title>Print QR Code - ${detail.hive.hive_code}</title></head>
                    <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif;">
                        <img src="${dataUrl}" style="width:256px; height:256px;" />
                        <h2 style="margin-top:1rem; color:#1A1A1A;">Hive: ${detail.hive.hive_code}</h2>
                        <p style="color:#666;">BeeHub Hive Tracker</p>
                    </body>
                </html>
            `);
            w.document.close();
            w.focus();
            setTimeout(() => {
                w.print();
                w.close();
            }, 250);
        }
    };

    // ─── Queen CRUD ───
    const handleSaveQueen = async () => {
        if (!detail?.hive) return;
        setSavingQueen(true);
        try {
            const { data } = await beeyieldService.createQueen({
                hive_id: detail.hive.id,
                ...queenForm,
            });
            if (data) {
                setShowQueenForm(false);
                fetchDetail();
            }
        } finally {
            setSavingQueen(false);
        }
    };

    // ─── Queen Rearing Batch CRUD ───
    const handleCreateRearingBatch = async () => {
        if (!detail?.hive) return;
        setSavingBatch(true);
        try {
            const { data } = await beeyieldService.createQueenRearingBatch({
                hive_id: detail.hive.id,
                batch_name: rearingForm.batch_name,
                method: rearingForm.method,
                start_date: rearingForm.start_date,
                planned_units: rearingForm.planned_units,
                notebook: rearingForm.notebook,
                generate_calendar: rearingForm.generate_calendar,
                generate_units: rearingForm.generate_units,
                generate_reminders: rearingForm.generate_reminders,
            });
            if (data) {
                setShowRearingForm(false);
                setRearingForm({
                    batch_name: '', method: 'Grafting', start_date: new Date().toISOString().split('T')[0],
                    planned_units: 20, notebook: '', generate_calendar: true, generate_units: true, generate_reminders: true
                });
                fetchDetail();
            }
        } finally {
            setSavingBatch(false);
        }
    };

    // ─── Calendar Helpers ───
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Monday-first
    };
    const calendarDays = React.useMemo(() => {
        const today = new Date();
        const daysInMonth = getDaysInMonth(calMonth, calYear);
        const firstDay = getFirstDayOfMonth(calMonth, calYear);
        const prevMonthDays = getDaysInMonth(calMonth === 0 ? 11 : calMonth - 1, calMonth === 0 ? calYear - 1 : calYear);
        const cells: { day: number; current: boolean; isToday: boolean }[] = [];

        // Previous month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push({ day: prevMonthDays - i, current: false, isToday: false });
        }
        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            cells.push({ day: d, current: true, isToday });
        }
        // Next month leading days
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            cells.push({ day: d, current: false, isToday: false });
        }
        return cells;
    }, [calMonth, calYear]);

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]" />
                </div>
            </motion.div>
        );
    }

    const hive = detail?.hive;
    const apiary = detail?.apiary;
    const queen = detail?.queen;
    const lastInspection = detail?.last_inspection;
    const harvests = detail?.harvests || [];
    const requests = detail?.requests || [];
    const rearingBatches = detail?.queen_rearing_batches || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
            {/* ── Header ── */}
            <div className="flex items-center gap-4 pb-5 border-b border-border/ mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-foreground tracking-tight">{hive?.hive_code || 'Hive'}</h1>
                    <p className="text-sm text-[#F4D03F] font-semibold">{apiary?.name || 'BeeYield Apiary'}</p>
                </div>
            </div>

            {/* ── Main Grid: Left content + Right sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── LEFT COLUMN (2/3) ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* My Requests */}
                    <div className={cn(glass.section, 'bg-[#FFFBEB] border border-amber-100')}>
                        <div className={glass.sectionHeader}>
                            <BeeYieldSectionHeader
                                title="My Requests"
                                icon={ClipboardList}
                                actions={
                                    <button className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1 rounded-full px-3 py-1">
                                        <ExternalLink className="w-3 h-3" /> More
                                    </button>
                                }
                            />
                        </div>
                        <div className="p-5">
                            {requests.length === 0 ? (
                                <p className="text-sm text-red-500 text-center py-4 font-medium">No requests to display for selected hive.</p>
                            ) : (
                                <div className="space-y-2">
                                    {requests.map((r: any) => (
                                        <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/ border border-border/">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{r.subject || r.title}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={cn(glass.badge, r.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : '')}>{r.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else { setCalMonth(calMonth - 1); } }} className="w-8 h-8 rounded-lg border border-border/ flex items-center justify-center hover:bg-[#F4D03F]/5 transition-colors">
                                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else { setCalMonth(calMonth + 1); } }} className="w-8 h-8 rounded-lg border border-border/ flex items-center justify-center hover:bg-[#F4D03F]/5 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-black text-foreground">{MONTHS[calMonth]} {calYear}</h3>
                                <div className="flex bg-[#F4D03F]/5 p-0.5 rounded-lg border border-border/">
                                    <span className="px-3 py-1 rounded-md bg-white text-[10px] font-bold text-foreground shadow-sm">Month</span>
                                    <span className="px-3 py-1 text-[10px] font-bold text-muted-foreground/70">Agenda</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-0">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center py-2 text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">{d}</div>
                                ))}
                                {calendarDays.map((cell, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-center py-3 text-sm font-semibold rounded-lg transition-colors cursor-default",
                                            cell.current ? 'text-foreground' : 'text-gray-300',
                                            cell.isToday && 'bg-[#FEF3C7] text-foreground font-black outline-none ring-0',
                                            // Show inspection dates in red
                                            cell.current && detail?.inspections?.some(ins => {
                                                const d = new Date(ins.inspection_date);
                                                return d.getDate() === cell.day && d.getMonth() === calMonth && d.getFullYear() === calYear;
                                            }) && 'text-red-500 font-bold'
                                        )}
                                    >
                                        {cell.day}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="h-9 px-5 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#1E293B] transition-colors shadow-sm">
                                    Export .ics
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.section)}>\n                        <div className="p-5">
                            <h3 className="text-lg font-black text-foreground italic mb-1">The Queen's Rearing Calendar</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-5">Plan a batch, track milestones, and confirm progress directly from the hive view.</p>

                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={fetchDetail} className="h-9 px-4 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#1E293B] transition-colors shadow-sm">
                                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                                </button>
                                <button onClick={() => setShowRearingForm(true)} className="h-9 px-4 rounded-full bg-white border border-gray-200 text-[#1E293B] text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Plus className="w-3.5 h-3.5" /> New batch
                                </button>
                            </div>

                            {/* Existing batches */}
                            {rearingBatches.length > 0 ? (
                                <div className="space-y-3">
                                    {rearingBatches.map(batch => (
                                        <div key={batch.id} className="p-4 rounded-xl bg-muted/ border border-border/ shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{batch.batch_name}</p>
                                                    <p className="text-xs text-muted-foreground">{batch.method} · {new Date(batch.start_date).toLocaleDateString()} · {batch.planned_units} units</p>
                                                </div>
                                                <span className={cn(glass.badge, batch.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : '')}>{batch.status || 'active'}</span>
                                            </div>
                                            {batch.notebook && <p className="text-xs text-muted-foreground mt-2 border-t border-border/ pt-2">{batch.notebook}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                                    <p className="text-sm text-muted-foreground font-medium mb-4">No queen rearing batches have been created for this hive yet.</p>
                                    <button onClick={() => setShowRearingForm(true)} className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-bold text-[#1E293B] hover:bg-gray-50 transition-colors shadow-sm">
                                        Create first batch
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.section)}>
                        <div className={glass.sectionHeader}>
                            <BeeYieldSectionHeader
                                title="Harvest Records"
                                icon={Wheat}
                                actions={
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShowHarvestForm(true)} className={cn(glass.btnPrimary, 'h-8 px-3 text-[10px]')}>
                                            <Plus className="w-3.5 h-3.5" /> Add harvest
                                        </button>
                                        <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, 'h-8 px-3 text-[10px]')}>
                                            <ExternalLink className="w-3 h-3" /> All harvests
                                        </button>
                                    </div>
                                }
                            />
                        </div>
                        <div className="p-5 space-y-5">
                            {/* ── Summary strip ── */}
                            {harvests.length > 0 && (() => {
                                const totalKg = harvests.reduce((s: number, h: any) => s + (parseFloat(h.quantity_kg) || 0), 0);
                                const linkedBatchCount = harvests.filter((h: any) => h.batch_code || h.traceability_code || h.batch?.batch_code).length;
                                const latestDate = harvests.reduce((latest: string, h: any) => {
                                    return !latest || h.harvest_date > latest ? h.harvest_date : latest;
                                }, '');
                                return (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 rounded-xl bg-[#F4D03F]/5 border border-border/ text-center">
                                            <p className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Total Yield</p>
                                            <p className="text-lg font-black text-foreground tabular-nums">{totalKg.toFixed(1)}<span className="text-xs font-bold text-muted-foreground/70 ml-0.5">kg</span></p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F4D03F]/5 border border-border/ text-center">
                                            <p className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Batches</p>
                                            <p className="text-lg font-black text-foreground tabular-nums">{harvests.length}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F4D03F]/5 border border-border/ text-center">
                                            <p className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Linked Codes</p>
                                            <p className="text-lg font-black text-foreground tabular-nums">{linkedBatchCount}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F4D03F]/5 border border-border/ text-center">
                                            <p className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Last Harvest</p>
                                            <p className="text-sm font-black text-foreground">{latestDate ? new Date(latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Hive type badge ── */}
                            {hive?.hive_type && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A]/3 border border-border/ w-fit">
                                    <Hexagon className="w-3.5 h-3.5 text-[#F4D03F]" />
                                    <span className="text-[10px] font-black text-foreground tracking-wide uppercase">{hive.hive_type}</span>
                                    <span className="text-[10px] text-muted-foreground/70 font-medium">hive type</span>
                                </div>
                            )}

                            {/* ── Harvest cards ── */}
                            {harvests.length > 0 ? (
                                <div className="space-y-3">
                                    {harvests.map((h: any, i: number) => (
                                        <motion.div
                                            key={h.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => setSelectedHarvest(h)}
                                            className="rounded-xl border border-border/ bg-muted/ overflow-hidden shadow-sm hover:border-border/ hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            {/* Card header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-border/ bg-muted/">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-[#F4D03F]/10 border border-border/ flex items-center justify-center">
                                                        <Wheat className="w-3.5 h-3.5 text-[#D97706]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-foreground tabular-nums">
                                                            {parseFloat(h.quantity_kg || 0).toFixed(1)} kg
                                                            <span className="ml-2 text-[10px] font-bold text-[#D97706] bg-[#F4D03F]/10 px-2 py-0.5 rounded-md">{h.honey_type || 'Multi-flower'}</span>
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-muted-foreground/70">
                                                            {new Date(h.harvest_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {h.batch_code && (
                                                        <span className="px-2.5 py-1 rounded-lg bg-[#1A1A1A]/5 border border-border/ text-[9px] font-black text-muted-foreground tracking-widest font-mono">
                                                            {h.batch_code}
                                                        </span>
                                                    )}
                                                    {h.is_verified && (
                                                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-600">
                                                            <ShieldCheck className="w-3 h-3" /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card body: data grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-[#F4D03F]/10">
                                                {[
                                                    { label: 'Color grade', value: h.color_grade || '—' },
                                                    { label: 'Moisture', value: h.moisture_content_percent ? `${h.moisture_content_percent}%` : '—' },
                                                    { label: 'Left for bees', value: h.quantity_left_for_bees_kg ? `${parseFloat(h.quantity_left_for_bees_kg).toFixed(1)} kg` : '—' },
                                                    { label: 'Extraction', value: h.extraction_method || '—' },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="px-3 py-2.5 flex flex-col gap-0.5">
                                                        <p className="text-[8px] font-black text-muted-foreground/70 uppercase tracking-wider">{label}</p>
                                                        <p className="text-[11px] font-bold text-foreground truncate" title={value}>{value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {(h.batch_code || h.traceability_code || h.batch?.batch_code) && (
                                                <div className="px-4 py-2.5 border-t border-border/ bg-white/60 flex items-center justify-between gap-3">
                                                    <span className="text-[8px] font-black text-muted-foreground/70 uppercase tracking-wider">Hive to batch traceability</span>
                                                    <span className="text-[10px] font-black text-foreground font-mono truncate" title={h.traceability_code || h.batch?.batch_code || h.batch_code}>
                                                        {h.traceability_code || h.batch?.batch_code || h.batch_code}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Notes row */}
                                            {(h.notes || h.forage_type || h.weather_conditions) && (
                                                <div className="px-4 py-2.5 border-t border-border/ bg-[#FFFBF0]/40 flex items-start gap-3 flex-wrap">
                                                    {h.forage_type && <span className="text-[10px] text-muted-foreground"><span className="font-bold text-muted-foreground/70">Flora:</span> {h.forage_type}</span>}
                                                    {h.weather_conditions && <span className="text-[10px] text-muted-foreground"><span className="font-bold text-muted-foreground/70">Weather:</span> {h.weather_conditions}</span>}
                                                    {h.notes && <span className="text-[10px] text-muted-foreground italic">{h.notes}</span>}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center rounded-2xl border border-dashed border-border/ bg-[#FFFBF0]/30">
                                    <Wheat className="w-8 h-8 mx-auto mb-3 text-[#F4D03F] opacity-30" />
                                    <p className="text-sm font-bold text-muted-foreground/70">No harvests recorded yet</p>
                                    <p className="text-[11px] text-muted-foreground/70 mt-1 mb-4">Log your first batch to start tracking production.</p>
                                    <button onClick={() => setShowHarvestForm(true)} className={cn(glass.btnPrimary, 'mx-auto')}>
                                        <Plus className="w-4 h-4" /> Add first harvest
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR (1/3) ── */}
                <div className="space-y-6">

                    {/* Last Inspection */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <BeeYieldSectionHeader title="Last Inspection" icon={Eye} />
                            {lastInspection ? (
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-muted-foreground">Date</span>
                                        <span className="text-xs font-bold text-foreground">{new Date(lastInspection.inspection_date).toLocaleDateString()}</span>
                                    </div>
                                    {lastInspection.health_status && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-muted-foreground">Health</span>
                                            <span className={cn(glass.badge, 'text-[10px]')}>{lastInspection.health_status}</span>
                                        </div>
                                    )}
                                    {lastInspection.queen_seen !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-muted-foreground">Queen seen</span>
                                            <span className="text-xs font-bold">{lastInspection.queen_seen ? '✓ Yes' : '✗ No'}</span>
                                        </div>
                                    )}
                                    {lastInspection.notes && (
                                        <p className="text-xs text-muted-foreground mt-2 border-t border-border/ pt-2">{lastInspection.notes}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground/70 mt-3">No inspections recorded for selected hive.</p>
                            )}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <BeeYieldSectionHeader title="QR Code" icon={QrCode} />
                            <div className="mt-3 flex flex-col items-center">
                                <div className="w-32 h-32 bg-white rounded-xl border-2 border-border/ flex items-center justify-center shadow-inner mb-3 overflow-hidden">
                                    <canvas ref={qrRef} className="w-full h-full" />
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <button 
                                        onClick={handleDownloadQR}
                                        className="h-8 px-3 rounded-lg border border-border/ text-xs font-bold text-muted-foreground/90 flex items-center gap-1.5 hover:bg-[#F4D03F]/5 transition-colors"
                                    >
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                    <button 
                                        onClick={handlePrintQR}
                                        className="h-8 px-3 rounded-lg border border-border/ text-xs font-bold text-muted-foreground/90 flex items-center gap-1.5 hover:bg-[#F4D03F]/5 transition-colors"
                                    >
                                        <Printer className="w-3 h-3" /> Print
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed">Print and stick a QR code on the hive to quickly find the hive in the BeeYield webapp or app.</p>
                            </div>
                        </div>
                    </div>

                    {/* Queen */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <BeeYieldSectionHeader title="Queen" icon={Crown} />
                            <div className="mt-3 flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#F4D03F]/10 border border-border/ flex items-center justify-center text-2xl flex-shrink-0">
                                    🐝
                                </div>
                                <div className="flex-1">
                                    {queen ? (
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{queen.name || 'Queen'}</p>
                                            <p className="text-xs text-muted-foreground">{queen.breed || 'Unknown breed'} · {queen.origin || 'Unknown origin'}</p>
                                            {queen.marking_color && <p className="text-xs text-muted-foreground/70 mt-1">Marked: {queen.marking_color} · {queen.year_introduced}</p>}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Queen</p>
                                            <p className="text-xs text-muted-foreground/70 font-medium mb-2">No queen assigned to this hive.</p>
                                            <button
                                                onClick={() => setShowQueenForm(true)}
                                                className="text-[11px] font-black text-red-500 hover:text-red-600 mt-1 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full border border-red-100 transition-colors"
                                            >
                                                CLICK TO ADD
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════ QUEEN FORM MODAL ══════════ */}
            <AnimatePresence>
                {showQueenForm && (
                    <div className={glass.modalOverlay} onClick={() => setShowQueenForm(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(glass.modalCard, 'max-w-lg')}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b border-border/ bg-white flex items-center justify-between rounded-t-2xl">
                                <div>
                                    <h2 className="text-lg font-black text-foreground">Assign Queen</h2>
                                    <p className="text-xs text-muted-foreground font-medium">Add queen information for {hive?.hive_code}</p>
                                </div>
                                <button onClick={() => setShowQueenForm(false)} className="w-8 h-8 rounded-lg border border-border/ flex items-center justify-center hover:bg-red-50 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="queen-name" className={glass.microLabel}>Name</Label>
                                        <Input id="queen-name" className={glass.input} placeholder="Queen name" value={queenForm.name} onChange={e => setQueenForm({ ...queenForm, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="queen-breed" className={glass.microLabel}>Breed</Label>
                                        <Input id="queen-breed" className={glass.input} placeholder="e.g. Italian, Carniolan" value={queenForm.breed} onChange={e => setQueenForm({ ...queenForm, breed: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className={glass.microLabel}>Origin</Label>
                                        <Select value={queenForm.origin} onValueChange={v => setQueenForm({ ...queenForm, origin: v })}>
                                            <SelectTrigger className={glass.select}><SelectValue /></SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="raised">Raised</SelectItem>
                                                <SelectItem value="purchased">Purchased</SelectItem>
                                                <SelectItem value="swarm-caught">Swarm-caught</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className={glass.microLabel}>Marking color</Label>
                                        <Select value={queenForm.marking_color} onValueChange={v => setQueenForm({ ...queenForm, marking_color: v })}>
                                            <SelectTrigger className={glass.select}><SelectValue /></SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['white', 'yellow', 'red', 'green', 'blue'].map(c => (
                                                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="queen-year" className={glass.microLabel}>Year introduced</Label>
                                    <Input id="queen-year" type="number" className={glass.input} value={queenForm.year_introduced} onChange={e => setQueenForm({ ...queenForm, year_introduced: parseInt(e.target.value) || new Date().getFullYear() })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="queen-notes" className={glass.microLabel}>Notes</Label>
                                    <Textarea id="queen-notes" className={cn(glass.input, 'min-h-[80px] resize-none')} placeholder="Optional observations..." value={queenForm.notes} onChange={e => setQueenForm({ ...queenForm, notes: e.target.value })} />
                                </div>
                                <div className="pt-3 flex gap-3">
                                    <button className="h-10 px-6 rounded-full bg-[#0F172A] text-white text-sm font-bold flex items-center justify-center hover:bg-[#1E293B] transition-colors" onClick={() => setShowQueenForm(false)}>Cancel</button>
                                    <button onClick={handleSaveQueen} disabled={savingQueen} className="h-10 px-6 rounded-full bg-[#F8F9FA] border border-gray-200 text-[#1E293B] text-sm font-bold flex items-center justify-center gap-2 flex-1 hover:bg-white transition-colors">
                                        {savingQueen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                        Assign Queen
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══════════ VIEW HARVEST RECORD MODAL ══════════ */}
            <GlassModal
                isOpen={!!selectedHarvest}
                onClose={() => setSelectedHarvest(null)}
                title="Harvest Record"
                subtitle={`Details for batch ${selectedHarvest?.batch_code || 'unspecified'}`}
            >
                {selectedHarvest && (
                    <div className="space-y-6">
                        {/* Highlights Strip */}
                        <div className="flex bg-muted/ rounded-xl p-3 border border-border/ gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Yield</p>
                                <p className="text-xl font-black text-foreground">{parseFloat(selectedHarvest.quantity_kg || 0).toFixed(1)} <span className="text-sm text-muted-foreground/70">kg</span></p>
                            </div>
                            <div className="w-px bg-[#F4D03F]/20" />
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider mb-0.5">Date</p>
                                <p className="text-sm font-bold text-foreground mt-1">{new Date(selectedHarvest.harvest_date).toLocaleDateString()}</p>
                            </div>
                            <div className="w-px bg-[#F4D03F]/20" />
                            <div className="flex-1 text-right flex flex-col items-end justify-center">
                                {selectedHarvest.is_verified ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-600">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[10px] font-black text-muted-foreground">
                                        Unverified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Honey Type</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.honey_type || '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Color Grade</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.color_grade || '—'}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Moisture Content</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.moisture_content_percent ? `${selectedHarvest.moisture_content_percent}%` : '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Extraction Method</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.extraction_method || '—'}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Left for Bees</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.quantity_left_for_bees_kg ? `${selectedHarvest.quantity_left_for_bees_kg} kg` : '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Forage Type (Flora)</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.forage_type || selectedHarvest.florage_type || '—'}</p>
                            </div>

                            <div className="space-y-1 col-span-2">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Weather Conditions</p>
                                <p className="text-sm font-bold text-foreground">{selectedHarvest.weather_conditions || '—'}</p>
                            </div>

                            <div className="space-y-1 col-span-2 pt-3 border-t border-border/">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Traceability Code</p>
                                <p className="text-sm font-bold text-foreground font-mono break-all">{selectedHarvest.traceability_code || selectedHarvest.batch?.batch_code || selectedHarvest.batch_code || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Linked Batch ID</p>
                                <p className="text-sm font-bold text-foreground font-mono truncate" title={selectedHarvest.honey_batch_id || selectedHarvest.batch?.id || ''}>{selectedHarvest.honey_batch_id || selectedHarvest.batch?.id || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Block Hash</p>
                                <p className="text-sm font-bold text-foreground font-mono truncate" title={selectedHarvest.blockchain_hash || selectedHarvest.batch?.block_hash || ''}>{selectedHarvest.blockchain_hash || selectedHarvest.batch?.block_hash || '-'}</p>
                            </div>

                            {selectedHarvest.notes && (
                                <div className="space-y-1 col-span-2 pt-3 border-t border-border/">
                                    <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">Notes</p>
                                    <p className="text-sm text-muted-foreground/90 bg-[#FFFBF0]/50 p-3 rounded-lg border border-border/ leading-relaxed">{selectedHarvest.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button onClick={() => setSelectedHarvest(null)} className={cn(glass.btnSecondary, "px-6")}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </GlassModal>

            {/* ══════════ HARVEST FORM MODAL ══════════ */}
            <GlassModal
                isOpen={showHarvestForm}
                onClose={() => setShowHarvestForm(false)}
                title="Record Harvest"
                subtitle={`Log a new honey batch for ${detail?.hive?.hive_code || 'this hive'}`}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Harvest Date*</label>
                            <input
                                type="date"
                                value={harvestForm.harvest_date}
                                onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Yield (KG)*</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={harvestForm.quantity_kg || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Honey Type</label>
                            <select
                                value={harvestForm.honey_type}
                                onChange={(e) => setHarvestForm({ ...harvestForm, honey_type: e.target.value })}
                                className={cn(glass.select, "w-full h-9 text-sm font-bold")}
                            >
                                <option value="Acacia">Acacia</option>
                                <option value="Wildflower">Wildflower</option>
                                <option value="Lavender">Lavender</option>
                                <option value="Multi-flower">Multi-flower</option>
                                <option value="Buckwheat">Buckwheat</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Color Grade</label>
                            <select
                                value={harvestForm.color_grade}
                                onChange={(e) => setHarvestForm({ ...harvestForm, color_grade: e.target.value })}
                                className={cn(glass.select, "w-full h-9 text-sm font-bold")}
                            >
                                <option value="Extra Light Amber">Extra Light Amber</option>
                                <option value="Light Amber">Light Amber</option>
                                <option value="Amber">Amber</option>
                                <option value="Dark Amber">Dark Amber</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Left for Bees (KG)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={harvestForm.quantity_left_for_bees_kg || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, quantity_left_for_bees_kg: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Moisture (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="18.0"
                                value={harvestForm.moisture_content_percent || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, moisture_content_percent: parseFloat(e.target.value) || 0 })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Florage Type</label>
                            <input
                                placeholder="e.g. Wildflower"
                                value={harvestForm.florage_type || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, florage_type: e.target.value })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Batch Code</label>
                            <input
                                placeholder="Auto-generated"
                                value={harvestForm.batch_code || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, batch_code: e.target.value })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70">Weather</label>
                            <input
                                placeholder="e.g. Sunny, 25°C"
                                value={harvestForm.weather_conditions || ''}
                                onChange={(e) => setHarvestForm({ ...harvestForm, weather_conditions: e.target.value })}
                                className={cn(glass.input, "w-full h-9 text-sm font-bold")}
                            />
                        </div>
                        <div className="space-y-2 border border-border/ rounded-xl p-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="modal-harvest-verified"
                                checked={harvestForm.is_verified}
                                onChange={(e) => setHarvestForm({ ...harvestForm, is_verified: e.target.checked })}
                                className="rounded bg-black/40 border-border/ text-[#F4D03F] focus:ring-[#F4D03F]/50 w-4 h-4"
                            />
                            <label htmlFor="modal-harvest-verified" className="text-[10px] font-black uppercase text-muted-foreground/70 cursor-pointer">
                                Verified Record
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground/70">Notes</label>
                        <textarea
                            placeholder="Observations..."
                            value={harvestForm.notes || ''}
                            onChange={(e) => setHarvestForm({ ...harvestForm, notes: e.target.value })}
                            className={cn(glass.input, "w-full min-h-[60px] text-sm font-bold p-2")}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowHarvestForm(false)} className={cn(glass.btnSecondary, "flex-1")}>
                            Cancel
                        </button>
                        <button onClick={handleSaveHarvest} disabled={savingHarvest || !harvestForm.quantity_kg} className={cn(glass.btnPrimary, "flex-1")}>
                            {savingHarvest ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {savingHarvest ? 'Recording...' : 'Record Harvest'}
                        </button>
                    </div>
                </div>
            </GlassModal>

            {/* ══════════ QUEEN REARING BATCH FORM MODAL ══════════ */}
            <AnimatePresence>
                {showRearingForm && (
                    <div className={glass.modalOverlay} onClick={() => setShowRearingForm(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(glass.modalCard, 'max-w-xl')}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b border-border/ bg-[#F4D03F]/[0.02]">
                                <h2 className="text-lg font-black text-foreground">New Queen Rearing Batch</h2>
                                <p className="text-xs text-muted-foreground font-medium">Plan a batch for {hive?.hive_code}</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="batch-name" className={glass.microLabel}>Batch name</Label>
                                        <Input id="batch-name" className={glass.input} placeholder="Batch name" value={rearingForm.batch_name} onChange={e => setRearingForm({ ...rearingForm, batch_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className={glass.microLabel}>Method</Label>
                                        <Select value={rearingForm.method} onValueChange={v => setRearingForm({ ...rearingForm, method: v })}>
                                            <SelectTrigger className={glass.select}><SelectValue /></SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Grafting', 'Walk-away', 'Miller', 'Jenter', 'OTS'].map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="batch-start" className={glass.microLabel}>Start date</Label>
                                        <Input id="batch-start" type="date" className={glass.input} value={rearingForm.start_date} onChange={e => setRearingForm({ ...rearingForm, start_date: e.target.value })} />
                                    </div>
                                </div>

                                <div className="w-1/3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="batch-units" className={glass.microLabel}>Planned units</Label>
                                        <Input id="batch-units" type="number" className={glass.input} value={rearingForm.planned_units} onChange={e => setRearingForm({ ...rearingForm, planned_units: parseInt(e.target.value) || 20 })} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="batch-notebook" className={glass.microLabel}>Notebook</Label>
                                    <Textarea id="batch-notebook" className={cn(glass.input, 'min-h-[120px] resize-y')} placeholder="Notebook" value={rearingForm.notebook} onChange={e => setRearingForm({ ...rearingForm, notebook: e.target.value })} />
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_calendar} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_calendar: !!c })} />
                                        Generate calendar
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_units} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_units: !!c })} />
                                        Generate units
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_reminders} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_reminders: !!c })} />
                                        Generate reminders
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button onClick={() => setShowRearingForm(false)} className="px-6 py-2.5 rounded-full bg-[#0F172A] text-white text-sm font-bold hover:bg-[#1E293B] transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleCreateRearingBatch} disabled={savingBatch || !rearingForm.batch_name} className="px-6 py-2.5 rounded-full bg-[#F8F9FA] border border-gray-200 text-[#1E293B] text-sm font-bold hover:bg-white transition-colors shadow-sm disabled:opacity-50">
                                        {savingBatch ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                        Create batch
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HiveDetailView;

