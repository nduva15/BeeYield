import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LogOut, Settings, X } from 'lucide-react';
import Logo from '@/assets/Logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export interface ShopNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hidden?: boolean;
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: ShopNavItem[];
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

const ShopDashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isMobileOpen = false,
    onCloseMobile
}) => {
    const { user } = useAuth();
    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'Customer';
    const avatarUrl = userMetadata.avatar_url;

    // Stagger variants for desktop
    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.04
            }
        }
    };

    const handleItemClick = (id: string) => {
        onTabChange(id);
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#FFF9F0] antialiased">
            {/* Brand Header */}
            <div className="h-16 sm:h-20 flex items-center justify-between px-5 sm:px-6 border-b border-[#F4D03F]/20 flex-shrink-0">
                <button
                    onClick={() => handleItemClick('overview')}
                    className="flex items-center gap-3 w-full text-left group transition-colors"
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 bg-[#F4D03F]/10 rounded-xl border border-[#F4D03F]/20 p-1.5 transition-all group-hover:scale-[1.05]">
                        <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-tight leading-none">
                            BeeYield <span className="text-[#F4D03F]">Shop</span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-1">Customer Portal</span>
                    </div>
                </button>

                {/* Mobile Close Button */}
                {onCloseMobile && (
                    <button
                        onClick={onCloseMobile}
                        className="md:hidden w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-600 ml-2 flex-shrink-0 transition-colors"
                        aria-label="Close navigation"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* User Profile Summary */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#F4D03F]/15 bg-white/50 flex-shrink-0">
                <button
                    onClick={() => handleItemClick('profile')}
                    className="flex items-center gap-3 group w-full text-left"
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/20 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs group-hover:border-[#F4D03F]/50 transition-all">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F9F7F2] text-[#F4D03F] font-bold text-sm">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-[#1A1A1A] truncate">{fullName}</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate">{user?.email}</span>
                    </div>
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 custom-scrollbar space-y-1">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between h-11 sm:h-10 px-3.5 transition-all rounded-xl group relative text-[13.5px] sm:text-[14px]",
                                isActive
                                    ? "bg-[#F4D03F]/20 text-[#1A1A1A] font-bold shadow-xs"
                                    : "text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] font-medium"
                            )}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <item.icon className={cn(
                                    "w-[18px] h-[18px] flex-shrink-0",
                                    isActive ? "text-[#B78103]" : "opacity-50 group-hover:opacity-80"
                                )} />
                                <span className="truncate pointer-events-none select-none">
                                    {item.label}
                                </span>
                            </div>

                            {item.id === 'checkout' && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F4D03F]/20 text-[#1A1A1A] flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] animate-pulse" />
                                </div>
                            )}
                            
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F4D03F] rounded-r-full shadow-[0_0_8px_rgba(244,208,63,0.5)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-3.5 sm:p-4 space-y-2 border-t border-[#F4D03F]/15 bg-white/40 flex-shrink-0">
                <button
                    onClick={() => handleItemClick('profile')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10 transition-all text-[12.5px] sm:text-[13px] font-medium border border-transparent hover:border-[#F4D03F]/20 bg-[#F9F7F2]"
                >
                    <Settings className="w-4 h-4 opacity-70" />
                    Account Details
                </button>
                <button
                    onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                        onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all text-[12.5px] sm:text-[13px] font-medium border border-transparent hover:border-red-100 bg-[#F9F7F2]"
                >
                    <LogOut className="w-4 h-4 opacity-70" />
                    Secure Logout
                </button>
                
                <div className="pt-2 text-center">
                   <p className="text-[10px] text-gray-400 font-medium">BEE YIELD SHOP v2.1.0</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar (hidden on phone/tablet < md) */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                    "hidden md:flex flex-col h-full bg-[#FFF9F0] border-r border-[#F4D03F]/20 w-[250px] lg:w-[280px] flex-shrink-0 z-30 antialiased shadow-xs",
                    className
                )}
            >
                {sidebarContent}
            </motion.div>

            {/* Mobile Slide-in Drawer Sidebar (Phone View) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Dark blurred backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                            onClick={onCloseMobile}
                        />

                        {/* Slide-out drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 26, stiffness: 280 }}
                            className="relative w-[82vw] max-w-[320px] h-full shadow-2xl z-10 flex flex-col"
                        >
                            {sidebarContent}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(244, 208, 63, 0.25);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(244, 208, 63, 0.5);
                }
            `}} />
        </>
    );
};

export default ShopDashboardSidebar;
