import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut, Search, Command, LayoutGrid, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavItem } from './DashboardSidebar';
import { Button } from '@/components/ui/button';

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
    navItems
}) => {
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'data']);
    const { t } = useLanguage();

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[270px] bg-white border-r border-[#E0E7FF]/50 z-40 hidden md:flex flex-col antialiased shadow-[0_12px_40px_rgba(0,0,0,0.03)]",
                className
            )}
        >
            {/* Brand Logo */}
            <div className="px-8 pt-12 pb-10">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => onTabChange('home')}
                >
                    <div className="w-12 h-12 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-lg shadow-slate-200">
                        <Hexagon className="w-6 h-6 text-[#CEF144] fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            Floaria™
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                            V2.0 Dashboard
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 px-4 overflow-y-auto custom-scrollbar-slim space-y-1.5 pb-8">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;
                    const isFolder = item.hasSubmenu;
                    const isExpanded = expandedFolders.includes(item.id);

                    return (
                        <div key={item.id} className="relative">
                            <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (isFolder) {
                                        toggleFolder(item.id);
                                    } else {
                                        onTabChange(item.id);
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-5 py-3.5 rounded-full transition-all duration-300 group",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-[#CEF144]" : "text-slate-400 group-hover:text-slate-900"
                                    )} />
                                    <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                                </div>
                                {isFolder && (
                                    <ChevronDown className={cn(
                                        "w-4 h-4 opacity-40 transition-transform duration-500",
                                        isExpanded ? "rotate-180" : ""
                                    )} />
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {isFolder && isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-11 mt-1 border-l-2 border-slate-50 pl-2 space-y-1"
                                    >
                                        {item.submenuItems?.map((sub: any, idx) => {
                                            if ('title' in sub) {
                                                return (
                                                    <div key={idx} className="pt-4 pb-2">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-4 mb-2 block">{sub.title}</span>
                                                        {sub.items.map((subItem: any) => (
                                                            <button
                                                                key={subItem.id}
                                                                onClick={() => onTabChange(subItem.id)}
                                                                className={cn(
                                                                    "w-full text-left px-4 py-2.5 rounded-full text-[12px] font-bold transition-all",
                                                                    activeTab === subItem.id ? "text-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50/50"
                                                                )}
                                                            >
                                                                {subItem.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => onTabChange(sub.id)}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2.5 rounded-full text-[12px] font-bold transition-all",
                                                        activeTab === sub.id ? "text-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    {sub.label}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* User Profile */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100"
                            className="w-11 h-11 rounded-full border-2 border-white shadow-md object-cover"
                            alt="User"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">Timothy Nduva</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Enterprise Owner</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all group"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{t('logout')}</span>
                </Button>
            </div>
        </motion.div>
    );
};

export default GlassSidebar;
