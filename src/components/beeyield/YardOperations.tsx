import React from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    Filter,
    Hexagon,
    Loader2,
    Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useCreateInspection, useInspections } from '@/hooks/useInspections';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import type { Task } from '@/services/beeyieldService';

interface YardOperationsProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

type Urgency = 'critical' | 'high' | 'medium' | 'low';

type YardTask = {
    id: string;
    hiveId: string;
    hive: string;
    location: string;
    urgency: Urgency;
    reason: string;
    fob: number;
    fobr: number;
    lastInspected: string;
    resolved: boolean;
};

type AuditMetrics = {
    fob: number;
    fobr: number;
};

const TOTAL_ACRES = 80;
const AUDIT_NOTE_PREFIX = 'YARD_OPS_AUDIT';

const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string; border: string; dot: string }> = {
    critical: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' },
    high: { label: 'High', color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]', border: 'border-amber-500/20', dot: 'bg-[#F4D03F] shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
    low: { label: 'Low', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]', border: 'border-[#1B9157]', dot: 'bg-[#1B9157] shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
};

const toDateLabel = (value?: string) => {
    if (!value) return 'Not logged';
    return value.slice(0, 10);
};

export const getUrgency = (task: Task): Urgency => {
    const rawPriority = String(task.priority || '').toLowerCase();
    const detail = `${task.title || ''} ${task.description || ''}`.toLowerCase();

    if (detail.includes('critical') || detail.includes('urgent')) {
        return 'critical';
    }
    if (rawPriority === 'high') {
        return 'high';
    }
    if (rawPriority === 'low') {
        return 'low';
    }
    return 'medium';
};

export const isInspectionTask = (task: Task) => {
    const category = String(task.category || '').toLowerCase();
    const type = String(task.type || '').toLowerCase();
    return Boolean(task.hive_id) && (category === 'inspection' || type === 'inspection');
};

export const parseAuditMetrics = (notes?: string | null): AuditMetrics | null => {
    if (!notes || !notes.includes(AUDIT_NOTE_PREFIX)) {
        return null;
    }

    const match = notes.match(/YARD_OPS_AUDIT\|fob=(\d+)\|fobr=(\d+)/i);
    if (!match) {
        return null;
    }

    return {
        fob: Number(match[1] || 0),
        fobr: Number(match[2] || 0),
    };
};

export const buildAuditNotes = (fob: number, fobr: number, reason: string) => {
    const trimmedReason = reason.trim();
    return `${AUDIT_NOTE_PREFIX}|fob=${fob}|fobr=${fobr}|reason=${trimmedReason}`;
};

const YardOperations: React.FC<YardOperationsProps> = () => {
    const [filterUrgency, setFilterUrgency] = React.useState<'all' | Urgency>('all');
    const [showResolved, setShowResolved] = React.useState(false);
    const [auditHive, setAuditHive] = React.useState<YardTask | null>(null);
    const [auditFob, setAuditFob] = React.useState(0);
    const [auditFobr, setAuditFobr] = React.useState(0);
    const [actionTaskId, setActionTaskId] = React.useState<string | null>(null);

    const { data: tasksData = [], isLoading: tasksLoading, error: tasksError } = useTasks();
    const { data: hivesData = [], isLoading: hivesLoading } = useHives();
    const { data: apiariesData = [], isLoading: apiariesLoading } = useApiaries();
    const { data: inspectionsData = [], isLoading: inspectionsLoading } = useInspections();
    const createInspectionMutation = useCreateInspection();
    const updateTaskMutation = useUpdateTask();

    const isLoading = tasksLoading || hivesLoading || apiariesLoading || inspectionsLoading;

    const hivesById = React.useMemo(
        () => new Map(hivesData.map((hive) => [hive.id, hive])),
        [hivesData],
    );

    const apiariesById = React.useMemo(
        () => new Map(apiariesData.map((apiary) => [apiary.id, apiary])),
        [apiariesData],
    );

    const latestInspectionByHive = React.useMemo(() => {
        const latest = new Map<string, (typeof inspectionsData)[number]>();

        for (const inspection of inspectionsData) {
            if (!inspection.hive_id) continue;
            const current = latest.get(inspection.hive_id);
            if (!current) {
                latest.set(inspection.hive_id, inspection);
                continue;
            }

            const currentTime = new Date(current.inspection_date || '').getTime();
            const nextTime = new Date(inspection.inspection_date || '').getTime();
            if (Number.isNaN(currentTime) || nextTime > currentTime) {
                latest.set(inspection.hive_id, inspection);
            }
        }

        return latest;
    }, [inspectionsData]);

    const latestAuditByHive = React.useMemo(() => {
        const latest = new Map<string, { inspection_date?: string; metrics: AuditMetrics }>();

        for (const inspection of inspectionsData) {
            if (!inspection.hive_id) continue;
            const metrics = parseAuditMetrics(inspection.notes);
            if (!metrics) continue;

            const current = latest.get(inspection.hive_id);
            if (!current) {
                latest.set(inspection.hive_id, { inspection_date: inspection.inspection_date, metrics });
                continue;
            }

            const currentTime = new Date(current.inspection_date || '').getTime();
            const nextTime = new Date(inspection.inspection_date || '').getTime();
            if (Number.isNaN(currentTime) || nextTime >= currentTime) {
                latest.set(inspection.hive_id, { inspection_date: inspection.inspection_date, metrics });
            }
        }

        return latest;
    }, [inspectionsData]);

    const tasks = React.useMemo<YardTask[]>(() => {
        return tasksData
            .filter(isInspectionTask)
            .map((task) => {
                const hive = task.hive_id ? hivesById.get(task.hive_id) : undefined;
                const apiary = hive?.apiary_id ? apiariesById.get(hive.apiary_id) : undefined;
                const audit = task.hive_id ? latestAuditByHive.get(task.hive_id) : undefined;
                const latestInspection = task.hive_id ? latestInspectionByHive.get(task.hive_id) : undefined;

                return {
                    id: task.id,
                    hiveId: task.hive_id || '',
                    hive: hive?.hive_code || task.hive_id || 'Unknown hive',
                    location: apiary?.name || 'Unassigned apiary',
                    urgency: getUrgency(task),
                    reason: task.description?.trim() || task.title?.trim() || 'Inspection task',
                    fob: audit?.metrics.fob ?? 0,
                    fobr: audit?.metrics.fobr ?? 0,
                    lastInspected: toDateLabel(audit?.inspection_date || latestInspection?.inspection_date),
                    resolved: task.status === 'completed' || task.is_completed === true,
                };
            })
            .sort((left, right) => Number(left.resolved) - Number(right.resolved));
    }, [apiariesById, hivesById, latestAuditByHive, latestInspectionByHive, tasksData]);

    const filtered = React.useMemo(() => tasks.filter((task) => {
        if (!showResolved && task.resolved) return false;
        if (filterUrgency !== 'all' && task.urgency !== filterUrgency) return false;
        return true;
    }), [tasks, filterUrgency, showResolved]);

    const fpa = React.useMemo(() => {
        if (tasks.length === 0) return '-';
        const totalFob = tasks.reduce((sum, task) => sum + task.fob, 0);
        return (totalFob / TOTAL_ACRES).toFixed(2);
    }, [tasks]);

    const markTaskResolved = React.useCallback(async (taskId: string) => {
        setActionTaskId(taskId);
        try {
            await updateTaskMutation.mutateAsync({
                id: taskId,
                updates: {
                    status: 'completed',
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                },
            });
        } catch (error) {
            console.error('Failed to resolve yard task:', error);
        } finally {
            setActionTaskId(null);
        }
    }, [updateTaskMutation]);

    const handleResolve = React.useCallback(async (task: YardTask) => {
        await markTaskResolved(task.id);
    }, [markTaskResolved]);

    const handleAuditSubmit = React.useCallback(async () => {
        if (!auditHive) return;

        setActionTaskId(auditHive.id);
        try {
            await createInspectionMutation.mutateAsync({
                hive_id: auditHive.hiveId,
                inspection_date: new Date().toISOString().slice(0, 10),
                inspector_name: 'Yard Operations',
                findings: auditHive.reason,
                actions_taken: `Recorded colony strength audit. FOB ${auditFob}, FOBR ${auditFobr}.`,
                notes: buildAuditNotes(auditFob, auditFobr, auditHive.reason),
            });

            await markTaskResolved(auditHive.id);
            setAuditHive(null);
        } catch (error) {
            console.error('Failed to save yard audit:', error);
            toast.error('Failed to commit colony strength audit');
        } finally {
            setActionTaskId(null);
        }
    }, [auditFob, auditFobr, auditHive, createInspectionMutation, markTaskResolved]);

    const savingTaskId = actionTaskId || (updateTaskMutation.isPending ? actionTaskId : null);

    return (
        <div className={cn(glass.page, 'p-8 -m-8 min-h-screen')}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20')}>
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Smart Urgency Filter</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Yard <span className="text-[#F4D03F]">Operations</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        Colony Strength Audit
                    </p>
                </div>

                <div className={cn(glass.card, 'p-6 sm:px-8 border-[#F4D03F]/20 shadow-xl shadow-honey/5 flex flex-col justify-center items-end bg-gradient-to-br from-white/80 to-honey/10')}>
                    <p className={cn(glass.microLabel, 'text-muted-foreground mb-1 font-semibold')}>Avg Strength</p>
                    <p className={cn(glass.sectionTitle, 'text-5xl tabular-nums text-[#F4D03F] leading-none mb-2')}>{fpa}</p>
                    <p className={cn(glass.microLabel, 'text-muted-foreground/60 italic font-semibold normal-case')}>
                        Frames Per Colony / {TOTAL_ACRES} Area
                    </p>
                </div>
            </div>

            <div className={cn(glass.filterBar, 'flex-wrap items-center gap-4')}>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex bg-muted/40 p-1 rounded-2xl border border-border w-full md:w-auto overflow-x-auto custom-scrollbar">
                        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((urgency) => (
                            <button
                                key={urgency}
                                onClick={() => setFilterUrgency(urgency)}
                                className={cn(
                                    'px-5 py-2.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap',
                                    filterUrgency === urgency
                                        ? 'bg-[#FFF9F0] text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {urgency === 'all' ? 'All' : urgencyConfig[urgency].label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setShowResolved((current) => !current)}
                    className={cn(
                        'px-6 py-3 rounded-2xl text-[10px] font-black transition-all border ml-auto',
                        showResolved
                            ? 'bg-[#1B9157] border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'border-border text-muted-foreground hover:border-[#1B9157] hover:text-[#1B9157]',
                    )}
                >
                    {showResolved ? 'Hide Resolved' : 'Show Resolved'}
                </button>
            </div>

            <div className="space-y-4">
                {isLoading && (
                    <div className={glass.emptyState}>
                        <Loader2 className="w-10 h-10 animate-spin text-[#F4D03F]" />
                        <p className={cn(glass.sectionTitle, 'text-2xl normal-case mt-4')}>Loading Audits</p>
                        <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold max-w-sm mx-auto text-center mt-2')}>
                            Pulling inspection tasks and the latest saved colony strength audits.
                        </p>
                    </div>
                )}

                {!isLoading && tasksError && (
                    <div className={glass.emptyState}>
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <p className={cn(glass.sectionTitle, 'text-2xl normal-case mt-4')}>Audit Feed Unavailable</p>
                        <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold max-w-sm mx-auto text-center mt-2')}>
                            BeeYield could not load inspection tasks right now. Retry once the backend is reachable.
                        </p>
                    </div>
                )}

                {!isLoading && !tasksError && filtered.length === 0 && (
                    <div className={glass.emptyState}>
                        <div className="w-24 h-24 rounded-[2rem] bg-[#1B9157]/10 border border-[#1B9157]/20 flex items-center justify-center mb-6 shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-[#1B9157]" />
                        </div>
                        <p className={cn(glass.sectionTitle, 'text-2xl normal-case')}>All Clear</p>
                        <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold max-w-sm mx-auto text-center mt-2')}>
                            No inspection tasks matching your current filter.
                        </p>
                    </div>
                )}

                {!isLoading && !tasksError && (
                    <div className="grid gap-4">
                        {filtered.map((task) => {
                            const cfg = urgencyConfig[task.urgency];
                            const isTaskBusy = savingTaskId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        glass.card,
                                        'p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-[#F4D03F]/40 transition-all',
                                        task.resolved ? 'opacity-60 bg-muted/20' : '',
                                        !task.resolved && 'hover:shadow-xl hover:shadow-black/5',
                                    )}
                                >
                                    <div className="flex items-center gap-4 md:w-48 shrink-0">
                                        <div className={cn('w-3 h-3 rounded-full shrink-0', cfg.dot)} />
                                        <div>
                                            <p className={cn(glass.sectionTitle, 'text-xl normal-case leading-none mb-1')}>{task.hive}</p>
                                            <p className={cn(glass.microLabel, 'opacity-60 font-semibold normal-case')}>{task.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <p className={cn('text-lg font-serif font-black tracking-tight', task.resolved ? 'line-through text-muted-foreground' : cfg.color)}>
                                            {task.reason}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 gap-y-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                                <Hexagon className="w-3 h-3 text-[#F4D03F]" />
                                                <span className={cn(glass.microLabel, 'opacity-80')}>Strength: {task.fob}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                                <Hexagon className="w-3 h-3 text-[#1B9157]" />
                                                <span className={cn(glass.microLabel, 'opacity-80')}>Brood: {task.fobr}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span className={cn(glass.microLabel, 'opacity-80')}>Last: {task.lastInspected}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                        <span className={cn('px-4 py-2 rounded-xl text-[10px] font-black border border-transparent', cfg.bg, cfg.color, cfg.border)}>
                                            {cfg.label}
                                        </span>
                                        {!task.resolved && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setAuditHive(task);
                                                        setAuditFob(task.fob);
                                                        setAuditFobr(task.fobr);
                                                    }}
                                                    disabled={isTaskBusy}
                                                    className={cn(glass.btnSecondary, 'px-6 h-10 text-[10px] disabled:opacity-60')}
                                                >
                                                    Audit
                                                </button>
                                                <button
                                                    onClick={() => void handleResolve(task)}
                                                    disabled={isTaskBusy}
                                                    className={cn(glass.btnPrimary, 'px-6 h-10 text-[10px] bg-[#1B9157] text-white border-emerald-500 hover:bg-[#145A32] shadow-emerald-500/20 disabled:opacity-60')}
                                                >
                                                    {isTaskBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {auditHive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#F4D03F]/10 backdrop-blur-sm" onClick={() => setAuditHive(null)} />
                    <div className={cn(glass.card, 'w-full max-w-md relative z-10 shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200')}>
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#F4D03F]" />
                                <h3 className={cn(glass.sectionTitle, 'text-2xl normal-case')}>
                                    Colony Strength Audit <span className="text-muted-foreground mr-1">-</span> {auditHive.hive}
                                </h3>
                            </div>
                            <button
                                onClick={() => setAuditHive(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border"
                            >
                                x
                            </button>
                        </div>
                        <div className="p-8 space-y-8 pb-10">
                            <div className="space-y-4">
                                <label className={cn(glass.microLabel, 'text-muted-foreground font-semibold')}>Frames of Bees (Strength)</label>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setAuditFob((value) => Math.max(0, value - 1))} className={cn(glass.btnSecondary, 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1')}>-</button>
                                    <span className={cn(glass.sectionTitle, 'text-5xl tabular-nums w-16 text-center text-[#F4D03F] leading-none')}>{auditFob}</span>
                                    <button onClick={() => setAuditFob((value) => value + 1)} className={cn(glass.btnSecondary, 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1')}>+</button>
                                </div>
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="space-y-4">
                                <label className={cn(glass.microLabel, 'text-muted-foreground font-semibold')}>Frames of Brood</label>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setAuditFobr((value) => Math.max(0, value - 1))} className={cn(glass.btnSecondary, 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1')}>-</button>
                                    <span className={cn(glass.sectionTitle, 'text-5xl tabular-nums w-16 text-center text-[#1B9157] leading-none')}>{auditFobr}</span>
                                    <button onClick={() => setAuditFobr((value) => value + 1)} className={cn(glass.btnSecondary, 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl pb-1')}>+</button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/20">
                                <p className={cn(glass.microLabel, 'normal-case italic font-semibold text-[#F4D03F]/80')}>
                                    Strength contribution from this hive:
                                    <span className="text-[#F4D03F] font-black text-sm not-italic ml-1">{(auditFob / TOTAL_ACRES).toFixed(3)}</span>
                                    {' '}frames/colony
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setAuditHive(null)} className={cn(glass.btnSecondary, 'flex-1')}>Cancel</button>
                                <button
                                    onClick={() => void handleAuditSubmit()}
                                    disabled={createInspectionMutation.isPending || savingTaskId === auditHive.id}
                                    className={cn(glass.btnPrimary, 'flex-1 disabled:opacity-60')}
                                >
                                    {createInspectionMutation.isPending || savingTaskId === auditHive.id
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Save className="w-4 h-4" />}
                                    Commit
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
