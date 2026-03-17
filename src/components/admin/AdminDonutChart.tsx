import React from 'react';
import { cn } from '@/lib/utils';

interface AdminDonutChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    centerValue?: string;
    centerLabel?: string;
    className?: string;
}

const AdminDonutChart: React.FC<AdminDonutChartProps> = ({
    data,
    centerValue,
    centerLabel,
    className
}) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const createSegment = (startAngle: number, endAngle: number, color: string) => {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    const segments = data.reduce<{ segments: Array<{ path: string; color: string }>; angle: number }>(
        (acc, item) => {
            const segmentAngle = total > 0 ? (item.value / total) * 360 : 0;
            const nextAngle = acc.angle + segmentAngle;
            acc.segments.push({
                path: createSegment(acc.angle, nextAngle, item.color),
                color: item.color,
            });
            acc.angle = nextAngle;
            return acc;
        },
        { segments: [], angle: 0 }
    ).segments;

    return (
        <div className={cn("relative", className)}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {segments.map((segment, idx) => (
                    <path
                        key={idx}
                        d={segment.path}
                        fill={segment.color}
                        className="transition-all duration-300 hover:opacity-80"
                    />
                ))}
                {/* Inner circle for donut effect */}
                <circle cx="50" cy="50" r="25" className="fill-white" />
            </svg>

            {/* Center text */}
            {(centerValue || centerLabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {centerValue && (
                        <span className="text-2xl font-bold text-foreground">{centerValue}</span>
                    )}
                    {centerLabel && (
                        <span className="text-xs text-muted-foreground">{centerLabel}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDonutChart;
