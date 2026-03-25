import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Hexagon, Sprout, Activity, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Apiary, ApiaryCreateInput } from '@/services/beeyieldService';
import { useCreateApiary, useUpdateApiary } from '@/hooks/useHives';
import { useAnalytics } from '@/hooks/useAnalytics';
import { glass } from './GlassTheme';

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    React.useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
};

interface ApiaryFormProps {
    apiary?: Apiary | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ApiaryForm: React.FC<ApiaryFormProps> = ({ apiary, onSuccess, onCancel }) => {
    const createApiary = useCreateApiary();
    const updateApiary = useUpdateApiary();
    const { trackEvent } = useAnalytics();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);

    const [formData, setFormData] = React.useState<ApiaryCreateInput>({
        name: apiary?.name || '',
        type: apiary?.type || 'permanent',
        location_name: apiary?.location_name || '',
        region: apiary?.region || '',
        forage_type: apiary?.forage_type || '',
        expected_hives: apiary?.expected_hives || 0,
        size_acres: apiary?.size_acres || 0,
        notes: apiary?.notes || '',
        latitude: apiary?.latitude || -2.42,
        longitude: apiary?.longitude || 37.97
    });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data[0]) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setFormData(prev => ({ 
                    ...prev, 
                    latitude: lat, 
                    longitude: lon,
                    location_name: data[0].display_name
                }));
                toast.success(`Found: ${data[0].display_name.split(',')[0]}`, {
                    description: "Pivot moved to searched location."
                });
            } else {
                toast.error('Location not found. Try a different name.');
            }
        } catch (e) {
            toast.error('Search failed. Check your connection.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Please enter a location name.');
            return;
        }

        const toastId = toast.loading("Saving location...");
        try {
            if (apiary) {
                await updateApiary.mutateAsync({ id: apiary.id, data: formData });
                trackEvent('apiary_update', { name: formData.name, type: formData.type });
                toast.success('Location updated.', { id: toastId });
            } else {
                await createApiary.mutateAsync(formData);
                trackEvent('apiary_create', { name: formData.name, type: formData.type, region: formData.region });
                toast.success('Location saved.', { id: toastId });
            }
            onSuccess();
        } catch (error) {
            toast.error("Could not save. Please try again.", { id: toastId });
        }
    };

    const isPending = createApiary.isPending || updateApiary.isPending;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-black text-gray-400 ml-2">Site Identifier*</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Acacia Valley 01"
                            className={cn(glass.input, "px-4 h-10 text-[11px] font-black tracking-wider w-full")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 ml-2">Placement</Label>
                        <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                            <SelectTrigger className="h-10 border-[#F4D03F]/10 bg-white px-4 rounded-xl font-black text-[9px] transition-all hover:border-[#F4D03F]/30 focus:ring-0 w-full">
                                <div className="flex items-center gap-3">
                                    <Target className="w-3.5 h-3.5 text-[#F4D03F]" />
                                    <SelectValue placeholder="Select type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                <SelectItem value="permanent" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Permanent Site</SelectItem>
                                <SelectItem value="migratory" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Migratory Site</SelectItem>
                                <SelectItem value="breeding" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Breeding Site</SelectItem>
                                <SelectItem value="quarantine" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Isolation Site</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black text-gray-400 ml-2">Unit Capacity</Label>
                            <div className="relative">
                                <Hexagon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <Input
                                    type="number"
                                    value={formData.expected_hives || ''}
                                    onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="h-10 pl-10 font-black text-[11px] bg-white border-[#F4D03F]/10 rounded-xl tabular-nums w-full"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black text-gray-400 ml-2">Area (AC)</Label>
                            <div className="relative">
                                <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B9157]/40" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.size_acres || ''}
                                    onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.0"
                                    className="h-10 pl-10 font-black text-[11px] bg-white border-[#F4D03F]/10 rounded-xl tabular-nums w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 ml-2">Flora</Label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B9157]/40" />
                            <Input
                                value={formData.forage_type}
                                onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                placeholder="Lavender Cluster Pro"
                                className="h-10 pl-10 font-black text-[10px] bg-white border-[#F4D03F]/10 rounded-xl tracking-wider w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative h-64 rounded-2xl overflow-hidden border border-[#F4D03F]/20 shadow-inner group">
                            <MapContainer 
                                center={[formData.latitude || -2.42, formData.longitude || 37.97]} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    attribution="&copy; Google Maps Hybrid"
                                />
                                <MapController 
                                    center={[formData.latitude || -2.42, formData.longitude || 37.97]} 
                                    zoom={15} 
                                />
                                <Marker 
                                    position={[formData.latitude || -2.42, formData.longitude || 37.97]}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const pos = marker.getLatLng();
                                            setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
                                        }
                                    }}
                                >
                                    <Popup className="font-bold border-none shadow-xl rounded-xl">
                                        <div className="p-2 text-center">
                                            <p className="text-xs font-black text-[#1B9157]">Deployment Pivot</p>
                                            <p className="text-[9px] text-gray-400">Drag to exact hive site</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input 
                                            className="w-full bg-white/90 backdrop-blur-md border border-[#F4D03F]/20 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F4D03F]/20 transition-all"
                                            placeholder="Search exact location..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSearch();
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="px-3 bg-[#F4D03F] text-[#1A1A1A] rounded-lg text-[9px] font-black shadow-lg hover:bg-[#E5C335] transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {isSearching ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
                                        SEARCH
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[8px] font-black text-gray-400 ml-1 uppercase">Latitude</Label>
                                <Input 
                                    type="number"
                                    step="any"
                                    value={formData.latitude || ''} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                                    className="h-8 bg-white text-[10px] font-mono border-[#F4D03F]/10 rounded-lg focus:ring-[#F4D03F]/20 w-full" 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[8px] font-black text-gray-400 ml-1 uppercase">Longitude</Label>
                                <Input 
                                    type="number"
                                    step="any"
                                    value={formData.longitude || ''} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                                    className="h-8 bg-white text-[10px] font-mono border-[#F4D03F]/10 rounded-lg focus:ring-[#F4D03F]/20 w-full" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[9px] font-black text-gray-400 ml-2">Operational Notes</Label>
                <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-20 p-4 text-[10px] font-bold bg-white border-[#F4D03F]/10 rounded-xl resize-none italic leading-relaxed w-full"
                    placeholder="Add important notes for this site..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#F4D03F]/10">
                <button
                    onClick={onCancel}
                    className={cn(glass.btnSecondary, "h-11 px-6 text-[9px] font-black")}
                >
                    Discard_Draft
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className={cn(glass.btnPrimary, "h-11 px-10 text-[9px] font-black shadow-xl shadow-[#F4D03F]/10")}
                >
                    {isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    {apiary ? 'UPDATE_DEPLOYMENT' : 'INITIALIZE_DEPLOYMENT'}
                </button>
            </div>
        </div>
    );
};
