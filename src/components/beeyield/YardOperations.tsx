import React from 'react';
import {
    ClipboardList, Filter, AlertTriangle, CheckCircle2, Clock, ChevronDown, Save, Plus, Hexagon, Activity, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

interface YardOperationsProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

type Urgency = 'critical' | 'high' | 'medium' | 'low';

interface HiveTask {
    id: string;
    hive: string;
    location: string;
    urgency: Urgency;
    reason: string;
    fob: number;
    fobr: number;
    lastInspected: string;
    resolved: boolean;
}

const initialTasks: HiveTask[] = [
    { id: 'T-001', hive: 'HV-003', location: 'Block 4B', urgency: 'critical', reason: 'Queenless Acoustic Signature Detected', fob: 3, fobr: 1, lastInspected: '2026-02-14', resolved: false },
    { id: 'T-002', hive: 'HV-002', location: 'Block 4B', urgency: 'high', reason: 'Pre-Swarm Pattern — Inspect for Swarm Cells', fob: 9, fobr: 7, lastInspected: '2026-02-15', resolved: false },
    { id: 'T-003', hive: 'HV-006', location: 'Block 3A', urgency: 'medium', reason: 'Low Activity — Wind Exposure Concerns', fob: 6, fobr: 4, lastInspected: '2026-02-17', resolved: false },
    { id: 'T-004', hive: 'HV-001', location: 'Block 1C', urgency: 'low', reason: 'Routine Mite Treatment Due', fob: 8, fobr: 6, lastInspected: '2026-02-18', resolved: false },
    { id: 'T-005', hive: 'HV-004', location: 'Block 1C', urgency: 'low', reason: 'Syrup top-up required', fob: 7, fobr: 5, lastInspected: '2026-02-18', resolved: true },
    { id: 'T-006', hive: 'HV-005', location: 'Block 2D', urgency: 'medium', reason: 'Humidity Above Threshold', fob: 8, fobr: 6, lastInspected: '2026-02-16', resolved: false },
];

const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string; border: string; dot: string }> = {
    critical: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' },
    high: { label: 'High', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
    low: { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
};

const TOTAL_ACRES = 80;

const YardOperations: React.FC<YardOperationsProps> = ({ onTabChange }) => {
    const [tasks, setTasks] = React.useState<HiveTask[]>(initialTasks);
    const [filterUrgency, setFilterUrgency] = React.useState<'all' | Urgency>('all');
    const [showResolved, setShowResolved] = React.useState(false);
    const [auditHive, setAuditHive] = React.useState<HiveTask | null>(null);
    const [auditFob, setAuditFob] = React.useState(0);
    const [auditFobr, setAuditFobr] = React.useState(0);

    const filtered = React.useMemo(() => tasks.filter(t => {
        if (!showResolved && t.resolved) return false;
        if (filterUrgency !== 'all' && t.urgency !== filterUrgency) return false;
        return true;
    }), [tasks, filterUrgency, showResolved]);

    // FPA = total FOB across all hives / total acres
    const fpa = React.useMemo(() => {
        const totalFob = tasks.reduce((sum, t) => sum + t.fob, 0);
        return (totalFob / TOTAL_ACRES).toFixed(2);
    }, [tasks]);

    const handleResolve = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, resolved: true } : t));
    };

    const handleAuditSubmit = () => {
        if (!auditHive) return;
        setTasks(prev => prev.map(t =>
            t.id === auditHive.id
                ? { ...t, fob: auditFob, fobr: auditFobr, lastInspected: new Date().toISOString().slice(0, 10), resolved: true }
                : t
        ));
        setAuditHive(null);
    };

    return (
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20')}>
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">Smart Urgency Filter</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Yard <span className="text-honey">Operations</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        Digital FOB Audit Engine
                    </p>
                </div>

                {/* FPA KPI */}
                <div className={cn(glass.card, "p-6 sm:px-8 border-honey/20 shadow-xl shadow-honey/5 flex flex-col justify-center items-end bg-gradient-to-br from-white/80 to-honey/10")}>
                    <p className={cn(glass.microLabel, "text-muted-foreground mb-1 font-semibold")}>Current FPA</p>
                    <p className={cn(glass.sectionTitle, "text-5xl tabular-nums text-honey leading-none mb-2")}>{fpa}</p>
                    <p className={cn(glass.microLabel, "text-muted-foreground/60 italic font-semibold normal-case")}>Frames Per Acre / {TOTAL_ACRES} ac</p>
                </div>
            </div>

            {/* Filters */}
            <div className={cn(glass.filterBar, "flex-wrap items-center gap-4")}>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex bg-muted/40 p-1 rounded-2xl border border-border w-full md:w-auto overflow-x-auto custom-scrollbar">
                        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(u => (
                            <button
                                key={u}
                                onClick={() => setFilterUrgency(u)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    filterUrgency === u
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {u === 'all' ? 'All' : urgencyConfig[u].label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setShowResolved(r => !r)}
                    className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ml-auto",
                        showResolved ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/50 border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-500"
                    )}
                >
                    {showResolved ? 'Hide Resolved' : 'Show Resolved'}
                </button>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {filtered.length === 0 && (
                    <div className={glass.emptyState}>
                        <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className={cn(glass.sectionTitle, "text-2xl normal-case")}>All Clear</p>
                        <p className={cn(glass.microLabel, "opacity-70 normal-case italic font-bold max-w-sm mx-auto text-center mt-2")}>No tasks matching your current filter.</p>
                    </div>
                )}
                <div className="grid gap-4">
                    {filtered.map(task => {
                        const cfg = urgencyConfig[task.urgency];
                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    glass.card,
                                    "p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-honey/40 transition-all",
                                    task.resolved ? "opacity-60 bg-muted/20" : "",
                                    !task.resolved && `hover:shadow-xl hover:shadow-black/5`
                                )}
                            >
                                <div className="flex items-center gap-4 md:w-48 shrink-0">
                                    <div className={cn("w-3 h-3 rounded-full shrink-0", cfg.dot)} />
                                    <div>
                                        <p className={cn(glass.sectionTitle, "text-xl normal-case leading-none mb-1")}>{task.hive}</p>
                                        <p className={cn(glass.microLabel, "opacity-60 font-semibold normal-case")}>{task.location}</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <p className={cn("text-lg font-serif font-black tracking-tight", task.resolved ? "line-through text-muted-foreground" : cfg.color)}>
                                        {task.reason}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 gap-y-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                            <Hexagon className="w-3 h-3 text-honey" />
                                            <span className={cn(glass.microLabel, "opacity-80")}>FOB: {task.fob}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                            <Hexagon className="w-3 h-3 text-emerald-500" />
                                            <span className={cn(glass.microLabel, "opacity-80")}>FOBr: {task.fobr}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className={cn(glass.microLabel, "opacity-80")}>Last: {task.lastInspected}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                    <span className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent", cfg.bg, cfg.color, cfg.border)}>
                                        {cfg.label}
                                    </span>
                                    {!task.resolved && (
                                        <>
                                            <button
                                                onClick={() => { setAuditHive(task); setAuditFob(task.fob); setAuditFobr(task.fobr); }}
                                                className={cn(glass.btnSecondary, "px-6 h-10 text-[10px]")}
                                            >
                                                Audit
                                            </button>
                                            <button
                                                onClick={() => handleResolve(task.id)}
                                                className={cn(glass.btnPrimary, "px-6 h-10 text-[10px] bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20")}
                                            >
                                                Resolve
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FOB Audit Modal */}
            {auditHive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm" onClick={() => setAuditHive(null)} />
                    <div className={cn(glass.card, "w-full max-w-md relative z-10 shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200")}>
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-honey" />
                                <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>FOB Audit <span className="text-muted-foreground mr-1">—</span> {auditHive.hive}</h3>
                            </div>
                            <button onClick={() => setAuditHive(null)} className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white:bg-white/10 transition-all border border-border">✕</button>
                        </div>
                        <div className="p-8 space-y-8 pb-10">
                            <div className="space-y-4">
                                <label className={cn(glass.microLabel, "text-muted-foreground font-semibold")}>Frames of Bees (FOB)</label>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setAuditFob(f => Math.max(0, f - 1))} className={cn(glass.btnSecondary, "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1")}>−</button>
                                    <span className={cn(glass.sectionTitle, "text-5xl tabular-nums w-16 text-center text-honey leading-none")}>{auditFob}</span>
                                    <button onClick={() => setAuditFob(f => f + 1)} className={cn(glass.btnSecondary, "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1")}>+</button>
                                </div>
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="space-y-4">
                                <label className={cn(glass.microLabel, "text-muted-foreground font-semibold")}>Frames of Brood (FOBr)</label>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setAuditFobr(f => Math.max(0, f - 1))} className={cn(glass.btnSecondary, "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1")}>−</button>
                                    <span className={cn(glass.sectionTitle, "text-5xl tabular-nums w-16 text-center text-emerald-500 leading-none")}>{auditFobr}</span>
                                    <button onClick={() => setAuditFobr(f => f + 1)} className={cn(glass.btnSecondary, "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1")}>+</button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-honey/10 border border-honey/20">
                                <p className={cn(glass.microLabel, "normal-case italic font-semibold text-honey/80")}>
                                    FPA contribution from this hive: <span className="text-honey font-black text-sm not-italic ml-1">{(auditFob / TOTAL_ACRES).toFixed(3)}</span> frames/acre
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setAuditHive(null)} className={cn(glass.btnSecondary, "flex-1")}>Cancel</button>
                                <button onClick={handleAuditSubmit} className={cn(glass.btnPrimary, "flex-1")}>
                                    <Save className="w-4 h-4" /> Commit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YardOperations;
