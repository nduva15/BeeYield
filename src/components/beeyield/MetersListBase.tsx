import React from 'react';
import { Activity, Building2, Download, Loader2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { meterService, Apartment, Building, Meter } from '@/services/meterService';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

interface MetersListBaseProps {
    meterType: 'Water' | 'Heat' | 'Energy' | 'Other';
    title: string;
    onTabChange: (tab: string) => void;
}

const MetersListBase: React.FC<MetersListBaseProps> = ({ meterType, title }) => {
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [apartments, setApartments] = React.useState<Apartment[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [buildingFilter, setBuildingFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [form, setForm] = React.useState({
        meter_number: '',
        building_id: '',
        apartment_id: 'none',
    });
    const [saving, setSaving] = React.useState(false);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [buildingRows, apartmentRows, meterRows] = await Promise.all([
                meterService.getBuildings(),
                meterService.getApartments(),
                meterService.getMeters({ meter_type: meterType }),
            ]);
            setBuildings(buildingRows);
            setApartments(apartmentRows);
            setMeters(meterRows);
            setForm((current) => ({
                ...current,
                building_id: current.building_id || buildingRows[0]?.id || '',
            }));
        } catch (error) {
            console.error(error);
            setError(`Unable to load ${title.toLowerCase()} meters from the backend.`);
        } finally {
            setLoading(false);
        }
    }, [meterType, title]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredMeters = meters.filter((meter) => {
        if (buildingFilter !== 'all' && meter.building_id !== buildingFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (
                meter.meter_number.toLowerCase().includes(q) ||
                meter.meter_code?.toLowerCase().includes(q) ||
                buildings.find((building) => building.id === meter.building_id)?.name.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const handleCreateMeter = async () => {
        if (!form.meter_number.trim() || !form.building_id) {
            toast.error('Meter number and location are required');
            return;
        }

        setSaving(true);
        const toastId = toast.loading('Saving meter...');
        try {
            await meterService.createMeter({
                meter_number: form.meter_number.trim(),
                building_id: form.building_id,
                apartment_id: form.apartment_id === 'none' ? undefined : form.apartment_id,
                meter_type: meterType,
                status: 'OK',
            });
            setForm((current) => ({ ...current, meter_number: '', apartment_id: 'none' }));
            await loadData();
            toast.success('Meter saved', { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Could not save meter', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const exportMeters = () => {
        if (filteredMeters.length === 0) {
            toast.info('No meters to export');
            return;
        }

        const rows = filteredMeters.map((meter) => ({
            meter_number: meter.meter_number,
            meter_code: meter.meter_code || '',
            meter_type: meter.meter_type,
            building: buildings.find((building) => building.id === meter.building_id)?.name || meter.building_id,
            apartment: apartments.find((apartment) => apartment.id === meter.apartment_id)?.unit_number || '',
            status: meter.status,
            last_reading_value: meter.last_reading_value ?? '',
            last_reading_unit: meter.last_reading_unit ?? '',
            last_reading_at: meter.last_reading_at ?? '',
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Meters');
        XLSX.writeFile(workbook, `beeyield-${meterType.toLowerCase()}-meters.xlsx`);
        toast.success('Meter list exported');
    };

    const availableApartments = apartments.filter((apartment) => apartment.building_id === form.building_id);

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <div className="space-y-6 pb-20 p-4 md:p-6">
                <BeeYieldPageHeader
                    icon={Activity}
                    label="Live registry"
                    title={<>Meter <span className="text-[#F4D03F]">List</span> · {title}</>}
                    subtitle="Live building, unit, and device records served from the backend."
                    actions={
                        <div className="flex gap-3">
                            <Button className={glass.btnSecondary} onClick={exportMeters}>
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                            <Button className={glass.btnPrimary} onClick={loadData}>
                                Refresh
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
                    <div className={cn(glass.card, 'p-6 bg-white/40 border-white/20 space-y-4')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={glass.input}
                                placeholder="Search meter number or site"
                            />
                            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All sites</SelectItem>
                                    {buildings.map((building) => (
                                        <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                        ) : error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-600">{error}</div>
                        ) : filteredMeters.length === 0 ? (
                            <div className="rounded-xl border border-white/40 bg-white/40 px-4 py-8 text-sm text-gray-500">No meters found for this view.</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredMeters.map((meter) => (
                                    <div key={meter.id} className="rounded-2xl border border-white/40 bg-white/40 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-[#1A1A1A]">{meter.meter_number}</div>
                                            <div className="text-[9px] font-bold text-gray-500">
                                                {buildings.find((building) => building.id === meter.building_id)?.name || meter.building_id}
                                                {' · '}
                                                {apartments.find((apartment) => apartment.id === meter.apartment_id)?.unit_number || 'No unit'}
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="text-[10px] font-black text-[#1A1A1A]">{meter.status}</div>
                                            <div className="text-[9px] font-bold text-gray-500">
                                                {meter.last_reading_value ?? '—'} {meter.last_reading_unit ?? ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-6 bg-white/40 border-white/20 space-y-4')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                                <Building2 className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-[#1A1A1A]">Register meter</h3>
                                <p className="text-[9px] font-bold text-gray-500">Create a new meter record for this category.</p>
                            </div>
                        </div>

                        <Input
                            value={form.meter_number}
                            onChange={(e) => setForm((current) => ({ ...current, meter_number: e.target.value }))}
                            className={glass.input}
                            placeholder="Meter number"
                        />

                        <Select value={form.building_id} onValueChange={(value) => setForm((current) => ({ ...current, building_id: value, apartment_id: 'none' }))}>
                            <SelectTrigger className={glass.input}>
                                <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                            <SelectContent>
                                {buildings.map((building) => (
                                    <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={form.apartment_id} onValueChange={(value) => setForm((current) => ({ ...current, apartment_id: value }))}>
                            <SelectTrigger className={glass.input}>
                                <SelectValue placeholder="Optional unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No unit</SelectItem>
                                {availableApartments.map((apartment) => (
                                    <SelectItem key={apartment.id} value={apartment.id}>{apartment.unit_number}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button className={glass.btnPrimary} onClick={handleCreateMeter} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Save meter
                        </Button>
                    </div>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default MetersListBase;
