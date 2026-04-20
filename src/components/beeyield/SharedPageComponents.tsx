import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BeeYieldPageHeader } from '@/components/beeyield/BeeYieldUI';

interface QuickActionCardProps {
    title: string;
    description?: string;
    icon: React.ElementType;
    onClick?: () => void;
    badge?: string;
    color?: 'primary' | 'green' | 'blue' | 'amber' | 'purple' | 'red';
    className?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    badge,
    color = 'primary',
    className
}) => {
    const getColorClasses = () => {
        const colors = {
            primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary',
            green: 'bg-[#1B9157] hover:bg-[#1B9157] border-[#1B9157] text-[#1B9157]',
            blue: 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 text-blue-600',
            amber: 'bg-[#F4D03F] hover:bg-[#F4D03F] border-amber-500/20 text-[#F4D03F]',
            purple: 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20 text-purple-600',
            red: 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-600'
        };
        return colors[color];
    };

    return (
        <Card
            className={cn(
                "relative overflow-hidden border cursor-pointer transition-all duration-300 hover:shadow-lg group",
                getColorClasses(),
                className
            )}
            onClick={onClick}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                    </div>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-muted-foreground/90">
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
};

// Backwards-compatible re-export: prefer BeeYieldPageHeader for new code.
// Keeping the name PageHeader avoids breaking existing imports.
export const PageHeader = BeeYieldPageHeader;

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ElementType;
    color?: 'primary' | 'green' | 'blue' | 'amber' | 'purple' | 'red';
    subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    trend,
    icon: Icon,
    color = 'primary',
    subtitle
}) => {
    const getColorClasses = () => {
        const colors = {
            primary: 'border-l-primary bg-primary/5',
            green: 'border-l-green-500 bg-[#1B9157]',
            blue: 'border-l-blue-500 bg-blue-500/5',
            amber: 'border-l-amber-500 bg-[#F4D03F]',
            purple: 'border-l-purple-500 bg-purple-500/5',
            red: 'border-l-red-500 bg-red-500/5'
        };
        return colors[color];
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-[#1B9157]';
        if (trend === 'down') return 'text-red-600';
        return 'text-muted-foreground/90';
    };

    return (
        <Card className={cn("border-l-4 p-6", getColorClasses())}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider mb-2">
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-foreground">
                            {value}
                        </p>
                        {change !== undefined && (
                            <span className={cn("text-sm font-semibold", getTrendColor())}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground/90" />
                    </div>
                )}
            </div>
        </Card>
    );
};

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => {
    return (
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-muted-foreground/90">
                        {subtitle}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
};

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-16 h-16 bg-[#F4D03F]/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>
            <p className="text-muted-foreground/90 max-w-sm mb-6">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};

