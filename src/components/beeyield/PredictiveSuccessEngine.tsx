import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { format, parseISO, subDays } from 'date-fns';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useApiaries } from '@/hooks/useApiaries';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import beeyieldService from '@/services/beeyieldService';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

type ManualPoint = {
    lat: number;
    lng: number;
};

const PRIMARY_BUTTON =
    'inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f7a45] px-5 text-sm font-semibold text-white transition hover:bg-[#256339] disabled:cursor-not-allowed disabled:opacity-60';
const SECONDARY_CHIP =
    'rounded-full border border-[#d8dfef] bg-white px-4 py-2 text-sm font-medium text-[#51607f] transition hover:border-[#9db3ea] hover:text-[#1b2b4b]';

const DEFAULT_CENTER: [number, number] = [-2.4187, 37.9686];
const VEGETATION_OPTIONS = ['NDVI', 'EVI', 'SAVI'];
const CROP_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'acacia', label: 'Acacia' },
    { value: 'avocado', label: 'Avocado' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'citrus', label: 'Citrus' },
    { value: 'macadamia', label: 'Macadamia' },
    { value: 'sunflower', label: 'Sunflower' },
    { value: 'wildflower', label: 'Wildflower' },
];

function formatNumber(value: number | null | undefined, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits > 0 ? Math.min(digits, 1) : 0,
    }).format(value);
}

function clampCoordinate(value: string, min: number, max: number) {
    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < min || parsed > max) return null;
    return parsed;
}

function ViewportSync({ center }: { center: [number, number] }) {
    const map = useMap();

    React.useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

function MapClickCapture({ onPick }: { onPick: (point: ManualPoint) => void }) {
    useMapEvents({
        click(event) {
            onPick({
                lat: Number(event.latlng.lat.toFixed(6)),
                lng: Number(event.latlng.lng.toFixed(6)),
            });
        },
    });

    return null;
}

function StepPanel({
    step,
    title,
    subtitle,
    active,
    children,
}: {
    step: number;
    title: string;
    subtitle: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <section
            className={cn(
                'rounded-[28px] border bg-white p-5 shadow-[0_20px_60px_rgba(38,64,111,0.08)] transition',
                active ? 'border-[#a8c2ff]' : 'border-[#edf1f8]'
            )}
        >
            <div className="mb-5 flex items-start gap-4">
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold',
                        active ? 'bg-[#eaf1ff] text-[#4f72d8]' : 'bg-[#f2f5fb] text-[#a3afc6]'
                    )}
                >
                    {step}
                </div>
                <div className="space-y-1">
                    <h2 className={cn('text-[1.15rem] font-semibold', active ? 'text-[#16274b]' : 'text-[#75839d]')}>{title}</h2>
                    <p className={cn('text-sm', active ? 'text-[#54627f]' : 'text-[#b1bacb]')}>{subtitle}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function MetricCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="rounded-3xl border border-[#ebeff7] bg-white p-4 shadow-[0_10px_30px_rgba(31,51,89,0.05)]">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#93a0b8]">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-[#132240]">{value}</div>
            <div className="mt-1 text-sm text-[#63718b]">{detail}</div>
        </div>
    );
}

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = () => {
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const today = React.useMemo(() => new Date(), []);
    const todayIso = React.useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
    const defaultDateFrom = React.useMemo(() => format(subDays(today, 90), 'yyyy-MM-dd'), [today]);

    const [search, setSearch] = React.useState('');
    const [locationMode, setLocationMode] = React.useState<'manual' | 'apiary'>('manual');
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [manualLat, setManualLat] = React.useState('');
    const [manualLng, setManualLng] = React.useState('');
    const [appliedLocation, setAppliedLocation] = React.useState<{
        apiaryId?: string;
        label: string;
        lat: number;
        lng: number;
    } | null>(null);

    const [dateFrom, setDateFrom] = React.useState(defaultDateFrom);
    const [dateTo, setDateTo] = React.useState(todayIso);
    const [radiusM, setRadiusM] = React.useState('2000');
    const [vegetationIndex, setVegetationIndex] = React.useState('NDVI');
    const [cropProfile, setCropProfile] = React.useState('general');
    const [beeActivity, setBeeActivity] = React.useState('');
