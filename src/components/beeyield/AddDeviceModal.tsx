import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: any) => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.error("Cloud Connection Inactive: Backend for device orchestration is not yet linked. Contact your administrator.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-[#FDFBF9] dark:bg-[#1A1816] border-none rounded-[3rem] p-12 shadow-2xl">
                <DialogHeader className="p-0 space-y-4">
                    <DialogTitle className="text-4xl font-normal text-slate-800 dark:text-slate-100">
                        Assign device to hive
                    </DialogTitle>
                    <DialogDescription className="text-xl text-[#6B8BA4] dark:text-[#8EABC0] font-normal leading-relaxed">
                        Select an apiary, choose a hive, and enter the BeeHUB short id.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-10">
                    <p className="text-xl text-[#6B8BA4] dark:text-[#8EABC0] font-normal">
                        No apiaries available yet.
                    </p>
                </div>

                <div className="flex justify-end gap-6 pt-4">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full h-16 px-12 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xl font-bold border-none"
                    >
                        Go back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="rounded-full h-16 px-12 bg-[#F5A9A9] hover:bg-[#F59E9E] text-[#7F1D1D] text-xl font-bold border-none shadow-lg shadow-red-500/10 cursor-not-allowed"
                    >
                        Assign device
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
