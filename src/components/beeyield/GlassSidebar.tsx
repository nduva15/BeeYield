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
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.04
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -5 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E0E0E0] z-40 hidden md:flex flex-col antialiased",
                className
            )}
        >
            {/* Logo Area */}
            <div className="px-7 pt-10 pb-8">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onTabChange('home')}
                >
                    <div className="w-10 h-10 bg-beeyield-forest rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                        <Hexagon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-beeyield-charcoal tracking-tight leading-none">
                            Floaria™
                        </h1>
                        <span className="text-[10px] font-medium text-beeyield-forest uppercase tracking-widest mt-1 opacity-70">
                            BeeYield Core
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 px-4 overflow-y-auto custom-scrollbar-slim space-y-1 pb-6 pt-2">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {t('main_menu') || 'Navigation'}
                    </span>
                </div>

                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;
                    const isExpanded = pinnedItems.includes(item.id);

                    return (
                        <div key={item.id} className="relative">
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onTabChange(item.id);
                                    if (item.hasSubmenu) toggleExpand(item.id);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-beeyield-forest/[0.04] text-beeyield-forest font-semibold"
                                        : "text-gray-500 hover:text-beeyield-forest hover:bg-beeyield-forest/[0.02]"
                                )}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-beeyield-forest rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                <div className="flex items-center gap-3.5">
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] stroke-[1.5] transition-all duration-300",
                                        isActive ? "text-beeyield-forest" : "text-gray-400 group-hover:text-beeyield-forest"
                                    )} />
                                    <span className="text-[13px] tracking-tight">{item.label}</span>
                                </div>

                                {item.hasSubmenu && (
                                    <ChevronDown className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-300 opacity-40",
                                        isExpanded ? "rotate-180" : "rotate-0"
                                    )} />
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {item.hasSubmenu && isExpanded && item.submenuItems && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-9 pl-3 border-l border-gray-100 mt-1 mb-1"
                                    >
                                        <div className="py-1 space-y-0.5">
                                            {item.submenuItems.map((subItem) => (
                                                <button
                                                    key={subItem.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTabChange(subItem.id);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left py-2 px-3 text-[12px] rounded-lg transition-all flex items-center gap-2.5",
                                                        activeTab === subItem.id
                                                            ? "text-beeyield-forest bg-beeyield-forest/[0.03] font-semibold"
                                                            : "text-gray-500 hover:text-beeyield-forest hover:bg-beeyield-forest/[0.01]"
                                                    )}
                                                >
                                                    {subItem.icon && <subItem.icon className="w-3.5 h-3.5 opacity-60" />}
                                                    {subItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* User Profile / Footer */}
            <div className="p-6 border-t border-[#F0F0F0] bg-gray-50/30">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-9 h-9 rounded-full bg-beeyield-forest/10 border border-beeyield-forest/20 flex items-center justify-center text-beeyield-forest font-bold text-xs shadow-sm">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-beeyield-charcoal">John Doe</span>
                        <span className="text-[10px] text-gray-400 font-medium">Owner</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ backgroundColor: '#F9F9F9' }}
                    onClick={onLogout}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-500 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('logout')}
                </motion.button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-slim::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar-slim::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-slim::-webkit-scrollbar-thumb {
                    background: #E0E0E0;
                    border-radius: 10px;
                }
            `}} />
        </motion.div>
    );
};

export default GlassSidebar;
