import React from 'react';
import { CloudSun, Droplets, Gauge, Sunrise, Sunset, Wind, Thermometer, SunMedium, Leaf, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import type { ApiaryWeatherSummary } from '@/services/beeyieldService';

interface WeatherTelemetryPanelProps {
    summary?: ApiaryWeatherSummary | null;
    isLoading?: boolean;
    compact?: boolean;
    title?: string;
    className?: string;
}

function formatValue(value: number | string | null | undefined, suffix = '', digits = 0) {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
        return `${value.toFixed(digits)}${suffix}`;
    }
    return `${value}${suffix}`;
}

function formatTime(value?: string | null) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return format(date, 'HH:mm');
}

function WeatherMetricCard({
    label,
    value,
    hint,
    icon: Icon,
    accent,
    compact,
}: {
    label: string;
    value: string;
    hint?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    compact?: boolean;
}) {
    return (
        <div className={cn(glass.card, 'relative overflow-hidden border-white/50 bg-white/50 p-4 shadow-sm', compact && 'p-3')}>
            <div className="absolute inset-x-0 top-0 h-1 opacity-80" style={{ background: accent }} />
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    <div className={cn('font-black tracking-tight text-[#1A1A1A]', compact ? 'text-xl' : 'text-3xl')}>
                        {value}
                    </div>
                    {hint ? <div className="text-[10px] font-semibold text-slate-500">{hint}</div> : null}
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/70 p-2 shadow-sm">
                    <Icon className="h-5 w-5 text-[#1A1A1A]" />
                </div>
            </div>
        </div>
    );
}

export default function WeatherTelemetryPanel({
    summary,
    isLoading,
    compact = false,
    title = 'Weather & telemetry',
    className,
}: WeatherTelemetryPanelProps) {
    const current = summary?.current;
    const hourly = summary?.hourly_forecast || [];
    const cards = [
        {
            label: 'Temperature',
            value: formatValue(current?.temperature_c, '°', 1),
            hint: current?.condition || 'Current conditions',
            icon: CloudSun,
            accent: 'linear-gradient(90deg, #F4D03F 0%, #FDBA74 100%)',
        },
        {
            label: 'Humidity',
            value: formatValue(current?.humidity_pct, '%', 0),
            hint: 'Relative humidity',
            icon: Droplets,
            accent: 'linear-gradient(90deg, #38BDF8 0%, #2563EB 100%)',
        },
        {
            label: 'Pressure',
            value: formatValue(current?.pressure_hpa, ' hPa', 0),
            hint: 'Barometric pressure',
            icon: Gauge,
            accent: 'linear-gradient(90deg, #60A5FA 0%, #0284C7 100%)',
        },
        {
            label: 'Wind',
            value: current?.wind_speed_kmh != null ? `${formatValue(current.wind_speed_kmh, ' km/h', 1)}${current.wind_direction ? ` ${current.wind_direction}` : ''}` : 'N/A',
            hint: 'Live airflow',
            icon: Wind,
            accent: 'linear-gradient(90deg, #94A3B8 0%, #64748B 100%)',
        },
        {
            label: 'Feels like',
            value: formatValue(current?.feels_like_c, '°', 1),
            hint: 'Apparent temperature',
            icon: Thermometer,
            accent: 'linear-gradient(90deg, #FB7185 0%, #F59E0B 100%)',
        },
        {
            label: 'UV index',
            value: formatValue(current?.uv_index, '', 1),
            hint: 'Solar intensity',
            icon: SunMedium,
            accent: 'linear-gradient(90deg, #FDE047 0%, #F59E0B 100%)',
        },
        {
            label: 'AQI',
            value: formatValue(current?.aqi, '', 0),
            hint: 'Air quality',
            icon: Leaf,
            accent: 'linear-gradient(90deg, #4ADE80 0%, #16A34A 100%)',
        },
        {
            label: 'Sun cycle',
            value: `${formatTime(current?.sunrise_at)} / ${formatTime(current?.sunset_at)}`,
            hint: 'Sunrise / sunset',
            icon: Activity,
            accent: 'linear-gradient(90deg, #FBBF24 0%, #F97316 100%)',
        },
    ];

    return (
        <div className={cn('space-y-4', className)}>
            <div className={cn(glass.section, 'overflow-hidden border-white/60 bg-white/55 shadow-xl')}>
                <div className="border-b border-[#F4D03F]/15 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">{title}</h3>
                            <p className="text-[10px] font-semibold text-slate-500">
                                {summary?.apiary_name || 'Selected apiary'}
                            </p>
                        </div>
                        <div className="rounded-full border border-[#F4D03F]/20 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                            {isLoading ? 'Syncing' : (current?.last_observed_at ? `Updated ${formatTime(current.last_observed_at)}` : 'Live weather')}
                        </div>
                    </div>
                </div>

                <div className="border-b border-[#F4D03F]/10 bg-[#FFF9F0]/80 px-3 py-4">
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-6 xl:grid-cols-12">
                        {(hourly.length ? hourly.slice(0, compact ? 6 : 12) : new Array(compact ? 6 : 12).fill(null)).map((point, index) => (
                            <div key={point?.time || `placeholder-${index}`} className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-center shadow-sm">
                                <div className="text-[10px] font-black text-slate-400">
                                    {point?.time ? format(new Date(point.time), 'HH:mm') : '--:--'}
                                </div>
                                <div className="mt-2 text-lg font-black tracking-tight text-[#1A1A1A]">
                                    {point ? formatValue(point.temperature_c, '°', 0) : 'N/A'}
                                </div>
                                <div className="mt-1 text-[10px] font-semibold text-slate-500">
                                    {point?.condition || 'Unavailable'}
                                </div>
                                <div className="mt-2 text-[10px] font-bold text-slate-400">
                                    {point ? formatValue(point.wind_speed_kmh, ' km/h', 0) : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cn('grid gap-4 p-4', compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4')}>
                    {cards.map((card) => (
                        <WeatherMetricCard
                            key={card.label}
                            label={card.label}
                            value={isLoading ? '...' : card.value}
                            hint={card.hint}
                            icon={card.icon}
                            accent={card.accent}
                            compact={compact}
                        />
                    ))}
                </div>

                {!summary && !isLoading ? (
                    <div className="px-5 pb-5 text-[11px] font-semibold text-slate-500">
                        No real weather data is available for this apiary yet. Connect a linked device or confirm apiary coordinates to enable the live cards.
                    </div>
                ) : null}
            </div>

            {current?.sunrise_at || current?.sunset_at ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className={cn(glass.card, 'flex items-center gap-4 border-white/50 bg-white/55 p-4 shadow-sm')}>
                        <div className="rounded-2xl border border-white/60 bg-white/80 p-3">
                            <Sunrise className="h-5 w-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sunrise</div>
                            <div className="text-2xl font-black tracking-tight text-[#1A1A1A]">{formatTime(current.sunrise_at)}</div>
                        </div>
                    </div>
                    <div className={cn(glass.card, 'flex items-center gap-4 border-white/50 bg-white/55 p-4 shadow-sm')}>
                        <div className="rounded-2xl border border-white/60 bg-white/80 p-3">
                            <Sunset className="h-5 w-5 text-[#F97316]" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sunset</div>
                            <div className="text-2xl font-black tracking-tight text-[#1A1A1A]">{formatTime(current.sunset_at)}</div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
