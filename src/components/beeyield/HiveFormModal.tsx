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
                <div className={cn(glass.modalOverlay, "flex items-center justify-center p-8")}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className={glass.modalCard}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Header ── */}
                        <div className={glass.modalHeader}>
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-6 px-8 py-3 bg-honey/10 rounded-full border border-honey/30 shadow-4xl skew-x-[-15deg]">
                                        <Box className="w-6 h-6 text-honey skew-x-[15deg]" />
                                        <span className="text-[12px] font-black uppercase tracking-[0.5em] skew-x-[15deg] italic">Hive Registry</span>
                                    </div>
                                    <h2 className="text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                                        {editingHive ? 'Edit' : 'Add New'} <span className="text-honey">Hive</span>
                                    </h2>
                                    <p className="text-2xl font-black text-foreground/30 uppercase italic border-l-4 border-honey/20 pl-10">Fill in the details to manage this hive in your dashboard.</p>
                                </div>
                                <button onClick={onClose} className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-neutral-800 transition-all duration-700">
                                    <X className="w-10 h-10" />
                                </button>
                            </div>
                        </div>

                        {/* ── Form ── */}
                        <div className="p-20 space-y-20 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {/* Left Section */}
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Hive ID / Name</Label>
                                        <div className="relative group">
                                            <Hash className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within:opacity-100 transition-all" />
                                            <Input
                                                value={formData.hive_code}
                                                onChange={(e) => setFormData({ ...formData, hive_code: e.target.value })}
                                                placeholder="e.g. Hive-01"
                                                className={cn(glass.input, "pl-24")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Location</Label>
                                        <Select value={formData.apiary_id} onValueChange={(val) => setFormData({ ...formData, apiary_id: val })}>
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-8">
                                                    <MapPin className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select Location" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {apiaries.map(apiary => (
                                                    <SelectItem key={apiary.id} value={apiary.id} className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">{apiary.name.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Hive Type</Label>
                                        <Select value={formData.hive_type} onValueChange={(val) => setFormData({ ...formData, hive_type: val })}>
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-8">
                                                    <Layers className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select Hive Type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="Langstroth" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Langstroth</SelectItem>
                                                <SelectItem value="KTBH" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Kenya Top Bar</SelectItem>
                                                <SelectItem value="Traditional Log" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Traditional Log</SelectItem>
                                                <SelectItem value="Warre" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Warre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Number of Frames</Label>
                                        <div className="relative group">
                                            <Settings className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-30 group-focus-within:opacity-100 transition-all" />
                                            <Input
                                                type="number"
                                                value={formData.frame_count || ''}
                                                onChange={(e) => setFormData({ ...formData, frame_count: parseInt(e.target.value) || 0 })}
                                                placeholder="10"
                                                className={cn(glass.input, "pl-24 text-4xl tabular-nums")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Bee Species</Label>
                                        <Select value={formData.bee_type} onValueChange={(val) => setFormData({ ...formData, bee_type: val })}>
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-8">
                                                    <Binary className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select Bee Type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="African Honey Bee" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">African Honey Bee</SelectItem>
                                                <SelectItem value="Italian Bee" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Italian Bee</SelectItem>
                                                <SelectItem value="Carniolan Bee" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Carniolan Bee</SelectItem>
                                                <SelectItem value="Buckfast Bee" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Buckfast Bee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Current Status</Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-8">
                                                    <ShieldCheck className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select Status" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="ACTIVE" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Healthy</SelectItem>
                                                <SelectItem value="WEAK" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Recovering</SelectItem>
                                                <SelectItem value="INACTIVE" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Offline</SelectItem>
                                                <SelectItem value="QUEENLESS" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">No Queen</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Building Material</Label>
                                        <Select value={formData.material} onValueChange={(val) => setFormData({ ...formData, material: val })}>
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-8">
                                                    <Cpu className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select Material" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                <SelectItem value="Wood" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Wood</SelectItem>
                                                <SelectItem value="Plastic" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Plastic</SelectItem>
                                                <SelectItem value="Bamboo" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">Bamboo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Installation Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.installation_date || ''}
                                            onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                                            className={cn(glass.input, "text-3xl")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="flex flex-col sm:flex-row justify-end gap-10 pt-20 border-t border-white/5">
                                <button
                                    onClick={onClose}
                                    className={glass.btnSecondary}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className={cn(glass.btnPrimary, "h-24 min-w-[300px] text-3xl")}
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-12 h-12 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-12 h-12" />
                                    )}
                                    {editingHive ? 'Update Hive' : 'Save Hive'}
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
