import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    Droplets,
    Box,
    Thermometer,
    AlertTriangle,
    TrendingUp,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Framer Motion Enhanced Dashboard
 * Implements staggered card animations and spring physics
 */

// Animation Variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25
        }
    }
};

interface AnimatedStatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ElementType;
    color: 'amber' | 'emerald' | 'blue' | 'red';
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({ title, value, trend, icon: Icon, color }) => {
    const colors = {
        amber: "text-[#F4D03F] bg-[#F4D03F]/ border-amber-500/20",
        emerald: "text-[#1B9157] bg-[#1B9157]/ border-[#1B9157]/",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        red: "text-red-500 bg-red-500/10 border-red-500/20",
    };

    return (
        <motion.div
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-hive p-6 relative overflow-hidden group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", colors[color])}>
                    <Icon size={24} />
                </div>
                <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center text-xs font-medium text-[#1B9157] bg-[#1B9157]/ px-2 py-1 rounded-full"
                >
                    {trend} <ArrowUpRight size={12} className="ml-1" />
                </motion.span>
            </div>
            <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">{value}</h3>
            <p className="text-sm text-gray-600 font-medium">{title}</p>

            {/* Hover glow effect */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1), transparent 70%)'
                }}
            />
        </motion.div>
    );
};

interface ActivityItemProps {
    text: string;
    time: string;
    alert?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ text, time, alert }) => {
    return (
        <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 text-sm py-2 px-3 rounded-lg hover:bg-[#F9F7F2]:bg-gray-800/50 transition-colors"
        >
            <div className={cn(
                "mt-1.5 w-2 h-2 rounded-full",
                alert ? "bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" : "bg-gray-400"
            )} />
            <div className="flex-1">
                <p className={cn(
                    "font-medium",
                    alert ? "text-red-500" : "text-gray-700"
                )}>
                    {text}
                </p>
                <span className="text-xs text-gray-500">{time}</span>
            </div>
        </motion.li>
    );
};

interface FramerDashboardProps {
    onTabChange?: (tab: string) => void;
}

const FramerDashboard: React.FC<FramerDashboardProps> = ({ onTabChange }) => {
    return (
        <div className="space-y-6">
            {/* Header with motion */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Dashboard</h2>
                    <p className="text-gray-600 mt-1">
                        Welcome back. Operations are <span className="text-[#1B9157] font-semibold">94% nominal</span>.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-interactive bg-[hsl(var(--honey-gold))] hover:bg-[hsl(var(--pollen-yellow))] text-[#1A1A1A] px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all"
                >
                    + Log Harvest
                </motion.button>
            </motion.header>

            {/* Stats Grid with staggered animation */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <AnimatedStatCard
                    title="Total Honey"
                    value="1,240 kg"
                    trend="+12%"
                    icon={Droplets}
                    color="amber"
                />
                <AnimatedStatCard
                    title="Active Hives"
                    value="45 / 50"
                    trend="90%"
                    icon={Box}
                    color="emerald"
                />
                <AnimatedStatCard
                    title="Avg Temp"
                    value="34.2°C"
                    trend="Stable"
                    icon={Thermometer}
                    color="blue"
                />
                <AnimatedStatCard
                    title="Alerts"
                    value="3 Critical"
                    trend="Action Req"
                    icon={AlertTriangle}
                    color="red"
                />
            </motion.div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-hive p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-[hsl(var(--honey-gold))]" size={20} />
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">
                            Yield Trends (2026)
                        </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-[#F4D03F]/20 rounded-xl">
                        [Chart Component Here]
                    </div>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-hive p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="text-[hsl(var(--honey-gold))]" size={20} />
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">
                            Live Activity
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        <ActivityItem text="Harvest logged: 25kg (Acacia)" time="2h ago" />
                        <ActivityItem text="Hive #04 temp spike detected" time="4h ago" alert />
                        <ActivityItem text="New batch traceability generated" time="5h ago" />
                        <ActivityItem text="IoT device BH-042 connected" time="6h ago" />
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default FramerDashboard;
