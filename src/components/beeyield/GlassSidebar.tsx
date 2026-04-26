import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, Settings, Sun, Moon, Lock as LockIcon, ShieldCheck } from "lucide-react";
import { NavItem } from './DashboardSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';

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
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'data', 'precision-pollination-folder', 'meters']);
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    
    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = userMetadata.avatar_url;

    const isDark = theme === 'dark';

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-border z-50 hidden md:flex flex-col antialiased transition-all",
                className
            )}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center px-5 border-b border-border/50">
                <button
                    onClick={() => onTabChange('home')}
                    className="flex items-center gap-3 w-full text-left group transition-colors"
                >
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded-xl border border-border p-1.5 transition-all group-hover:scale-110">
                        <img src={Logo} alt="Beeeyield" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground tracking-tight leading-none">Beeeyield <span className="text-[#F4D03F]">Dashboard</span></span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Management Platform</span>
                    </div>
                </button>
            </div>

            {/* User Profile Summary */}
            <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
                <button 
                  onClick={() => onTabChange('settings')}
                  className="flex items-center gap-3 group w-full text-left"
                >
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-border/ transition-all">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/20 text-[#F4D03F] font-bold text-sm">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-bold text-foreground truncate">{fullName}</span>
                        <span className="text-[10px] text-muted-foreground/70 font-medium truncate">{user?.email}</span>
                    </div>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                <div className="space-y-0.5">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu || (item.submenuItems && item.submenuItems.length > 0);
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-9 px-3 transition-all rounded-lg group relative text-[13px]",
                                        isActive
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <item.icon className={cn(
                                            "w-4 h-4 flex-shrink-0",
                                            isActive ? "text-[#F4D03F]" : "opacity-40 group-hover:opacity-70"
                                        )} />
                                        <span className={cn(
                                            "font-medium truncate",
                                            isActive ? "text-foreground" : ""
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
                                            className="ml-3 pl-4 border-l border-border space-y-0.5 py-1 overflow-hidden"
                                        >
                                            {item.submenuItems?.map((sub: any, idx: number) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="space-y-0.5 pt-2 first:pt-0">
                                                            <div className="px-3 py-1.5">
                                                                <span className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider">{sub.title}</span>
                                                            </div>
                                                            {sub.items.map((subItem: any) => (
                                                                <button
                                                                    key={subItem.id}
                                                                    onClick={() => onTabChange(subItem.id)}
                                                                    className={cn(
                                                                        "w-full text-left h-8 px-3 text-[12px] rounded-md transition-all flex items-center gap-2 group/sub",
                                                                        activeTab === subItem.id
                                                                            ? "text-foreground bg-[#F4D03F]/20 font-bold"
                                                                            : "text-muted-foreground hover:text-foreground hover:bg-[#F4D03F]/5"
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
                                                                ? "text-foreground bg-[#F4D03F]/20 font-bold"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-[#F4D03F]/5"
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

            <div className={cn(glass.section, "mx-3 mb-5 p-5 bg-card/60 backdrop-blur-md shadow-sm")}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/20 text-primary font-bold text-sm">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground truncate max-w-[120px]">{fullName}</h3>
                        <p className="text-[11px] text-muted-foreground">Your signed-in details</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => onTabChange('settings')}
                        className={cn(glass.btnSecondary, "flex-1 justify-center")}
                    >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Settings
                    </button>
                    <button
                        onClick={onLogout}
                        className={cn(glass.btnSecondary, "flex-1 justify-center hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 group")}
                    >
                        <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="py-2 text-center pb-4">
                <span className="text-[10px] text-gray-300 font-medium">© 2026 Beeeyield</span>
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


