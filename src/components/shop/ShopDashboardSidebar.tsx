import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LogOut, ShoppingBag } from 'lucide-react';
import Logo from '@/assets/Logo.png';
import { motion } from 'framer-motion';

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
}

const ShopDashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
}) => {
    // Stagger variants
    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as any,
                staggerChildren: 0.05
            }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    } as any;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("flex flex-col h-full bg-white border-r border-beeyield-green/5 w-64 shadow-[10px_0_30px_rgba(27,145,87,0.03)]", className)}
        >
            {/* Logo area - More consumer friendly */}
            <motion.div variants={itemVariants} className="p-8">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 bg-beeyield-gold/10 rounded-xl flex items-center justify-center border border-beeyield-gold/20 shadow-sm">
                        <img src={Logo} alt="Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-beeyield-green tracking-tighter leading-none italic">My Account</h1>
                        <p className="text-[10px] font-black text-beeyield-gold tracking-widest mt-1.5 uppercase opacity-80">Shop Dashboard</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar-modern">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[13px] font-black uppercase tracking-wider group",
                                isActive
                                    ? "bg-gradient-to-r from-beeyield-green to-beeyield-green-dark text-white shadow-xl shadow-beeyield-green/20 border border-beeyield-green/10"
                                    : "text-beeyield-green/40 hover:text-beeyield-green hover:bg-beeyield-cream/50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-beeyield-gold" : "text-beeyield-green/30 group-hover:text-beeyield-green")} />
                            {item.label}
                            {item.id === 'checkout' && (
                                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-beeyield-orange shadow-[0_0_12px_rgba(244,208,63,0.6)] animate-pulse" />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <motion.div variants={itemVariants} className="p-6 space-y-4 border-t border-beeyield-green/5 bg-beeyield-cream/20">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#fff', color: '#ea580c' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-beeyield-green/50 transition-all font-black text-[12px] uppercase tracking-widest group border border-transparent hover:border-beeyield-orange/20"
                >
                    <LogOut className="w-5 h-5" />
                    Secure Logout
                </motion.button>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-beeyield-green animate-pulse" />
                        <p className="text-[9px] text-beeyield-green/30 font-black tracking-[0.1em] uppercase">
                            BEE YIELD SHOP v2.1.0
                        </p>
                    </div>
                </div>
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

export default ShopDashboardSidebar;
