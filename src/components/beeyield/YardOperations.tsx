import React, { useState, useMemo } from 'react';
import {
    ClipboardList,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ChevronDown,
    Save,
    Plus,
    Hexagon,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface YardOperationsProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
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
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500', dot: 'bg-red-500 animate-pulse' },
    high: { label: 'High', color: 'text-[#b45309]', bg: 'bg-[#facc15]/10', border: 'border-[#facc15]', dot: 'bg-[#facc15]' },
    medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-400', dot: 'bg-blue-400' },
    low: { label: 'Low', color: 'text-[#064e3b]', bg: 'bg-[#10b981]/5', border: 'border-[#10b981]', dot: 'bg-[#10b981]' },
};

const TOTAL_ACRES = 80;

const YardOperations: React.FC<YardOperationsProps> = ({ onTabChange }) => {
    const [tasks, setTasks] = useState<HiveTask[]>(initialTasks);
    const [filterUrgency, setFilterUrgency] = useState<'all' | Urgency>('all');
    const [showResolved, setShowResolved] = useState(false);
    const [auditHive, setAuditHive] = useState<HiveTask | null>(null);
    const [auditFob, setAuditFob] = useState(0);
    const [auditFobr, setAuditFobr] = useState(0);

    const filtered = useMemo(() => tasks.filter(t => {
        if (!showResolved && t.resolved) return false;
        if (filterUrgency !== 'all' && t.urgency !== filterUrgency) return false;
        return true;
    }), [tasks, filterUrgency, showResolved]);

    // FPA = total FOB across all hives / total acres
    const fpa = useMemo(() => {
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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Yard <span className="text-[#10b981]">Operations</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Smart Urgency Filter — Digital FOB Audit Engine
                    </p>
                </div>
                {/* FPA KPI */}
                <div className="border-4 border-[#064e3b] bg-[#064e3b] px-8 py-4 shadow-[6px_6px_0px_0px_#10b981]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Current FPA</p>
                    <p className="text-4xl font-black text-[#facc15] tabular-nums">{fpa}</p>
                    <p className="text-[9px] font-bold uppercase text-white/30 mt-1">Frames Per Acre / {TOTAL_ACRES} ac</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <Filter className="w-4 h-4 text-[#064e3b]/40" />
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(u => (
                    <button
                        key={u}
                        onClick={() => setFilterUrgency(u)}
                        className={cn(
                            "px-5 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-none",
                            filterUrgency === u
                                ? "bg-[#064e3b] border-[#064e3b] text-white"
                                : "bg-white border-[#064e3b]/20 text-[#064e3b] hover:border-[#064e3b]"
                        )}
                    >
                        {u === 'all' ? 'All' : urgencyConfig[u].label}
                    </button>
                ))}
                <button
                    onClick={() => setShowResolved(r => !r)}
                    className={cn(
                        "px-5 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-none ml-auto",
                        showResolved ? "bg-[#10b981] border-[#10b981] text-white" : "bg-white border-[#064e3b]/20 text-[#064e3b]"
                    )}
                >
                    {showResolved ? 'Hide Resolved' : 'Show Resolved'}
                </button>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {filtered.length === 0 && (
                    <div className="border-4 border-[#064e3b]/10 p-12 text-center">
                        <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-4" />
                        <p className="font-black text-[#064e3b]/40 uppercase text-sm tracking-widest">All Clear — No tasks matching filter</p>
                    </div>
                )}
                {filtered.map(task => {
                    const cfg = urgencyConfig[task.urgency];
                    return (
                        <div
                            key={task.id}
                            className={cn(
                                "border-4 bg-white p-6 flex flex-col md:flex-row md:items-center gap-6",
                                task.resolved ? "opacity-50 border-[#064e3b]/10" : cfg.border,
                                !task.resolved && `shadow-[4px_4px_0px_0px_rgba(6,78,59,0.15)]`
                            )}
                        >
                            <div className="flex items-center gap-4 md:w-40 shrink-0">
                                <div className={cn("w-3 h-3 rounded-full", cfg.dot)} />
                                <div>
                                    <p className="text-xs font-black uppercase text-[#064e3b]">{task.hive}</p>
                                    <p className="text-[9px] font-bold uppercase text-[#064e3b]/40">{task.location}</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm font-black", task.resolved ? "line-through text-[#064e3b]/30" : cfg.color)}>{task.reason}</p>
                                <div className="flex items-center gap-6 mt-2">
                                    <span className="text-[9px] font-bold uppercase text-[#064e3b]/30">FOB: {task.fob} frames</span>
                                    <span className="text-[9px] font-bold uppercase text-[#064e3b]/30">Brood: {task.fobr} frames</span>
                                    <span className="text-[9px] font-bold uppercase text-[#064e3b]/30">Inspected: {task.lastInspected}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={cn("px-3 py-1.5 text-[9px] font-black uppercase tracking-wider", cfg.bg, cfg.color)}>
                                    {cfg.label}
                                </span>
                                {!task.resolved && (
                                    <>
                                        <button
                                            onClick={() => { setAuditHive(task); setAuditFob(task.fob); setAuditFobr(task.fobr); }}
                                            className="px-4 py-2 border-2 border-[#064e3b] text-[10px] font-black uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-none"
                                        >
                                            Audit
                                        </button>
                                        <button
                                            onClick={() => handleResolve(task.id)}
                                            className="px-4 py-2 border-2 border-[#10b981] bg-[#10b981] text-white text-[10px] font-black uppercase tracking-widest transition-none"
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

            {/* FOB Audit Modal */}
            {auditHive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064e3b]/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white border-8 border-[#064e3b] shadow-[16px_16px_0px_0px_rgba(6,78,59,1)]">
                        <div className="bg-[#064e3b] px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Hexagon className="w-5 h-5 text-[#facc15]" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">FOB Audit — {auditHive.hive}</h3>
                            </div>
                            <button onClick={() => setAuditHive(null)} className="text-white/40 hover:text-white text-xl font-black">✕</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Frames of Bees (FOB)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setAuditFob(f => Math.max(0, f - 1))} className="w-10 h-10 border-4 border-[#064e3b] font-black text-xl flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">−</button>
                                    <span className="text-4xl font-black text-[#064e3b] w-12 text-center">{auditFob}</span>
                                    <button onClick={() => setAuditFob(f => f + 1)} className="w-10 h-10 border-4 border-[#064e3b] font-black text-xl flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">+</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Frames of Brood (FOBr)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setAuditFobr(f => Math.max(0, f - 1))} className="w-10 h-10 border-4 border-[#064e3b] font-black text-xl flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">−</button>
                                    <span className="text-4xl font-black text-[#064e3b] w-12 text-center">{auditFobr}</span>
                                    <button onClick={() => setAuditFobr(f => f + 1)} className="w-10 h-10 border-4 border-[#064e3b] font-black text-xl flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">+</button>
                                </div>
                            </div>
                            <div className="p-4 bg-[#064e3b]/5 border-2 border-[#064e3b]/10 text-[10px] font-bold uppercase text-[#064e3b]/50">
                                FPA contribution from this hive: <span className="text-[#10b981] font-black">{(auditFob / TOTAL_ACRES).toFixed(3)}</span> frames/acre
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button onClick={() => setAuditHive(null)} className="flex-1 py-4 border-4 border-[#064e3b] font-black uppercase text-xs tracking-widest">Cancel</button>
                                <button onClick={handleAuditSubmit} className="flex-1 py-4 bg-[#064e3b] text-white border-4 border-[#064e3b] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_#10b981]">
                                    <Save className="w-4 h-4" /> Commit Audit
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
