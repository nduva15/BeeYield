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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                        {editingHive ? 'Edit Hive' : 'Add Hive'}
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white hover:bg-white/10 rounded-none border-2 border-transparent hover:border-white transition-none"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white rounded-none overflow-hidden">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="hive_code" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Hive Code<span className="text-[#FF4F00] ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="hive_code"
                                        name="hive_code"
                                        value={formData.hive_code}
                                        onChange={(e) => setFormData({ ...formData, hive_code: e.target.value })}
                                        placeholder="e.g. ALPHA-001"
                                        className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs transition-none focus:ring-0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apiary_id" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Location<span className="text-[#FF4F00] ml-1">*</span>
                                    </Label>
                                    <Select name="apiary_id" value={formData.apiary_id} onValueChange={(val) => setFormData({ ...formData, apiary_id: val })}>
                                        <SelectTrigger id="hive-apiary" className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs">
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-black shadow-lg">
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id} className="font-bold py-3 uppercase text-[10px]">{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hive_type" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Hive Type
                                    </Label>
                                    <Select name="hive_type" value={formData.hive_type} onValueChange={(val) => setFormData({ ...formData, hive_type: val })}>
                                        <SelectTrigger id="hive-type" className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-black">
                                            <SelectItem value="Langstroth" className="font-bold py-3 uppercase text-[10px]">Langstroth</SelectItem>
                                            <SelectItem value="KTBH" className="font-bold py-3 uppercase text-[10px]">Kenya Top-Bar</SelectItem>
                                            <SelectItem value="Traditional Log" className="font-bold py-3 uppercase text-[10px]">Traditional Log</SelectItem>
                                            <SelectItem value="Warre" className="font-bold py-3 uppercase text-[10px]">Warré</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frame_count" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Frames
                                    </Label>
                                    <Input
                                        id="frame_count"
                                        name="frame_count"
                                        type="number"
                                        value={formData.frame_count || ''}
                                        onChange={(e) => setFormData({ ...formData, frame_count: parseInt(e.target.value) || 0 })}
                                        placeholder="10"
                                        className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs transition-none focus:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bee_type" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Bee Type
                                    </Label>
                                    <Select name="bee_type" value={formData.bee_type} onValueChange={(val) => setFormData({ ...formData, bee_type: val })}>
                                        <SelectTrigger id="hive-bee-type" className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-black">
                                            <SelectItem value="African Honey Bee" className="font-bold py-3 uppercase text-[10px]">African Honey Bee</SelectItem>
                                            <SelectItem value="Italian Bee" className="font-bold py-3 uppercase text-[10px]">Italian Bee</SelectItem>
                                            <SelectItem value="Carniolan Bee" className="font-bold py-3 uppercase text-[10px]">Carniolan Bee</SelectItem>
                                            <SelectItem value="Buckfast Bee" className="font-bold py-3 uppercase text-[10px]">Buckfast Bee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Status
                                    </Label>
                                    <Select name="status" value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger id="hive-status" className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-black">
                                            <SelectItem value="ACTIVE" className="font-bold py-3 uppercase text-[10px]">Active</SelectItem>
                                            <SelectItem value="WEAK" className="font-bold py-3 uppercase text-[10px]">Weak</SelectItem>
                                            <SelectItem value="INACTIVE" className="font-bold py-3 uppercase text-[10px]">Inactive</SelectItem>
                                            <SelectItem value="QUEENLESS" className="font-bold py-3 uppercase text-[10px]">Queenless</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="material" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Material
                                    </Label>
                                    <Select name="material" value={formData.material} onValueChange={(val) => setFormData({ ...formData, material: val })}>
                                        <SelectTrigger id="hive-material" className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs">
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-black">
                                            <SelectItem value="Wood" className="font-bold py-3 uppercase text-[10px]">Wood</SelectItem>
                                            <SelectItem value="Plastic" className="font-bold py-3 uppercase text-[10px]">Plastic</SelectItem>
                                            <SelectItem value="Bamboo" className="font-bold py-3 uppercase text-[10px]">Bamboo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="installation_date" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Installation Date
                                    </Label>
                                    <Input
                                        id="installation_date"
                                        name="installation_date"
                                        type="date"
                                        value={formData.installation_date || ''}
                                        onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                                        className="h-12 rounded-none border-2 border-black bg-neutral-50 font-bold uppercase text-xs transition-none focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t-2 border-neutral-100 flex items-center justify-end gap-4">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="h-12 px-6 rounded-none font-bold text-neutral-400 hover:text-black uppercase text-[10px] tracking-widest transition-none"
                                disabled={isSaving}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-12 px-8 rounded-none bg-black text-white hover:bg-[#FF4F00] border-2 border-black font-black uppercase text-xs tracking-widest transition-none"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {editingHive ? 'Save Changes' : 'Add Hive'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HiveFormModal;
