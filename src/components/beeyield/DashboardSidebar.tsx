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
                "flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 w-[290px] rounded-[32px] bg-[#FAFAFA] border border-[#E5E5E5] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden antialiased relative",
                className
            )}
        >
            {/* Header Area */}
            <div className="relative px-7 pt-8 pb-6">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-5 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="flex items-center gap-3 cursor-default"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-[#F4D03F]/20 to-[#F4D03F]/5 border border-[#F4D03F]/30 rounded-[14px] flex items-center justify-center shadow-sm">
                                <Zap className="w-6 h-6 text-[#F4D03F] fill-[#F4D03F]/20 stroke-[2]" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[17px] font-bold text-[#171717] tracking-[-0.03em] leading-tight">
                                    {t('dashboard_title')}
                                </h1>
                                <span className="text-[11px] font-semibold text-[#1B9157] tracking-[0.02em] uppercase">
                                    {isAdmin ? 'Admin' : 'Dashboard'}
                                </span>
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ backgroundColor: '#F0F0F0' }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]/50 transition-colors"
                        >
                            <LayoutGrid className="w-4 h-4 text-[#737373]" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search - Ultra-Modern Inset */}
                <motion.div variants={itemVariants} className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] transition-colors group-focus-within:text-[#171717]" />
                    <input
                        type="text"
                        placeholder={t('quick_search')}
                        className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl py-2.5 pl-10 pr-12 text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#F4D03F] focus:border-[#F4D03F] focus:bg-white transition-all shadow-inner"
                        readOnly
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded border border-[#E5E5E5] bg-white text-xs text-[#737373] font-sans shadow-sm">⌘K</kbd>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar-modern pb-6">
                <div>
                    <motion.div variants={itemVariants} className="px-4 pb-3">
                        <span className="text-xs font-bold text-[#D4D4D4] uppercase tracking-widest">
                            Menu
                        </span>
                    </motion.div>

                    <div className="space-y-1">
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
                                        whileHover={{ x: 4, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            if (item.hasSubmenu) toggleExpand(item.id);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 group",
                                            isActive
                                                ? "bg-white text-[#1B9157] shadow-[0_4px_20px_-8px_rgba(244,208,63,0.3)] border border-[#F4D03F]"
                                                : "text-[#737373] hover:text-[#1B9157] hover:bg-white hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-5 h-5 flex items-center justify-center transition-colors",
                                                isActive ? "text-[#F4D03F]" : "text-[#737373] group-hover:text-[#F4D03F]"
                                            )}>
                                                <item.icon className="w-5 h-5 stroke-[1.8]" />
                                            </div>
                                            <span className="text-[14px] font-semibold tracking-[-0.01em]">{item.label}</span>
                                        </div>

                                        {item.hasSubmenu ? (
                                            <ChevronDown className={cn(
                                                "w-4 h-4 transition-transform duration-500",
                                                isExpanded ? "rotate-0 text-[#1B9157]" : "-rotate-90 text-[#D4D4D4]"
                                            )} />
                                        ) : (
                                            isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] shadow-[0_0_8px_rgba(244,208,63,0.5)]"
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
                                                className="overflow-hidden bg-white/30 rounded-2xl mt-1 ml-4 border-l border-[#E5E5E5] pl-3"
                                            >
                                                <div className="py-2 space-y-1">
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
                                                                        "w-full text-left py-2 px-3 text-[13px] font-semibold transition-all rounded-xl flex items-center justify-between",
                                                                        activeState
                                                                            ? "text-[#1B9157] bg-white shadow-sm border border-[#F4D03F]/50"
                                                                            : "text-[#737373] hover:text-[#1B9157] hover:bg-white/50"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {subItem.icon && <subItem.icon className="w-4 h-4" />}
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
                                                                            className="ml-3 mt-1 pl-3 border-l border-[#E5E5E5]/60 space-y-1"
                                                                        >
                                                                            {subItem.subItems!.map((child) => (
                                                                                <button
                                                                                    key={child.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onTabChange(child.id);
                                                                                    }}
                                                                                    className={cn(
                                                                                        "w-full text-left py-1.5 px-3 text-[12px] font-semibold transition-all rounded-lg",
                                                                                        activeTab === child.id
                                                                                            ? "text-[#1B9157] bg-[#F4D03F]/10 shadow-sm border border-[#F4D03F]/20"
                                                                                            : "text-[#A3A3A3] hover:text-[#1B9157]"
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
                className="px-6 py-8 bg-white/50 backdrop-blur-sm border-t border-[#E5E5E5]"
            >
                <div className="flex items-center justify-between mb-6 px-1">
                    <motion.div
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTabChange('server-status')}
                        className="flex items-center gap-2.5 group cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1B9157] shadow-[0_0_12px_rgba(27,145,87,0.4)]" />
                            <div className="absolute inset-0 rounded-full bg-[#1B9157] animate-ping opacity-20" />
                        </div>
                        <span className="text-[10px] font-black text-[#1B9157] uppercase tracking-[0.1em] group-hover:tracking-[0.15em] transition-all">
                            Online
                        </span>
                    </motion.div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#FEF2F2', color: '#EF4444' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onLogout}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[18px] border border-[#E5E5E5] bg-white text-[13px] font-bold text-[#171717] transition-all shadow-sm"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('logout')}</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onTabChange('settings')}
                        className="w-12 h-12 flex items-center justify-center rounded-[18px] border border-[#E5E5E5] bg-white shadow-sm text-[#737373] hover:text-[#171717] transition-all"
                    >
                        <Hexagon className="w-5 h-5" />
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
