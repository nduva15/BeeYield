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
    page: 'bg-[#F9F7F2] min-h-screen p-4 md:p-6 -m-4 md:-m-6 space-y-5 pb-20 animate-in fade-in duration-500 relative overflow-hidden',

    /** Primary Card */
    card: 'rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-sm hover:border-[#F4D03F]/60 transition-all duration-300 overflow-hidden relative group',

    /** Section wrapper */
    section: 'rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-sm overflow-hidden relative',


    /** Section Header Area */
    sectionHeader: 'px-5 py-4 border-b border-[#F4D03F]/20 bg-[#F9F7F2] flex justify-between items-center',

    /** Filter Bar */
    filterBar: 'rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-sm p-3 transition-all duration-300 flex items-center gap-3',

    /** Stat Card */
    statCard: 'rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-sm transition-all duration-300 group overflow-hidden relative hover:border-[#F4D03F] hover:shadow-md',

    /** Modal overlay */
    modalOverlay: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A1A]/20 backdrop-blur-sm',

    /** Modal body */
    modalCard: 'rounded-xl border border-[#F4D03F]/40 bg-[#FFF9F0] shadow-xl overflow-hidden max-w-2xl w-full relative',

    /** Primary Button — properly sized */
    btnPrimary: 'h-9 px-4 rounded-lg bg-[#F4D03F] text-[#1A1A1A] text-sm font-bold shadow-sm transition-all hover:bg-[#D4AC0D] active:scale-95 gap-2 flex items-center justify-center border border-transparent',

    /** Secondary Button — properly sized */
    btnSecondary: 'h-9 px-4 rounded-lg bg-[#FFF9F0] border border-[#F4D03F]/50 text-[#1A1A1A] hover:bg-[#F4D03F]/10 transition-all text-sm font-semibold flex items-center gap-2 justify-center',

    /** Form Input */
    input: 'h-9 rounded-lg border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm text-[#1A1A1A] transition-all focus:ring-2 focus:ring-[#F4D03F]/50 focus:border-[#F4D03F] px-3 placeholder:text-[#1A1A1A]/40 shadow-sm',

    /** Select Trigger */
    select: 'h-9 rounded-lg border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm text-[#1A1A1A] focus:ring-2 focus:ring-[#F4D03F]/50 focus:border-[#F4D03F] px-3 shadow-sm',

    /** Select Dropdown */
    selectContent: 'rounded-lg border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-lg p-1 min-w-[180px]',

    /** Table styles */
    table: 'rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] shadow-sm overflow-hidden relative',
    tableHead: 'bg-[#F9F7F2] text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest h-9 px-4 border-b border-[#F4D03F]/20',
    tableRow: 'hover:bg-[#F4D03F]/5 transition-colors duration-200 border-b border-[#F4D03F]/10 last:border-0 group/row text-[#1A1A1A] h-11',

    /** Compact status badge */
    badge: 'px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#F4D03F]/30 bg-[#F4D03F]/10 text-[#1A1A1A] uppercase tracking-wider',

    /** Micro label */
    microLabel: 'text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest',

    /** Section Title — controlled size */
    sectionTitle: 'text-lg font-bold text-[#1A1A1A] tracking-tight',

    /** Loading skeleton */
    skeleton: 'bg-[#F4D03F]/20 animate-pulse rounded-xl overflow-hidden',

    /** Empty state container */
    emptyState: 'flex flex-col items-center justify-center p-10 text-center space-y-3 rounded-xl border border-dashed border-[#F4D03F]/40 bg-[#F9F7F2]/50',
} as const;


/* ─── Page Header Component ─── */
interface PageHeaderProps {
    icon: LucideIcon;
    label?: string;
    title: React.ReactNode;
    subtitle?: string;
    actions?: React.ReactNode;
    action?: React.ReactNode;
    color?: string;
    bg?: string;
    borderColor?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    icon: Icon,
    label,
    title,
    subtitle,
    actions,
    action,
    color = "text-[#F4D03F]",
    bg = "bg-[#F4D03F]/10",
    borderColor = "border-[#F4D03F]/20"
}) => {
    const headerActions = actions || action;

    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#F4D03F]/20 relative mb-6">
            <div className="space-y-1.5">
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border", bg, color, borderColor)}>
                    <Icon className="w-3 h-3" />
                    {label || 'BEE_YIELD_MODULE'}
                </div>
                <h1 className={cn(glass.sectionTitle, 'mt-1')}>
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
            {headerActions && <div className="flex items-center gap-2.5 relative z-10">{headerActions}</div>}
        </div>
    );
};


/* ─── Stat Card Component ─── */
interface GlassStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    index?: number;
    color?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({ label, value, icon: Icon, index = 0, color = "text-[#F4D03F]" }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="group"
    >
        <div className={glass.statCard}>
            <div className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border border-[#F4D03F]/10 bg-[#F9F7F2] group-hover:border-[#F4D03F]/20 group-hover:bg-[#F4D03F]/5")}>
                        <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <p className={glass.microLabel}>{label}</p>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] tabular-nums tracking-tight leading-none truncate">
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
                <div className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F9F7F2]/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">{title}</h2>
                            {subtitle && <p className={glass.microLabel}>{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-md border border-[#F4D03F]/20 bg-[#FFF9F0] flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] transition-all shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="p-5 relative z-10 bg-[#FFF9F0]">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

