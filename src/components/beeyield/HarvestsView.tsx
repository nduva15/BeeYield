import React, { useState } from 'react';
import { Package, Plus, Calendar, MapPin, Hexagon, TrendingUp, Download, Filter, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageHeader, StatCard, SectionHeader, EmptyState } from './SharedPageComponents';
import { useHarvests, useCreateHarvest } from '@/hooks/useHarvests';
import { Harvest } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface HarvestsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ onTabChange, initialParams }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState<string>('all');
    const [isAddingHarvest, setIsAddingHarvest] = useState(false);

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingHarvest(true);
        }
    }, [initialParams]);

    const [formData, setFormData] = useState<Partial<Harvest>>({
        harvest_date: format(new Date(), 'yyyy-MM-dd'),
        quantity_kg: 0,
        honey_type: 'Acacia',
        nectar_source: 'Floral',
        extraction_method: 'Cold Extraction',
        color_grade: 'Light Amber',
        weather_conditions: 'Sunny',
        is_verified: true
    });

    const { data: harvests = [], isLoading } = useHarvests();
    const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalHarvests = harvests.length;
        const totalHoney = harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0);
        const thisMonth = harvests.filter(h => {
            const harvestDate = new Date(h.harvest_date);
            const now = new Date();
            return harvestDate.getMonth() === now.getMonth() &&
                harvestDate.getFullYear() === now.getFullYear();
        }).length;
        const avgPerHarvest = totalHarvests > 0 ? totalHoney / totalHarvests : 0;

        return {
            totalHarvests,
            totalHoney: totalHoney.toFixed(1),
            thisMonth,
            avgPerHarvest: avgPerHarvest.toFixed(1)
        };
    }, [harvests]);

    // Filter harvests
    const filteredHarvests = React.useMemo(() => {
        return harvests.filter(harvest => {
            const matchesSearch = searchQuery === '' ||
                harvest.batch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                harvest.honey_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = filterYear === 'all' ||
                new Date(harvest.harvest_date).getFullYear().toString() === filterYear;

            return matchesSearch && matchesYear;
        });
    }, [harvests, searchQuery, filterYear]);

    const getColorGrade = (grade?: string) => {
        const colors: Record<string, string> = {
            'Extra Light Amber': 'bg-amber-100 text-amber-700 border-amber-200',
            'Light Amber': 'bg-amber-200 text-amber-800 border-amber-300',
            'Amber': 'bg-amber-300 text-amber-900 border-amber-400',
            'Dark Amber': 'bg-amber-500 text-white border-amber-600',
        };
        return colors[grade || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.quantity_kg || formData.quantity_kg <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        createHarvest(formData as any, {
            onSuccess: () => {
                setIsAddingHarvest(false);
                setFormData({
                    harvest_date: format(new Date(), 'yyyy-MM-dd'),
                    quantity_kg: 0,
                    honey_type: 'Acacia',
                    nectar_source: 'Floral',
                    extraction_method: 'Cold Extraction',
                    color_grade: 'Light Amber',
                    weather_conditions: 'Sunny',
                    is_verified: true
                });
            }
        });
    };

    if (isAddingHarvest) {
        return (
            <div className="space-y-6 pb-12">
                <PageHeader
                    title="Log New Harvest"
                    subtitle="Record honey harvest details"
                    icon={Package}
                    onBack={() => setIsAddingHarvest(false)}
                />
                <Card className="max-w-4xl">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Harvest Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.harvest_date}
                                        onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Quantity (kg)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={formData.quantity_kg || ''}
                                        onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Honey Type
                                    </label>
                                    <Select
                                        value={formData.honey_type}
                                        onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Acacia">Acacia</SelectItem>
                                            <SelectItem value="Multifloral">Multifloral</SelectItem>
                                            <SelectItem value="Sunflower">Sunflower</SelectItem>
                                            <SelectItem value="Forest">Forest</SelectItem>
                                            <SelectItem value="Rapeseed">Rapeseed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Color Grade
                                    </label>
                                    <Select
                                        value={formData.color_grade}
                                        onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Extra Light Amber">Extra Light Amber</SelectItem>
                                            <SelectItem value="Light Amber">Light Amber</SelectItem>
                                            <SelectItem value="Amber">Amber</SelectItem>
                                            <SelectItem value="Dark Amber">Dark Amber</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Extraction Method
                                    </label>
                                    <Input
                                        placeholder="e.g. Cold Extraction"
                                        value={formData.extraction_method || ''}
                                        onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Weather Conditions
                                    </label>
                                    <Input
                                        placeholder="e.g. Sunny"
                                        value={formData.weather_conditions || ''}
                                        onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddingHarvest(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="gap-2"
                                >
                                    {isCreating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Confirm Harvest
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <PageHeader
                title="Harvests"
                subtitle="Track and manage your honey harvests"
                icon={Package}
                badge={{ text: `${stats.totalHarvests} Total`, variant: 'success' }}
                onRefresh={() => window.location.reload()}
                actions={
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Log Harvest
                    </Button>
                }
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Harvests"
                    value={stats.totalHarvests}
                    icon={Package}
                    color="amber"
                    subtitle="All time"
                />
                <StatCard
                    label="Total Honey"
                    value={`${stats.totalHoney} kg`}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Cumulative yield"
                />
                <StatCard
                    label="This Month"
                    value={stats.thisMonth}
                    icon={Calendar}
                    color="blue"
                    subtitle="Recent harvests"
                />
                <StatCard
                    label="Avg per Harvest"
                    value={`${stats.avgPerHarvest} kg`}
                    icon={Package}
                    color="purple"
                    subtitle="Average yield"
                />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by batch code or honey type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Harvests List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredHarvests.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No Harvests Found"
                    description="Start logging your honey harvests to track production and quality over time."
                    action={{
                        label: "Log First Harvest",
                        onClick: () => setIsAddingHarvest(true)
                    }}
                />
            ) : (
                <>
                    <SectionHeader
                        title="Harvest Records"
                        subtitle={`Showing ${filteredHarvests.length} of ${harvests.length} harvests`}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredHarvests.map((harvest, index) => (
                                <motion.div
                                    key={harvest.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Card
                                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-amber-500 overflow-hidden"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Package className="w-4 h-4 text-amber-600" />
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            {harvest.batch_code || 'No Batch Code'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                        {harvest.quantity_kg} kg
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {harvest.honey_type || 'Mixed Flora'}
                                                    </p>
                                                </div>
                                                {harvest.is_verified && (
                                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {format(new Date(harvest.harvest_date), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>

                                                {harvest.hive && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Hexagon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Hive: {harvest.hive.hive_code}
                                                        </span>
                                                    </div>
                                                )}

                                                {harvest.apiary && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {harvest.apiary.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {harvest.color_grade && (
                                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                                        <Badge className={getColorGrade(harvest.color_grade)}>
                                                            {harvest.color_grade}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {harvest.extraction_method && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <p className="text-xs text-gray-500">
                                                        <span className="font-semibold">Method:</span> {harvest.extraction_method}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

export default HarvestsView;
