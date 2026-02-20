import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Droplet, Flame, Zap, FileText, CreditCard, ChevronRight, GripVertical, Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { meterService, BillingRate } from '@/services/meterService';
import { toast } from 'sonner';

interface MetersPaymentsProps {
    onTabChange?: (tab: string) => void;
}

const MetersPayments: React.FC<MetersPaymentsProps> = ({ onTabChange = () => { } }) => {
    const [rates, setRates] = useState<BillingRate[]>([]);
    const [loading, setLoading] = useState(true);

    const consumptionData = [
        { label: 'Energy usage', value: '12,483 Units', subtext: 'last month', icon: Zap },
        { label: 'Water usage', value: '3,842 m3', subtext: 'last month', icon: Droplet },
        { label: 'Heat/Fuel usage', value: '1,203 GJ', subtext: 'last month', icon: Flame },
    ];

    const [columns, setColumns] = useState([
        'Sensor ID',
        'Device number',
        'Apiary address',
        'Hive / Unit',
        'Level',
        'Reading'
    ]);

    useEffect(() => {
        const loadRates = async () => {
            setLoading(true);
            try {
                const data = await meterService.getBillingRates();
                setRates(data);
            } catch (error) {
                console.error('Failed to load billing rates', error);
                toast.error('Failed to load billing rates');
            } finally {
                setLoading(false);
            }
        };
        loadRates();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                    <CreditCard className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Usage & Settlement Registry</span>
                </div>
                <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Financial <span className="text-[#10b981]">Logistics</span></h1>
            </div>

            {/* Consumption Summary */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b-4 border-[#064e3b]/10 bg-neutral-50/30">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#10b981]" />
                        <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Consumption Matrix</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-0 p-0 divide-x-4 divide-[#064e3b]/10">
                    {consumptionData.map((item, idx) => (
                        <div key={idx} className="p-8 hover:bg-[#facc15]/5 transition-none">
                            <div className="w-full">
                                <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] mb-3">{item.label}</p>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-[#064e3b] tracking-tighter uppercase">{item.value}</h3>
                                    <p className="text-[9px] font-black text-[#10b981] uppercase tracking-widest">{item.subtext}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Export to billing system */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] overflow-hidden text-white">
                <CardHeader className="p-8 pb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#facc15]" />
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Batch Settlement Export</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <p className="text-lg font-black text-white/90 uppercase tracking-tighter leading-none">Compile Payment Archives</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select dimensions for recursive billing processing.</p>
                    </div>
                    <Button
                        onClick={() => {
                            toast.info("Preparing data package for export...");
                            setTimeout(() => toast.success("Data package exported successfully to billing system!"), 2000);
                        }}
                        className="rounded-none h-14 px-12 bg-[#facc15] text-[#064e3b] hover:bg-white border-4 border-[#064e3b] font-black uppercase text-xs tracking-[0.2em] transition-none shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        EXECUTE BATCH EXPORT
                    </Button>
                </CardContent>
            </Card>

            {/* Sample billing rates */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b-4 border-[#064e3b]/10 bg-neutral-50/30">
                    <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Billing Parameterization</CardTitle>
                    <CardDescription className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-widest mt-1">Define resource-specific valuation weights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                    <div className="space-y-4 px-8 pt-8">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-10 h-10 animate-spin text-[#10b981]" />
                            </div>
                        ) : rates.length === 0 ? (
                            <div className="text-center py-12 border-4 border-dashed border-[#064e3b]/10 bg-neutral-50/50">
                                <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Zero-rate configuration detected.</p>
                            </div>
                        ) : (
                            rates.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 rounded-none bg-neutral-50/50 border-2 border-[#064e3b]/10 hover:border-[#064e3b]/40 transition-none">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-none bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981] text-white">
                                            {item.meter_type === 'Water' && <Droplet className="w-5 h-5" />}
                                            {item.meter_type === 'Heat' && <Flame className="w-5 h-5" />}
                                            {item.meter_type === 'Energy' && <Zap className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-[#064e3b] uppercase tracking-tighter">{item.meter_type} RATE</h4>
                                            <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-widest mt-0.5">{item.description || 'Global standard settlement'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-[#064e3b] uppercase">{item.rate_per_unit.toFixed(2)} <span className="text-xs text-[#10b981]">{item.currency} / {item.unit}</span></p>
                                        <div className="flex items-center justify-end gap-3 mt-2">
                                            <Badge className="rounded-none bg-[#10b981] text-white text-[8px] font-black px-2 py-0.5 border-2 border-[#064e3b] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]">ACTIVE_PROTOCOL</Badge>
                                            <p className="text-[9px] font-black text-[#064e3b]/20 uppercase tracking-[0.1em]">EFF_DATE: {new Date(item.effective_from).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 pt-4 border-t-4 border-[#064e3b]/5 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Tele-Type</label>
                                <Select defaultValue="water">
                                    <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus:ring-0 transition-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                        <SelectItem value="water" className="uppercase font-black text-[10px]">Water</SelectItem>
                                        <SelectItem value="heat" className="uppercase font-black text-[10px]">Heat</SelectItem>
                                        <SelectItem value="energy" className="uppercase font-black text-[10px]">Energy</SelectItem>
                                        <SelectItem value="other" className="uppercase font-black text-[10px]">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Weight Ratio (KES)</label>
                                <Input type="number" placeholder="0.00" className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Annotation</label>
                                <Input placeholder="Comment..." className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none" />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={() => {
                                        toast.success("New billing rate added successfully!");
                                    }}
                                    className="w-full h-12 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] border-2 border-[#064e3b] font-black uppercase text-xs tracking-widest transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1 gap-3"
                                >
                                    <Plus className="w-5 h-5 mr-1" /> Commit Weight
                                </Button>
                            </div>
                        </div>

                        {/* Drag and Drop Columns */}
                        <div className="space-y-6 pt-4">
                            <div>
                                <h4 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Recursive Dimensionality</h4>
                                <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Configure hierarchical ordering for batch output</p>
                            </div>
                            <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {columns.map((column) => (
                                    <Reorder.Item
                                        key={column}
                                        value={column}
                                        className="flex items-center justify-between p-4 rounded-none bg-white border-4 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] cursor-grab active:cursor-grabbing hover:bg-[#facc15]/5 transition-none group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-none bg-neutral-50 flex items-center justify-center border-2 border-[#064e3b]/10 group-hover:bg-[#facc15]/20 group-hover:border-[#064e3b]/30">
                                                <GripVertical className="w-4 h-4 text-[#064e3b]/30" />
                                            </div>
                                            <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">{column}</span>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersPayments;
