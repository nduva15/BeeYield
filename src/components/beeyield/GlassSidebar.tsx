import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut, Search, Command, LayoutGrid, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavItem } from './DashboardSidebar';

interface GlassSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
}

const GlassSidebar: React.FC<GlassSidebarProps> = ({
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
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "fixed left-4 top-4 bottom-4 w-[280px] rounded-[30px] bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden z-40 hidden md:flex flex-col",
                className
            )}
        >
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-0" />

            {/* Header Area */}
            <div className="relative z-10 px-6 pt-8 pb-6">
                <motion.div variants={itemVariants} className="flex flex-col gap-6 mb-6">
                    <div className="flex items-center justify-between">
                        <motion.div
                            whileHover={{ rotate: -2, scale: 1.05 }}
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => onTabChange('home')}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Zap className="w-5 h-5 text-white fill-white/20 stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">
                                    {t('dashboard_title')}
                                </h1>
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mt-1">
                                    Intelligent Hive
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick Command..."
                            className="w-full bg-white/40 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white/60 transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/50 border border-white/20 text-[9px] font-bold text-gray-400 shadow-sm">⌘K</kbd>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <div className="relative z-10 flex-1 px-3 overflow-y-auto custom-scrollbar-glass space-y-1 pb-4">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;
                    const isExpanded = pinnedItems.includes(item.id);

                    return (
                        <div key={item.id} className="mb-1">
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onTabChange(item.id);
                                    if (item.hasSubmenu) toggleExpand(item.id);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/10"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="glass-active-pill"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"
                                    />
                                )}

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={cn(
                                        "transition-colors duration-300",
                                        isActive ? "text-amber-500" : "text-gray-400 group-hover:text-amber-500"
                                    )}>
                                        <item.icon className="w-4 h-4 stroke-[2]" />
                                    </div>
                                    <span className="text-xs tracking-wide">{item.label}</span>
                                </div>

                                {item.hasSubmenu && (
                                    <ChevronDown className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-300 opacity-50",
                                        isExpanded ? "rotate-0 text-amber-500" : "-rotate-90"
                                    )} />
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {item.hasSubmenu && isExpanded && item.submenuItems && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-4 pl-4 border-l border-gray-200/50 dark:border-white/5"
                                    >
                                        <div className="py-1 space-y-0.5">
                                            {item.submenuItems.map((subItem) => (
                                                <motion.button
                                                    key={subItem.id}
                                                    whileHover={{ x: 2 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTabChange(subItem.id);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left py-2 px-3 text-[11px] rounded-lg transition-all flex items-center gap-2",
                                                        activeTab === subItem.id
                                                            ? "text-amber-600 bg-amber-500/5 font-bold"
                                                            : "text-gray-500 hover:text-gray-900 hover:bg-white/30"
                                                    )}
                                                >
                                                    {subItem.icon && <subItem.icon className="w-3 h-3 opacity-70" />}
                                                    {subItem.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="relative z-10 p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/20 backdrop-blur-md text-center">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={onLogout}
                    className="w-full py-3 rounded-xl bg-white/50 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('logout')}
                </motion.button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-glass::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-glass::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-glass::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar-glass::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                }
            `}} />
        </motion.div>
    );
};

export default GlassSidebar;
