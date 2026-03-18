import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, Settings, Sun, Moon, Lock as LockIcon } from "lucide-react";
import { NavItem } from './DashboardSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/assets/Logo.png';

interface GlassSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
}

const GlassSidebar: React.FC<GlassSidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'data', 'precision-pollination-folder', 'management-folder']);
    const { theme, setTheme } = useTheme();

    // Dark mode is disabled.
    const isDark = false;

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[280px] bg-[#FFF9F0] border-r border-[#F4D03F]/20 z-50 hidden md:flex flex-col antialiased transition-all",
                className
            )}
        >
            {/* Brand Header */}
            <button
                onClick={() => onTabChange('home')}
                className="h-16 flex items-center px-5 border-b border-[#F4D03F]/20 w-full text-left group hover:bg-[#F9F7F2] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-[#F4D03F]/10 rounded-xl border border-[#F4D03F]/20 p-1.5">
                        <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-[#1A1A1A] tracking-tight leading-none">BeeYield</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">Management Platform</span>
                    </div>
                </div>
            </button>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                <div className="space-y-0.5">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu;
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-9 px-3 transition-all rounded-lg group relative text-[13px]",
                                        isActive
                                            ? "bg-[#F4D03F]/10 text-[#1A1A1A]"
                                            : "text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <item.icon className={cn(
                                            "w-4 h-4 flex-shrink-0",
                                            isActive ? "text-[#F4D03F]" : "opacity-40 group-hover:opacity-70"
                                        )} />
                                        <span className={cn(
                                            "font-medium truncate",
                                            isActive ? "text-[#1A1A1A]" : ""
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 flex-shrink-0 transition-transform",
                                            isActive ? "text-[#F4D03F]/60" : "text-gray-300",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}

                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#F4D03F] rounded-r-full" />
                                    )}
                                </button>

                                {/* Submenu */}
                                <AnimatePresence mode="popLayout">
                                    {isFolder && isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="ml-3 pl-4 border-l border-[#F4D03F]/20 space-y-0.5 py-1 overflow-hidden"
                                        >
                                            {item.submenuItems?.map((sub: any, idx: number) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="space-y-0.5 pt-2 first:pt-0">
                                                            <div className="px-3 py-1.5">
                                                                <span className="text-[10px] font-semibold text-gray-400 tracking-wider">{sub.title}</span>
                                                            </div>
                                                            {sub.items.map((subItem: any) => (
                                                                <button
                                                                    key={subItem.id}
                                                                    onClick={() => onTabChange(subItem.id)}
                                                                    className={cn(
                                                                        "w-full text-left h-8 px-3 text-[12px] rounded-md transition-all flex items-center gap-2 group/sub",
                                                                        activeTab === subItem.id
                                                                            ? "text-[#1A1A1A] bg-[#F4D03F]/20 font-bold"
                                                                            : "text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/5"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-1 h-1 rounded-full flex-shrink-0 transition-all",
                                                                        activeTab === subItem.id ? "bg-[#F4D03F]" : "bg-gray-300 group-hover/sub:bg-gray-400"
                                                                    )} />
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
                                                            "w-full text-left h-8 px-3 text-[12px] rounded-md transition-all flex items-center gap-2 group/sub",
                                                            activeTab === sub.id
                                                                ? "text-[#1A1A1A] bg-[#F4D03F]/20 font-bold"
                                                                : "text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/5"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-1 h-1 rounded-full flex-shrink-0 transition-all",
                                                            activeTab === sub.id ? "bg-[#F4D03F]" : "bg-gray-300 group-hover/sub:bg-gray-400"
                                                        )} />
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
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#F4D03F]/20 space-y-2">

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="h-9 flex items-center justify-center gap-2 bg-[#FFF9F0] text-gray-500 hover:text-gray-700 hover:bg-[#F4D03F]/10 rounded-lg transition-all border border-[#F4D03F]/10 hover:border-[#F4D03F]/20 text-[12px] font-medium"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                    </button>
                    <button
                        onClick={onLogout}
                        className="h-9 flex items-center justify-center gap-2 bg-[#FFF9F0] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-[#F4D03F]/10 hover:border-red-200 text-[12px] font-medium"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>

                <div className="pt-2 text-center">
                    <span className="text-[10px] text-gray-300 font-medium">© 2026 BeeYield</span>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(244, 208, 63, 0.3); }
            `}</style>
        </div>
    );
};

export default GlassSidebar;
