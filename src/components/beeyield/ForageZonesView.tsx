import React from 'react';
import { Flower2, Loader2, MapPinned, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useApiaries } from '@/hooks/useApiaries';
import { useCreateForageZone, useDeleteForageZone, useForageZoneDetail, useForageZones, useUpdateForageZone } from '@/hooks/useForageZones';
import { ForageZone } from '@/services/beeyieldService';
import { BeeYieldEmptyState, BeeYieldFormField, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GlassConfirmModal, GlassStatCard, glass } from './GlassTheme';

type ZoneFormState = {
    apiary_id: string;
    zone_name: string;
    flora_type: string;
    latitude: string;
    longitude: string;
    radius_km: string;
    density_score: string;
    season: string;
    notes: string;
};

function createEmptyZoneForm(apiaryId?: string): ZoneFormState {
    return {
        apiary_id: apiaryId || '',
        zone_name: '',
        flora_type: '',
        latitude: '',
        longitude: '',
        radius_km: '',
        density_score: '',
        season: '',
        notes: '',
    };
}

function parseNumber(value: string) {
    if (!value.trim()) return undefined;
    const next = Number(value);
    return Number.isFinite(next) ? next : undefined;
}

const ForageZonesView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    const { data: apiaries = [] } = useApiaries();
    const [apiaryFilter, setApiaryFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [selectedZoneId, setSelectedZoneId] = React.useState('');
    const [editingZoneId, setEditingZoneId] = React.useState<string | null>(null);
    const [zoneToDelete, setZoneToDelete] = React.useState<ForageZone | null>(null);
    const [form, setForm] = React.useState<ZoneFormState>(createEmptyZoneForm());

    const zoneApiaryId = apiaryFilter === 'all' ? undefined : apiaryFilter;
    const { data: zones = [], isLoading, refetch } = useForageZones(zoneApiaryId);
    const selectedZoneQuery = useForageZoneDetail(selectedZoneId);
    const createZone = useCreateForageZone(zoneApiaryId);
    const updateZone = useUpdateForageZone(zoneApiaryId);
    const deleteZone = useDeleteForageZone(zoneApiaryId);

    const selectedZone = selectedZoneQuery.data || zones.find((zone) => zone.id === selectedZoneId) || null;

    const stats = React.useMemo(() => {
        const totalRadius = zones.reduce((sum, zone) => sum + (zone.radius_km || 0), 0);
        const totalDensity = zones.reduce((sum, zone) => sum + (zone.density_score || 0), 0);
        return {
            total: zones.length,
            apiaries: new Set(zones.map((zone) => zone.apiary_id)).size,
            avgRadius: zones.length ? `${(totalRadius / zones.length).toFixed(1)} km` : '0 km',
            avgDensity: zones.length ? `${(totalDensity / zones.length).toFixed(2)}` : '0.00',
        };
    }, [zones]);

    const filteredZones = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return zones.filter((zone) => {
            if (!query) return true;
            return (
                (zone.zone_name || '').toLowerCase().includes(query) ||
                (zone.flora_type || '').toLowerCase().includes(query) ||
                (zone.season || '').toLowerCase().includes(query)
            );
        });
    }, [zones, search]);

    const getApiaryName = React.useCallback(
        (apiaryId?: string) => apiaries.find((apiary) => apiary.id === apiaryId)?.name || 'Unknown apiary',
        [apiaries]
    );

    const resetForm = React.useCallback(() => {
        setEditingZoneId(null);
        setForm(createEmptyZoneForm(zoneApiaryId || apiaries[0]?.id));
    }, [apiaries, zoneApiaryId]);

    React.useEffect(() => {
        if (!form.apiary_id && apiaries[0]?.id) {
            setForm((current) => ({ ...current, apiary_id: current.apiary_id || apiaries[0]?.id || '' }));
        }
    }, [apiaries, form.apiary_id]);

    const startEditing = (zone: ForageZone) => {
        setEditingZoneId(zone.id);
        setForm({
            apiary_id: zone.apiary_id,
            zone_name: zone.zone_name || '',
            flora_type: zone.flora_type || '',
            latitude: zone.latitude?.toString() || '',
            longitude: zone.longitude?.toString() || '',
            radius_km: zone.radius_km?.toString() || '',
            density_score: zone.density_score?.toString() || '',
            season: zone.season || '',
            notes: zone.notes || '',
        });
    };

    const handleSaveZone = async () => {
        if (!form.apiary_id) {
            toast.error('Apiary is required');
            return;
        }

        const payload = {
            apiary_id: form.apiary_id,
            zone_name: form.zone_name || undefined,
            flora_type: form.flora_type || undefined,
            latitude: parseNumber(form.latitude),
            longitude: parseNumber(form.longitude),
            radius_km: parseNumber(form.radius_km),
            density_score: parseNumber(form.density_score),
            season: form.season || undefined,
            notes: form.notes || undefined,
        };

        if (editingZoneId) {
            const response = await updateZone.mutateAsync({ id: editingZoneId, data: payload });
            if (response.error) return;
            setSelectedZoneId(editingZoneId);
        } else {
            const response = await createZone.mutateAsync(payload);
            if (response.error || !response.data) return;
            setSelectedZoneId(response.data.id);
        }

        resetForm();
    };

    const handleDelete = async () => {
        if (!zoneToDelete) return;
        await deleteZone.mutateAsync(zoneToDelete.id);
        if (selectedZoneId === zoneToDelete.id) {
            setSelectedZoneId('');
        }
        setZoneToDelete(null);
    };

    return (
        <BeeYieldPageShell className={glass.page}>
            <div className="space-y-6">
                <BeeYieldPageHeader
                    icon={MapPinned}
                    label="Forage planning"
                    onBack={() => onTabChange('home')}
                    onRefresh={() => { void refetch(); }}
                    title={<>Forage <span className="text-[#F4D03F]">Zones</span></>}
                    subtitle="Manage the backend-backed zone register that powers your field planning and flight-map context."
                    actions={
                        <div className="flex gap-2">
                            <Button className={glass.btnSecondary} onClick={() => onTabChange('flight-map')}>
                                Open map
                            </Button>
                            <Button className={glass.btnPrimary} onClick={resetForm}>
                                <Plus className="w-4 h-4" />
                                New zone
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <GlassStatCard label="Total zones" value={stats.total} icon={MapPinned} />
                    <GlassStatCard label="Apiaries covered" value={stats.apiaries} icon={Flower2} />
                    <GlassStatCard label="Average radius" value={stats.avgRadius} icon={MapPinned} />
                    <GlassStatCard label="Average density" value={stats.avgDensity} icon={Flower2} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className={cn(glass.card, 'p-5 space-y-4')}>
                        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3">
                            <Select value={apiaryFilter} onValueChange={setApiaryFilter}>
                                <SelectTrigger className={glass.input}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All apiaries</SelectItem>
                                    {apiaries.map((apiary) => (
                                        <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className={cn(glass.input, 'pl-10')}
                                    placeholder="Search zone name, flora type, or season"
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                            </div>
                        ) : filteredZones.length === 0 ? (
                            <BeeYieldEmptyState
                                icon={MapPinned}
                                title="No forage zones yet"
                                description="Create a zone to start tracking forage radius, density, and seasonal notes per apiary."
                                action={{ label: 'Create zone', onClick: resetForm }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {filteredZones.map((zone) => (
                                    <button
                                        key={zone.id}
                                        type="button"
                                        onClick={() => setSelectedZoneId(zone.id)}
                                        className={cn(
                                            'w-full rounded-2xl border px-4 py-4 text-left transition-all bg-white/60 hover:bg-white',
                                            selectedZoneId === zone.id ? 'border-[#F4D03F]/50 shadow-sm' : 'border-[#F4D03F]/15'
                                        )}
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="space-y-1 min-w-0">
                                                <div className="text-sm font-bold text-[#1A1A1A]">{zone.zone_name || 'Unnamed zone'}</div>
                                                <div className="text-[11px] font-semibold text-gray-500">{getApiaryName(zone.apiary_id)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {zone.flora_type || 'No flora type'}{zone.season ? ` / ${zone.season}` : ''}
                                                </div>
                                            </div>
                                            <div className="text-left lg:text-right">
                                                <div className="text-[10px] font-black text-[#1A1A1A]">{zone.radius_km || 0} km</div>
                                                <div className="text-[10px] text-gray-500">Density {zone.density_score || 0}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className={cn(glass.card, 'p-5')}>
                            {!selectedZone ? (
                                <BeeYieldEmptyState
                                    icon={Flower2}
                                    title="Select a zone"
                                    description="Inspect a saved forage zone here, then edit or delete it from the same panel."
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-black tracking-[0.18em] text-[#F4D03F]">
                                            {getApiaryName(selectedZone.apiary_id)}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1A1A1A]">{selectedZone.zone_name || 'Unnamed zone'}</h3>
                                        <p className="text-sm text-gray-500">{selectedZone.flora_type || 'No flora type'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                            <div className="text-[10px] font-bold text-gray-400">Radius</div>
                                            <div className="text-sm font-semibold text-[#1A1A1A]">{selectedZone.radius_km || 0} km</div>
                                        </div>
                                        <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                            <div className="text-[10px] font-bold text-gray-400">Density</div>
                                            <div className="text-sm font-semibold text-[#1A1A1A]">{selectedZone.density_score || 0}</div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-2">
                                        <div className="text-[10px] font-bold text-gray-400">Coordinates</div>
                                        <div className="text-sm text-gray-700">
                                            {selectedZone.latitude ?? '-'}, {selectedZone.longitude ?? '-'}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-2">
                                        <div className="text-[10px] font-bold text-gray-400">Notes</div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedZone.notes || 'No notes yet.'}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button className={glass.btnSecondary} onClick={() => startEditing(selectedZone)}>
                                            Edit
                                        </Button>
                                        <Button className={glass.btnSecondary} onClick={() => setZoneToDelete(selectedZone)}>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={cn(glass.card, 'p-5 space-y-4')}>
                            <div>
                                <h3 className="text-[11px] font-black text-[#1A1A1A]">{editingZoneId ? 'Update zone' : 'Create zone'}</h3>
                                <p className="text-[10px] text-gray-500">{editingZoneId ? 'Edit the saved backend record.' : 'Add a new forage zone for an apiary.'}</p>
                            </div>

                            <BeeYieldFormField id="zone-apiary" label="Apiary">
                                <Select value={form.apiary_id} onValueChange={(value) => setForm((current) => ({ ...current, apiary_id: value }))}>
                                    <SelectTrigger className={glass.input}>
                                        <SelectValue placeholder="Select apiary" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {apiaries.map((apiary) => (
                                            <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </BeeYieldFormField>

                            <BeeYieldFormField id="zone-name" label="Zone name">
                                <Input id="zone-name" value={form.zone_name} onChange={(event) => setForm((current) => ({ ...current, zone_name: event.target.value }))} className={glass.input} />
                            </BeeYieldFormField>

                            <BeeYieldFormField id="zone-flora" label="Flora type">
                                <Input id="zone-flora" value={form.flora_type} onChange={(event) => setForm((current) => ({ ...current, flora_type: event.target.value }))} className={glass.input} />
                            </BeeYieldFormField>

                            <div className="grid grid-cols-2 gap-3">
                                <BeeYieldFormField id="zone-latitude" label="Latitude">
                                    <Input id="zone-latitude" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} className={glass.input} />
                                </BeeYieldFormField>
                                <BeeYieldFormField id="zone-longitude" label="Longitude">
                                    <Input id="zone-longitude" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} className={glass.input} />
                                </BeeYieldFormField>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <BeeYieldFormField id="zone-radius" label="Radius (km)">
                                    <Input id="zone-radius" value={form.radius_km} onChange={(event) => setForm((current) => ({ ...current, radius_km: event.target.value }))} className={glass.input} />
                                </BeeYieldFormField>
                                <BeeYieldFormField id="zone-density" label="Density score">
                                    <Input id="zone-density" value={form.density_score} onChange={(event) => setForm((current) => ({ ...current, density_score: event.target.value }))} className={glass.input} />
                                </BeeYieldFormField>
                            </div>

                            <BeeYieldFormField id="zone-season" label="Season">
                                <Input id="zone-season" value={form.season} onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))} className={glass.input} placeholder="Long rains, dry season, bloom peak..." />
                            </BeeYieldFormField>

                            <BeeYieldFormField id="zone-notes" label="Notes">
                                <Textarea id="zone-notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[110px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm" />
                            </BeeYieldFormField>

                            <div className="flex gap-2">
                                <Button
                                    className={glass.btnPrimary}
                                    onClick={() => { void handleSaveZone(); }}
                                    disabled={createZone.isPending || updateZone.isPending}
                                >
                                    {(createZone.isPending || updateZone.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingZoneId ? 'Save changes' : 'Save zone'}
                                </Button>
                                {editingZoneId && (
                                    <Button className={glass.btnSecondary} onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GlassConfirmModal
                isOpen={!!zoneToDelete}
                onClose={() => setZoneToDelete(null)}
                onConfirm={() => { void handleDelete(); }}
                title="Delete forage zone"
                message="This removes the selected forage zone from the backend and dashboard."
                confirmLabel="Delete"
                isLoading={deleteZone.isPending}
            />
        </BeeYieldPageShell>
    );
};

export default ForageZonesView;
