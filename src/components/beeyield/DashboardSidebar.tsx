import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut, Search, Command, LayoutGrid, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
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

    const containerVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delayChildren: 0.05,
                staggerChildren: 0.04
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: spring.gentle }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "flex flex-col h-[calc(100vh-3rem)] my-6 ml-6 w-[310px] rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden antialiased relative",
                className
            )}
        >
            {/* Header Area */}
            <div className="relative px-8 pt-10 pb-8">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-6 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 cursor-default"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF9100] to-[#F4D03F] rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Zap className="w-6 h-6 text-white fill-white/20 stroke-[3]" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                                    BeeYield
                                </h1>
                                <span className="text-[10px] font-bold text-green-600 uppercase mt-1 tracking-wider">
                                    {isAdmin ? 'Management' : 'Dashboard'}
                                </span>
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#FAF9F6' }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100"
                        >
                            <LayoutGrid className="w-4 h-4 text-slate-400" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search Inset */}
                <motion.div variants={itemVariants} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-all font-bold" />
                    <input
                        type="text"
                        placeholder="Search dashboard..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-12 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all"
                        readOnly
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <kbd className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[9px] text-slate-400 font-bold shadow-sm">⌘K</kbd>
                    </div>
                </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar-modern pb-6">
                <div>
                    <motion.div variants={itemVariants} className="px-3 pb-2">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                            Menu
                        </span>
                    </motion.div>

                    <motion.div
                        className="space-y-0.5"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.03
                                }
                            }
                        }}
                    >
                        {navItems.filter(item => !item.hidden).map((item) => {
                            const isActive = activeTab === item.id;
                            const isExpanded = pinnedItems.includes(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="relative px-1"
                                >
                                    <motion.button
                                        whileHover={{ x: 3, scale: 1.01 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            if (item.hasSubmenu) toggleExpand(item.id);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold"
                                                : "text-slate-400 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className={cn(
                                                    "w-4 h-4 flex items-center justify-center transition-colors",
                                                    isActive ? "text-primary-foreground" : "text-slate-300 group-hover:text-primary"
                                                )}
                                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <item.icon className="w-4 h-4 stroke-[2.5]" />
                                            </motion.div>
                                            <span className="text-[11px] uppercase tracking-wide font-bold">{item.label}</span>
                                        </div>

                                        {item.hasSubmenu ? (
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <ChevronDown className={cn(
                                                    "w-3.5 h-3.5 transition-colors",
                                                    isExpanded ? "text-amber-400" : "text-slate-200"
                                                )} />
                                            </motion.div>
                                        ) : (
                                            isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )
                                        )}
                                    </motion.button>

                                    {/* Animated Submenu */}
                                    <AnimatePresence>
                                        {item.hasSubmenu && isExpanded && item.submenuItems && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, y: -10 }}
                                                animate={{ height: "auto", opacity: 1, y: 0 }}
                                                exit={{ height: 0, opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden mt-0.5 ml-4 border-l-2 border-slate-100 pl-2 space-y-0.5"
                                            >
                                                {item.submenuItems.map((subItem, idx) => {
                                                    const isActiveSub = activeTab === subItem.id;
                                                    const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
                                                    const isSubExpanded = pinnedItems.includes(subItem.id);
                                                    const isChildActive = subItem.subItems?.some(child => child.id === activeTab);
                                                    const activeState = isActiveSub || isChildActive;

                                                    return (
                                                        <motion.div
                                                            key={subItem.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                        >
                                                            <motion.button
                                                                whileHover={{ x: 2, scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (hasSubItems) toggleExpand(subItem.id, e);
                                                                    else onTabChange(subItem.id);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wide transition-all rounded-lg flex items-center justify-between",
                                                                    activeState
                                                                        ? "text-amber-600 bg-amber-50 shadow-sm"
                                                                        : "text-slate-400 hover:bg-slate-50 hover:text-amber-500"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {subItem.icon && <subItem.icon className="w-3.5 h-3.5 stroke-[2.5]" />}
                                                                    {subItem.label}
                                                                </div>
                                                                {hasSubItems && (
                                                                    <motion.div
                                                                        animate={{ rotate: isSubExpanded ? 0 : -90 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        <ChevronDown className="w-3 h-3" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.button>

                                                            {/* Sub-sub menu */}
                                                            <AnimatePresence>
                                                                {hasSubItems && isSubExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.25 }}
                                                                        className="ml-2 mt-0.5 pl-3 border-l border-slate-100 space-y-0.5"
                                                                    >
                                                                        {subItem.subItems!.map((child, childIdx) => (
                                                                            <motion.button
                                                                                key={child.id}
                                                                                initial={{ opacity: 0, x: -5 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: childIdx * 0.03 }}
                                                                                whileHover={{ x: 2, color: '#22c55e' }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onTabChange(child.id);
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full text-left py-1.5 px-2 text-[9px] font-bold uppercase tracking-wide transition-all rounded-md",
                                                                                    activeTab === child.id
                                                                                        ? "text-green-700 bg-green-50 shadow-sm"
                                                                                        : "text-slate-300 hover:text-green-600"
                                                                                )}
                                                                            >
                                                                                {child.label}
                                                                            </motion.button>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Premium Interactive Footer - Compact Design */}
            <motion.div
                variants={itemVariants}
                className="px-6 py-6 bg-slate-50 border-t border-slate-100"
            >
                <div className="flex items-center justify-between mb-5">
                    <motion.div
                        whileHover={{ x: 2 }}
                        onClick={() => onTabChange('server-status')}
                        className="flex items-center gap-2.5 group cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                        </div>
                        <span className="text-[9px] font-bold text-green-700 uppercase tracking-wide group-hover:tracking-wider transition-all">
                            System Online
                        </span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <motion.button
                        whileHover={{ scale: 1.08, backgroundColor: '#FAF9F6', color: '#FF9100', y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={() => onTabChange('settings')}
                        className="col-span-1 h-14 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-400 hover:border-amber-200 transition-all"
                    >
                        <Settings className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03, backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2', y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={onLogout}
                        className="col-span-4 flex items-center justify-center gap-2.5 px-4 h-14 rounded-xl border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wide text-slate-800 transition-all shadow-sm"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.5]" />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </motion.div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-modern::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb:hover {
                    background: #e2e8f0;
                }
            `}} />
        </motion.div >
    );
};

export default DashboardSidebar;
