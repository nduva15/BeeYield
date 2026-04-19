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
            return 'border-[#F4D03F]/30 bg-[#F4D03F]/10 text-[#8a6a00]';
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
        <div className="rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#064e3b]/45">{label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-[#064e3b]">{value}</p>
                    {detail && <p className="mt-1 text-xs font-semibold text-[#064e3b]/55">{detail}</p>}
                </div>
                <div className={cn('rounded-2xl p-3 text-[#064e3b]', accent || 'bg-white/70')}>{icon}</div>
            </div>
            <div className="mt-4">
                <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]', sourceTone(source))}>
                    {sourceLabel(source)}
                </span>
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
            <div className={cn(glass.card, 'p-5', className)}>
                <div className="space-y-4">
                    <div className="h-5 w-44 rounded-full bg-[#F4D03F]/20 animate-pulse" />
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-28 rounded-[24px] bg-[#F4D03F]/15 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(glass.card, 'overflow-hidden border-[#064e3b]/10 bg-[#FFF9F0] p-5', className)}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">{title}</p>
                        <div className="mt-2 flex flex-wrap items-end gap-3">
                            <p className="text-5xl font-black tracking-tight text-[#064e3b]">{formatTemperature(current?.temperature_c)}</p>
                            <div className="pb-1">
                                <p className="text-sm font-black text-[#064e3b]">{current?.condition || 'Condition unavailable'}</p>
                                <p className="text-xs font-semibold text-[#064e3b]/55">
                                    Observed {formatTime(current?.last_observed_at)} | {deviceCount} linked device{deviceCount === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[26px] border border-[#064e3b]/10 bg-[#F7F1E4] px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Hourly outlook</p>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                            {hourlyCards.map((point, index) => (
                                <div
                                    key={`${point?.timestamp || 'hour'}-${index}`}
                                    className="min-w-[74px] rounded-2xl border border-[#064e3b]/10 bg-white/70 px-3 py-2 text-center"
                                >
                                    <p className="text-[11px] font-black text-[#064e3b]/55">{formatHour(point?.timestamp)}</p>
                                    <p className="mt-1 text-xl font-black text-[#064e3b]">{formatTemperature(point?.temperature_c)}</p>
                                    <p className="mt-1 text-[11px] font-semibold text-[#064e3b]/55">{point?.condition || 'No data'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={<Droplets className="h-5 w-5" />}
                        label="Humidity"
                        value={`${formatNumber(current?.humidity_pct)}%`}
                        detail="Relative humidity"
                        source={sourceMeta.humidity_pct}
                        accent="bg-[#0ea5e9]/10 text-[#0284c7]"
                    />
                    <MetricCard
                        icon={<Gauge className="h-5 w-5" />}
                        label="Pressure"
                        value={formatNumber(current?.pressure_hpa)}
                        detail="mbar"
                        source={sourceMeta.pressure_hpa}
                        accent="bg-[#38bdf8]/10 text-[#0f766e]"
                    />
                    <MetricCard
                        icon={<Wind className="h-5 w-5" />}
                        label="Wind"
                        value={`${formatNumber(current?.wind_speed_kmh, 1)} km/h`}
                        detail={current?.wind_direction || 'Direction pending'}
                        source={sourceMeta.wind_speed_kmh}
                        accent="bg-[#14b8a6]/10 text-[#0f766e]"
                    />
                    <MetricCard
                        icon={<Thermometer className="h-5 w-5" />}
                        label="Feels like"
                        value={formatTemperature(current?.feels_like_c)}
                        detail="Ambient perception"
                        source={sourceMeta.feels_like_c}
                        accent="bg-[#fb923c]/10 text-[#ea580c]"
                    />
                    <MetricCard
                        icon={<Sunrise className="h-5 w-5" />}
                        label="Sunrise"
                        value={formatTime(current?.sunrise_at)}
                        detail={`Sunset ${formatTime(current?.sunset_at)}`}
                        source={sourceMeta.sunrise_at}
                        accent="bg-[#fbbf24]/10 text-[#d97706]"
                    />
                    <MetricCard
                        icon={<CloudSun className="h-5 w-5" />}
                        label="Cloud cover"
                        value={`${formatNumber(current?.cloud_cover_pct)}%`}
                        detail={current?.condition || 'Sky conditions'}
                        source={sourceMeta.cloud_cover_pct}
                        accent="bg-[#cbd5e1]/40 text-[#475569]"
                    />
                    <MetricCard
                        icon={<Zap className="h-5 w-5" />}
                        label="UV index"
                        value={formatNumber(current?.uv_index, 1)}
                        detail="Solar intensity"
                        source={sourceMeta.uv_index}
                        accent="bg-[#facc15]/15 text-[#a16207]"
                    />
                    <MetricCard
                        icon={<Leaf className="h-5 w-5" />}
                        label="AQI"
                        value={formatNumber(current?.aqi)}
                        detail="Air quality index"
                        source={sourceMeta.aqi}
                        accent="bg-[#86efac]/20 text-[#15803d]"
                    />
                </div>

                {!compact && (
                    <div className="rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4">
                        <div className="flex items-center gap-2 text-[#064e3b]">
                            <Activity className="h-4 w-4" />
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Telemetry coverage</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(summary?.linked_device_meta || []).length > 0 ? (
                                summary?.linked_device_meta?.map((device) => (
                                    <span
                                        key={device.device_id}
                                        className="inline-flex rounded-full border border-[#064e3b]/10 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#064e3b]"
                                    >
                                        {device.device_name} | {device.status || 'unknown'}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm font-semibold text-[#064e3b]/55">No linked devices reported yet.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherTelemetryPanel;
