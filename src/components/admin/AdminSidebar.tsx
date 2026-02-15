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
    // Manually handle expanded state for simplicity in this view
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => {
            const next = new Set(prev);
            if (next.has(menuId)) next.delete(menuId);
            else next.add(menuId);
            return next;
        });
    };

    const displayItems = navItems.length > 0 ? navItems : defaultNavStructure as any[];

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white border-r border-beeyield-green/10 w-[280px] text-sm shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20",
                className
            )}
        >
            {/* Admin Header */}
            <div className="px-6 py-8 border-b border-beeyield-green/10 bg-gradient-to-b from-beeyield-cream/50 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-beeyield-gold/10 rounded-xl flex items-center justify-center border border-beeyield-gold/20 shadow-sm">
                        <Shield className="w-6 h-6 text-beeyield-gold" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-black text-xl leading-none tracking-tight text-beeyield-green">BeeYield</h1>
                        <span className="text-[10px] text-beeyield-green/60 font-bold uppercase tracking-widest mt-1.5">Enterprise Core</span>
                    </div>
                </div>
            </div>

            {/* Navigation Body */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-beeyield-green/10 scrollbar-track-transparent">
                <div className="space-y-1">
                    {displayItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.has(item.id);

                        // Check if a child is active
                        let isChildActive = false;
                        if (hasChildren) {
                            isChildActive = item.children.some((child: any) => child.id === activeTab);
                        }

                        const activeGroup = isActive || isChildActive;

                        return (
                            <div key={item.id} className="space-y-1">
                                <button
                                    onClick={() => {
                                        if (hasChildren) toggleMenu(item.id);
                                        else onTabChange(item.id);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                        activeGroup
                                            ? "bg-beeyield-green/10 text-beeyield-green shadow-sm ring-1 ring-beeyield-green/20"
                                            : "text-beeyield-green/60 hover:bg-beeyield-cream hover:text-beeyield-green hover:pl-4"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-colors",
                                            activeGroup ? "text-beeyield-green" : "text-beeyield-green/40 group-hover:text-beeyield-green"
                                        )} />
                                        <span>{item.label}</span>
                                    </div>
                                    {hasChildren && (
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform duration-200 text-beeyield-green/40",
                                            isExpanded ? "" : "-rotate-90"
                                        )} />
                                    )}
                                </button>

                                {hasChildren && isExpanded && (
                                    <div className="ml-4 pl-3 border-l-2 border-beeyield-green/10 space-y-1 mt-1">
                                        {item.children.map((child: any) => (
                                            <button
                                                key={child.id}
                                                onClick={() => onTabChange(child.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium",
                                                    activeTab === child.id
                                                        ? "bg-beeyield-gold/10 text-beeyield-green text-beeyield-green-dark"
                                                        : "text-beeyield-green/50 hover:bg-beeyield-cream/50 hover:text-beeyield-green"
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

                <div className="space-y-1 pt-4 border-t border-beeyield-green/5">
                    <div className="px-3 pb-3">
                        <span className="text-[10px] font-black text-beeyield-green/30 uppercase tracking-widest">System Utilities</span>
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
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                activeTab === item.id
                                    ? "bg-beeyield-green/10 text-beeyield-green shadow-sm ring-1 ring-beeyield-green/20"
                                    : "text-beeyield-green/60 hover:bg-beeyield-cream hover:text-beeyield-green hover:pl-4"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-4 h-4 transition-colors",
                                    activeTab === item.id ? "text-beeyield-green" : "text-beeyield-green/40 group-hover:text-beeyield-green"
                                )} />
                                <span>{item.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Admin Footer */}
            <div className="p-4 border-t border-beeyield-green/10 bg-beeyield-cream/30">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-beeyield-green/20 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-bold text-beeyield-green/70 shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Secure Logout</span>
                </button>
                <div className="text-center mt-4 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-beeyield-green animate-pulse"></div>
                    <p className="text-[10px] text-beeyield-green/40 uppercase tracking-widest font-bold">
                        System Online v4.1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
