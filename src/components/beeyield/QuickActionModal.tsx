import React from 'react';
import {
    Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from 'framer-motion';
import { ApiaryForm } from './ApiaryForm';
import { HiveForm } from './HiveForm';
import { cn } from '@/lib/utils';
import { glass, GlassModal } from './GlassTheme';

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
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create new asset"
            subtitle="Configure a deployment site (apiary) or register a hive unit."
            maxWidth={activeTab === 'apiary' ? 'max-w-4xl' : 'max-w-xl'}
        >
            <div className="space-y-6">
                <div className={cn('inline-flex items-center gap-2 w-fit', glass.badge, 'bg-[#F4D03F]/10 border-[#F4D03F]/20 text-[#1A1A1A]/70')}>
                    <Plus className="w-3.5 h-3.5 text-[#F4D03F]" aria-hidden="true" focusable="false" />
                    <span className="text-[10px] font-black tracking-wider uppercase">New record</span>
                </div>

                <Tabs defaultValue="apiary" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/40 p-1.5 h-12 rounded-xl border border-[#F4D03F]/10 shadow-sm">
                        <TabsTrigger
                            value="apiary"
                            className="rounded-lg text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-[#F4D03F] data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-md transition-all h-9"
                        >
                            Deployment Site (Apiary)
                        </TabsTrigger>
                        <TabsTrigger
                            value="hive"
                            className="rounded-lg text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-[#F4D03F] data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-md transition-all h-9"
                        >
                            Hive Unit
                        </TabsTrigger>
                    </TabsList>

                    <div className="max-h-[65vh] overflow-y-auto pr-2 pb-1 mt-6">
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
        </GlassModal>
    );
};

export default QuickActionModal;
