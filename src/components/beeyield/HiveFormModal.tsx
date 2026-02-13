import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { Hive, HiveCreateInput, Apiary } from '@/services/beeyieldService';
import { useCreateHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import { toast } from 'sonner';

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

    const [formData, setFormData] = useState<HiveCreateInput>({
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

    useEffect(() => {
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
            toast.error('Please enter a hive code');
            return;
        }
        if (!formData.apiary_id) {
            toast.error('Please select an apiary');
            return;
        }

        try {
            if (editingHive) {
                await updateHive.mutateAsync({ id: editingHive.id, data: formData });
            } else {
                await createHive.mutateAsync(formData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save hive', error);
        }
    };

    const isSaving = createHive.isPending || updateHive.isPending;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        {editingHive ? 'Update Hive Unit' : 'Deploy New Hive'}
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <Card className="border-none shadow-2xl bg-white dark:bg-[#111111] rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="hive_code" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Unit Identifier (Hive Code)<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="hive_code"
                                        name="hive_code"
                                        value={formData.hive_code}
                                        onChange={(e) => setFormData({ ...formData, hive_code: e.target.value })}
                                        placeholder="e.g. ALPHA-001"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="apiary_id" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Assigned Apiary<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Select name="apiary_id" value={formData.apiary_id} onValueChange={(val) => setFormData({ ...formData, apiary_id: val })}>
                                        <SelectTrigger id="hive-apiary" className="h-14 rounded-2xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] font-bold">
                                            <SelectValue placeholder="Select target apiary" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/10">
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id} className="font-bold py-3">{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="hive_type" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Architecture Type
                                    </Label>
                                    <Select name="hive_type" value={formData.hive_type} onValueChange={(val) => setFormData({ ...formData, hive_type: val })}>
                                        <SelectTrigger id="hive-type" className="h-14 rounded-2xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] font-bold">
                                            <SelectValue placeholder="Select architecture" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/10">
                                            <SelectItem value="Langstroth" className="font-bold py-3">Langstroth (Standard)</SelectItem>
                                            <SelectItem value="KTBH" className="font-bold py-3">Kenya Top-Bar (KTBH)</SelectItem>
                                            <SelectItem value="Traditional Log" className="font-bold py-3">Traditional Log</SelectItem>
                                            <SelectItem value="Warre" className="font-bold py-3">Warré</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="frame_count" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Frame Capacity
                                    </Label>
                                    <Input
                                        id="frame_count"
                                        name="frame_count"
                                        type="number"
                                        value={formData.frame_count || ''}
                                        onChange={(e) => setFormData({ ...formData, frame_count: parseInt(e.target.value) || 0 })}
                                        placeholder="10"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="bee_type" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Colony Species
                                    </Label>
                                    <Select name="bee_type" value={formData.bee_type} onValueChange={(val) => setFormData({ ...formData, bee_type: val })}>
                                        <SelectTrigger id="hive-bee-type" className="h-14 rounded-2xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] font-bold">
                                            <SelectValue placeholder="Select species" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/10">
                                            <SelectItem value="African Honey Bee" className="font-bold py-3">African Honey Bee (Scutellata)</SelectItem>
                                            <SelectItem value="Italian Bee" className="font-bold py-3">Italian Bee (Ligustica)</SelectItem>
                                            <SelectItem value="Carniolan Bee" className="font-bold py-3">Carniolan Bee</SelectItem>
                                            <SelectItem value="Buckfast Bee" className="font-bold py-3">Buckfast Bee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="status" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Current Vitals Status
                                    </Label>
                                    <Select name="status" value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger id="hive-status" className="h-14 rounded-2xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] font-bold">
                                            <SelectValue placeholder="Update status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/10">
                                            <SelectItem value="ACTIVE" className="font-bold py-3">Active & Productive</SelectItem>
                                            <SelectItem value="WEAK" className="font-bold py-3">Weak / Under Observation</SelectItem>
                                            <SelectItem value="INACTIVE" className="font-bold py-3">Inactive Unit</SelectItem>
                                            <SelectItem value="QUEENLESS" className="font-bold py-3">Warning: Queenless</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="material" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Chassis Material
                                    </Label>
                                    <Select name="material" value={formData.material} onValueChange={(val) => setFormData({ ...formData, material: val })}>
                                        <SelectTrigger id="hive-material" className="h-14 rounded-2xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] font-bold">
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/10">
                                            <SelectItem value="Wood" className="font-bold py-3">Cedar / Pine Wood</SelectItem>
                                            <SelectItem value="Plastic" className="font-bold py-3">High-Density Plastic</SelectItem>
                                            <SelectItem value="Bamboo" className="font-bold py-3">Structural Bamboo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="installation_date" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Deployment Timestamp
                                    </Label>
                                    <Input
                                        id="installation_date"
                                        name="installation_date"
                                        type="date"
                                        value={formData.installation_date || ''}
                                        onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-100 dark:border-white/5 text-base bg-slate-50/50 dark:bg-white/[0.02] font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest text-[10px]"
                                disabled={isSaving}
                            >
                                Discard Changes
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-14 px-10 rounded-2xl font-black bg-[#1B9157] hover:bg-[#157d4a] text-white shadow-xl shadow-[#1B9157]/40 dark:shadow-none tracking-[0.2em] uppercase text-xs"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {editingHive ? 'Sync Intelligence' : 'Deploy Module'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HiveFormModal;
