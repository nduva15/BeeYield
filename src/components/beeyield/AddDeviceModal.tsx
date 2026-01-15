import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: any) => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock add
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            device_code: 'NEW-DEVICE-' + Math.floor(Math.random() * 1000),
            device_name: 'New Sensor',
            status: 'active',
            battery_level: 100,
            location_name: 'North Orchard',
            last_ping: new Date().toISOString()
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#09090b] border-gray-100 dark:border-[#1e1e1e] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add new device</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Enter the details of your BeeYield IoT device to start monitoring.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="device_code">Device Code (Serial Number)</Label>
                        <Input
                            id="device_code"
                            placeholder="e.g. BY-XXXX-XXXX"
                            className="rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border-none"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="device_name">Display Name</Label>
                        <Input
                            id="device_name"
                            placeholder="e.g. Hive 42 Sensor"
                            className="rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border-none"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apiary">Assign to Apiary</Label>
                        <Select required>
                            <SelectTrigger className="rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border-none w-full">
                                <SelectValue placeholder="Select an apiary" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800">
                                <SelectItem value="north-orchard">North Orchard</SelectItem>
                                <SelectItem value="backyard">Backyard</SelectItem>
                                <SelectItem value="river-side">River Side</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#4ADE80] hover:bg-[#22c55e] text-black rounded-xl px-8 border-none font-bold">
                            Add device
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
