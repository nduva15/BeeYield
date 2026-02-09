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
                <h1 className="text-3xl font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">
                    BeeYield Insights
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Moving agriculture forward - Earth Observation + Insights + Agronomy
                </p>
            </div>
            {/* ... (rest of the content) */}

            {/* Hero Card */}
            <Card className="rounded-[1.5rem] border border-[#F4D03F]/20 shadow-sm bg-white dark:bg-[#141414] overflow-hidden border-l-4 border-l-[#F4D03F]">
                <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-[#1B9157] dark:text-white mb-2">
                        We don't just monitor fields. We understand crops, climate and pollinators - together.
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Field-first workflows that connect satellite imagery, analysis, and beekeeper data.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-[#1B9157]/10 text-[#1B9157] hover:bg-[#1B9157]/20 dark:bg-[#1B9157]/30 dark:text-[#1B9157] px-4 py-1.5 rounded-full font-semibold border-0">
                            Earth Observation
                        </Badge>
                        <Badge variant="secondary" className="bg-[#F4D03F]/10 text-[#7a6820] hover:bg-[#F4D03F]/20 dark:bg-[#F4D03F]/30 dark:text-[#F4D03F] px-4 py-1.5 rounded-full font-semibold border-0">
                            Insights + Agronomy
                        </Badge>
                        <Badge variant="secondary" className="bg-[#1B9157]/10 text-[#1B9157] hover:bg-[#1B9157]/20 dark:bg-[#1B9157]/30 dark:text-[#1B9157] px-4 py-1.5 rounded-full font-semibold border-0">
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
                        "BeeYield Intelligence",
                        "BeeYield Intelligence",
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">BeeYield Analysis Layer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From satellites to decisions</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#141414] rounded-[2rem] border border-[#F4D03F]/20 dark:border-[#F4D03F]/10 shadow-sm flex flex-col items-center">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full overflow-x-auto pb-2">
                        <div className="flex-1 min-w-[180px] bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 px-6 py-4 rounded-2xl border border-[#F4D03F]/20 dark:border-[#F4D03F]/20 font-bold text-sm text-[#7a6820] dark:text-[#F4D03F] shadow-sm flex justify-between items-center group cursor-pointer hover:bg-[#F4D03F]/10 transition-colors">
                            Copernicus Data <span className="text-[#F4D03F] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-[#1B9157]/5 dark:bg-[#1B9157]/10 px-6 py-4 rounded-2xl border border-[#1B9157]/20 dark:border-[#1B9157]/20 font-bold text-sm text-[#1B9157] dark:text-[#1B9157] shadow-sm flex justify-between items-center group cursor-pointer hover:bg-[#1B9157]/10 transition-colors">
                            BeeYield Analysis Layer <span className="text-[#1B9157] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 px-6 py-4 rounded-2xl border border-[#F4D03F]/20 dark:border-[#F4D03F]/20 font-bold text-sm text-[#7a6820] dark:text-[#F4D03F] shadow-sm flex justify-between items-center group cursor-pointer hover:bg-[#F4D03F]/10 transition-colors">
                            Predictive Models <span className="text-[#F4D03F] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-[#1B9157]/5 dark:bg-[#1B9157]/10 px-6 py-4 rounded-2xl border border-[#1B9157]/20 dark:border-[#1B9157]/20 font-bold text-sm text-[#1B9157] dark:text-[#1B9157] shadow-sm flex justify-between items-center group cursor-pointer hover:bg-[#1B9157]/10 transition-colors">
                            BeeYield Dashboard <span className="text-[#1B9157] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-[#F4D03F] px-6 py-4 rounded-2xl border border-[#F4D03F] font-bold text-sm text-[#1A1A1A] shadow-md flex justify-center items-center group cursor-pointer transition-transform hover:scale-105 text-center">
                            Decisions / Reports / Alerts
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
                            <span className="font-bold text-[#1B9157]">Nectar Flow Index: -/10</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1B9157] shrink-0" />
                            <span className="font-bold text-[#1B9157]">Pollen Diversity: -</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>NDRE - nitrogen stress.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>EVI - biomass signal.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Moisture index - drough signal.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F4D03F] shrink-0" />
                            <span>Yield proxy.</span>
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
                        <CardTitle className="text-lg font-bold">Crop Analysis Engine</CardTitle>
                        <p className="text-xs text-gray-400 font-medium">Forecasting, anomalies, phenology.</p>
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Story of the field</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click a field to see the season narrative.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl border-none bg-[#1B9157]/5 dark:bg-[#1B9157]/10 flex flex-col justify-between h-28 border-l-4 border-l-[#1B9157]">
                        <p className="text-[10px] font-black text-[#1B9157] uppercase tracking-widest">Weather Resilience</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">- %</p>
                        <Badge className="w-fit bg-gray-500/20 text-gray-600 border-none text-[8px] font-black">PENDING</Badge>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 flex flex-col justify-between h-28 border-l-4 border-l-[#F4D03F]">
                        <p className="text-[10px] font-black text-[#7a6820] dark:text-[#F4D03F] uppercase tracking-widest">Crop-Sync Delay</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">-<span className="text-xs"> Days</span></p>
                        <Badge className="w-fit bg-gray-500/20 text-gray-600 border-none text-[8px] font-black">CALCULATING</Badge>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none bg-blue-50 dark:bg-blue-900/10 flex flex-col justify-between h-28 border-l-4 border-l-blue-500">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Moisture Saturation</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">- %</p>
                        <Badge className="w-fit bg-gray-500/20 text-gray-600 border-none text-[8px] font-black">INITIALIZING</Badge>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none bg-indigo-50 dark:bg-indigo-900/10 flex flex-col justify-between h-28 border-l-4 border-l-indigo-500">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Carbon Impact</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">-<span className="text-xs"> tCO2e</span></p>
                        <Badge className="w-fit bg-gray-500/20 text-gray-600 border-none text-[8px] font-black">COLLECTING</Badge>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
