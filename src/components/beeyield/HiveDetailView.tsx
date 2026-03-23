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
    ShieldCheck, Eye, Bug, Loader2, FileText
} from 'lucide-react';
import { beeyieldService, Hive, Apiary, Harvest, Inspection, Queen, QueenRearingBatch, HiveDetailData } from '@/services/beeyieldService';
import { toast } from 'sonner';

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
    const today = new Date();

    const calendarDays = React.useMemo(() => {
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
            <div className="flex items-center gap-4 pb-5 border-b border-[#F4D03F]/20 mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1A1A1A] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{hive?.hive_code || 'Hive'}</h1>
                    <p className="text-sm text-[#F4D03F] font-semibold">{apiary?.name || 'BeeYield Apiary'}</p>
                </div>
            </div>

            {/* ── Main Grid: Left content + Right sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── LEFT COLUMN (2/3) ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* My Requests */}
                    <div className={cn(glass.section)}>
                        <div className={glass.sectionHeader}>
                            <BeeYieldSectionHeader
                                title="My Requests"
                                icon={ClipboardList}
                                actions={
                                    <button className="text-xs font-bold text-[#F4D03F] hover:underline flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> More
                                    </button>
                                }
                            />
                        </div>
                        <div className="p-5">
                            {requests.length === 0 ? (
                                <p className="text-sm text-amber-600 text-center py-4 font-medium">No requests to display for selected hive.</p>
                            ) : (
                                <div className="space-y-2">
                                    {requests.map((r: any) => (
                                        <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-[#F4D03F]/10">
                                            <div>
                                                <p className="text-sm font-bold text-[#1A1A1A]">{r.subject || r.title}</p>
                                                <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
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
                                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else { setCalMonth(calMonth - 1); } }} className="w-8 h-8 rounded-lg border border-[#F4D03F]/20 flex items-center justify-center hover:bg-[#F4D03F]/5 transition-colors">
                                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else { setCalMonth(calMonth + 1); } }} className="w-8 h-8 rounded-lg border border-[#F4D03F]/20 flex items-center justify-center hover:bg-[#F4D03F]/5 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-black text-[#1A1A1A]">{MONTHS[calMonth]} {calYear}</h3>
                                <div className="flex bg-[#F4D03F]/5 p-0.5 rounded-lg border border-[#F4D03F]/10">
                                    <span className="px-3 py-1 rounded-md bg-white text-[10px] font-bold text-[#1A1A1A] shadow-sm">Month</span>
                                    <span className="px-3 py-1 text-[10px] font-bold text-gray-400">Agenda</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-0">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">{d}</div>
                                ))}
                                {calendarDays.map((cell, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-center py-3 text-sm font-semibold rounded-lg transition-colors cursor-default",
                                            cell.current ? 'text-[#1A1A1A]' : 'text-gray-300',
                                            cell.isToday && 'bg-[#F4D03F]/10 text-[#1A1A1A] font-black ring-2 ring-[#F4D03F]/30',
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
                                <button className="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#333] transition-colors shadow-sm">
                                    Export .ics
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.section)}>\n                        <div className="p-5">
                            <h3 className="text-lg font-black text-[#1A1A1A] italic mb-1">The Queen's Rearing Calendar</h3>
                            <p className="text-sm text-gray-500 font-medium mb-5">Plan a batch, track milestones, and confirm progress directly from the hive view.</p>

                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={fetchDetail} className={cn(glass.btnPrimary, 'h-9 text-xs')}>
                                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                                </button>
                                <button onClick={() => setShowRearingForm(true)} className={cn(glass.btnSecondary, 'h-9 text-xs')}>
                                    <Plus className="w-3.5 h-3.5" /> New batch
                                </button>
                            </div>

                            {/* Existing batches */}
                            {rearingBatches.length > 0 ? (
                                <div className="space-y-3">
                                    {rearingBatches.map(batch => (
                                        <div key={batch.id} className="p-4 rounded-xl bg-white/50 border border-[#F4D03F]/10 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-[#1A1A1A]">{batch.batch_name}</p>
                                                    <p className="text-xs text-gray-500">{batch.method} · {new Date(batch.start_date).toLocaleDateString()} · {batch.planned_units} units</p>
                                                </div>
                                                <span className={cn(glass.badge, batch.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : '')}>{batch.status || 'active'}</span>
                                            </div>
                                            {batch.notebook && <p className="text-xs text-gray-500 mt-2 border-t border-[#F4D03F]/10 pt-2">{batch.notebook}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-white/10 rounded-2xl border border-dashed border-[#F4D03F]/20">
                                    <p className="text-sm text-gray-500 font-medium mb-4">No queen rearing batches have been created for this hive yet.</p>
                                    <button onClick={() => setShowRearingForm(true)} className="px-5 py-2.5 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/20 text-sm font-bold text-[#1A1A1A] hover:bg-white transition-colors shadow-sm">
                                        Create first batch
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.section)}>\n                        <div className="p-5">
                            <h3 className="text-lg font-black text-[#1A1A1A] mb-1">Harvests</h3>
                            <p className="text-sm text-gray-500 font-medium mb-5">Detailed harvest statistics for the selected hive.</p>

                            {harvests.length > 0 ? (
                                <div className="space-y-2">
                                    {harvests.map((h: any) => (
                                        <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-[#F4D03F]/10">
                                            <div>
                                                <p className="text-sm font-bold text-[#1A1A1A]">{h.quantity_kg} kg — {h.honey_type || 'Multi-flower'}</p>
                                                <p className="text-xs text-gray-500">{new Date(h.harvest_date).toLocaleDateString()}{h.batch_code ? ` · ${h.batch_code}` : ''}</p>
                                            </div>
                                            {h.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-6">No harvests to display.</p>
                            )}

                            <div className="flex items-center gap-3 mt-5">
                                <button className={cn(glass.btnSecondary, 'h-9 text-xs')}>
                                    <Plus className="w-3.5 h-3.5" /> Add harvest
                                </button>
                                <button onClick={() => onTabChange('harvests')} className={cn(glass.btnPrimary, 'h-9 text-xs')}>
                                    <ExternalLink className="w-3.5 h-3.5" /> Go to harvests
                                </button>
                            </div>
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
                                        <span className="text-xs text-gray-500">Date</span>
                                        <span className="text-xs font-bold text-[#1A1A1A]">{new Date(lastInspection.inspection_date).toLocaleDateString()}</span>
                                    </div>
                                    {lastInspection.health_status && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Health</span>
                                            <span className={cn(glass.badge, 'text-[10px]')}>{lastInspection.health_status}</span>
                                        </div>
                                    )}
                                    {lastInspection.queen_seen !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500">Queen seen</span>
                                            <span className="text-xs font-bold">{lastInspection.queen_seen ? '✓ Yes' : '✗ No'}</span>
                                        </div>
                                    )}
                                    {lastInspection.notes && (
                                        <p className="text-xs text-gray-500 mt-2 border-t border-[#F4D03F]/10 pt-2">{lastInspection.notes}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 mt-3">No inspections recorded for selected hive.</p>
                            )}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <BeeYieldSectionHeader title="QR Code" icon={QrCode} />
                            <div className="mt-3 flex flex-col items-center">
                                <div className="w-32 h-32 bg-white rounded-xl border-2 border-[#F4D03F]/20 flex items-center justify-center shadow-inner mb-3">
                                    <QrCode className="w-20 h-20 text-[#1A1A1A] opacity-80" />
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <button className="h-8 px-3 rounded-lg border border-[#F4D03F]/20 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-[#F4D03F]/5 transition-colors">
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                    <button className="h-8 px-3 rounded-lg border border-[#F4D03F]/20 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-[#F4D03F]/5 transition-colors">
                                        <Printer className="w-3 h-3" /> Print
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center leading-relaxed">Print and stick a QR code on the hive to quickly find the hive in the Intelligent Hive browser or mobile app.</p>
                            </div>
                        </div>
                    </div>

                    {/* Queen */}
                    <div className={cn(glass.section)}>
                        <div className="p-5">
                            <BeeYieldSectionHeader title="Queen" icon={Crown} />
                            <div className="mt-3 flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center text-2xl flex-shrink-0">
                                    🐝
                                </div>
                                <div className="flex-1">
                                    {queen ? (
                                        <div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">{queen.name || 'Queen'}</p>
                                            <p className="text-xs text-gray-500">{queen.breed || 'Unknown breed'} · {queen.origin || 'Unknown origin'}</p>
                                            {queen.marking_color && <p className="text-xs text-gray-400 mt-1">Marked: {queen.marking_color} · {queen.year_introduced}</p>}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">Queen</p>
                                            <p className="text-xs text-gray-400 font-medium">No queen assigned to this hive.</p>
                                            <button
                                                onClick={() => setShowQueenForm(true)}
                                                className="text-xs font-black text-[#F4D03F] hover:underline mt-1 uppercase tracking-wider"
                                            >
                                                Click to add
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
                            <div className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-[#1A1A1A]">Assign Queen</h2>
                                    <p className="text-xs text-gray-500 font-medium">Add queen information for {hive?.hive_code}</p>
                                </div>
                                <button onClick={() => setShowQueenForm(false)} className="w-8 h-8 rounded-lg border border-[#F4D03F]/20 flex items-center justify-center hover:bg-red-50 transition-colors">
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
                                    <button className={glass.btnSecondary} onClick={() => setShowQueenForm(false)}>Cancel</button>
                                    <button onClick={handleSaveQueen} disabled={savingQueen} className={cn(glass.btnPrimary, 'flex-1')}>
                                        {savingQueen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                        Assign Queen
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                            <div className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02]">
                                <h2 className="text-lg font-black text-[#1A1A1A]">New Queen Rearing Batch</h2>
                                <p className="text-xs text-gray-500 font-medium">Plan a batch for {hive?.hive_code}</p>
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
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_calendar} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_calendar: !!c })} />
                                        Generate calendar
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_units} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_units: !!c })} />
                                        Generate units
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] cursor-pointer">
                                        <Checkbox checked={rearingForm.generate_reminders} onCheckedChange={c => setRearingForm({ ...rearingForm, generate_reminders: !!c })} />
                                        Generate reminders
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button onClick={() => setShowRearingForm(false)} className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-bold hover:bg-[#333] transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleCreateRearingBatch} disabled={savingBatch || !rearingForm.batch_name} className="px-6 py-2.5 rounded-full bg-[#F9F7F2] border border-[#F4D03F]/30 text-[#1A1A1A] text-sm font-bold hover:bg-white transition-colors shadow-sm disabled:opacity-50">
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
