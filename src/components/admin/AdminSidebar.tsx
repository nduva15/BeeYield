import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LucideIcon, ChevronDown, ChevronRight, LogOut,
    LayoutDashboard, FileText, Inbox, FolderOpen, ShoppingCart,
    MessageSquare, Mail, Calendar, BarChart2, Users, User,
    FileCode, Settings, Layers, Edit
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

// Default navigation structure matching screenshot layout
const defaultNavStructure = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        children: [
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'overview-2', label: 'Overview 2', icon: BarChart2 },
            { id: 'overview-3', label: 'Overview 3', icon: BarChart2 },
        ]
    },
    { id: 'menu-layout', label: 'Menu Layout', icon: Layers },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'file-manager', label: 'File Manager', icon: FolderOpen },
    { id: 'orders', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'contact', label: 'Chat', icon: MessageSquare },
    { id: 'newsletter', label: 'Post', icon: Mail },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
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
            if (next.has(menuId)) {
                next.delete(menuId);
            } else {
                next.add(menuId);
            }
            return next;
        });
    };

    // Merge provided navItems with default structure for display
    const displayItems = navItems.length > 0 ? navItems : defaultNavStructure as AdminNavItem[];

    return (
        <div className={cn(
            "flex flex-col h-full bg-gradient-to-b from-amber-500 via-amber-500 to-orange-600 w-64 transition-all duration-300 shadow-xl",
            className
        )}>
            {/* Logo area */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <span className="text-xl">🐝</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide leading-none">BeeYield</h1>
                        <p className="text-[10px] font-medium text-white/70 tracking-wider mt-0.5 uppercase">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
                {displayItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedMenus.has(item.id);
                    const isChildActive = hasChildren && item.children?.some(child => child.id === activeTab);

                    return (
                        <div key={item.id} className="space-y-0.5">
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleMenu(item.id);
                                    } else {
                                        onTabChange(item.id);
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group relative",
                                    isActive || isChildActive
                                        ? "bg-white text-amber-600 shadow-md"
                                        : "text-white/90 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <item.icon className={cn(
                                        "w-4 h-4",
                                        isActive || isChildActive ? "text-amber-500" : "text-white/80"
                                    )} />
                                    <span>{item.label}</span>
                                </div>
                                {hasChildren && (
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform duration-200",
                                        isExpanded ? "rotate-180" : "",
                                        isActive || isChildActive ? "text-amber-500" : "text-white/60"
                                    )} />
                                )}
                            </button>

                            {/* Sub-items */}
                            {hasChildren && isExpanded && (
                                <div className="ml-4 pl-4 border-l border-white/20 space-y-0.5 py-1">
                                    {item.children!.map((child, idx) => {
                                        const isChildItemActive = activeTab === child.id;
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => onTabChange(child.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                                    isChildItemActive
                                                        ? "bg-white text-amber-600 font-medium shadow-sm"
                                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    isChildItemActive ? "bg-amber-500" : "bg-white/40"
                                                )} />
                                                <span>{child.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Divider */}
                <div className="h-px bg-white/20 my-4" />

                {/* Additional menus matching screenshot */}
                <div className="space-y-1">
                    {[
                        { id: 'cms', label: 'CMS', icon: Edit },
                        { id: 'team', label: 'Users', icon: Users },
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'pages', label: 'Pages', icon: FileText },
                        { id: 'components', label: 'Components', icon: Layers },
                        { id: 'forms', label: 'Forms', icon: FileCode },
                        { id: 'widgets', label: 'Widgets', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                                activeTab === item.id
                                    ? "bg-white text-amber-600 shadow-md"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-4 h-4",
                                    activeTab === item.id ? "text-amber-500" : "text-white/80"
                                )} />
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40" />
                        </button>
                    ))}
                </div>
            </nav>

            {/* Footer Section */}
            <div className="p-4 space-y-3">
                {/* Log Out */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                </button>

                <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider text-center pt-2">
                    BEEYIELD © 2026
                </p>
            </div>
        </div>
    );
};

export default AdminSidebar;
