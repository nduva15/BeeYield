import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LucideIcon, ChevronDown, ChevronRight, LogOut,
    LayoutDashboard, FileText, Inbox, FolderOpen, ShoppingCart,
    MessageSquare, Mail, Calendar, BarChart2, Users, User,
    FileCode, Settings, Layers, Edit, Globe, Shield, Activity
} from 'lucide-react';

export interface AdminNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hidden?: boolean;
    children?: AdminNavItem[];
}

interface AdminSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: AdminNavItem[];
}

const defaultNavStructure = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        children: [
            { id: 'overview', label: 'Analytics', icon: BarChart2 },
            { id: 'stats', label: 'Live Status', icon: Activity },
            { id: 'reports', label: 'Reports', icon: FileText },
        ]
    },
    {
        id: 'content',
        label: 'Content Hub',
        icon: FileText
    },
    { id: 'menu-layout', label: 'Menu Layout', icon: Layers },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'file-manager', label: 'Assets', icon: FolderOpen },
    { id: 'orders', label: 'Omnichannel', icon: ShoppingCart },
    { id: 'contact', label: 'Support Chat', icon: MessageSquare },
    { id: 'newsletter', label: 'Campaigns', icon: Mail },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => {
            const next = new Set(prev);
            if (next.has(menuId)) next.delete(menuId);
            else next.add(menuId);
            return next;
        });
    };

    const displayItems = navItems.length > 0 ? navItems : defaultNavStructure as AdminNavItem[];

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white dark:bg-card border-r border-border w-[280px] text-sm",
                className
            )}
        >
            {/* Admin Header */}
            <div className="px-6 py-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg leading-none tracking-tight">BeeYield</h1>
                        <span className="text-xs text-muted-foreground font-medium mt-1">Control Panel</span>
                    </div>
                </div>
            </div>

            {/* Navigation Body */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                <div className="space-y-1">
                    {displayItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.has(item.id);
                        const isChildActive = hasChildren && item.children?.some(child => child.id === activeTab);
                        const activeGroup = isActive || isChildActive;

                        return (
                            <div key={item.id} className="space-y-1">
                                <button
                                    onClick={() => {
                                        if (hasChildren) toggleMenu(item.id);
                                        else onTabChange(item.id);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors group",
                                        activeGroup
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "w-4 h-4",
                                            activeGroup ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )} />
                                        <span>{item.label}</span>
                                    </div>
                                    {hasChildren && (
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform duration-200",
                                            isExpanded ? "" : "-rotate-90"
                                        )} />
                                    )}
                                </button>

                                {hasChildren && isExpanded && (
                                    <div className="ml-4 pl-3 border-l border-border space-y-1 mt-1">
                                        {item.children!.map((child) => (
                                            <button
                                                key={child.id}
                                                onClick={() => onTabChange(child.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                                                    activeTab === child.id
                                                        ? "bg-accent/50 text-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                                                )}
                                            >
                                                <span>{child.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-1">
                    <div className="px-3 pb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilities</span>
                    </div>
                    {[
                        { id: 'cms', label: 'Content Manager', icon: Edit },
                        { id: 'team', label: 'User Directory', icon: Users },
                        { id: 'pages', label: 'Sitemap', icon: Globe },
                        { id: 'settings', label: 'System Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors group",
                                activeTab === item.id
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-4 h-4",
                                    activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span>{item.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Admin Footer */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                </button>
                <div className="text-center mt-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Version 4.0.2
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
