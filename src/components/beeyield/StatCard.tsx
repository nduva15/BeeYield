import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    icon: LucideIcon;
    trendType?: 'positive' | 'negative' | 'neutral';
    className?: string;
    iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    trend,
    icon: Icon,
    trendType = 'neutral',
    className,
    iconColor = 'hsl(var(--honey-gold))'
}) => {
    const trendColors = {
        positive: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        negative: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
    };

    return (
        <div
            className={cn(
                "glass-hive card-hover p-6 animate-enter",
                className
            )}
        >
            <div className="flex flex-col gap-3">
                {/* Icon and Trend Row */}
                <div className="flex items-center justify-between">
                    <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `hsla(var(--honey-gold), 0.1)` }}
                    >
                        <Icon
                            size={24}
                            style={{ color: iconColor }}
                        />
                    </div>

                    {trend && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "rounded-full font-semibold",
                                trendColors[trendType]
                            )}
                        >
                            {trend}
                        </Badge>
                    )}
                </div>

                {/* Value */}
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {value}
                </div>

                {/* Title */}
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {title}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
