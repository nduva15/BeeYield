import React, { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Droplet, Flame, Zap, FileText, CreditCard, ChevronRight, GripVertical, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MetersPaymentsProps {
    onTabChange?: (tab: string) => void;
}

const MetersPayments: React.FC<MetersPaymentsProps> = ({ onTabChange = () => { } }) => {
    const consumptionData = [
        { label: 'Electricity usage', value: '12,483 kWh', subtext: 'last month', icon: Zap },
        { label: 'Water usage', value: '3,842 m3', subtext: 'last month', icon: Droplet },
        { label: 'Heat usage', value: '1203 GJ', subtext: 'last month', icon: Flame },
    ];

    const billingRates = [
        { medium: 'Water', rate: '7.20 PLN / m3', description: 'Example rate' },
        { medium: 'Heat', rate: '38.00 PLN / GJ', description: 'Example rate' },
        { medium: 'Energy', rate: '1.05 PLN / kWh', description: 'Example rate' },
    ];

    const [columns, setColumns] = useState([
        'Meter ID',
        'Meter number',
        'Building address',
        'Apartment',
        'Status',
        'Reading'
    ]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Payments & settlements</h1>

            {/* Consumption Summary */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Consumption summary</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
                    {consumptionData.map((item, idx) => (
                        <div key={idx} className={cn(
                            "flex items-end justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800",
                            idx !== consumptionData.length - 1 && "md:border-r-0 md:bg-transparent md:border-0 md:p-0 md:pb-4 md:border-b-0" // Just making them look like the screenshot which is one unified card with dividers? 
                            // Actually screenshot looks like 3 distinct blocks inside the card or just 3 columns. 
                            // Let's stick to simple columns.
                        )}>
                            <div className="w-full relative">
                                <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                                <div className="flex items-baseline justify-between w-full">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</h3>
                                    <span className="text-xs text-gray-400">{item.subtext}</span>
                                </div>
                                {idx < consumptionData.length - 1 && (
                                    <div className="hidden md:block absolute right-[-13px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-gray-800" />
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Export to billing system */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Export to billing system</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                        Prepare a data package for settlements.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <p className="text-sm text-gray-500">Choose export columns and their order.</p>
                    <Button variant="outline" className="gap-2 font-bold border-[#F4D03F]/20 hover:border-[#F4D03F] text-[#1A1A1A] dark:text-[#F4D03F]">
                        <FileText className="w-4 h-4" />
                        Export
                    </Button>
                </CardContent>
            </Card>

            {/* Sample billing rates */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-[#1B9157]">Sample billing rates</CardTitle>
                    <CardDescription className="text-gray-500">Assign rates per medium for settlements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                    {/* Rates List */}
                    <div className="space-y-4">
                        {billingRates.map((rate, idx) => (
                            <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-bold uppercase text-[10px] tracking-widest text-[#1B9157] mb-0.5">{rate.medium}</p>
                                    <p className="text-xs text-gray-400">{rate.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-[#1B9157]">{rate.rate}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Rate Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 p-6 rounded-2xl border border-[#F4D03F]/20">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1B9157] uppercase tracking-wider">Medium</label>
                            <Select>
                                <SelectTrigger className="bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 focus:ring-[#F4D03F]/20 focus:border-[#F4D03F]/50 h-11 rounded-xl">
                                    <SelectValue placeholder="Water" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="heat">Heat</SelectItem>
                                    <SelectItem value="energy">Energy</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1B9157] uppercase tracking-wider">Rate</label>
                            <Input placeholder="e.g. 7.20" className="bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 focus:ring-[#F4D03F]/20 focus:border-[#F4D03F]/50 h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1B9157] uppercase tracking-wider">Unit</label>
                            <Input placeholder="m3" className="bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 focus:ring-[#F4D03F]/20 focus:border-[#F4D03F]/50 h-11 rounded-xl" />
                        </div>
                        <Button className="bg-[#F4D03F] text-[#1A1A1A] hover:bg-[#e0be36] font-bold h-11 rounded-xl shadow-lg shadow-yellow-500/10">Add rate</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Export columns */}
            <div className="bg-[#1B9157]/5 dark:bg-[#1B9157]/10 p-8 rounded-[2.5rem] border border-[#1B9157]/10 -mx-2 md:-mx-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h3 className="text-xl font-bold text-[#1B9157]">Export columns</h3>
                    <div className="flex items-center gap-2">
                        {/* Search Bar matching screenshot approximately */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B9157]/50" />
                            <Input
                                placeholder="Search apiaries, beehives"
                                className="pl-11 h-12 w-[320px] bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-800 shadow-sm rounded-full text-sm focus:ring-[#F4D03F]/20 focus:border-[#F4D03F]/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="space-y-3">
                    {columns.map((col) => (
                        <SortableItem key={col} item={col} />
                    ))}
                </Reorder.Group>
            </div>

            {/* Next step */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span className="w-2 h-8 bg-[#F4D03F] rounded-full"></span>
                    Next step
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-[#1B9157]">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#1B9157] transition-colors">Invoices</h4>
                                <p className="text-sm text-gray-400">Recurring generation</p>
                            </div>
                            <Badge variant="outline" className="border-[#1B9157]/20 text-[#1B9157] uppercase text-[10px] font-bold px-3 py-1 bg-[#1B9157]/5">MVP+</Badge>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-[#F4D03F]">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#F4D03F] transition-colors">Online payments</h4>
                                <p className="text-sm text-gray-400">Gateway integrations</p>
                            </div>
                            <Badge variant="outline" className="border-[#F4D03F]/20 text-[#7a6820] dark:text-[#F4D03F] uppercase text-[10px] font-bold px-3 py-1 bg-[#F4D03F]/5">MVP+</Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MetersPayments;

const SortableItem = ({ item }: { item: string }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            className="flex items-center gap-3 p-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative select-none"
        >
            <div
                className="cursor-move touch-none"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="w-5 h-5 text-gray-300" />
            </div>
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center pointer-events-none">
                {/* Pseudorandom icon or hash */}
                <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                    <div className="bg-gray-400 rounded-[1px]"></div>
                    <div className="bg-gray-400 rounded-[1px]"></div>
                    <div className="bg-gray-400 rounded-[1px]"></div>
                    <div className="bg-gray-400 rounded-[1px]"></div>
                </div>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
        </Reorder.Item>
    );
};
