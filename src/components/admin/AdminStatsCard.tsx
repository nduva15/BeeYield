import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatsCardProps {
    title: string;
    value: string;
    subtitle?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    icon?: LucideIcon;
    iconBgColor?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    iconBgColor = 'bg-amber-500',
    className,
    size = 'md'
}) => {
    return (
        <div className={cn(
            "bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-border",
            className
        )}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>
                    <p className={cn(
                        "font-bold text-foreground",
                        size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'
                    )}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                trend.isPositive
                                    ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            )}>
                                {trend.isPositive ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {trend.value}
                            </div>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        iconBgColor
                    )}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStatsCard;
