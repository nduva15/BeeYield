import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ChevronRight,
    ArrowRight,
    Map,
    Layers,
    Activity,
    CloudRain,
    Zap,
    Leaf,
    Sprout,
    Droplets,
    Wind,
    Sun,
    BarChart3,
    FileText,
    Settings,
    Bell,
    Share2,
    Download,
    Eye,
    Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface AIAssistantViewProps {
    onTabChange: (tab: string) => void;
}

const AgroIntelligenceView: React.FC<AIAssistantViewProps> = ({ onTabChange }) => {
    // New Dashboard Implementation for BeeYield Agro Intelligence
    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12 space-y-8">
            {/* First Steps Banner */}
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Header Section */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    BeeYield Agro Intelligence
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Moving agriculture forward - Earth Observation + AI + Agronomy
                </p>
            </div>
            {/* ... (rest of the content) */}

            {/* Hero Card */}
            <Card className="rounded-[1.5rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        We don't just monitor fields. We understand crops, climate and pollinators - together.
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Field-first workflows that connect satellite imagery, AI, and beekeeper data.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 rounded-full font-semibold border-0">
                            Earth Observation
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-1.5 rounded-full font-semibold border-0">
                            AI + Agronomy
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-4 py-1.5 rounded-full font-semibold border-0">
                            Pollinators
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick links</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Jump straight to the Copernicus tools.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        "BeeYield Agro Intelligence",
                        "BeeYield Agro Intelligence",
                        "Field Management",
                        "Field status",
                        "Saved reports",
                        "Management zones",
                        "Vegetation Health Suite",
                        "Crop Phenology",
                        "Water Stress",
                        "Biodiversity & Pollination",
                        "Yield Forecast",
                        "Vegetation (NDVI)",
                        "NDVI Anomaly Detection",
                        "Field Activity (Sentinel-1)",
                        "Carbon & ESG"
                    ].map((label, i) => (
                        <Button
                            key={i}
                            variant="secondary"
                            className="bg-[#EFF6EF] hover:bg-[#E0EFE0] text-[#3c5e3c] dark:bg-green-900/10 dark:text-green-400 dark:hover:bg-green-900/20 border border-transparent dark:border-green-900/20 h-auto py-4 px-4 whitespace-normal text-center text-sm font-semibold rounded-2xl shadow-none min-h-[80px]"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Agro Intelligence Layer Flow */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Agro Intelligence Layer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From satellites to decisions</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#141414] rounded-[2rem] border border-gray-100 dark:border-[#1e1e1e] shadow-sm flex flex-col items-center">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full overflow-x-auto pb-2">
                        <div className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#09090b] px-6 py-4 rounded-2xl border border-gray-100 dark:border-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-200 shadow-sm flex justify-between items-center group cursor-pointer hover:border-gray-200 transition-colors">
                            Copernicus Data <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#09090b] px-6 py-4 rounded-2xl border border-gray-100 dark:border-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-200 shadow-sm flex justify-between items-center group cursor-pointer hover:border-gray-200 transition-colors">
                            Agro Intelligence Layer <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#09090b] px-6 py-4 rounded-2xl border border-gray-100 dark:border-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-200 shadow-sm flex justify-between items-center group cursor-pointer hover:border-gray-200 transition-colors">
                            AI Models <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#09090b] px-6 py-4 rounded-2xl border border-gray-100 dark:border-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-200 shadow-sm flex justify-between items-center group cursor-pointer hover:border-gray-200 transition-colors">
                            BeeYield Dashboard <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#09090b] px-6 py-4 rounded-2xl border border-gray-100 dark:border-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-200 shadow-sm flex justify-center items-center group cursor-pointer hover:border-gray-200 transition-colors text-center">
                            Decisions / Reports / Alerts
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Columns Grid 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Field Management */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Field management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Draw field boundaries on the map (polygon).</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Auto area, perimeter, and centroid.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Assign crop, season, owner, apiary, or farm.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Change history and boundary versioning.</span>
                            </li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-4 italic">Leaflet Draw + GeoJSON/PostGIS ready.</p>
                    </CardContent>
                </Card>

                {/* True and False Color Imagery */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">True and false color imagery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Search apiaries, beehives" className="pl-9 bg-gray-50 dark:bg-[#09090b] border-none rounded-full h-10 text-sm" />
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>True color (RGB) view.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>False color (NIR) view.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Timeline slider with seasonal animation.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Cloud masking using SCL.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Analytical Layers */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">Analytical layers</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Share2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Download className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Maximize2 className="w-4 h-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>NDRE - nitrogen stress.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>EVI - biomass signal.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>MSAVI - early vegetation.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Moisture index - drough signal.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Yield proxy (AI).</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Columns Grid 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Management Zones */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Management zones</CardTitle>
                        <p className="text-xs text-gray-400 font-medium">Automatic segmentation of fields.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>K-means / DBSCAN on NDVI.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Zones: good / medium / weak.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Year-over-year zone comparison.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Export GeoJSON, SHP, ISOXML.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Crop Intelligence Engine */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Crop Intelligence Engine</CardTitle>
                        <p className="text-xs text-gray-400 font-medium">Forecasting, anomalies, phenology.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Yield forecast (NDVI + weather).</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Anomaly detection: disease, frost, flooding.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Phenology: start, peak biomass, senescence.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* BeeYield Integration Advantage */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">BeeYield integration advantage</CardTitle>
                        <p className="text-xs text-gray-400 font-medium">Pollinators and crops in one view.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Hive data: weight and activity.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Honey plant phenology.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Correlations: NDVI ↔ flights, weather ↔ weight gain.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                <span>Pollination heatmap.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Story of the field Footer */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Story of the field</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click a field to see the season narrative.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 rounded-[1.5rem] bg-gray-50 hover:bg-white dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border-gray-200 dark:border-[#1e1e1e] text-left justify-start px-8 font-bold text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all text-base">
                        Animated seasonal map.
                    </Button>
                    <Button variant="outline" className="h-20 rounded-[1.5rem] bg-gray-50 hover:bg-white dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border-gray-200 dark:border-[#1e1e1e] text-left justify-start px-8 font-bold text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all text-base">
                        Year-over-year comparison.
                    </Button>
                    <Button variant="outline" className="h-20 rounded-[1.5rem] bg-gray-50 hover:bg-white dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border-gray-200 dark:border-[#1e1e1e] text-left justify-start px-8 font-bold text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all text-base">
                        Timeline of operations and anomalies.
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
