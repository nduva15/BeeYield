/**
 * Obsidian & Citrus — BeeYield Design System
 * Shared styling utilities for the high-contrast command center.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── High-Intensity Shared Class Tokens ─── */
export const glass = {
    /** The outermost page wrapper — obsidian canvas */
    page: 'honeycomb-bg min-h-screen p-12 -m-8 space-y-16 pb-40 animate-in fade-in duration-700 relative overflow-hidden',

    /** Primary Obsidian Card — White edge, subtle inner glow */
    card: 'rounded-[3rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl hover:border-[#FF6B00]/40 transition-all duration-500 overflow-hidden relative group',

    /** Industrial Section Card */
    section: 'rounded-[4rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative',

    /** Command Header Area */
    sectionHeader: 'p-12 pb-8 border-b border-white/20 bg-white/5 backdrop-blur-3xl flex justify-between items-center',

    /** High-Contrast Filter Bar */
    filterBar: 'rounded-[3rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl p-10 transition-all duration-500',

    /** Biometric Stat Card */
    statCard: 'rounded-[3rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl transition-all duration-500 group overflow-hidden relative',

    /** Cinematic modal overlay */
    modalOverlay: 'fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/90 backdrop-blur-[40px]',

    /** Stark modal body */
    modalCard: 'rounded-[4rem] border border-white/20 bg-[#0A0A0A] shadow-[0_0_100px_rgba(255,107,0,0.1)] overflow-hidden max-w-4xl w-full relative',

    /** Precision CTA — Citrus Burst */
    btnPrimary: 'h-20 px-14 rounded-[2.5rem] bg-[#FF6B00] text-white font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,107,0,0.3)] transition-all hover:scale-105 active:scale-95 gap-6 flex items-center justify-center relative overflow-hidden',

    /** Industrial secondary button */
    btnSecondary: 'h-20 px-12 rounded-[2.5rem] bg-white/5 border border-white/20 text-white/60 hover:text-[#FF6B00] hover:border-[#FF6B00]/60 transition-all duration-500 font-black uppercase text-lg tracking-[0.1em]',

    /** Deep obsidian form input */
    input: 'h-18 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl font-mono text-white uppercase tracking-widest transition-all duration-500 focus:ring-4 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]/60 shadow-inner px-8 placeholder:opacity-20',

    /** Precision select trigger */
    select: 'h-18 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl font-mono text-white uppercase tracking-widest focus:ring-4 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]/60 shadow-inner px-8',

    /** Neural dropdown menu */
    selectContent: 'rounded-[2rem] border border-white/20 bg-[#0A0A0A] backdrop-blur-3xl shadow-2xl p-4 min-w-[280px]',

    /** High-fidelity table framework */
    table: 'rounded-[4rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative',

    /** Industrial table header */
    tableHead: 'bg-white/10 backdrop-blur-3xl text-[10px] font-black text-white/40 uppercase tracking-[0.4em] h-16 px-12 border-b border-white/10',

    /** Cinematic data row */
    tableRow: 'hover:bg-white/5 transition-all duration-500 border-b border-white/5 last:border-0 group/row cursor-default',

    /** High-visibility status badge */
    badge: 'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 transition-all duration-500 block',

    /** Proprietary micro label */
    microLabel: 'text-[10px] font-black text-white/30 uppercase tracking-[0.3em]',

    /** Obsidian Section Title */
    sectionTitle: 'text-6xl font-black text-white tracking-tighter uppercase leading-none',

    /** Ghost Shimmer Skeleton */
    skeleton: 'bg-white/5 animate-pulse rounded-[3rem] overflow-hidden relative after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent',

    /** Atmospheric Empty State */
    emptyState: 'flex flex-col items-center justify-center p-20 text-center space-y-8 rounded-[5rem] border-2 border-dashed border-white/5 bg-white/[0.02]',
} as const;


/* ─── Obsidian Page Header Component ─── */
interface PageHeaderProps {
    icon: LucideIcon;
    label: string;
    title: React.ReactNode;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, label, title, subtitle, actions }) => (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 pb-8 border-b border-white/20 relative group">
        <div className="space-y-6">
            <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/5 text-white/60 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 backdrop-blur-3xl">
                <Icon className="w-4 h-4 text-[#FF6B00]" />
                {label}
            </div>
            <h1 className={cn(glass.sectionTitle, 'text-7xl xl:text-8xl')}>
                {typeof title === 'string' ? (
                    <span>{title}</span>
                ) : (
                    title
                )}
            </h1>
            {subtitle && (
                <p className="text-xl font-medium text-white/40 max-w-3xl leading-relaxed uppercase tracking-tight border-l-2 border-[#FF6B00]/40 pl-8">
                    {subtitle}
                </p>
            )}
        </div>
        {actions && <div className="flex items-center gap-6 relative z-10">{actions}</div>}
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

export const GlassStatCard: React.FC<GlassStatCardProps> = ({ label, value, icon: Icon, index = 0, color = "text-[#FF6B00]" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        className="group"
    >
        <div className={glass.statCard}>
            <div className="p-10 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/10 bg-white/5 group-hover:border-[#FF6B00]/40")}>
                        <Icon className={cn("w-8 h-8", color)} />
                    </div>
                    <div className="text-right">
                        <p className={glass.microLabel}>{label}</p>
                    </div>
                </div>
                <h3 className="text-5xl font-mono font-black text-white tabular-nums tracking-tighter leading-none truncate">
                    {value}
                </h3>
            </div>
        </div>
    </motion.div>
);


/* ─── Stark Glass Modal Component ─── */
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(glass.modalCard, maxWidth)}
            >
                <div className="p-12 pb-8 border-b border-white/10 bg-white/5 backdrop-blur-3xl">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{title}</h2>
                            {subtitle && <p className={glass.microLabel}>{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-[#FF6B00] transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="p-12 relative z-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
