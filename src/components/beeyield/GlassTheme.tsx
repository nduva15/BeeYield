/**
 * Glass & Gold — BeeYield Design System
 * Shared styling utilities matching the BeeYield AI aesthetic.
 * Import these constants into any view to enforce visual harmony.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronRight, Binary, Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/* ─── High-Intensity Shared Class Tokens ─── */
export const glass = {
    /** The outermost page wrapper — honeycomb background + min-h-screen */
    page: 'honeycomb-bg min-h-screen p-12 -m-8 space-y-20 pb-40 animate-in fade-in zoom-in-95 duration-1000 relative overflow-hidden',

    /** Primary High-Fidelity glass card */
    card: 'rounded-[4rem] border border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl shadow-4xl hover:border-honey/60 hover:shadow-[0_80px_150px_-30px_rgba(251,191,36,0.3)] transition-all duration-1000 overflow-hidden relative group',

    /** Cinematic full-width section card */
    section: 'rounded-[5rem] border border-white/5 bg-white/40 dark:bg-[#080808]/40 backdrop-blur-3xl shadow-4xl overflow-hidden relative',

    /** Industrial header area */
    sectionHeader: 'p-16 pb-10 border-b border-white/5 bg-white/20 dark:bg-black/40 backdrop-blur-3xl flex justify-between items-center',

    /** Frosted filter bar control hub */
    filterBar: 'rounded-[3.5rem] border border-white/5 bg-white/80 dark:bg-black/60 backdrop-blur-3xl shadow-4xl p-12 transition-all duration-1000',

    /** Biometric stat card container */
    statCard: 'rounded-[3.5rem] border border-white/5 bg-white/80 dark:bg-[#0D0D0D]/90 backdrop-blur-3xl shadow-4xl transition-all duration-1000 group overflow-hidden relative',

    /** High-Intensity modal overlay */
    modalOverlay: 'fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/80 backdrop-blur-[60px]',

    /** Cinematic modal body */
    modalCard: 'rounded-[5rem] border border-white/5 bg-white dark:bg-[#0D0D0D] backdrop-blur-3xl shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] overflow-hidden max-w-4xl w-full relative',

    /** Industrial modal header */
    modalHeader: 'p-16 pb-10 border-b border-white/5 bg-black/40 backdrop-blur-3xl',

    /** Command CTA button — Large High-Intensity */
    btnPrimary: 'h-24 px-16 rounded-[3.5rem] bg-[#FBBE24] text-black font-black italic text-2xl uppercase tracking-widest shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] transition-all hover:scale-105 active:scale-95 gap-8 flex items-center relative overflow-hidden',

    /** Industrial ghost/secondary button */
    btnGhost: 'h-20 px-12 rounded-[2.5rem] bg-white dark:bg-black/40 backdrop-blur-3xl border border-white/5 text-foreground/40 hover:text-honey hover:border-honey/60 hover:bg-honey/10 transition-all duration-1000 font-black italic uppercase text-lg tracking-[0.2em] shadow-4xl',

    /** Command secondary button */
    btnSecondary: 'h-20 px-12 rounded-[2.5rem] bg-white dark:bg-black/40 backdrop-blur-3xl border border-white/5 text-foreground/60 hover:text-honey hover:border-honey/60 hover:bg-honey/15 transition-all duration-1000 font-black italic uppercase text-lg tracking-[0.2em] shadow-4xl',

    /** Deep glass form input */
    input: 'h-20 rounded-[2.2rem] border border-white/5 bg-black/5 dark:bg-black/40 backdrop-blur-3xl font-black italic text-xl uppercase tracking-widest transition-all duration-700 focus:ring-8 focus:ring-honey/10 focus:border-honey/60 shadow-inner px-10 placeholder:opacity-20',

    /** Cinematic select trigger */
    select: 'h-20 rounded-[2.2rem] border border-white/5 bg-black/5 dark:bg-black/40 backdrop-blur-3xl font-black italic text-xl uppercase tracking-widest focus:ring-8 focus:ring-honey/10 focus:border-honey/60 shadow-inner px-10',

    /** Neural dropdown menu */
    selectContent: 'rounded-[3rem] border border-white/5 bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-3xl shadow-4xl p-6 min-w-[300px]',

    /** High-fidelity table framework */
    table: 'rounded-[5rem] border border-white/5 bg-white dark:bg-[#0D0D0D]/40 backdrop-blur-3xl shadow-4xl overflow-hidden relative',

    /** Industrial table header row */
    tableHead: 'bg-black/20 backdrop-blur-3xl text-[11px] font-black text-foreground/40 uppercase tracking-[0.5em] italic h-20 px-12 border-b border-white/5',

    /** Cinematic data row */
    tableRow: 'hover:bg-honey/[0.08] transition-all duration-1000 border-b border-white/5 last:border-0 group/row cursor-default',

    /** Skewed status badge */
    badge: 'px-8 py-2.5 rounded-full text-[11px] font-black italic uppercase tracking-[0.4em] shadow-4xl border border-white/5 skew-x-[-15deg] transition-all duration-700 block',

    /** Void industrial empty state */
    emptyState: 'py-48 text-center flex flex-col items-center gap-12 rounded-[5rem] border-4 border-dashed border-white/5 bg-honey/[0.01] backdrop-blur-3xl shadow-[0_45px_100px_rgba(0,0,0,0.1)]',

    /** Pulsing spectral skeleton */
    skeleton: 'rounded-[3rem] bg-black/5 dark:bg-white/[0.03] animate-pulse border border-white/5',

    /** Proprietary micro label */
    microLabel: 'text-[11px] font-black text-foreground/20 italic uppercase tracking-[0.4em]',

    /** Cinematic Section Title — Italic Condensed Serif */
    sectionTitle: 'text-6xl font-black italic text-honey tracking-tighter uppercase leading-none italic',
} as const;


/* ─── Cinematic Page Header Component ─── */
interface PageHeaderProps {
    icon: LucideIcon;
    label: string;
    title: React.ReactNode;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, label, title, subtitle, actions }) => (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 pb-10 border-b border-white/5 relative group">
        <div className="absolute -left-20 top-0 bottom-0 w-2 bg-honey opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
        <div className="space-y-6">
            <div className="inline-flex items-center gap-4 px-8 py-3 bg-honey/10 text-honey rounded-full text-[11px] font-black italic uppercase tracking-[0.4em] border border-honey/30 backdrop-blur-3xl shadow-4xl skew-x-[-15deg]">
                <div className="skew-x-[15deg] flex items-center gap-4">
                    <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {label}
                </div>
            </div>
            <h1 className={cn(glass.sectionTitle, 'text-7xl xl:text-8xl')}>{title}</h1>
            {subtitle && (
                <p className="text-xl font-black text-foreground/30 max-w-3xl leading-relaxed uppercase italic tracking-tight border-l-4 border-honey/20 pl-10">
                    {subtitle}
                </p>
            )}
        </div>
        {actions && <div className="flex items-center gap-8 relative z-10">{actions}</div>}
    </div>
);


/* ─── Biometric Stat Card Component ─── */
interface GlassStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    index?: number;
    color?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({ label, value, icon: Icon, index = 0, color = "text-honey" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="group"
    >
        <div className={glass.statCard}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-honey/[0.03] rounded-full blur-2xl group-hover:bg-honey/[0.08] transition-all duration-1000" />
            <div className="p-12 relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className={cn("w-18 h-18 rounded-[1.5rem] flex items-center justify-center transition-all duration-1000 border border-transparent shadow-4xl", color.includes('honey') ? "bg-honey/15 border-honey/30 group-hover:rotate-[360deg]" : "bg-black/5 dark:bg-black/40 border-white/5 group-hover:rotate-12")}>
                        <Icon className={cn("w-9 h-9", color)} />
                    </div>
                    <div className="text-right space-y-2">
                        <p className={cn(glass.microLabel, "leading-tight opacity-40 group-hover:opacity-100 transition-opacity")}>
                            {label}
                        </p>
                        <div className="flex justify-end gap-1">
                            <div className="w-1 h-3 bg-honey/20 rounded-full animate-pulse" />
                            <div className="w-1 h-4 bg-honey/40 rounded-full animate-pulse delay-75" />
                            <div className="w-1 h-2 bg-honey/10 rounded-full animate-pulse delay-150" />
                        </div>
                    </div>
                </div>
                <h3 className={cn("text-6xl font-black italic tabular-nums tracking-tighter italic leading-none truncate", color === "text-honey" ? "text-foreground group-hover:text-honey transition-colors duration-1000" : color)}>{value}</h3>
            </div>
        </div>
    </motion.div>
);


/* ─── Cinematic Glass Modal Component ─── */
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-4xl" }) => {
    if (!isOpen) return null;
    return (
        <div className={glass.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 100, rotateX: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(glass.modalCard, maxWidth)}
            >
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-honey/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

                <div className={glass.modalHeader}>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-4">
                            <h2 className={cn(glass.sectionTitle, 'text-5xl')}>{title}</h2>
                            {subtitle && <p className={cn(glass.microLabel, 'mt-2 opacity-30 italic')}>{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-20 h-20 rounded-[2.5rem] border border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-3xl flex items-center justify-center text-foreground/40 hover:text-red-500 hover:border-red-500/20 transition-all shadow-4xl group"
                        >
                            <span className="text-3xl group-hover:rotate-90 transition-transform duration-700">✕</span>
                        </button>
                    </div>
                </div>
                <div className="p-16 relative z-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
