import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
    hidden?: boolean;
    submenuItems?: {
        id: string;
        label: string;
        icon?: LucideIcon;
        subItems?: { id: string; label: string; icon?: LucideIcon }[];
    }[];
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false
}) => {
    const [pinnedItems, setPinnedItems] = useState<string[]>(['beeyield', 'data', 'meters']);
    const [hoveredItems, setHoveredItems] = useState<string[]>([]);
    const { t } = useLanguage();

    const toggleExpand = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setPinnedItems(prev =>
            prev.includes(id) ? [] : [id]
        );
    };

    const handleMouseEnter = (id: string, hasSubmenu?: boolean) => {
        if (hasSubmenu && !hoveredItems.includes(id)) {
            setHoveredItems(prev => [...prev, id]);
        }
    };

    const handleMouseLeave = (id: string, hasSubmenu?: boolean) => {
        if (hasSubmenu) {
            setHoveredItems(prev => prev.filter(i => i !== id));
        }
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 w-[280px] rounded-3xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden",
                className
            )}
        >
            {/* Logo area */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 180, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-12 h-12 bg-gradient-to-br from-primary to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                        <Hexagon className="w-7 h-7 text-white fill-current" />
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-wide leading-none font-display">{t('dashboard_title')}</h1>
                        <p className="text-[10px] font-bold text-primary tracking-[0.3em] mt-1.5 uppercase">{t('dashboard_subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-4">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;
                    const isExpanded = pinnedItems.includes(item.id) || hoveredItems.includes(item.id);

                    return (
                        <div key={item.id} className="space-y-1">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onTabChange(item.id);
                                    if (item.hasSubmenu) toggleExpand(item.id);
                                }}
                                onMouseEnter={() => handleMouseEnter(item.id, item.hasSubmenu)}
                                onMouseLeave={() => handleMouseLeave(item.id, item.hasSubmenu)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-primary/90 to-amber-600/90 text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                        isActive
                                            ? "bg-white/20 shadow-inner"
                                            : "bg-white/50 dark:bg-white/5 shadow-sm group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-md group-hover:-translate-y-0.5"
                                    )}>
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                                    </div>
                                    <span className="tracking-wide">{item.label}</span>
                                </div>
                                {item.hasSubmenu && (
                                    <div
                                        onClick={(e) => toggleExpand(item.id, e)}
                                        className="p-1 hover:bg-white/20 rounded-full transition-colors relative z-10"
                                    >
                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", isExpanded ? "rotate-0" : "-rotate-90")} />
                                    </div>
                                )}
                            </motion.button>

                            {/* Submenu Items */}
                            <AnimatePresence>
                                {item.hasSubmenu && isExpanded && item.submenuItems && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="ml-5 pl-5 border-l-2 border-dashed border-gray-200 dark:border-white/10 space-y-1 py-1">
                                            {item.submenuItems.map((subItem) => {
                                                const isActiveSub = activeTab === subItem.id;
                                                const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
                                                const isSubExpanded = pinnedItems.includes(subItem.id) || hoveredItems.includes(subItem.id);
                                                const isChildActive = subItem.subItems?.some(child => child.id === activeTab);
                                                const activeState = isActiveSub || isChildActive;

                                                return (
                                                    <div key={subItem.id}>
                                                        <motion.button
                                                            whileHover={{ x: 4 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (hasSubItems) toggleExpand(subItem.id, e);
                                                                else onTabChange(subItem.id);
                                                            }}
                                                            onMouseEnter={() => handleMouseEnter(subItem.id, hasSubItems)}
                                                            onMouseLeave={() => handleMouseLeave(subItem.id, hasSubItems)}
                                                            className={cn(
                                                                "w-full text-left py-2.5 px-3 text-xs font-medium transition-all duration-200 flex items-center justify-between rounded-xl",
                                                                activeState
                                                                    ? "bg-primary/10 text-primary font-semibold"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {subItem.icon ? (
                                                                    <subItem.icon className={cn(
                                                                        "w-4 h-4",
                                                                        activeState ? "text-primary dark:text-amber-400" : "text-muted-foreground/70"
                                                                    )} />
                                                                ) : null}
                                                                {subItem.label}
                                                            </div>
                                                            {hasSubItems && (
                                                                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isSubExpanded ? "rotate-0" : "-rotate-90")} />
                                                            )}
                                                        </motion.button>

                                                        {/* Nested Items */}
                                                        <AnimatePresence>
                                                            {hasSubItems && isSubExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden ml-2 pl-2 border-l border-gray-100 dark:border-white/5 space-y-1 mt-1"
                                                                >
                                                                    {subItem.subItems!.map((child) => (
                                                                        <motion.button
                                                                            key={child.id}
                                                                            whileHover={{ x: 4 }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onTabChange(child.id);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full text-left py-2 px-3 text-[11px] font-medium transition-all duration-200 flex items-center gap-2 rounded-lg",
                                                                                activeTab === child.id
                                                                                    ? "text-primary font-semibold bg-primary/5"
                                                                                    : "text-muted-foreground hover:text-foreground"
                                                                            )}
                                                                        >
                                                                            {child.icon && <child.icon className="w-3 h-3 opacity-70" />}
                                                                            {child.label}
                                                                        </motion.button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
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

            {/* Footer Section */}
            <div className="p-4 space-y-3 bg-gradient-to-t from-gray-50/80 to-transparent dark:from-white/5 dark:to-transparent">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTabChange('server-status')}
                    className="w-full bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-3 rounded-2xl flex items-center justify-between border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129)]" />
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{t('system_normal')}</span>
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all font-semibold text-sm group border border-transparent hover:border-destructive/20"
                >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center group-hover:bg-destructive/20 transition-colors shadow-sm">
                        <LogOut className="w-4 h-4" />
                    </div>
                    {t('logout')}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default DashboardSidebar;

