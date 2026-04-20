import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ApiaryForm } from './ApiaryForm';
import { HiveForm } from './HiveForm';
import { cn } from '@/lib/utils';

interface QuickActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = React.useState('apiary');

    // Reset tab when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab('apiary');
        }
    }, [isOpen]);

    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className={cn(
                    "bg-card border border-border/ rounded-[2rem] shadow-2xl p-0 overflow-hidden outline-none transition-all duration-300",
                    activeTab === 'apiary' ? 'max-w-4xl' : 'max-w-xl'
                )}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-[#F4D03F]/5 to-transparent px-8 py-6 border-b border-border/">
                    <DialogHeader>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4D03F]/10 rounded-xl border border-border/ w-fit mb-3">
                            <Plus className="w-4 h-4 text-[#F4D03F]" />
                            <span className="text-[11px] font-black tracking-wider text-[#F4D03F] uppercase">New Record</span>
                        </div>
                        <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
                            Create New Asset
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-muted-foreground">
                            Configure a new apiary deployment site or register a hive unit.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="px-8 py-6 bg-muted/ backdrop-blur-xl">
                    <Tabs defaultValue="apiary" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/ p-1.5 h-12 rounded-xl mb-8 border border-border/ shadow-sm">
                            <TabsTrigger 
                                value="apiary" 
                                className="rounded-lg text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-[#F4D03F] data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all h-9"
                            >
                                Deployment Site (Apiary)
                            </TabsTrigger>
                            <TabsTrigger 
                                value="hive" 
                                className="rounded-lg text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-[#F4D03F] data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all h-9"
                            >
                                Hive Unit
                            </TabsTrigger>
                        </TabsList>

                        <div className="max-h-[65vh] overflow-y-auto pr-2 pb-2">
                            <AnimatePresence mode="wait">
                                <TabsContent value="apiary" className="m-0 focus-visible:outline-none">
                                    <ApiaryForm onSuccess={handleSuccess} onCancel={onClose} />
                                </TabsContent>
                                <TabsContent value="hive" className="m-0 focus-visible:outline-none">
                                    <HiveForm onSuccess={handleSuccess} onCancel={onClose} />
                                </TabsContent>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickActionModal;

