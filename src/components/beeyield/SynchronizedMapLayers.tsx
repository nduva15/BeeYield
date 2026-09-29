import React, { useEffect, useState, useMemo } from 'react';
import { useMap, Polygon, Circle, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, MapPin, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapHivePin {
    id: string;
    code?: string;
    lat: number;
    lng: number;
    status?: string;
    temperature_c?: number | null;
    isOptimized?: boolean;
}

interface SynchronizedMapLayersProps {
    boundaryPolygon?: [number, number][]; // [[lat, lng], ...]
    hivePins: MapHivePin[];
    selectedHiveId?: string | null;
    onSelectHive?: (id: string) => void;
    showHeatmap?: boolean;
    coverageRadiusMeters?: number;
    onBoundaryCalculated?: (bounds: L.LatLngBounds) => void;
}

/**
 * SynchronizedMapLayers: Eliminates map layer race conditions by enforcing strict
 * lifecycle synchronization: Boundary Calculation -> FitBounds Viewport -> Hive Pins Overlay.
 * Includes GPS Drift detection for pins falling outside orchard boundaries.
 */
export const SynchronizedMapLayers: React.FC<SynchronizedMapLayersProps> = ({
    boundaryPolygon = [],
    hivePins = [],
    selectedHiveId,
    onSelectHive,
    showHeatmap = true,
    coverageRadiusMeters = 800,
    onBoundaryCalculated
}) => {
    const map = useMap();
    const [boundaryReady, setBoundaryReady] = useState<boolean>(false);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

    // 1. Calculate and lock field boundary first
    useEffect(() => {
        if (!boundaryPolygon || boundaryPolygon.length < 3) {
            // No polygon boundary, use pins bounds if available
            if (hivePins.length > 0) {
                const validPins = hivePins.filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0);
                if (validPins.length > 0) {
                    const bounds = L.latLngBounds(validPins.map(p => [p.lat, p.lng]));
                    map.fitBounds(bounds.pad(0.25), { animate: true });
                    setMapBounds(bounds);
                    setBoundaryReady(true);
                    onBoundaryCalculated?.(bounds);
                }
            }
            return;
        }

        try {
            const bounds = L.latLngBounds(boundaryPolygon.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds.pad(0.2), { animate: true });
            setMapBounds(bounds);
            setBoundaryReady(true);
            onBoundaryCalculated?.(bounds);
        } catch (e) {
            console.error('Failed to compute boundary bounds:', e);
            setBoundaryReady(true);
        }
    }, [boundaryPolygon, hivePins, map, onBoundaryCalculated]);

    // 2. Boundary containment & GPS Drift detection
    const processedPins = useMemo(() => {
        if (!boundaryReady) return [];

        return hivePins.map(pin => {
            const isValidCoord = !isNaN(pin.lat) && !isNaN(pin.lng) && pin.lat !== 0 && pin.lng !== 0;
            let isInsideBoundary = true;

            if (mapBounds && isValidCoord) {
                isInsideBoundary = mapBounds.contains([pin.lat, pin.lng]);
            }

            return {
                ...pin,
                isValidCoord,
                isInsideBoundary
            };
        });
    }, [hivePins, boundaryReady, mapBounds]);

    // Do not render pins if boundary is still resolving (prevents floating pins race condition)
    if (!boundaryReady && (boundaryPolygon.length > 0 || hivePins.length > 0)) {
        return null;
    }

    return (
        <>
            {/* 1. Field Boundary Layer */}
            {boundaryPolygon.length >= 3 && (
                <Polygon
                    positions={boundaryPolygon as any}
                    pathOptions={{
                        color: '#1B9157',
                        weight: 2.5,
                        fillColor: '#2ECC71',
                        fillOpacity: 0.12,
                        dashArray: '6, 6'
                    }}
                />
            )}

            {/* 2. Coverage Circles for Optimized Hive Radii */}
            {processedPins.map((pin) => {
                if (!pin.isValidCoord) return null;
                return (
                    <Circle
                        key={`coverage-${pin.id}`}
                        center={[pin.lat, pin.lng]}
                        radius={coverageRadiusMeters}
                        pathOptions={{
                            color: pin.isInsideBoundary ? '#F4D03F' : '#EF4444',
                            weight: 1,
                            fillColor: '#F4D03F',
                            fillOpacity: 0.05,
                            dashArray: '4, 4'
                        }}
                    />
                );
            })}

            {/* 3. Synchronized Hive Pins (Mounted safely after boundary is locked) */}
            {processedPins.map((pin, idx) => {
                if (!pin.isValidCoord) return null;
                const isSelected = selectedHiveId === pin.id;

                const fillColor = !pin.isInsideBoundary 
                    ? '#EF4444' // Red for GPS Drift
                    : pin.isOptimized 
                        ? '#F59E0B' // Gold
                        : '#1B9157'; // Green

                return (
                    <CircleMarker
                        key={`pin-${pin.id}`}
                        center={[pin.lat, pin.lng]}
                        radius={isSelected ? 11 : 8}
                        pathOptions={{
                            color: isSelected ? '#1A1A1A' : '#FFFFFF',
                            fillColor,
                            fillOpacity: 0.95,
                            weight: isSelected ? 3 : 2,
                        }}
                        eventHandlers={{
                            click: () => onSelectHive?.(pin.id)
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 space-y-1.5 min-w-[190px]">
                                <div className="flex items-center justify-between border-b pb-1">
                                    <span className="text-xs font-bold text-foreground">
                                        {pin.code || `Colony #${idx + 1}`}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                        pin.isInsideBoundary 
                                            ? "bg-emerald-100 text-emerald-800" 
                                            : "bg-red-100 text-red-800"
                                    )}>
                                        {pin.isInsideBoundary ? "INSIDE FIELD" : "GPS DRIFT"}
                                    </span>
                                </div>

                                {!pin.isInsideBoundary && (
                                    <div className="flex items-start gap-1 p-1 bg-red-50 text-red-700 rounded text-[10px]">
                                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                        <span>Coordinates placed outside active orchard perimeter.</span>
                                    </div>
                                )}

                                <p className="text-[11px] text-muted-foreground font-mono">
                                    GPS: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                                </p>

                                {pin.temperature_c !== null && pin.temperature_c !== undefined && (
                                    <p className="text-[11px] font-medium text-foreground">
                                        Brood Core: <strong className="text-amber-600">{pin.temperature_c.toFixed(1)}°C</strong>
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
};
