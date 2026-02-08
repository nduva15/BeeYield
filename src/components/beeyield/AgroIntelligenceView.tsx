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

interface AIAssistantViewProps {
    onTabChange: (tab: string) => void;
}

const AgroIntelligenceView: React.FC<AIAssistantViewProps> = ({ onTabChange }) => {
    // New Dashboard Implementation for BeeYield Agro Intelligence
    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-12 space-y-8">

            {/* Header Section */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-green-700 tracking-tight">
                    Agro Intelligence
                </h1>
                <p className="text-slate-500 font-medium text-xs">
                    Advanced field monitoring - Satellite and field data
                </p>
            </div>
            {/* ... (rest of the content) */}

            {/* Hero Card */}
            <Card className="rounded-2xl border border-amber-100 shadow-sm bg-white overflow-hidden border-l-4 border-l-amber-400">
                <CardContent className="p-8">
                    <h2 className="text-lg font-bold text-green-700 mb-2">
                        Integrated field monitoring for better yield insights.
                    </h2>
                    <p className="text-slate-500 mb-6 text-sm">
                        Workflows that connect satellite imagery with hive data for deeper insights.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 font-bold px-4 py-1.5 rounded-full border-0">
                            Satellite Data
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 font-bold px-4 py-1.5 rounded-full border-0">
                            Data Analysis
                        </Badge>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 font-bold px-4 py-1.5 rounded-full border-0">
                            Pollination Metrics
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
                        "BeeYield Analysis",
                        "BeeYield Data",
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
                            onClick={() => label === "Biodiversity & Pollination" && onTabChange('precision-pollination')}
                            className="bg-white hover:bg-[#F4D03F]/10 text-gray-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/30 h-auto py-4 px-4 whitespace-normal text-center text-sm font-bold rounded-2xl shadow-sm min-h-[80px] transition-all"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Agro Intelligence Layer Flow */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">Field Data Process</h3>
                    <p className="text-xs text-slate-400 font-medium">From sensor data to actionable insights</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full overflow-x-auto pb-2">
                        <div className="flex-1 min-w-[180px] bg-amber-50 px-6 py-4 rounded-xl border border-amber-100 font-bold text-xs text-amber-700 shadow-sm flex justify-between items-center group cursor-pointer hover:bg-amber-100 transition-colors">
                            Source Data <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-green-50 px-6 py-4 rounded-xl border border-green-100 font-bold text-xs text-green-700 shadow-sm flex justify-between items-center group cursor-pointer hover:bg-green-100 transition-colors">
                            Processing Layer <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-amber-50 px-6 py-4 rounded-xl border border-amber-100 font-bold text-xs text-amber-700 shadow-sm flex justify-between items-center group cursor-pointer hover:bg-amber-100 transition-colors">
                            Analysis Models <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-green-50 px-6 py-4 rounded-xl border border-green-100 font-bold text-xs text-green-700 shadow-sm flex justify-between items-center group cursor-pointer hover:bg-green-100 transition-colors">
                            Visual Dashboard <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-amber-500 px-6 py-4 rounded-xl border border-amber-500 font-bold text-xs text-white shadow-md flex justify-center items-center group cursor-pointer transition-transform hover:scale-105 text-center">
                            Final Reports & Alerts
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Columns Grid 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Field Management */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden border-t-2 border-[#1B9157]/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Field management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Draw field boundaries on the map (polygon).</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Auto area, perimeter, and centroid.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Assign crop, season, owner, apiary, or farm.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Change history and boundary versioning.</span>
                            </li>
                        </ul>
                        <p className="text-xs text-[#1B9157]/60 mt-4 italic">Leaflet Draw + GeoJSON/PostGIS ready.</p>
                    </CardContent>
                </Card>

                {/* True and False Color Imagery */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden border-t-2 border-[#1B9157]/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">True and false color imagery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>True color (RGB) view.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>False color (NIR) view.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Timeline slider with seasonal animation.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Cloud masking using SCL.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Analytical Layers */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden border-t-2 border-[#1B9157]/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Analytical layers</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-[#1B9157]"><Share2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-[#1B9157]"><Download className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-[#1B9157]"><Maximize2 className="w-4 h-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1B9157] shrink-0" />
                            <span className="font-bold text-[#1B9157]">Nectar Index: -/10</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1B9157] shrink-0" />
                            <span className="font-bold text-[#1B9157]">Pollen Diversity: -</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Nitrogen stress monitoring.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Biomass signal.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Moisture status.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Yield estimate.</span>
                        </li>
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
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>K-means / DBSCAN on NDVI.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Zones: good / medium / weak.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Year-over-year zone comparison.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Export GeoJSON, SHP, ISOXML.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Crop Intelligence Engine */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-[#141414] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Crop Performance Engine</CardTitle>
                        <p className="text-xs text-gray-400 font-medium">Forecasting, anomalies, health.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Yield forecast (NDVI + weather).</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Anomaly detection: disease, frost, flooding.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
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
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Hive data: weight and activity.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Honey plant phenology.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Correlations: NDVI ↔ flights, weather ↔ weight gain.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                                <span>Pollination heatmap.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Story of the field Footer */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">Field Insights</h3>
                    <p className="text-xs text-slate-400 font-medium">Select a field to view details.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-xl border-none bg-green-50 flex flex-col justify-between h-28 border-l-4 border-l-green-600">
                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Weather Resilience</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">- %</p>
                        <Badge className="w-fit bg-slate-200 text-slate-500 border-none text-[8px] font-bold">PENDING</Badge>
                    </Card>
                    <Card className="p-4 rounded-xl border-none bg-amber-50 flex flex-col justify-between h-28 border-l-4 border-l-amber-500">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Growth Status</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">-<span className="text-xs"> Days</span></p>
                        <Badge className="w-fit bg-slate-200 text-slate-500 border-none text-[8px] font-bold">ANALYZING</Badge>
                    </Card>
                    <Card className="p-4 rounded-xl border-none bg-blue-50 flex flex-col justify-between h-28 border-l-4 border-l-blue-500">
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Moisture Status</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">- %</p>
                        <Badge className="w-fit bg-slate-200 text-slate-500 border-none text-[8px] font-bold">READY</Badge>
                    </Card>
                    <Card className="p-4 rounded-xl border-none bg-indigo-50 flex flex-col justify-between h-28 border-l-4 border-l-indigo-500">
                        <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Environmental Impact</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">-<span className="text-xs"> tCO2e</span></p>
                        <Badge className="w-fit bg-slate-200 text-slate-500 border-none text-[8px] font-bold">COLLECTING</Badge>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
