/**
 * Bright & Compact — BeeYield Design System
 * Clean, high-legibility light theme for maximum productivity.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Modernized Shared Class Tokens ─── */
export const glass = {
    /** The outermost page wrapper */
    page: 'bg-slate-50 min-h-screen p-4 md:p-6 -m-4 md:-m-6 space-y-5 pb-20 animate-in fade-in duration-500 relative overflow-hidden',

    /** Primary Card */
    card: 'rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-all duration-300 overflow-hidden relative group',

    /** Section wrapper */
    section: 'rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden relative',

    /** Section Header Area */
    sectionHeader: 'px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center',

    /** Filter Bar */
    filterBar: 'rounded-xl border border-gray-200 bg-white shadow-sm p-3 transition-all duration-300 flex items-center gap-3',

    /** Stat Card */
    statCard: 'rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group overflow-hidden relative hover:border-honey/30 hover:shadow-md',

    /** Modal overlay */
    modalOverlay: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm',

    /** Modal body */
    modalCard: 'rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden max-w-2xl w-full relative',

    /** Primary Button — properly sized */
    btnPrimary: 'h-9 px-4 rounded-lg bg-honey text-white text-sm font-semibold shadow-sm transition-all hover:bg-honey-deep active:scale-95 gap-2 flex items-center justify-center border border-transparent',

    /** Secondary Button — properly sized */
    btnSecondary: 'h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-white hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2 justify-center',

    /** Form Input */
    input: 'h-9 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 transition-all focus:ring-2 focus:ring-honey/20 focus:border-honey px-3 placeholder:text-gray-400 shadow-sm',

    /** Select Trigger */
    select: 'h-9 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-honey/20 focus:border-honey px-3 shadow-sm',

    /** Select Dropdown */
    selectContent: 'rounded-lg border border-gray-200 bg-white shadow-lg p-1 min-w-[180px]',

    /** Table styles */
    table: 'rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden relative',
    tableHead: 'bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest h-10 px-4 border-b border-gray-200',
    tableRow: 'hover:bg-gray-50/50 transition-colors duration-200 border-b border-gray-100 last:border-0 group/row',

    /** Compact status badge */
    badge: 'px-2 py-0.5 rounded-md text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider',

    /** Micro label */
    microLabel: 'text-[10px] font-bold text-gray-500 uppercase tracking-widest',

    /** Section Title — controlled size */
    sectionTitle: 'text-lg md:text-xl font-bold text-gray-900 tracking-tight',

    /** Loading skeleton */
    skeleton: 'bg-gray-100 animate-pulse rounded-xl overflow-hidden',

    /** Empty state container */
    emptyState: 'flex flex-col items-center justify-center p-10 text-center space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50',
} as const;


/* ─── Page Header Component ─── */
interface PageHeaderProps {
    icon: LucideIcon;
    label: string;
    title: React.ReactNode;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, label, title, subtitle, actions }) => (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-gray-200 relative mb-6">
        <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-honey/10 text-honey rounded-md text-[10px] font-bold uppercase tracking-widest border border-honey/20">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <h1 className={cn(glass.sectionTitle, 'text-xl md:text-2xl mt-1')}>
                {typeof title === 'string' ? (
                    <span>{title}</span>
                ) : (
                    title
                )}
            </h1>
            {subtitle && (
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
        {actions && <div className="flex items-center gap-2.5 relative z-10">{actions}</div>}
    </div>
);


/* ─── Stat Card Component ─── */
interface GlassStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    index?: number;
    color?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({ label, value, icon: Icon, index = 0, color = "text-honey" }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="group"
    >
        <div className={glass.statCard}>
            <div className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-100 bg-gray-50 group-hover:border-honey/20 group-hover:bg-honey/5")}>
                        <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <p className={glass.microLabel}>{label}</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900 tabular-nums tracking-tight leading-none truncate">
                    {value}
                </h3>
            </div>
        </div>
    </motion.div>
);


/* ─── Modal Component ─── */
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-2xl" }) => {
    if (!isOpen) return null;
    return (
        <div className={glass.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(glass.modalCard, maxWidth)}
            >
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
                            {subtitle && <p className={glass.microLabel}>{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="p-5 relative z-10 bg-white">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

