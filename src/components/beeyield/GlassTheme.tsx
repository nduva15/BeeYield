/**
 * Bright & Compact — BeeYield Design System
 * Modernized for Theme Reactivity (Light/Dark).
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, X, Trash2, AlertTriangle, Info, Check, RefreshCw, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { humanizeKeyLabel } from '@/lib/plainEnglish';

function humanizeLabel(input?: string) {
    return humanizeKeyLabel(input);
}

/* ─── Reactive Shared Class Tokens ─── */
export const glass = {
    /** The outermost page wrapper */
    page: 'bg-background min-h-screen p-4 md:p-6 space-y-5 pb-20 animate-in fade-in duration-500 relative overflow-hidden',

    /** Primary Card */
    card: 'rounded-xl border border-border bg-card shadow-sm hover:border-primary/60 transition-all duration-300 overflow-hidden relative group',

    /** Section wrapper */
    section: 'rounded-xl border border-border bg-card shadow-sm overflow-hidden relative',

    /** Section Header Area */
    sectionHeader: 'px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center',

    /** Filter Bar */
    filterBar: 'rounded-xl border border-border bg-card shadow-sm p-3 transition-all duration-300 flex items-center gap-3',

    /** Stat Card */
    statCard: 'rounded-xl border border-border bg-card shadow-sm transition-all duration-300 group overflow-hidden relative hover:border-primary hover:shadow-md',

    /** Modal overlay */
    modalOverlay: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/20 backdrop-blur-sm',

    /** Modal body */
    modalCard: 'rounded-xl border border-border bg-card shadow-xl overflow-hidden max-w-2xl w-full relative',

    /** Primary Button */
    btnPrimary: 'h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm transition-all hover:bg-primary/90 active:scale-95 gap-2 flex items-center justify-center border border-transparent',

    /** Secondary Button */
    btnSecondary: 'h-9 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-accent/10 transition-all text-sm font-semibold flex items-center gap-2 justify-center',

    /** Form Input */
    input: 'h-9 rounded-lg border border-border bg-card text-sm text-foreground transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary px-3 placeholder:text-muted-foreground/40 shadow-sm',

    /** Select Trigger */
    select: 'h-9 rounded-lg border border-border bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary px-3 shadow-sm',

    /** Select Dropdown */
    selectContent: 'rounded-lg border border-border bg-card shadow-lg p-1 min-w-[180px]',

    /** Table styles */
    table: 'rounded-xl border border-border bg-card shadow-sm overflow-hidden relative',
    tableHead: 'bg-muted/30 text-[11px] font-semibold text-muted-foreground/80 h-9 px-4 border-b border-border',
    tableRow: 'hover:bg-primary/5 transition-colors duration-200 border-b border-border last:border-0 group/row text-foreground h-11',

    /** Compact status badge */
    badge: 'px-2 py-0.5 rounded-md text-[10px] font-semibold border border-primary/30 bg-primary/10 text-foreground',

    /** Micro label */
    microLabel: 'text-[11px] font-semibold text-muted-foreground/80',

    /** Section Title */
    sectionTitle: 'text-lg font-bold text-foreground tracking-tight',

    /** Loading skeleton */
    skeleton: 'bg-primary/20 animate-pulse rounded-xl overflow-hidden',

    /** Empty state container */
    emptyState: 'flex flex-col items-center justify-center p-10 text-center space-y-3 rounded-xl border border-dashed border-primary/40 bg-muted/20',
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
    color = "text-primary",
    bg = "bg-primary/10",
    borderColor = "border-primary/20"
}) => {
    const headerActions = actions || action;
    const displayLabel = humanizeLabel(label || 'BeeYield AI');

    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-border relative mb-6">
            <div className="space-y-1.5">
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border", bg, color, borderColor)}>
                    <Icon className="w-3 h-3" />
                    {displayLabel}
                </div>
                <h1 className={cn(glass.sectionTitle, 'mt-1')}>
                    {typeof title === 'string' ? (
                        <span>{title}</span>
                    ) : (
                        title
                    )}
                </h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
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

export const GlassStatCard: React.FC<GlassStatCardProps> = ({ label, value, icon: Icon, index = 0, color = "text-primary" }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="group"
    >
        <div className={glass.statCard}>
            <div className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border border-border bg-muted/20 group-hover:border-primary/20 group-hover:bg-primary/5")}>
                        <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <p className={glass.microLabel}>{humanizeLabel(label)}</p>
                </div>
                <h3 className="text-xl font-bold text-foreground tabular-nums tracking-tight leading-none truncate">
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
    hideClose?: boolean;
    preventClose?: boolean;
}

export const GlassModal: React.FC<GlassModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-md',
    hideClose = false,
    preventClose = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className={cn(glass.modalOverlay)}
                    onClick={(e) => {
                        if (!preventClose && e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(glass.modalCard, maxWidth)}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Header ── */}
                        <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                    <div className="w-4 h-4 text-primary"><Hexagon className="w-full h-full" /></div>
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h2>
                                    {subtitle && <p className="text-[8px] font-bold text-primary">{subtitle}</p>}
                                </div>
                            </div>
                            {!hideClose && (
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent/10 transition-all"
                                    aria-label="Close"
                                    title="Close"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* ── Content ── */}
                        <div className="p-6 relative z-10">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface GlassConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const GlassConfirmModal: React.FC<GlassConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    const variantConfig = {
        danger: {
            icon: Trash2,
            iconClass: 'text-red-500 bg-red-500/10 border-red-500/20',
            btnClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'text-primary bg-primary/10 border-primary/20',
            btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
        },
        info: {
            icon: Info,
            iconClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            btnClass: 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20'
        }
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-md"
            hideClose
        >
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-sm", config.iconClass)}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className={cn(glass.btnSecondary, "h-11 px-6 text-[9px] font-black")}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "h-11 px-8 rounded-xl font-black text-[9px] transition-all flex items-center gap-2 shadow-xl",
                            config.btnClass,
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </GlassModal>
    );
};

