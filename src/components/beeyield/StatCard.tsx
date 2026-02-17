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
    const finalIconColor = iconColor || (color === 'primary' ? '#F4D03F' : color === 'green' ? '#1B9157' : '#EF4444');

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn("h-full", className)}
        >
            <Card className="h-full border border-white/40 dark:border-white/5 bg-white/60 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-white/0 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                            "p-3 rounded-2xl flex items-center justify-center transition-all duration-300",
                            "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-110"
                        )}>
                            <Icon
                                className="w-6 h-6 stroke-[2.5]"
                                style={{ color: finalIconColor }}
                            />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                trendType === 'positive' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                    trendType === 'negative' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                        "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            )}>
                                {trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
                                {trendType === 'negative' && <TrendingDown className="w-3 h-3" />}
                                {trendType === 'neutral' && <Minus className="w-3 h-3" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-1 font-sans">
                            {value}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {displayTitle}
                        </p>
                        {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StatCard;
