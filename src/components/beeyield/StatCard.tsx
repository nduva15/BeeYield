import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    iconColor?: string;
    color?: string; // Legacy support
    label?: string; // Legacy support
    subtitle?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    trend,
    trendType = 'neutral',
    icon: Icon,
    iconColor,
    color,
    label,
    subtitle,
    className
}) => {
    // Handle legacy props
    const displayTitle = title || label;
    // Update default colors for forest theme
    const defaultIconColor = color === 'primary' ? '#1B4332' : color === 'green' ? '#2D6A4F' : '#E67A2E';
    const finalIconColor = iconColor || defaultIconColor;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className={cn("h-full", className)}
        >
            <Card className="h-full border border-[#E0E0E0] bg-white shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all duration-500">
                <CardContent className="p-7 relative z-10 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className={cn(
                            "p-3.5 rounded-2xl flex items-center justify-center transition-all duration-500",
                            "bg-beeyield-forest/5 border border-beeyield-forest/10 group-hover:bg-beeyield-forest group-hover:text-white"
                        )}>
                            <Icon
                                className="w-5 h-5 stroke-[2] transition-colors duration-500 group-hover:text-white"
                                style={{ color: finalIconColor }}
                            />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                trendType === 'positive' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    trendType === 'negative' ? "bg-red-50 text-red-600 border-red-100" :
                                        "bg-gray-50 text-gray-500 border-gray-100"
                            )}>
                                {trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
                                {trendType === 'negative' && <TrendingDown className="w-3 h-3" />}
                                {trendType === 'neutral' && <Minus className="w-3 h-3" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-3xl font-bold text-beeyield-charcoal tracking-tight mb-1">
                            {value}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            {displayTitle}
                        </p>
                        {subtitle && <p className="text-[10px] text-gray-400 mt-2 font-medium">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StatCard;
