import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';

export interface AdminNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hidden?: boolean;
}

interface AdminSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: AdminNavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border w-64 transition-colors duration-300", className)}>
            {/* Logo area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive rounded-xl flex items-center justify-center shadow-lg shadow-destructive/20">
                        <ShieldCheck className="w-6 h-6 text-destructive-foreground fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-widest leading-none">BEEYIELD ADMIN</h1>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mt-1 uppercase">SYSTEM CONTROL</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-8 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <div key={item.id} className="space-y-1">
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-semibold group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-white/20 shadow-sm" : "bg-muted"
                                    )}>
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                    </div>
                                    {item.label}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 space-y-4 border-t border-border bg-muted/30">
                {/* Admin Status */}
                <div className="bg-destructive/10 px-4 py-3 rounded-2xl flex items-center justify-between border border-destructive/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Security Status</span>
                    </div>
                    <span className="text-[10px] font-bold text-destructive uppercase">SECURE</span>
                </div>

                {/* Log Out */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-semibold text-sm group"
                >
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </div>
                    Log Out
                </button>

                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center pt-2">
                    BEEYIELD ADMIN © 2026
                </p>
            </div>
        </div>
    );
};

export default AdminSidebar;
