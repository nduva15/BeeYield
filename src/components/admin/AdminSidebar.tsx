import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LucideIcon, ChevronDown, ChevronRight, LogOut,
    LayoutDashboard, FileText, Inbox, FolderOpen, ShoppingCart,
    MessageSquare, Mail, Calendar, BarChart2, Users, User,
    FileCode, Settings, Layers, Edit, Globe, Shield, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const containerVariants = {
        hidden: { opacity: 0, x: -25 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.04
            }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
    } as any;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "flex flex-col h-full bg-white border-r border-[#E5E5E5] w-[280px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden antialiased",
                className
            )}
        >
            {/* Admin Header */}
            <div className="px-7 pt-9 pb-8">
                <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        className="w-11 h-11 bg-primary border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"
                    >
                        <Shield className="w-6 h-6 text-white stroke-[2.2]" />
                    </motion.div>
                    <div className="flex flex-col">
                        <h1 className="text-[19px] font-bold text-gray-900 tracking-[-0.03em] leading-none mb-1.5">BeeYield</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.08em] uppercase">Control Panel</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Body */}
            <nav className="flex-1 px-4 space-y-7 overflow-y-auto custom-scrollbar-modern pb-8">
                <div className="space-y-1.5">
                    {displayItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.has(item.id);
                        const isChildActive = hasChildren && item.children?.some(child => child.id === activeTab);
                        const activeGroup = isActive || isChildActive;

                        return (
                            <motion.div key={item.id} variants={itemVariants} className="space-y-1">
                                <motion.button
                                    whileHover={{ x: 4, backgroundColor: activeGroup ? '#FFF' : '#F9F9F9' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (hasChildren) toggleMenu(item.id);
                                        else onTabChange(item.id);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-[11px] rounded-2xl transition-all duration-300 group",
                                        activeGroup
                                            ? "bg-white text-gray-900 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] border border-[#E5E5E5]"
                                            : "text-gray-400 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <item.icon className={cn(
                                            "w-5 h-5 stroke-[1.8]",
                                            activeGroup ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                                        )} />
                                        <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
                                    </div>
                                    {hasChildren && (
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform duration-500",
                                            isExpanded ? "rotate-0 text-gray-900" : "-rotate-90 text-gray-300"
                                        )} />
                                    )}
                                </motion.button>

                                <AnimatePresence initial={false}>
                                    {hasChildren && isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                            className="overflow-hidden bg-gray-50/50 rounded-2xl mt-1 ml-4 border-l border-[#E5E5E5] pl-3"
                                        >
                                            <div className="py-2 space-y-1">
                                                {item.children!.map((child) => (
                                                    <motion.button
                                                        key={child.id}
                                                        whileHover={{ x: 3 }}
                                                        onClick={() => onTabChange(child.id)}
                                                        className={cn(
                                                            "w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 text-[13px] font-bold",
                                                            activeTab === child.id
                                                                ? "bg-white text-gray-900 shadow-sm border border-[#E5E5E5]"
                                                                : "text-gray-400 hover:text-gray-900 hover:bg-white/50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full transition-all scale-100",
                                                            activeTab === child.id ? "bg-primary scale-110" : "bg-gray-300 group-hover:bg-gray-400"
                                                        )} />
                                                        <span>{child.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="px-4 pb-4">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.15em]">Admin Utility</span>
                    </div>
                    <div className="space-y-1">
                        {[
                            { id: 'cms', label: 'CMS Engine', icon: Edit },
                            { id: 'team', label: 'User Directory', icon: Users },
                            { id: 'pages', label: 'Sitemap', icon: Globe },
                            { id: 'settings', label: 'System Settings', icon: Settings },
                        ].map((item) => (
                            <motion.button
                                key={item.id}
                                variants={itemVariants}
                                whileHover={{ x: 4, backgroundColor: '#F9F9F9' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-[14px] font-bold group",
                                    activeTab === item.id
                                        ? "bg-white text-gray-900 shadow-md border border-[#E5E5E5]"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={cn(
                                        "w-5 h-5",
                                        activeTab === item.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                                    )} />
                                    <span>{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Admin Footer */}
            <motion.div
                variants={itemVariants}
                className="p-6 bg-gray-50/30 border-t border-gray-100 mt-auto"
            >
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#FEF2F2', color: '#EF4444' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[18px] border border-gray-200 bg-white text-gray-400 transition-all font-bold text-[13px] shadow-sm uppercase tracking-wider"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Terminate Session</span>
                </motion.button>
                <p className="text-[9px] text-gray-300 font-bold text-center pt-5 tracking-[0.1em] uppercase">
                    Admin Protocol v4.0.2
                </p>
            </motion.div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-modern::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                    background: #F0F0F0;
                    border-radius: 10px;
                }
            `}} />
        </motion.div>
    );
};

export default AdminSidebar;
