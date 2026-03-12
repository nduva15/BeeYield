import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Share2, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    badge?: {
        text: string;
        variant?: 'default' | 'success' | 'warning' | 'error';
    };
    actions?: React.ReactNode;
    onBack?: () => void;
    onRefresh?: () => void;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    badge,
    actions,
    onBack,
    onRefresh,
    className
}) => {
    const getBadgeColor = (variant?: string) => {
        switch (variant) {
            case 'success':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'warning':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'error':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onBack}
                                className="h-8 w-8 rounded-full"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {title}
                                </h1>
                                {badge && (
                                    <Badge className={cn("text-xs font-semibold", getBadgeColor(badge.variant))}>
                                        {badge.text}
                                    </Badge>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-gray-600 mt-1 font-medium">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    )}
                    {actions}
                </div>
            </div>
        </div>
    );
};

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
            green: 'bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-600',
            blue: 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 text-blue-600',
            amber: 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-600',
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
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                    </div>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-600">
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
};

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
            green: 'border-l-green-500 bg-green-500/5',
            blue: 'border-l-blue-500 bg-blue-500/5',
            amber: 'border-l-amber-500 bg-amber-500/5',
            purple: 'border-l-purple-500 bg-purple-500/5',
            red: 'border-l-red-500 bg-red-500/5'
        };
        return colors[color];
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <Card className={cn("border-l-4 p-6", getColorClasses())}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900">
                            {value}
                        </p>
                        {change !== undefined && (
                            <span className={cn("text-sm font-semibold", getTrendColor())}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
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
                <h2 className="text-xl font-bold text-gray-900">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-gray-600">
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
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 max-w-sm mb-6">
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
