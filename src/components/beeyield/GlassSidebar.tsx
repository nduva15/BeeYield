import React from 'react';
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
    const [pinnedItems, setPinnedItems] = React.useState<string[]>(['beeyield', 'data', 'meters']);
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
                ease: [0.16, 1, 0.3, 1] as const,
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
                    <div className="w-10 h-10 bg-[#064e3b] border-2 border-[#10b981] rounded-none flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                        <Hexagon className="w-6 h-6 text-[#facc15]" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-[#064e3b] uppercase tracking-tighter leading-none">
                            Floaria™
                        </h1>
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] mt-1 opacity-70">
                            Enterprise Node
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 px-4 overflow-y-auto custom-scrollbar-slim space-y-1 pb-6 pt-2">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">
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
                                    "w-full flex items-center justify-between px-4 py-2.5 rounded-none transition-all duration-200 group relative border-2 border-transparent",
                                    isActive
                                        ? "bg-[#064e3b] text-white font-black"
                                        : "text-[#064e3b]/60 hover:text-[#064e3b] hover:bg-[#facc15]/10"
                                )}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#facc15] rounded-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                <div className="flex items-center gap-3.5">
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] stroke-[2] transition-all duration-300",
                                        isActive ? "text-[#facc15]" : "text-[#064e3b]/40 group-hover:text-[#064e3b]"
                                    )} />
                                    <span className="text-[12px] font-black uppercase tracking-tight">{item.label}</span>
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
                                            {item.submenuItems.map((sub, idx) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="mt-4 mb-2">
                                                            <p className="text-[9px] font-black uppercase text-[#064e3b]/30 tracking-widest pl-3 mb-2">{sub.title}</p>
                                                            <div className="space-y-0.5">
                                                                {sub.items.map(subItem => (
                                                                    <button
                                                                        key={subItem.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onTabChange(subItem.id);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full text-left py-2 px-3 text-[11px] font-black uppercase rounded-none transition-all flex items-center gap-2.5",
                                                                            activeTab === subItem.id
                                                                                ? "text-[#10b981] bg-[#10b981]/[0.05]"
                                                                                : "text-[#064e3b]/50 hover:text-[#064e3b] hover:bg-[#10b981]/[0.02]"
                                                                        )}
                                                                    >
                                                                        {subItem.icon && <subItem.icon className="w-3.5 h-3.5 opacity-60" />}
                                                                        {subItem.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTabChange(sub.id);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left py-2 px-3 text-[11px] font-black uppercase rounded-none transition-all flex items-center gap-2.5",
                                                            activeTab === sub.id
                                                                ? "text-[#10b981] bg-[#10b981]/[0.05]"
                                                                : "text-[#064e3b]/50 hover:text-[#064e3b] hover:bg-[#10b981]/[0.02]"
                                                        )}
                                                    >
                                                        {sub.icon && <sub.icon className="w-3.5 h-3.5 opacity-60" />}
                                                        {sub.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* User Profile / Footer */}
            <div className="p-6 border-t border-[#064e3b]/10 bg-neutral-50/10">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-10 h-10 border-2 border-[#064e3b] bg-[#facc15] flex items-center justify-center text-[#064e3b] font-black text-xs shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-[#064e3b]">John Doe</span>
                        <span className="text-[8px] font-bold uppercase text-[#10b981]">Owner</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ backgroundColor: '#064e3b', color: '#fff' }}
                    onClick={onLogout}
                    className="w-full py-2.5 bg-white border-2 border-[#064e3b] text-[10px] font-black uppercase text-[#064e3b] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] hover:shadow-none translate-y-[-2px] hover:translate-y-0"
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
