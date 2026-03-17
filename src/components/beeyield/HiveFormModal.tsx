import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Hexagon, MapPin, Layers, Binary, ShieldCheck, RefreshCw, Box, Zap, Cpu, Settings, Hash } from 'lucide-react';
import { Hive, HiveCreateInput, Apiary } from '@/services/beeyieldService';
import { useCreateHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';
import { cn } from '@/lib/utils';

interface HiveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHive?: Hive | null;
    preselectedApiaryId?: string;
}

const HiveFormModal: React.FC<HiveFormModalProps> = ({ isOpen, onClose, editingHive, preselectedApiaryId }) => {
    const { data: apiaries = [] } = useApiaries();
    const createHive = useCreateHive();
    const updateHive = useUpdateHive();

    const [formData, setFormData] = React.useState<HiveCreateInput>({
        hive_code: '',
        apiary_id: '',
        hive_type: 'Langstroth',
        bee_type: 'African Honey Bee',
        frame_count: 10,
        material: 'Wood',
        status: 'ACTIVE',
        installation_date: new Date().toISOString().split('T')[0],
        has_sensors: false,
    });

    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
            return date.toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    };

    React.useEffect(() => {
        if (editingHive) {
            setFormData({
                hive_code: editingHive.hive_code,
                apiary_id: editingHive.apiary_id || '',
                hive_type: editingHive.hive_type || 'Langstroth',
                bee_type: editingHive.bee_type || 'African Honey Bee',
                frame_count: editingHive.frame_count || 10,
                material: editingHive.material || 'Wood',
                status: editingHive.status || 'ACTIVE',
                installation_date: formatDateForInput(editingHive.installation_date),
                has_sensors: editingHive.has_sensors || false,
            });
        } else {
            setFormData({
                hive_code: '',
                apiary_id: preselectedApiaryId || (apiaries.length > 0 ? apiaries[0].id : ''),
                hive_type: 'Langstroth',
                bee_type: 'African Honey Bee',
                frame_count: 10,
                material: 'Wood',
                status: 'ACTIVE',
                installation_date: new Date().toISOString().split('T')[0],
                has_sensors: false,
            });
        }
    }, [editingHive, preselectedApiaryId, apiaries, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.hive_code.trim()) {
            toast.error('Please enter a hive ID');
            return;
        }
        if (!formData.apiary_id) {
            toast.error('Please select a location');
            return;
        }

        const toastId = toast.loading("Saving hive data...");
        try {
            if (editingHive) {
                await updateHive.mutateAsync({ id: editingHive.id, data: formData });
                toast.success('Hive updated successfully', { id: toastId });
            } else {
                await createHive.mutateAsync(formData);
                toast.success('New hive added successfully', { id: toastId });
            }
            onClose();
        } catch (error) {
            toast.error("Could not save changes. Please try again.", { id: toastId });
        }
    };

    const isSaving = createHive.isPending || updateHive.isPending;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={cn(glass.modalOverlay)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(glass.modalCard, "max-w-xl")}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Header ── */}
                        <div className="px-6 py-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                    <Hexagon className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-[#1A1A1A]">
                                        {editingHive ? 'Edit hive' : 'Add hive'}
                                    </h2>
                                    <p className="text-[8px] font-bold text-[#F4D03F] uppercase tracking-[0.1em]">Hive registration in progress.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all" aria-label="Close" title="Close">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* ── Form ── */}
                        <div className="p-6 space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="hive-form-hive-code" className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Hive Identifier*</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                        <Input
                                            id="hive-form-hive-code"
                                            name="hive_code"
                                            autoComplete="off"
                                            value={formData.hive_code}
                                            onChange={(e) => setFormData({ ...formData, hive_code: e.target.value })}
                                            placeholder="HIVE_ACACIA_01"
                                            className={cn(glass.input, "pl-10 h-10 text-[11px] font-black uppercase tracking-wider")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Location</Label>
                                    <Select value={formData.apiary_id} onValueChange={(val) => setFormData({ ...formData, apiary_id: val })}>
                                        <SelectTrigger id="hive-form-apiary" aria-label="Location" className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select Location" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id} className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10">{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Hardware Blueprint</Label>
                                    <Select value={formData.hive_type} onValueChange={(val) => setFormData({ ...formData, hive_type: val })}>
                                        <SelectTrigger id="hive-form-hive-type" aria-label="Hive type" className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select Type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            {['Langstroth', 'KTBH', 'Traditional Log', 'Warre'].map(t => (
                                                <SelectItem key={t} value={t} className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hive-form-frame-count" className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Frame Saturation</Label>
                                    <div className="relative">
                                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                        <Input
                                            id="hive-form-frame-count"
                                            name="frame_count"
                                            autoComplete="off"
                                            type="number"
                                            value={formData.frame_count || ''}
                                            onChange={(e) => setFormData({ ...formData, frame_count: parseInt(e.target.value) || 0 })}
                                            placeholder="10"
                                            className={cn(glass.input, "pl-10 h-10 text-[11px] font-black tabular-nums tracking-widest")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 ml-2">Bee type</Label>
                                    <Select value={formData.bee_type} onValueChange={(val) => setFormData({ ...formData, bee_type: val })}>
                                        <SelectTrigger id="hive-form-bee-type" aria-label="Bee type" className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl text-sm font-semibold transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <Binary className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select bee type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            {['African Honey Bee', 'Italian Bee', 'Carniolan Bee', 'Buckfast Bee'].map(b => (
                                                <SelectItem key={b} value={b} className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10">{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Operational State</Label>
                                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger id="hive-form-status" aria-label="Operational state" className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            <SelectItem value="ACTIVE" className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10 text-[#1B9157]">NOMINAL</SelectItem>
                                            <SelectItem value="WEAK" className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10 text-[#F4D03F]">OBSERVATION</SelectItem>
                                            <SelectItem value="INACTIVE" className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10 text-red-500">OFFLINE</SelectItem>
                                            <SelectItem value="QUEENLESS" className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10 text-purple-500">QUEENLESS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Material Specification</Label>
                                    <Select value={formData.material} onValueChange={(val) => setFormData({ ...formData, material: val })}>
                                        <SelectTrigger id="hive-form-material" aria-label="Material" className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <Cpu className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select Material" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            {['Wood', 'Plastic', 'Bamboo'].map(m => (
                                                <SelectItem key={m} value={m} className="text-[9px] font-black uppercase tracking-widest focus:bg-[#F4D03F]/10">{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hive-form-installation-date" className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase ml-2">Deployment_Date</Label>
                                    <Input
                                        id="hive-form-installation-date"
                                        name="installation_date"
                                        autoComplete="off"
                                        type="date"
                                        value={formData.installation_date || ''}
                                        onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                                        className={cn(glass.input, "h-10 text-[11px] font-black tabular-nums tracking-widest")}
                                    />
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-[#F4D03F]/10 mt-6">
                                <button
                                    onClick={onClose}
                                    className={cn(glass.btnSecondary, "h-11 px-6 text-[9px] font-black uppercase tracking-[0.3em]")}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className={cn(glass.btnPrimary, "h-11 px-10 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#F4D03F]/10")}
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                    )}
                                    {editingHive ? 'Save changes' : 'Add hive'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HiveFormModal;
