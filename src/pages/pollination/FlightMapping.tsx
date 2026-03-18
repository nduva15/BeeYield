import React from 'react';
import {
    Map as MapIcon,
    Navigation,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FlightMapping: React.FC = () => {
    return (
        <BeeYieldPageShell className="bg-[#FFF9F0] text-[#064e3b] font-sans antialiased p-8 md:p-12 -m-0 md:-m-0">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Back Link */}
                <Link to="/precision-pollination" className="inline-flex items-center gap-2 text-[10px] font-black text-[#10b981] hover:text-[#064e3b] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </Link>

                {/* Header */}
                <div className="border-b-4 border-[#064e3b] pb-8">
                    <h1 className="text-6xl font-black tracking-tighter leading-none">
                        Flight <span className="text-[#10b981]">Mapping</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-[10px] mt-4">
                        Enterprise Geospatial Analysis // v2.4.0
                    </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="border-4 border-[#064e3b] bg-[#FFF9F0] h-[700px] relative overflow-hidden group shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] z-0">
                        <MapContainer
                            center={[-2.42, 37.97]}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                            // @ts-ignore
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution='&copy; ESRI Satellite'
                            />

                            {/* Node Alpha */}
                            <Marker position={[-2.42, 37.97]}>
                                <Popup className="font-bold">
                                    <div className="p-2">
                                        <p className="text-xs font-black text-[#10b981]">Node Alpha</p>
                                        <p className="text-[10px] text-gray-400">Primary Hive Colony</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Node Beta */}
                            <Marker position={[-2.425, 37.975]}>
                                <Popup className="font-bold">
                                    <div className="p-2">
                                        <p className="text-xs font-black text-[#10b981]">Node Beta</p>
                                        <p className="text-[10px] text-gray-400">Expansion Unit</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Flight Path */}
                            <Polyline
                                positions={[
                                    [-2.42, 37.97],
                                    [-2.422, 37.972],
                                    [-2.425, 37.975]
                                ]}
                                pathOptions={{
                                    color: '#10b981',
                                    weight: 3,
                                    dashArray: '10, 10',
                                    opacity: 0.8
                                }}
                            />

                            {/* Coverage Area */}
                            <Circle
                                center={[-2.42, 37.97]}
                                radius={800}
                                pathOptions={{
                                    color: '#facc15',
                                    fillColor: '#facc15',
                                    fillOpacity: 0.05,
                                    weight: 1,
                                    dashArray: '5, 5'
                                }}
                            />
                        </MapContainer>

                        {/* Legend Overlay */}
                        <div className="absolute bottom-8 right-8 space-y-2 p-6 bg-[#FFF9F0] border-4 border-[#064e3b] shadow-[6px_6px_0px_0px_#064e3b] z-[1000]">
                            <h5 className="font-black text-[10px] border-b-2 border-black pb-2 mb-4">Flight Analysis</h5>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-1 bg-[#10b981] dashed" style={{ borderBottom: '2px dashed #10b981' }} />
                                <span className="text-[8px] font-black text-[#064e3b]/60 uppercase tracking-tighter">High Intensity Route</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#facc15] rotate-45 border-2 border-[#064e3b]" />
                                <span className="text-[8px] font-black text-[#064e3b]/60 uppercase tracking-tighter">Deployed Hive</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Active Map Layer</p>
                            <h4 className="text-xl font-black">Satellite / Tactical Overlay</h4>
                        </div>
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Tracked Units</p>
                            <h4 className="text-xl font-black">45 Colonies</h4>
                        </div>
                        <div className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-2">
                            <p className="text-[10px] font-black text-neutral-400">Coverage Index</p>
                            <h4 className="text-xl font-black text-[#10b981]">98.2% Optimal</h4>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
            `}} />
        </BeeYieldPageShell>
    );
};

export default FlightMapping;
