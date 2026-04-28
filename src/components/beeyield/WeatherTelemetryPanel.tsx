import React from 'react';
import {
    Activity,
    CloudSun,
    Droplets,
    Gauge,
    Leaf,
    Sunrise,
    Thermometer,
    Wind,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { ApiaryWeatherSummary, WeatherMetricSource } from '@/services/beeyieldService';

const DEG = '\u00B0';

type WeatherTelemetryPanelProps = {
    summary?: ApiaryWeatherSummary | null;
    isLoading?: boolean;
    title?: string;
    compact?: boolean;
    className?: string;
};

function formatNumber(value?: number | null, digits: number = 0) {
    return typeof value === 'number' ? value.toFixed(digits) : '--';
}

function formatTemperature(value?: number | null) {
    return typeof value === 'number' ? `${Math.round(value)}${DEG}` : `--${DEG}`;
}

function formatTime(value?: string | null) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatHour(value?: string | null) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sourceTone(source?: WeatherMetricSource) {
    switch (source?.source) {
        case 'device':
            return 'border-[#10b981]/20 bg-[#10b981]/10 text-[#047857]';
        case 'provider':
            return 'border-border/ bg-[#F4D03F]/10 text-[#8a6a00]';
        default:
            return 'border-[#064e3b]/10 bg-[#064e3b]/5 text-[#064e3b]/55';
    }
}

function sourceLabel(source?: WeatherMetricSource) {
    if (source?.source === 'device') return 'Device';
    if (source?.source === 'provider') return 'Provider';
    return 'Unavailable';
}

function MetricCard(props: {
    icon: React.ReactNode;
    label: string;
    value: string;
    detail?: string;
    source?: WeatherMetricSource;
    accent?: string;
}) {
    const { icon, label, value, detail, source, accent } = props;
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 group">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className={cn(glass.microLabel, "uppercase tracking-[0.1em]")}>{label}</p>
                    <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
                    {detail && <p className="text-[10px] font-bold text-muted-foreground/70 leading-tight">{detail}</p>}
                </div>
                <div className={cn('rounded-xl p-2.5 transition-colors', accent || 'bg-muted/30 text-muted-foreground')}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider', sourceTone(source))}>
                    {sourceLabel(source)}
                </span>
                <div className="h-1 w-1 rounded-full bg-border group-hover:bg-primary/40 transition-colors" />
            </div>
        </div>
    );
}

const WeatherTelemetryPanel: React.FC<WeatherTelemetryPanelProps> = ({
    summary,
    isLoading,
    title = 'Weather telemetry',
    compact = false,
    className,
}) => {
    const current = summary?.current;
    const sourceMeta = summary?.source_meta || {};
    const deviceCount = summary?.linked_device_meta?.length || 0;
    const hourly = (summary?.hourly_forecast || []).slice(0, compact ? 6 : 8);
    const hourlyCards = hourly.length > 0 ? hourly : Array.from({ length: compact ? 6 : 8 }, () => null);

    if (isLoading) {
        return (
            <div className={cn(glass.section, className)}>
                <div className={glass.sectionHeader}>
                    <div className="flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-primary animate-pulse" />
                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(glass.section, className)}>
            <div className={glass.sectionHeader}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <CloudSun className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
                        <p className="text-[8px] font-bold text-primary">Operational Environmental Scan</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <Badge variant="outline" className="bg-muted/30 text-[9px] font-bold py-0 h-6 border-border/">
                        {deviceCount} Linked Device{deviceCount === 1 ? '' : 's'}
                    </Badge>
                </div>
            </div>

            <div className="p-5 space-y-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex items-end gap-4 shrink-0">
                        <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">
                            {formatTemperature(current?.temperature_c)}
                        </p>
                        <div className="mb-1.5 space-y-0.5">
                            <p className="text-sm font-black text-foreground tracking-tight leading-none uppercase">{current?.condition || 'Analyzing...'}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/70">
                                Observed {formatTime(current?.last_observed_at)}
                            </p>
                        </div>
                    </div>

                    <div className="grow overflow-hidden">
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                            {hourlyCards.map((point, index) => (
                                <div
                                    key={`${point?.timestamp || 'hour'}-${index}`}
                                    className="min-w-[80px] rounded-xl border border-border bg-muted/10 p-2.5 text-center transition-all hover:bg-muted/20"
                                >
                                    <p className="text-[10px] font-bold text-muted-foreground/80 uppercase">{formatHour(point?.timestamp)}</p>
                                    <p className="mt-1 text-lg font-black text-foreground tabular-nums">{formatTemperature(point?.temperature_c)}</p>
                                    <p className="mt-1 text-[9px] font-black text-primary/70 uppercase truncate">{point?.condition || '---'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-4">
                    <MetricCard
                        icon={<Droplets />}
                        label="Humidity"
                        value={`${formatNumber(current?.humidity_pct)}%`}
                        detail="Water saturation"
                        source={sourceMeta.humidity_pct}
                        accent="bg-sky-500/10 text-sky-500"
                    />
                    <MetricCard
                        icon={<Gauge />}
                        label="Pressure"
                        value={formatNumber(current?.pressure_hpa)}
                        detail="Atmospheric mbar"
                        source={sourceMeta.pressure_hpa}
                        accent="bg-teal-500/10 text-teal-500"
                    />
                    <MetricCard
                        icon={<Wind />}
                        label="Wind speed"
                        value={`${formatNumber(current?.wind_speed_kmh, 1)}`}
                        detail={`${current?.wind_direction || 'N/A'} velocity km/h`}
                        source={sourceMeta.wind_speed_kmh}
                        accent="bg-emerald-500/10 text-emerald-500"
                    />
                    <MetricCard
                        icon={<Thermometer />}
                        label="Feels like"
                        value={formatTemperature(current?.feels_like_c)}
                        detail="Relative thermal index"
                        source={sourceMeta.feels_like_c}
                        accent="bg-orange-500/10 text-orange-500"
                    />
                    <MetricCard
                        icon={<Sunrise />}
                        label="Daylight"
                        value={formatTime(current?.sunrise_at)}
                        detail={`Sunset at ${formatTime(current?.sunset_at)}`}
                        source={sourceMeta.sunrise_at}
                        accent="bg-amber-500/10 text-amber-500"
                    />
                    <MetricCard
                        icon={<CloudSun />}
                        label="Sky State"
                        value={`${formatNumber(current?.cloud_cover_pct)}%`}
                        detail="Cloud volume density"
                        source={sourceMeta.cloud_cover_pct}
                        accent="bg-slate-500/10 text-slate-500"
                    />
                    <MetricCard
                        icon={<Zap />}
                        label="UV Impact"
                        value={formatNumber(current?.uv_index, 1)}
                        detail="Solar radiation index"
                        source={sourceMeta.uv_index}
                        accent="bg-yellow-500/10 text-yellow-500"
                    />
                    <MetricCard
                        icon={<Leaf />}
                        label="Air Quality"
                        value={formatNumber(current?.aqi)}
                        detail="Environmental AQI"
                        source={sourceMeta.aqi}
                        accent="bg-green-500/10 text-green-500"
                    />
                </div>

                {!compact && (
                    <div className="rounded-xl border border-border bg-muted/10 p-4 border-dashed">
                        <div className="flex items-center gap-2 text-foreground">
                            <Activity className="h-3.5 w-3.5 text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Ground-Truth Network</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(summary?.linked_device_meta || []).length > 0 ? (
                                summary?.linked_device_meta?.map((device) => (
                                    <span
                                        key={device.device_id}
                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-[10px] font-bold text-foreground shadow-sm"
                                    >
                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", device.status?.toLowerCase() === 'active' ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                        {device.device_name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/50 italic">Edge node data pending.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherTelemetryPanel;

