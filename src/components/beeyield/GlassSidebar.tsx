import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, Settings, Sun, Moon, Lock as LockIcon, ShieldCheck, X, Sparkles, Layers } from "lucide-react";
import { NavItem } from './DashboardSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';

interface GlassSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const GlassSidebar: React.FC<GlassSidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    mobileOpen = false,
    onMobileClose
}) => {
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'precision-pollination-folder', 'meters']);
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    
    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = userMetadata.avatar_url;

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
                    onClick={onMobileClose}
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-border z-50 flex flex-col antialiased transition-transform duration-300 shadow-2xl md:shadow-none",
                    mobileOpen ? "translate-x-0 !flex" : "-translate-x-full md:translate-x-0 hidden md:flex",
                    className
                )}
            >
                {/* Brand Header with Close on Mobile */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border/60 bg-card/40">
                    <button
                        onClick={() => { onTabChange('home'); onMobileClose?.(); }}
                        className="flex items-center gap-3 text-left group transition-colors flex-1 min-w-0"
                    >
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-[#F4D03F]/10 rounded-xl border border-[#F4D03F]/30 p-1.5 transition-all group-hover:scale-105 shadow-sm">
                            <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-base font-black text-foreground tracking-tight leading-none truncate">BeeYield <span className="text-[#F4D03F]">Dashboard</span></span>
                            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wider uppercase">Operational OS</span>
                        </div>
                    </button>
                    {mobileOpen && (
                        <button
                            onClick={onMobileClose}
                            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                            aria-label="Close navigation drawer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* User Profile Summary - Matching Harvests Page Card Style */}
                <div className="p-3 border-b border-border/60 bg-muted/20">
                    <button 
                      onClick={() => { onTabChange('settings'); onMobileClose?.(); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border/70 bg-card hover:border-[#F4D03F]/40 transition-all shadow-sm group text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/30 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-[#F4D03F] transition-colors">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#F4D03F]/15 text-[#F4D03F] font-black text-sm">
                                    {fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-foreground truncate group-hover:text-[#F4D03F] transition-colors">{fullName}</span>
                                <span className="text-[9px] font-bold text-[#F4D03F] bg-[#F4D03F]/10 border border-[#F4D03F]/25 px-1.5 py-0.2 rounded-full shrink-0">Operator</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate font-mono block mt-0.5">{user?.email || 'Signed-in Operator'}</span>
                        </div>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 custom-scrollbar">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu || (item.submenuItems && item.submenuItems.length > 0);
                        const isExpanded = expandedFolders.includes(item.id);
                        const ItemIcon = item.icon;

                        const subCount = item.submenuItems?.reduce((acc: number, s: any) => {
                            if ('items' in s) return acc + (s.items?.length || 0);
                            return acc + 1;
                        }, 0) || 0;

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all group relative border",
                                        isActive || (isFolder && isExpanded)
                                            ? "bg-card border-[#F4D03F]/40 text-foreground shadow-sm"
                                            : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60 hover:border-border/70"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                                            isActive || (isFolder && isExpanded)
                                                ? "bg-[#F4D03F]/15 border-[#F4D03F]/30 text-[#F4D03F]"
                                                : "bg-muted/40 border-border/60 text-muted-foreground group-hover:text-[#F4D03F] group-hover:border-[#F4D03F]/25"
                                        )}>
                                            <ItemIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={cn(
                                            "font-bold truncate text-xs",
                                            isActive || (isFolder && isExpanded) ? "text-foreground" : ""
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {isFolder && subCount > 0 && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/60 text-muted-foreground group-hover:border-[#F4D03F]/20">
                                                {subCount}
                                            </span>
                                        )}
                                        {isFolder && (
                                            <ChevronDown className={cn(
                                                "w-3.5 h-3.5 transition-transform duration-200",
                                                isExpanded ? "rotate-180 text-[#F4D03F]" : "text-muted-foreground/60 group-hover:text-[#F4D03F]"
                                            )} />
                                        )}
                                        {!isFolder && isActive && (
                                            <span className="w-2 h-2 rounded-full bg-[#F4D03F] shrink-0" />
                                        )}
                                    </div>
                                </button>

                                {/* Submenu Dropdown Container - Matching Harvests Page Sub-panels */}
                                <AnimatePresence mode="popLayout">
                                    {isFolder && isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1.5 mb-2 p-2 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-1 shadow-inner overflow-hidden"
                                        >
                                            {item.submenuItems?.map((sub: any, idx: number) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="space-y-1 pt-1.5 first:pt-0">
                                                            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-[#F4D03F] uppercase tracking-wider border-b border-border/40">
                                                                <Layers className="w-3 h-3 text-[#F4D03F]/80" />
                                                                <span>{sub.title}</span>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                {sub.items.map((subItem: any) => {
                                                                    const SubIcon = subItem.icon || Sparkles;
                                                                    const isSubActive = activeTab === subItem.id;
                                                                    return (
                                                                        <button
                                                                            key={subItem.id}
                                                                            onClick={() => { onTabChange(subItem.id); onMobileClose?.(); }}
                                                                            className={cn(
                                                                                "w-full text-left p-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group/sub border",
                                                                                isSubActive
                                                                                    ? "bg-[#F4D03F]/20 border-[#F4D03F]/40 text-foreground font-bold shadow-sm"
                                                                                    : "bg-background/40 border-border/30 text-muted-foreground hover:text-foreground hover:border-[#F4D03F]/30 hover:bg-background"
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <div className={cn(
                                                                                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all",
                                                                                    isSubActive
                                                                                        ? "bg-[#F4D03F] text-neutral-900 border-[#F4D03F]"
                                                                                        : "bg-muted/40 border-border/50 text-muted-foreground group-hover/sub:text-[#F4D03F] group-hover/sub:border-[#F4D03F]/30"
                                                                                )}>
                                                                                    <SubIcon className="w-3 h-3" />
                                                                                </div>
                                                                                <span className="truncate">{subItem.label}</span>
                                                                            </div>
                                                                            {isSubActive && (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                const SubIcon = sub.icon || Sparkles;
                                                const isSubActive = activeTab === sub.id;
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => { onTabChange(sub.id); onMobileClose?.(); }}
                                                        className={cn(
                                                            "w-full text-left p-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group/sub border",
                                                            isSubActive
                                                                ? "bg-[#F4D03F]/20 border-[#F4D03F]/40 text-foreground font-bold shadow-sm"
                                                                : "bg-background/40 border-border/30 text-muted-foreground hover:text-foreground hover:border-[#F4D03F]/30 hover:bg-background"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all",
                                                                isSubActive
                                                                    ? "bg-[#F4D03F] text-neutral-900 border-[#F4D03F]"
                                                                    : "bg-muted/40 border-border/50 text-muted-foreground group-hover/sub:text-[#F4D03F] group-hover/sub:border-[#F4D03F]/30"
                                                            )}>
                                                                <SubIcon className="w-3 h-3" />
                                                            </div>
                                                            <span className="truncate">{sub.label}</span>
                                                        </div>
                                                        {isSubActive && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                                        )}
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

                {/* Bottom Account Card - Matching Harvests Page Cards */}
                <div className="p-3 border-t border-border/60 bg-muted/20">
                    <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F4D03F]/15 text-[#F4D03F] font-black text-sm">
                                        {fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xs font-bold text-foreground truncate">{fullName}</h3>
                                <p className="text-[10px] text-muted-foreground truncate">Authentication Active</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => { onTabChange('settings'); onMobileClose?.(); }}
                                className="flex-1 h-8 px-2 rounded-lg border border-border bg-background hover:bg-[#F4D03F]/10 hover:border-[#F4D03F]/40 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-[#F4D03F]" />
                                Settings
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex-1 h-8 px-2 rounded-lg border border-border bg-background hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="py-2 text-center border-t border-border/40 bg-card/20">
                    <span className="text-[10px] text-muted-foreground font-medium">© 2026 BeeYield Systems</span>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(244, 208, 63, 0.4); }
                `}</style>
            </div>
        </>
    );
};

export default GlassSidebar;
