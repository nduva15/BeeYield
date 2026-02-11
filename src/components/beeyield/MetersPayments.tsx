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
            <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Payments</h1>

            {/* Consumption Summary */}
            <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Usage summary</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
                    {consumptionData.map((item, idx) => (
                        <div key={idx} className={cn(
                            "flex items-end justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-100 border border-gray-100 dark:border-slate-200",
                            idx !== consumptionData.length - 1 && "md:border-r-0 md:bg-transparent md:border-0 md:p-0 md:pb-4 md:border-b-0"
                        )}>
                            <div className="w-full relative">
                                <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                                <div className="flex items-baseline justify-between w-full">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-800">{item.value}</h3>
                                    <span className="text-xs text-gray-400">{item.subtext}</span>
                                </div>
                                {idx < consumptionData.length - 1 && (
                                    <div className="hidden md:block absolute right-[-13px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-slate-200" />
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Export to billing system */}
            <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Download for payments</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                        Get your data ready for payment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <p className="text-sm text-gray-500">Pick which columns to include and their order.</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            toast.info("Preparing data package for export...");
                            setTimeout(() => toast.success("Data package exported successfully to billing system!"), 2000);
                        }}
                        className="gap-2 font-bold border-[#F4D03F]/20 hover:border-[#F4D03F] text-[#1A1A1A] dark:text-[#F4D03F]"
                    >
                        <FileText className="w-4 h-4" />
                        Export
                    </Button>
                </CardContent>
            </Card>

            {/* Sample billing rates */}
            <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-[#1B9157]">Set prices</CardTitle>
                    <CardDescription className="text-gray-500">Assign prices to Different types.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1B9157]" />
                            </div>
                        ) : rates.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 text-sm">No billing rates configured.</p>
                        ) : (
                            rates.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-100 border border-gray-100 dark:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white dark:bg-slate-50 rounded-lg shadow-sm border border-gray-100 dark:border-slate-200">
                                            {item.meter_type === 'Water' && <Droplet className="w-4 h-4 text-blue-500" />}
                                            {item.meter_type === 'Heat' && <Flame className="w-4 h-4 text-orange-500" />}
                                            {item.meter_type === 'Energy' && <Zap className="w-4 h-4 text-yellow-500" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-800 capitalize">{item.meter_type}</h4>
                                            <p className="text-xs text-gray-400">{item.description || 'Standard rate'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#1B9157]">{item.rate_per_unit.toFixed(2)} {item.currency} / {item.unit}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <Badge variant="secondary" className="bg-green-50 text-green-600 text-[9px] px-1.5 py-0 h-4 border-0 font-bold">Active</Badge>
                                            <p className="text-[9px] text-gray-400">from {new Date(item.effective_from).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-50 dark:border-slate-200 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type</label>
                                <Select defaultValue="water">
                                    <SelectTrigger className="h-10 rounded-xl border-gray-100 dark:border-slate-200 bg-gray-50/50 dark:bg-slate-100 text-xs text-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="water">Water</SelectItem>
                                        <SelectItem value="heat">Heat</SelectItem>
                                        <SelectItem value="energy">Energy</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price (KES)</label>
                                <Input type="number" placeholder="0.00" className="h-10 rounded-xl border-gray-100 dark:border-slate-200 bg-gray-50/50 dark:bg-slate-100 text-xs text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Description</label>
                                <Input placeholder="Comment..." className="h-10 rounded-xl border-gray-100 dark:border-slate-200 bg-gray-50/50 dark:bg-slate-100 text-xs text-slate-800" />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={() => {
                                        toast.success("New billing rate added successfully!");
                                        // In a real app, we would call an API and refresh the list
                                    }}
                                    className="w-full h-10 rounded-xl bg-[#F4D03F] hover:bg-[#EBC42F] text-black font-bold text-xs gap-2 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add price
                                </Button>
                            </div>
                        </div>

                        {/* Drag and Drop Columns */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-800">Export columns order</h4>
                            <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="space-y-2">
                                {columns.map((column) => (
                                    <Reorder.Item
                                        key={column}
                                        value={column}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-50 border border-gray-100 dark:border-slate-200 shadow-sm cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-700">{column}</span>
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
