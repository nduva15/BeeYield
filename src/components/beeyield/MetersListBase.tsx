import React from 'react';
import { Activity, AlertTriangle, Building2, CalendarDays, Download, Edit3, Gauge, Loader2, MapPin, Plus, Save, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { meterService, Apartment, Building, Meter } from '@/services/meterService';
import { BeeYieldEmptyState, BeeYieldFormField, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlassConfirmModal, GlassModal, GlassStatCard, glass } from './GlassTheme';

type MeterType = 'Water' | 'Heat' | 'Energy' | 'Other';

interface MetersListBaseProps {
    meterType: MeterType;
    title: string;
    onTabChange: (tab: string) => void;
}

type MeterFormState = {
    meter_number: string;
    meter_code: string;
    building_id: string;
    apartment_id: string;
    status: string;
    install_date: string;
    reading_value: string;
    reading_unit: string;
};

const METER_TABS: Array<{ id: string; label: MeterType }> = [
    { id: 'meters-water', label: 'Water' },
    { id: 'meters-heat', label: 'Heat' },
    { id: 'meters-energy', label: 'Energy' },
    { id: 'meters-other', label: 'Other' },
];

const STATUS_OPTIONS = ['OK', 'Offline', 'Maintenance', 'Alert'] as const;

const DEFAULT_READING_UNITS: Record<MeterType, string> = {
    Water: 'm3',
    Heat: 'GJ',
    Energy: 'kWh',
    Other: 'units',
};

function createEmptyForm(meterType: MeterType, buildingId?: string): MeterFormState {
    return {
        meter_number: '',
        meter_code: '',
        building_id: buildingId || '',
        apartment_id: 'none',
        status: 'OK',
        install_date: '',
        reading_value: '',
        reading_unit: DEFAULT_READING_UNITS[meterType],
    };
}

function formatMeterReading(meter: Meter) {
    if (typeof meter.last_reading_value !== 'number') {
        return 'No readings yet';
    }

    const unit = meter.last_reading_unit ? ` ${meter.last_reading_unit}` : '';
    return `${meter.last_reading_value}${unit}`;
}

function formatInstallDate(value?: string) {
    if (!value) return 'Not scheduled';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString();
}

const MetersListBase: React.FC<MetersListBaseProps> = ({ meterType, title, onTabChange }) => {
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [apartments, setApartments] = React.useState<Apartment[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [buildingFilter, setBuildingFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [editingMeterId, setEditingMeterId] = React.useState<string | null>(null);
    const [meterToDelete, setMeterToDelete] = React.useState<Meter | null>(null);
    const [form, setForm] = React.useState<MeterFormState>(createEmptyForm(meterType));
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const defaultBuildingId = buildings[0]?.id || '';

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
            const apartmentName = apartments.find((apartment) => apartment.id === meter.apartment_id)?.unit_number || '';
            return (
                meter.meter_number.toLowerCase().includes(query) ||
                (meter.meter_code || '').toLowerCase().includes(query) ||
                buildingName.toLowerCase().includes(query) ||
                apartmentName.toLowerCase().includes(query)
            );
        });
    }, [apartments, buildingFilter, buildings, meters, search]);

    const availableApartments = React.useMemo(
        () => apartments.filter((apartment) => apartment.building_id === form.building_id),
        [apartments, form.building_id]
    );

    const selectedMeter = React.useMemo(
        () => meters.find((meter) => meter.id === editingMeterId) || null,
        [meters, editingMeterId]
    );

    const resetForm = React.useCallback((buildingId?: string) => {
        setEditingMeterId(null);
        setForm(createEmptyForm(meterType, buildingId || defaultBuildingId));
    }, [defaultBuildingId, meterType]);

    const closeForm = React.useCallback(() => {
        setIsFormOpen(false);
        resetForm();
    }, [resetForm]);

    const openCreateModal = React.useCallback(() => {
        resetForm();
        setIsFormOpen(true);
    }, [resetForm]);

    const startEditing = (meter: Meter) => {
        setEditingMeterId(meter.id);
        setForm({
            meter_number: meter.meter_number,
            meter_code: meter.meter_code || '',
            building_id: meter.building_id,
            apartment_id: meter.apartment_id || 'none',
            status: meter.status || 'OK',
            install_date: meter.install_date || '',
            reading_value: '',
            reading_unit: meter.last_reading_unit || DEFAULT_READING_UNITS[meterType],
        });
        setIsFormOpen(true);
    };

    const handleSaveMeter = async () => {
        if (!form.meter_number.trim() || !form.building_id) {
            toast.error('Meter number and site are required');
            return;
        }

        const readingValue = form.reading_value.trim();
        if (readingValue && Number.isNaN(Number(readingValue))) {
            toast.error('Reading value must be a valid number');
            return;
        }

        if (readingValue && !form.reading_unit.trim()) {
            toast.error('Reading unit is required when adding a reading');
            return;
        }

        setSaving(true);
        const toastId = toast.loading(editingMeterId ? 'Updating meter...' : 'Saving meter...');
        try {
            const payload = {
                meter_number: form.meter_number.trim(),
                meter_code: form.meter_code.trim() || null,
                building_id: form.building_id,
                apartment_id: form.apartment_id === 'none' ? null : form.apartment_id,
                status: form.status,
                install_date: form.install_date || null,
            };

            const meterRecord = editingMeterId
                ? await meterService.updateMeter(editingMeterId, payload)
                : await meterService.createMeter({
                    ...payload,
                    apartment_id: payload.apartment_id || undefined,
                    meter_type: meterType,
                });

            if (!editingMeterId && readingValue) {
                await meterService.createReading({
                    meter_id: meterRecord.id,
                    value: Number(readingValue),
                    unit: form.reading_unit.trim(),
                    timestamp: form.install_date
                        ? new Date(`${form.install_date}T08:00:00`).toISOString()
                        : new Date().toISOString(),
                    reading_type: 'INITIAL',
                });
            }

            toast.success(editingMeterId ? 'Meter updated' : 'Meter saved', { id: toastId });
            closeForm();
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

        setDeleting(true);
        const toastId = toast.loading('Deleting meter...');
        try {
            await meterService.deleteMeter(meterToDelete.id);
            if (editingMeterId === meterToDelete.id) {
                closeForm();
            }
            setMeterToDelete(null);
            await loadData();
            toast.success('Meter deleted', { id: toastId });
        } catch (deleteError: any) {
            console.error(deleteError);
            toast.error(deleteError?.message || 'Could not delete meter', { id: toastId });
        } finally {
            setDeleting(false);
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
            install_date: meter.install_date ?? '',
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
                    subtitle="Manage live backend-connected meters from a dedicated registry page and launch add or edit actions in a pop-out form."
                    onRefresh={() => { void loadData(); }}
                    actions={
                        <div className="flex flex-wrap gap-3">
                            <Button className={glass.btnSecondary} onClick={exportMeters}>
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                            <Button className={glass.btnPrimary} onClick={openCreateModal}>
                                <Plus className="w-4 h-4" />
                                Add meter
                            </Button>
                        </div>
                    }
                />

                <div className={cn(glass.card, 'p-5 bg-muted/ border-border/')}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-foreground/40">Registry lanes</p>
                            <h3 className="text-lg font-black text-foreground">Switch meter categories without leaving the registry</h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                Each category uses the same backend CRUD flow, and registration now happens in a single pop-out form.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {METER_TABS.map((tab) => {
                                const isActive = tab.label === meterType;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onTabChange(tab.id)}
                                        className={cn(
                                            'h-10 px-4 rounded-xl border text-sm font-bold transition-all',
                                            isActive
                                                ? 'bg-[#F4D03F] text-foreground border-[#F4D03F] shadow-sm'
                                                : 'bg-muted/ border-border/ text-muted-foreground/90 hover:text-foreground hover:border-border/'
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <GlassStatCard label="Total meters" value={stats.total} icon={Activity} />
                    <GlassStatCard label="Healthy" value={stats.active} icon={Save} />
                    <GlassStatCard label="Alarms" value={stats.alarms} icon={AlertTriangle} />
                    <GlassStatCard label="Sites" value={stats.sites} icon={Building2} />
                </div>

                <div className={cn(glass.card, 'p-6 bg-muted/ border-border/ space-y-5')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className={glass.input}
                                placeholder="Search meter number, code, site, or hive"
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
                                description="Create the first meter record and it will appear here with the full backend-connected flow."
                                action={{ label: 'Create meter', onClick: openCreateModal }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredMeters.map((meter) => {
                                    const building = buildings.find((item) => item.id === meter.building_id);
                                    const apartment = apartments.find((item) => item.id === meter.apartment_id);
                                    return (
                                        <div key={meter.id} className="rounded-3xl border border-border/ bg-muted/ px-5 py-5 shadow-sm">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-2xl bg-[#F4D03F]/15 border border-border/ flex items-center justify-center">
                                                                <Gauge className="w-5 h-5 text-foreground" />
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-black text-foreground">{meter.meter_number}</div>
                                                                <div className="text-[11px] font-bold text-muted-foreground">
                                                                    {meter.meter_code || 'No external code'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-2.5 py-1 rounded-full bg-[#F4D03F]/15 text-[10px] font-black text-foreground border border-border/">
                                                                {meter.status}
                                                            </span>
                                                            {meter.has_alarm && (
                                                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-[10px] font-black text-red-600 border border-red-500/20">
                                                                    Alarm active
                                                                </span>
                                                            )}
                                                        </div>
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

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div className="rounded-2xl border border-border/ bg-card/ px-4 py-3">
                                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            Placement
                                                        </div>
                                                        <div className="mt-2 font-bold text-foreground">{building?.name || meter.building_id}</div>
                                                        <div className="text-[12px] font-semibold text-muted-foreground">
                                                            {apartment ? apartment.unit_number : 'No hive / station assigned'}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-border/ bg-card/ px-4 py-3">
                                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            Latest reading
                                                        </div>
                                                        <div className="mt-2 font-bold text-foreground">{formatMeterReading(meter)}</div>
                                                        <div className="text-[12px] font-semibold text-muted-foreground">
                                                            {meter.last_reading_at ? new Date(meter.last_reading_at).toLocaleString() : 'Waiting for first sync'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
                                                    <CalendarDays className="w-4 h-4 text-[#F4D03F]" />
                                                    Installed: {formatInstallDate(meter.install_date)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                </div>
            </div>

            <GlassModal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={selectedMeter ? `Edit ${title} meter` : `Add ${title} meter`}
                subtitle={selectedMeter ? 'Update the live registry record.' : 'Create a new meter and register it in the backend.'}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BeeYieldFormField id={`meter-number-${meterType}`} label="Meter number" hint="The primary identifier used across the registry.">
                            <Input
                                id={`meter-number-${meterType}`}
                                value={form.meter_number}
                                onChange={(event) => setForm((current) => ({ ...current, meter_number: event.target.value }))}
                                className={glass.input}
                                placeholder="e.g. BY-WTR-021"
                            />
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-code-${meterType}`} label="Meter code" hint="Optional vendor or hardware reference.">
                            <Input
                                id={`meter-code-${meterType}`}
                                value={form.meter_code}
                                onChange={(event) => setForm((current) => ({ ...current, meter_code: event.target.value }))}
                                className={glass.input}
                                placeholder="Optional external code"
                            />
                        </BeeYieldFormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <BeeYieldFormField id={`meter-site-${meterType}`} label="Site" hint="Choose the apiary or installation site.">
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

                        <BeeYieldFormField id={`meter-unit-${meterType}`} label="Hive / station" hint="Optional sub-location inside the site.">
                            <Select value={form.apartment_id} onValueChange={(value) => setForm((current) => ({ ...current, apartment_id: value }))}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue placeholder="Optional hive / station" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No hive / station</SelectItem>
                                    {availableApartments.map((apartment) => (
                                        <SelectItem key={apartment.id} value={apartment.id}>{apartment.unit_number}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>

                        <BeeYieldFormField id={`meter-status-${meterType}`} label="Status" hint="Initial operational state for this meter.">
                            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </BeeYieldFormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BeeYieldFormField id={`meter-install-date-${meterType}`} label="Install date" hint="Optional deployment date for the device.">
                            <Input
                                id={`meter-install-date-${meterType}`}
                                type="date"
                                value={form.install_date}
                                onChange={(event) => setForm((current) => ({ ...current, install_date: event.target.value }))}
                                className={glass.input}
                            />
                        </BeeYieldFormField>

                        <div className="rounded-2xl border border-border/ bg-card/ px-4 py-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Meter type</div>
                            <div className="mt-2 text-base font-black text-foreground">{meterType}</div>
                            <div className="mt-1 text-sm font-medium text-muted-foreground">
                                Default reading unit: {DEFAULT_READING_UNITS[meterType]}
                            </div>
                        </div>
                    </div>

                    {!selectedMeter && (
                        <div className="rounded-3xl border border-border/ bg-card/ p-5 space-y-4">
                            <div>
                                <h4 className="text-sm font-black text-foreground">Optional first reading</h4>
                                <p className="text-sm font-medium text-muted-foreground">
                                    If you already know the starting reading, it will be saved to the backend together with the new meter.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <BeeYieldFormField id={`meter-reading-value-${meterType}`} label="Reading value" hint="Leave blank if the device has not been calibrated yet.">
                                    <Input
                                        id={`meter-reading-value-${meterType}`}
                                        type="number"
                                        step="0.01"
                                        value={form.reading_value}
                                        onChange={(event) => setForm((current) => ({ ...current, reading_value: event.target.value }))}
                                        className={glass.input}
                                        placeholder="0.00"
                                    />
                                </BeeYieldFormField>

                                <BeeYieldFormField id={`meter-reading-unit-${meterType}`} label="Reading unit" hint="Adjust only if this meter uses a custom unit.">
                                    <Input
                                        id={`meter-reading-unit-${meterType}`}
                                        value={form.reading_unit}
                                        onChange={(event) => setForm((current) => ({ ...current, reading_unit: event.target.value }))}
                                        className={glass.input}
                                        placeholder={DEFAULT_READING_UNITS[meterType]}
                                    />
                                </BeeYieldFormField>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <Button className={glass.btnSecondary} onClick={closeForm} disabled={saving}>
                            Cancel
                        </Button>
                        <Button className={glass.btnPrimary} onClick={() => { void handleSaveMeter(); }} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedMeter ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {selectedMeter ? 'Save changes' : 'Create meter'}
                        </Button>
                    </div>
                </div>
            </GlassModal>

            <GlassConfirmModal
                isOpen={!!meterToDelete}
                onClose={() => {
                    if (!deleting) {
                        setMeterToDelete(null);
                    }
                }}
                onConfirm={() => { void handleDeleteMeter(); }}
                title="Delete meter"
                message="This permanently removes the selected meter record from the backend."
                confirmLabel="Delete"
                isLoading={deleting}
            />
        </BeeYieldPageShell>
    );
};

export default MetersListBase;

