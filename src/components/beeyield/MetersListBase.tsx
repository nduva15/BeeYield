import React from 'react';
import { Activity, AlertTriangle, Building2, Download, Edit3, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { meterService, Apartment, Building, Meter } from '@/services/meterService';
import { BeeYieldEmptyState, BeeYieldFormField, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlassConfirmModal, GlassStatCard, glass } from './GlassTheme';

interface MetersListBaseProps {
    meterType: 'Water' | 'Heat' | 'Energy' | 'Other';
    title: string;
    onTabChange: (tab: string) => void;
}

type MeterFormState = {
    meter_number: string;
    meter_code: string;
    building_id: string;
    apartment_id: string;
    status: string;
};

function createEmptyForm(buildingId?: string): MeterFormState {
    return {
        meter_number: '',
        meter_code: '',
        building_id: buildingId || '',
        apartment_id: 'none',
        status: 'OK',
    };
}

const MetersListBase: React.FC<MetersListBaseProps> = ({ meterType, title }) => {
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [apartments, setApartments] = React.useState<Apartment[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [buildingFilter, setBuildingFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [editingMeterId, setEditingMeterId] = React.useState<string | null>(null);
    const [meterToDelete, setMeterToDelete] = React.useState<Meter | null>(null);
    const [form, setForm] = React.useState<MeterFormState>(createEmptyForm());
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
        } catch (loadError) {
            console.error(loadError);
            setError(`Unable to load ${title.toLowerCase()} meters from the backend.`);
        } finally {
            setLoading(false);
        }
    }, [meterType, title]);

    React.useEffect(() => {
        void loadData();
    }, [loadData]);

    const stats = React.useMemo(() => ({
        total: meters.length,
        active: meters.filter((meter) => String(meter.status || '').toUpperCase() === 'OK').length,
        alarms: meters.filter((meter) => meter.has_alarm).length,
        sites: new Set(meters.map((meter) => meter.building_id)).size,
    }), [meters]);

    const filteredMeters = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return meters.filter((meter) => {
            if (buildingFilter !== 'all' && meter.building_id !== buildingFilter) return false;
            if (!query) return true;
            const buildingName = buildings.find((building) => building.id === meter.building_id)?.name || '';
            return (
                meter.meter_number.toLowerCase().includes(query) ||
                (meter.meter_code || '').toLowerCase().includes(query) ||
                buildingName.toLowerCase().includes(query)
            );
        });
    }, [meters, buildingFilter, search, buildings]);

    const availableApartments = React.useMemo(
        () => apartments.filter((apartment) => apartment.building_id === form.building_id),
        [apartments, form.building_id]
    );

    const selectedMeter = React.useMemo(
        () => meters.find((meter) => meter.id === editingMeterId) || null,
        [meters, editingMeterId]
    );

    const resetForm = React.useCallback(() => {
        setEditingMeterId(null);
        setForm(createEmptyForm(buildings[0]?.id));
    }, [buildings]);

    const startEditing = (meter: Meter) => {
        setEditingMeterId(meter.id);
        setForm({
            meter_number: meter.meter_number,
            meter_code: meter.meter_code || '',
            building_id: meter.building_id,
            apartment_id: meter.apartment_id || 'none',
            status: meter.status || 'OK',
        });
    };

    const handleSaveMeter = async () => {
        if (!form.meter_number.trim() || !form.building_id) {
            toast.error('Meter number and site are required');
            return;
        }

        setSaving(true);
        const toastId = toast.loading(editingMeterId ? 'Updating meter...' : 'Saving meter...');
        try {
            if (editingMeterId) {
                await meterService.updateMeter(editingMeterId, {
                    meter_number: form.meter_number.trim(),
                    meter_code: form.meter_code.trim() || null,
                    building_id: form.building_id,
                    apartment_id: form.apartment_id === 'none' ? null : form.apartment_id,
                    status: form.status,
                });
                toast.success('Meter updated', { id: toastId });
            } else {
                await meterService.createMeter({
                    meter_number: form.meter_number.trim(),
                    building_id: form.building_id,
                    apartment_id: form.apartment_id === 'none' ? undefined : form.apartment_id,
                    meter_type: meterType,
                    status: form.status || 'OK',
                });
                toast.success('Meter saved', { id: toastId });
            }
            resetForm();
            await loadData();
        } catch (saveError: any) {
            console.error(saveError);
            toast.error(saveError?.message || 'Could not save meter', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMeter = async () => {
        if (!meterToDelete) return;
        const toastId = toast.loading('Deleting meter...');
        try {
            await meterService.deleteMeter(meterToDelete.id);
            if (editingMeterId === meterToDelete.id) {
                resetForm();
            }
            setMeterToDelete(null);
            await loadData();
            toast.success('Meter deleted', { id: toastId });
        } catch (deleteError: any) {
            console.error(deleteError);
            toast.error(deleteError?.message || 'Could not delete meter', { id: toastId });
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
            has_alarm: meter.has_alarm ? 'Yes' : 'No',
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

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <div className="space-y-6 pb-20 p-4 md:p-6">
                <BeeYieldPageHeader
                    icon={Activity}
                    label="Live registry"
                    title={<>Meter <span className="text-[#F4D03F]">List</span> · {title}</>}
                    subtitle="Create, inspect, update, and delete live meter records with the same compact dashboard treatment used on home."
                    onRefresh={() => { void loadData(); }}
                    actions={
                        <div className="flex gap-3">
                            <Button className={glass.btnSecondary} onClick={exportMeters}>
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                            <Button className={glass.btnPrimary} onClick={resetForm}>
                                <Plus className="w-4 h-4" />
                                New meter
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <GlassStatCard label="Total meters" value={stats.total} icon={Activity} />
                    <GlassStatCard label="Healthy" value={stats.active} icon={Save} />
                    <GlassStatCard label="Alarms" value={stats.alarms} icon={AlertTriangle} />
                    <GlassStatCard label="Sites" value={stats.sites} icon={Building2} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className={cn(glass.card, 'p-6 bg-white/40 border-white/20 space-y-4')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
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
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                            </div>
                        ) : error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-600">{error}</div>
                        ) : filteredMeters.length === 0 ? (
                            <BeeYieldEmptyState
                                icon={Activity}
                                title={`No ${title.toLowerCase()} meters found`}
                                description="Create the first meter record and it will appear here with full backend CRUD actions."
                                action={{ label: 'Create meter', onClick: resetForm }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {filteredMeters.map((meter) => {
                                    const building = buildings.find((item) => item.id === meter.building_id);
                                    const apartment = apartments.find((item) => item.id === meter.apartment_id);
                                    return (
                                        <div key={meter.id} className="rounded-2xl border border-white/40 bg-white/60 px-4 py-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold text-[#1A1A1A]">{meter.meter_number}</div>
                                                    <div className="text-[11px] font-semibold text-gray-500">
                                                        {building?.name || meter.building_id}
                                                        {apartment ? ` / ${apartment.unit_number}` : ' / No unit'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        Code: {meter.meter_code || 'Not set'}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:items-end gap-2">
                                                    <div className="text-[10px] font-black text-[#1A1A1A]">{meter.status}</div>
                                                    <div className="text-[10px] text-gray-500">
                                                        {meter.last_reading_value ?? '-'} {meter.last_reading_unit ?? ''}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button className={glass.btnSecondary} onClick={() => startEditing(meter)}>
                                                            <Edit3 className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button className={glass.btnSecondary} onClick={() => setMeterToDelete(meter)}>
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-6 bg-white/40 border-white/20 space-y-4')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                                <Building2 className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-[#1A1A1A]">
                                    {selectedMeter ? 'Update meter' : 'Register meter'}
                                </h3>
                                <p className="text-[9px] font-bold text-gray-500">
                                    {selectedMeter ? 'Edit the live backend record.' : 'Create a new meter record for this category.'}
                                </p>
                            </div>
                        </div>

                        <BeeYieldFormField id={`meter-number-${meterType}`} label="Meter number">
                            <Input
                                id={`meter-number-${meterType}`}
                                value={form.meter_number}
                                onChange={(event) => setForm((current) => ({ ...current, meter_number: event.target.value }))}
                                className={glass.input}
                                placeholder="Meter number"
                            />
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-code-${meterType}`} label="Meter code">
                            <Input
                                id={`meter-code-${meterType}`}
                                value={form.meter_code}
                                onChange={(event) => setForm((current) => ({ ...current, meter_code: event.target.value }))}
                                className={glass.input}
                                placeholder="Optional external code"
                            />
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-site-${meterType}`} label="Site">
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
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-unit-${meterType}`} label="Unit">
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
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-status-${meterType}`} label="Status">
                            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OK">OK</SelectItem>
                                    <SelectItem value="Offline">Offline</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Alert">Alert</SelectItem>
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        <div className="flex gap-2">
                            <Button className={glass.btnPrimary} onClick={() => { void handleSaveMeter(); }} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedMeter ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {selectedMeter ? 'Save changes' : 'Save meter'}
                            </Button>
                            {selectedMeter && (
                                <Button className={glass.btnSecondary} onClick={resetForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <GlassConfirmModal
                isOpen={!!meterToDelete}
                onClose={() => setMeterToDelete(null)}
                onConfirm={() => { void handleDeleteMeter(); }}
                title="Delete meter"
                message="This permanently removes the selected meter record from the backend."
                confirmLabel="Delete"
            />
        </BeeYieldPageShell>
    );
};

export default MetersListBase;
