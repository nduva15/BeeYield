import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut, Search, Command, LayoutGrid, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
    hidden?: boolean;
    submenuItems?: {
        id: string;
        label: string;
        icon?: LucideIcon;
        subItems?: { id: string; label: string; icon?: LucideIcon }[];
    }[];
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false
}) => {
    const [pinnedItems, setPinnedItems] = useState<string[]>(['beeyield', 'data', 'meters']);
    const { t } = useLanguage();

    const toggleExpand = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setPinnedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Stagger variants for modern entrance
    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as any,
                staggerChildren: 0.05
            }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 w-[290px] rounded-[40px] bg-white border border-beeyield-green/5 shadow-[20px_0_60px_-15px_rgba(27,145,87,0.05)] overflow-hidden antialiased relative z-20",
                className
            )}
        >
            {/* Header Area */}
            <div className="relative px-7 pt-10 pb-6">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-5 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <motion.div
                            whileHover={{ rotate: -2, scale: 1.02 }}
                            className="flex items-center gap-3 cursor-default"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-beeyield-gold to-beeyield-orange rounded-2xl flex items-center justify-center shadow-soft">
                                <Zap className="w-6 h-6 text-white fill-white/20 stroke-[2.5] animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-beeyield-green tracking-tighter leading-none italic">
                                    {t('dashboard_title')}
                                </h1>
                                <span className="text-[10px] font-black text-beeyield-orange tracking-[0.2em] uppercase mt-1.5 opacity-60">
                                    {isAdmin ? 'System Core' : 'Agri-Portal'}
                                </span>
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#fdf6e3' }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 bg-beeyield-cream/30 rounded-xl border border-beeyield-green/5 transition-all"
                        >
                            <LayoutGrid className="w-5 h-5 text-beeyield-green/40" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search - Ultra-Modern Inset */}
                <motion.div variants={itemVariants} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-green/20 group-focus-within:text-beeyield-green transition-colors" />
                    <input
                        type="text"
                        placeholder={t('quick_search')}
                        className="w-full bg-beeyield-green/[0.02] border border-beeyield-green/5 rounded-2xl py-3 pl-11 pr-12 text-sm text-beeyield-green font-bold placeholder:text-beeyield-green/20 focus:outline-none focus:ring-2 focus:ring-beeyield-gold/20 focus:border-beeyield-gold/40 focus:bg-white transition-all shadow-inner"
                        readOnly
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <kbd className="px-1.5 py-0.5 rounded border border-beeyield-green/10 bg-white text-[9px] text-beeyield-green/30 font-black shadow-sm tracking-widest">⌘K</kbd>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar-modern pb-6">
                <div>
                    <motion.div variants={itemVariants} className="px-4 pb-4">
                        <span className="text-[10px] font-black text-beeyield-green/20 uppercase tracking-[0.3em]">
                            Primary Node
                        </span>
                    </motion.div>

                    <div className="space-y-1.5">
                        {navItems.filter(item => !item.hidden).map((item) => {
                            const isActive = activeTab === item.id;
                            const isExpanded = pinnedItems.includes(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="relative"
                                >
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            if (item.hasSubmenu) toggleExpand(item.id);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                            isActive
                                                ? "bg-beeyield-green text-white shadow-xl shadow-beeyield-green/20"
                                                : "text-beeyield-green/50 hover:text-beeyield-green hover:bg-beeyield-cream/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-5 h-5 flex items-center justify-center transition-colors",
                                                isActive ? "text-beeyield-gold" : "text-beeyield-green/30 group-hover:text-beeyield-gold"
                                            )}>
                                                <item.icon className="w-5 h-5 stroke-[2.5]" />
                                            </div>
                                            <span className="text-sm font-black tracking-tight uppercase tracking-wider">{item.label}</span>
                                        </div>

                                        {item.hasSubmenu ? (
                                            <ChevronDown className={cn(
                                                "w-4 h-4 transition-transform duration-500",
                                                isExpanded ? "rotate-0 text-beeyield-gold" : "-rotate-90 text-beeyield-green/20"
                                            )} />
                                        ) : (
                                            isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="w-2 h-2 rounded-full bg-beeyield-gold shadow-[0_0_12px_rgba(244,208,63,1)] animate-pulse"
                                                />
                                            )
                                        )}
                                    </motion.button>

                                    {/* Animated Submenu */}
                                    <AnimatePresence>
                                        {item.hasSubmenu && isExpanded && item.submenuItems && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                className="overflow-hidden bg-beeyield-cream/10 rounded-2xl mt-2 ml-6 border-l-2 border-beeyield-gold/20 pl-4"
                                            >
                                                <div className="py-3 space-y-2">
                                                    {item.submenuItems.map((subItem) => {
                                                        const isActiveSub = activeTab === subItem.id;
                                                        const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
                                                        const isSubExpanded = pinnedItems.includes(subItem.id);
                                                        const isChildActive = subItem.subItems?.some(child => child.id === activeTab);
                                                        const activeState = isActiveSub || isChildActive;

                                                        return (
                                                            <div key={subItem.id}>
                                                                <motion.button
                                                                    whileHover={{ x: 2 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (hasSubItems) toggleExpand(subItem.id, e);
                                                                        else onTabChange(subItem.id);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full text-left py-2.5 px-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-between",
                                                                        activeState
                                                                            ? "text-beeyield-green bg-white shadow-sm border border-beeyield-gold/20"
                                                                            : "text-beeyield-green/40 hover:text-beeyield-green hover:bg-white/50"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {subItem.icon && <subItem.icon className="w-4 h-4 text-beeyield-gold" />}
                                                                        {subItem.label}
                                                                    </div>
                                                                    {hasSubItems && (
                                                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSubExpanded ? "rotate-0" : "-rotate-90")} />
                                                                    )}
                                                                </motion.button>

                                                                {/* Sub-sub menu */}
                                                                <AnimatePresence>
                                                                    {hasSubItems && isSubExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="ml-4 mt-2 pl-4 border-l border-beeyield-green/10 space-y-1.5"
                                                                        >
                                                                            {subItem.subItems!.map((child) => (
                                                                                <button
                                                                                    key={child.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onTabChange(child.id);
                                                                                    }}
                                                                                    className={cn(
                                                                                        "w-full text-left py-2 px-3 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-lg",
                                                                                        activeTab === child.id
                                                                                            ? "text-beeyield-green bg-beeyield-gold/10 shadow-sm border border-beeyield-gold/20"
                                                                                            : "text-beeyield-green/30 hover:text-beeyield-green"
                                                                                    )}
                                                                                >
                                                                                    {child.label}
                                                                                </button>
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Interactive Footer */}
            <motion.div
                variants={itemVariants}
                className="px-8 py-10 bg-gradient-to-t from-beeyield-cream/40 to-white/50 border-t border-beeyield-green/5"
            >
                <div className="flex items-center justify-between mb-8 px-1">
                    <motion.div
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTabChange('server-status')}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-beeyield-green shadow-[0_0_15px_rgba(27,145,87,0.6)]" />
                            <div className="absolute inset-0 rounded-full bg-beeyield-green animate-ping opacity-30" />
                        </div>
                        <span className="text-[10px] font-black text-beeyield-green uppercase tracking-[0.2em] group-hover:text-beeyield-orange transition-all">
                            Live Sync
                        </span>
                    </motion.div>
                    <div className="px-2 py-1 rounded bg-beeyield-green/5 border border-beeyield-green/10">
                        <span className="text-[9px] font-black text-beeyield-green/40">Encrypted</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#ea580c', borderColor: '#ea580c20' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className="flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-beeyield-green/10 bg-white text-[11px] font-black uppercase tracking-widest text-beeyield-green transition-all shadow-sm hover:shadow-lg"
                    >
                        <LogOut className="w-4 h-4 stroke-[3]" />
                        <span>{t('logout')}</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ rotate: 180, scale: 1.1, backgroundColor: '#fdf6e3' }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onTabChange('settings')}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl border border-beeyield-green/10 bg-white shadow-sm text-beeyield-green/40 hover:text-beeyield-orange transition-all"
                    >
                        <Hexagon className="w-6 h-6 stroke-[2]" />
                    </motion.button>
                </div>
            </motion.div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-modern::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                    background: #F0F0F0;
                    border-radius: 10px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb:hover {
                    background: #E5E5E5;
                }
            `}} />
        </motion.div >
    );
};

export default DashboardSidebar;
