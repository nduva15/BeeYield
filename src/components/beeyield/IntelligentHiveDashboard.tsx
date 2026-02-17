import React from 'react';
import {
    Activity,
    Box,
    TrendingUp,
    Zap,
    ThermometerSun,
    Droplet,
    Signal,
    AlertTriangle
} from 'lucide-react';
import StatCard from './StatCard';
import InteractiveButton from './InteractiveButton';
import LiveStatus from './LiveStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Intelligent Hive Dashboard Demo
 * 
 * This component demonstrates the "Glass & Gold" design system with:
 * - Animated stat cards with hover lift effects
 * - Interactive buttons with spring physics
 * - Live status indicators with pulse animations
 * - Premium glassmorphism aesthetic
 */

interface IntelligentHiveDashboardProps {
    onTabChange?: (tab: string) => void;
}

const IntelligentHiveDashboard: React.FC<IntelligentHiveDashboardProps> = ({ onTabChange }) => {
    return (
        <div className="space-y-6 animate-enter">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard Overview
                    </h1>
                    <div className="flex items-center gap-3">
                        <LiveStatus label="All Systems Operational" status="online" />
                        <span className="text-sm text-gray-500">Last updated: 2 min ago</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <InteractiveButton icon={Activity} variant="ghost">
                        View Analytics
                    </InteractiveButton>
                    <InteractiveButton icon={Box} variant="primary">
                        Add Device
                    </InteractiveButton>
                </div>
            </div>

            {/* Stats Grid - Glass Hive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Hives"
                    value="24"
                    trend="+12%"
                    trendType="positive"
                    icon={Box}
                    iconColor="hsl(var(--honey-gold))"
                />

                <StatCard
                    title="Total Devices"
                    value="48"
                    trend="+3 this week"
                    trendType="positive"
                    icon={Signal}
                    iconColor="hsl(var(--leaf-green))"
                />

                <StatCard
                    title="Avg Temperature"
                    value="34.5°C"
                    trend="Optimal"
                    trendType="neutral"
                    icon={ThermometerSun}
                    iconColor="hsl(var(--pollen-yellow))"
                />

                <StatCard
                    title="Alerts"
                    value="2"
                    trend="Requires attention"
                    trendType="negative"
                    icon={AlertTriangle}
                    iconColor="hsl(var(--varroa-red))"
                />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Honey Production"
                    value="943 kg"
                    trend="+18% vs last month"
                    trendType="positive"
                    icon={Droplet}
                    className="lg:col-span-1"
                />

                <StatCard
                    title="Energy Efficiency"
                    value="94%"
                    trend="Excellent"
                    trendType="positive"
                    icon={Zap}
                    className="lg:col-span-1"
                />

                <StatCard
                    title="Growth Rate"
                    value="+15.3%"
                    trend="Above average"
                    trendType="positive"
                    icon={TrendingUp}
                    className="lg:col-span-1"
                />
            </div>

            {/* Recent Activity Card with Glass Effect */}
            <Card className="glass-hive card-hover">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity size={20} className="text-[hsl(var(--honey-gold))]" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { time: '2 min ago', event: 'Device BH-042 connected', status: 'online' },
                            { time: '15 min ago', event: 'Temperature alert resolved', status: 'online' },
                            { time: '1 hour ago', event: 'New measurement recorded', status: 'online' },
                            { time: '2 hours ago', event: 'Battery warning on BH-018', status: 'warning' }
                        ].map((activity, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <LiveStatus status={activity.status as any} showPulse={idx === 0} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.event}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons Demo */}
            <div className="flex flex-wrap gap-4">
                <InteractiveButton icon={Signal} variant="primary">
                    View All Devices
                </InteractiveButton>
                <InteractiveButton icon={Activity} variant="secondary">
                    Analytics Dashboard
                </InteractiveButton>
                <InteractiveButton icon={Box} variant="ghost">
                    Settings
                </InteractiveButton>
            </div>
        </div>
    );
};

export default IntelligentHiveDashboard;
