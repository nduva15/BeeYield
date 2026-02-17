import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Share2,
    Download,
    Maximize2,
    Loader2,
    Satellite,
    Sprout,
    CloudRain,
    Wind,
    Sun,
    Layers,
    Map as MapIcon,
    ArrowRight
} from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard, SectionHeader, QuickActionCard } from './SharedPageComponents';

interface AgroIntelligenceViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const AgroIntelligenceView: React.FC<AgroIntelligenceViewProps> = ({ onTabChange }) => {
    const [weather, setWeather] = useState<any>(null);
    const [satellite, setSatellite] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch latest weather and satellite data
                const [weatherData, satelliteData] = await Promise.all([
                    beeyieldService.getWeatherHistory().then(res => res && res.length > 0 ? res[0] : null),
                    beeyieldService.getSatelliteIndices().then(res => res && res.length > 0 ? res[0] : null)
                ]);
                setWeather(weatherData);
                setSatellite(satelliteData);
            } catch (err) {
                console.error('Error loading agro intelligence data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived stats or defaults
    const moisture = satellite?.soil_moisture_index ? Math.round(satellite.soil_moisture_index * 100) : null;
    const vegetation = satellite?.ndvi ? Math.round(satellite.ndvi * 100) / 100 : null;
    const carbonScore = satellite?.ndvi ? Math.round(satellite.ndvi * 1000) : null; // Mock carbon logic

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <PageHeader
                title="Agro Intelligence"
                subtitle="Integrated Field Monitoring & Smart insights"
                icon={Satellite}
                badge={{ text: "Copernicus Data Active", variant: "success" }}
            />

            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Weather Status"
                    value={loading ? "..." : weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'No Data'}
                    icon={Sun}
                    color="amber"
                    subtitle="Based on cloud cover"
                />
                <StatCard
                    label="Soil Moisture"
                    value={loading ? "..." : moisture != null ? `${moisture}%` : 'No Data'}
                    icon={CloudRain}
                    color="blue"
                    subtitle="Satellite derived"
                />
                <StatCard
                    label="Vegetation Index"
                    value={loading ? "..." : vegetation != null ? vegetation : 'No Data'}
                    icon={Sprout}
                    color="green"
                    subtitle="NDVI Score"
                />
                <StatCard
                    label="Green Score"
                    value={loading ? "..." : carbonScore != null ? carbonScore : 'No Data'}
                    icon={Wind}
                    color="green"
                    subtitle="Carbon capture proxy"
                />
            </div>

            {/* Hero / Promo Card */}
            <Card className="bg-gradient-to-r from-emerald-900 to-emerald-800 border-none shadow-lg text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Satellite className="w-64 h-64 transform rotate-12" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="max-w-2xl">
                        <Badge className="bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 mb-4 border-none">
                            DATA-POWERED INSIGHTS
                        </Badge>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">
                            We don't just monitor fields. We understand crops, climate and pollinators - together.
                        </h2>
                        <p className="text-emerald-100/80 mb-8 text-lg">
                            Leverage advanced satellite imagery and advanced analytics to optimize your apiary locations and crop management strategies.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => onTabChange('precision-pollination')}
                                className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
                            >
                                Explore Pollination Data
                            </Button>
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                                View Documentation
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <div className="space-y-4">
                <SectionHeader title="Quick Links" subtitle="Jump straight to Copernicus tools" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    <QuickActionCard
                        title="Field Status"
                        icon={MapIcon}
                        description="View current field conditions"
                        onClick={() => { }}
                    />
                    <QuickActionCard
                        title="Alert Finder"
                        icon={Share2}
                        description="Identify potential risks"
                        onClick={() => { }}
                    />
                    <QuickActionCard
                        title="Water Levels"
                        icon={CloudRain}
                        description="Track hydration metrics"
                        onClick={() => { }}
                    />
                    <QuickActionCard
                        title="Growth Tracking"
                        icon={Sprout}
                        description="Monitor crop development"
                        onClick={() => { }}
                    />
                </div>
            </div>

            {/* How It Works */}
            <div className="space-y-4">
                <SectionHeader title="Workflow" subtitle="From satellite images to farming choices" />
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                            {[
                                { title: "Satellite Images", icon: Satellite, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                                { title: "Data Analysis", icon: Layers, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
                                { title: "Growth Tracking", icon: Sprout, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                                { title: "Actionable Insights", icon: Sun, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }
                            ].map((step, i, arr) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default w-full md:w-auto flex-1">
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", step.bg)}>
                                            <step.icon className={cn("w-6 h-6", step.color)} />
                                        </div>
                                        <span className="font-bold text-sm">{step.title}</span>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <ArrowRight className="w-6 h-6 text-gray-300 transform rotate-90 md:rotate-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-primary" />
                            Field Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {[
                                "Draw field boundaries on the map (polygon)",
                                "Auto area, perimeter, and centroid calculation",
                                "Assign crop, season, owner, apiary, or farm",
                                "Change history and boundary versioning"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Data Layers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {[
                                "Normal view (RGB) & Infrared view (NIR)",
                                "Nectar Flow Index & Pollen Diversity heatmaps",
                                "EVI (growth signal) & NDRE (nitrogen status)",
                                "Timeline slider with seasonal animation"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
