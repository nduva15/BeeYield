import React from 'react';
import {
  Activity,
  AlertCircle,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Satellite,
  Target,
  Thermometer,
  Wind,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useApiaries } from '@/hooks/useHives';
import { useHivesWithTelemetry } from '@/hooks/useHives';
import { useSensorAlerts } from '@/hooks/useSensorAlerts';
import {
  BeeYieldBadge,
  BeeYieldEmptyState,
  BeeYieldLoading,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import {
  describeCoverageAction,
  deriveCoverageMetrics,
  filterAlertsByApiary,
} from '@/lib/pollinationInsights';
import { beeyieldService, CropPollinationRequirement } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';

const getNumeric = (...values: Array<number | string | null | undefined>) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const EMPTY_APIARIES: any[] = [];
const EMPTY_ALERTS: any[] = [];

interface SpatialCoverageViewProps {
  embedded?: boolean;
}

const SpatialCoverageView: React.FC<SpatialCoverageViewProps> = ({ embedded = false }) => {
  const [viewMode, setViewMode] = React.useState<'kernel' | 'nodes'>('kernel');
  const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
  const [selectedHiveId, setSelectedHiveId] = React.useState<string | null>(null);
  const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);

  const apiariesQuery = useApiaries();
  const alertsQuery = useSensorAlerts(false);
  const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
  const selectedApiary = React.useMemo(
    () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
    [apiaries, selectedApiaryId],
  );

  const { hives, isLoading: hivesLoading, refetch: refetchHives } = useHivesWithTelemetry(selectedApiaryId || undefined);
  const { data: weatherSummary, isLoading: weatherLoading } = useApiaryWeatherSummary(selectedApiary?.id);
  const activeAlerts = React.useMemo(
    () => filterAlertsByApiary(alertsQuery.data ?? EMPTY_ALERTS, selectedApiaryId, hives),
    [alertsQuery.data, hives, selectedApiaryId],
  );

  React.useEffect(() => {
    if (!selectedApiaryId && apiaries.length > 0) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, selectedApiaryId]);

  React.useEffect(() => {
    let mounted = true;

    const loadCropRequirements = async () => {
      try {
        const data = await beeyieldService.getCropRequirements();
        if (mounted) setCropRequirements(data || []);
      } catch (error) {
        console.error(error);
        if (mounted) setCropRequirements([]);
      }
    };

    loadCropRequirements();
    return () => {
      mounted = false;
    };
  }, []);

  const coverage = React.useMemo(
    () => deriveCoverageMetrics(selectedApiary, hives, activeAlerts, cropRequirements),
    [activeAlerts, cropRequirements, hives, selectedApiary],
  );

  const nodePositions = React.useMemo(() => {
    if (!hives.length) return [];

    const columns = Math.max(3, Math.ceil(Math.sqrt(hives.length)));
    const rows = Math.max(1, Math.ceil(hives.length / columns));

    return hives.map((hive, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = 90 + (column / Math.max(1, columns - 1)) * 320;
      const y = 110 + (row / Math.max(1, rows - 1 || 1)) * 220;
      const isActive = String(hive.status || '').toLowerCase() === 'active' || String(hive.status || '').toLowerCase() === 'healthy';
      return {
        id: hive.id,
        label: hive.hive_code,
        hive,
        x,
        y,
        radius: 34 + Math.min(24, (Number(hive.frame_count) || 8) * 2),
        active: isActive,
      };
    });
  }, [hives]);

  const selectedNode = React.useMemo(
    () => nodePositions.find((node) => node.id === selectedHiveId) || nodePositions[0] || null,
    [nodePositions, selectedHiveId],
  );

  React.useEffect(() => {
    if (!nodePositions.length) {
      setSelectedHiveId(null);
      return;
    }

    if (!selectedHiveId || !nodePositions.some((node) => node.id === selectedHiveId)) {
      setSelectedHiveId(nodePositions[0].id);
    }
  }, [nodePositions, selectedHiveId]);

  const weatherTemperature = getNumeric(
    weatherSummary?.current?.temperature_c,
    weatherSummary?.current?.feels_like_c,
  );
  const weatherWind = getNumeric(
    weatherSummary?.current?.wind_speed_kmh,
  );
  const weatherHumidity = getNumeric(weatherSummary?.current?.humidity_pct);
  const telemetryLinks = weatherSummary?.linked_device_meta?.length || 0;

  const windStatus =
    weatherWind === null ? 'Unavailable' : weatherWind <= 10 ? 'Low' : weatherWind <= 20 ? 'Moderate' : 'High';
  const foragingRadius = coverage.totalHives
    ? `${Math.max(250, Math.round((coverage.coveragePercent / 100) * 450))}m / hive`
    : 'No hive data';

  const handleRefresh = () => {
    apiariesQuery.refetch();
    alertsQuery.refetch();
    refetchHives();
  };

  const loading = apiariesQuery.isLoading || hivesLoading || alertsQuery.isLoading;

  return (
    <BeeYieldPageShell embedded={embedded}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
        <PageHeader
          icon={Navigation}
          label="Coverage Area"
          title={<>Coverage <span className="text-primary">Area</span></>}
          subtitle="Selected-apiary coverage density, hive spacing, and live environmental context."
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className={cn(glass.btnSecondary, "h-9 w-9 p-0 items-center justify-center")}
                title="Refresh metrics"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-2 border-r border-border/50 pr-3">
                  <Wind className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-80">
                    {weatherLoading ? '...' : weatherWind !== null ? `${Math.round(weatherWind)} km/h` : 'No wind'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-80">
                    {weatherLoading ? '...' : weatherTemperature !== null ? `${Math.round(weatherTemperature)}°C` : 'No temp'}
                  </span>
                </div>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <div className={cn(glass.section, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-border/ px-5 py-4 bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-foreground">Spatial Overlay</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                      {selectedApiary?.name || 'Choose an apiary'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('kernel')}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                      viewMode === 'kernel' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-primary/10',
                    )}
                  >
                    Density
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('nodes')}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                      viewMode === 'nodes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-primary/10',
                    )}
                  >
                    Layout
                  </button>
                </div>
              </div>

              <div className="relative min-h-[520px] bg-muted/5 p-5">
                {loading && !nodePositions.length ? (
                  <BeeYieldLoading label="Loading coverage map..." />
                ) : !selectedApiary ? (
                  <BeeYieldEmptyState
                    icon={MapPin}
                    title="No apiary selected"
                    description="Select an apiary to render its live coverage layout."
                  />
                ) : !nodePositions.length ? (
                  <BeeYieldEmptyState
                    icon={Target}
                    title="No hives assigned"
                    description="Attach hives to this apiary to calculate coverage density and gaps."
                  />
                ) : (
                  <>
                    <div className="absolute left-5 top-5 z-20 space-y-2">
                      <select
                        value={selectedApiaryId}
                        onChange={(event) => setSelectedApiaryId(event.target.value)}
                        className={cn(glass.input, 'h-10 min-w-[220px] bg-card')}
                        aria-label="Select apiary"
                        title="Select apiary"
                      >
                        {apiaries.map((apiary) => (
                          <option key={apiary.id} value={apiary.id}>
                            {apiary.name}
                          </option>
                        ))}
                      </select>
                      <BeeYieldBadge variant={coverage.coveragePercent >= 100 ? 'success' : coverage.coveragePercent >= 70 ? 'warning' : 'error'}>
                        {coverage.coveragePercent.toFixed(0)}% target coverage
                      </BeeYieldBadge>
                    </div>

                    <div className="relative w-full h-[480px] overflow-hidden">
                      <svg viewBox="0 0 500 380" className="h-full w-full">
                        <path
                          d="M55,55 L445,55 L425,330 L85,350 Z"
                          fill="rgba(var(--primary), 0.02)"
                          stroke="rgba(var(--border), 0.5)"
                          strokeWidth="1.5"
                          strokeDasharray="6 6"
                        />

                        {viewMode === 'kernel' &&
                          nodePositions.map((node) => (
                            <circle
                              key={`coverage-${node.id}`}
                              cx={node.x}
                              cy={node.y}
                              r={node.radius}
                              fill={node.active ? 'rgba(var(--primary), 0.12)' : 'rgba(var(--destructive), 0.08)'}
                              stroke={node.active ? 'rgba(var(--primary), 0.24)' : 'rgba(var(--destructive), 0.18)'}
                              strokeDasharray="4 4"
                            />
                          ))}

                        {nodePositions.map((node) => (
                          <g
                            key={node.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedHiveId(node.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setSelectedHiveId(node.id);
                              }
                            }}
                            className="cursor-pointer group"
                          >
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={Math.max(22, node.radius * 0.42)}
                              fill="transparent"
                            />
                            {selectedNode?.id === node.id && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r="15"
                                fill="rgba(var(--primary), 0.18)"
                                stroke="rgb(var(--primary))"
                                strokeWidth="1.5"
                                className="animate-pulse"
                              />
                            )}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={selectedNode?.id === node.id ? '10' : '8'}
                              fill={node.active ? 'rgb(var(--primary))' : 'rgb(var(--destructive))'}
                              stroke="rgb(var(--background))"
                              strokeWidth={selectedNode?.id === node.id ? '2' : '1'}
                              className="transition-all duration-300 group-hover:scale-125"
                            />
                            <text
                              x={node.x + 12}
                              y={node.y + 4}
                              fontSize="8"
                              fontWeight="900"
                              fill="currentColor"
                              className="opacity-80 uppercase tracking-widest text-[8px]"
                            >
                              {node.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="absolute bottom-5 left-5 rounded-xl border border-border bg-card/80 backdrop-blur-md p-4 shadow-xl z-20">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70 mb-3">Coverage legend</p>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-foreground/80">
                          <span className="h-3 w-3 rounded-full bg-primary" />
                          Optimal distribution
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-foreground/80">
                          <span className="h-3 w-3 rounded-full bg-destructive" />
                          Critical gap detected
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-5 right-5 max-w-[280px] rounded-xl border border-border bg-card/80 backdrop-blur-md p-4 shadow-xl z-20">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary mb-3">Focused Node</p>
                      {selectedNode ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-black text-foreground">{selectedNode.hive.hive_code}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full", selectedNode.active ? "bg-primary" : "bg-destructive")} />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedNode.hive.status || 'Unspecified'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/40">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground/60">Strength</p>
                              <p className="text-[11px] font-black text-foreground">{selectedNode.hive.frame_count || 'N/A'} Frames</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground/60">Telemetry</p>
                              <p className="text-[11px] font-black text-foreground">
                                {selectedNode.hive.latitude != null ? 'GPS Active' : 'Beacon Only'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border/40">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground/60 mb-1">Precision Lat/Lng</p>
                            <p className="text-[11px] font-black text-foreground font-mono opacity-80">
                              {selectedNode.hive.latitude != null && selectedNode.hive.longitude != null
                                ? `${Number(selectedNode.hive.latitude).toFixed(5)}, ${Number(selectedNode.hive.longitude).toFixed(5)}`
                                : 'Coordinates pending synchronization'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] font-bold text-muted-foreground italic">Interactive: Click any node to inspect.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className={cn(glass.section, 'p-6')}>
              <div className="flex items-center gap-3 border-b border-border/ pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">Coverage Metrics</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Live apiary summary</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Current FPA</p>
                  <p className="text-2xl font-black text-foreground">{coverage.currentFpa.toFixed(1)}</p>
                </div>
                <div className="space-y-1 bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Target FPA</p>
                  <p className="text-2xl font-black text-primary">{(coverage.targetFpa || 0).toFixed(1)}</p>
                </div>
                <div className="space-y-1 bg-destructive/5 p-3 rounded-xl border border-destructive/20 text-destructive">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Gap Index</p>
                  <p className="text-2xl font-black">{coverage.coverageGapPercent.toFixed(0)}%</p>
                </div>
                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">Efficiency</p>
                  <p className="text-2xl font-black text-foreground opacity-90">{coverage.nodeEfficiency.toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="w-12 h-12 text-primary" />
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <h4 className="text-[10px] font-black tracking-widest text-primary uppercase">Strategic Insight</h4>
                </div>
                <p className="mt-3 text-sm font-bold leading-relaxed text-foreground/80 relative z-10">{describeCoverageAction(coverage)}</p>
              </div>
            </div>

            <WeatherTelemetryPanel
              summary={weatherSummary}
              isLoading={weatherLoading}
              compact
              title="Environmental telemetry"
            />

            <div className={cn(glass.card, 'p-6')}>
              <div className="flex items-center gap-3 border-b border-border/ pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Satellite className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">Foraging Route Quality</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Atmospheric resistance</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Wind Gradient</span>
                  <span className={cn("text-sm font-black", windStatus === 'High' ? "text-destructive" : "text-foreground")}>{windStatus}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Humidity load</span>
                  <span className="text-sm font-black text-foreground">
                    {weatherHumidity !== null ? `${Math.round(weatherHumidity)}%` : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Coverage radius</span>
                  <span className="text-sm font-black text-primary">{foragingRadius}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Sensor link active</span>
                  <span className="text-sm font-black text-foreground">{telemetryLinks} Hives</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Unresolved alerts</span>
                  <span className={cn("text-sm font-black", activeAlerts.length > 0 ? "text-destructive" : "text-primary")}>
                    {activeAlerts.filter((alert) => !alert.resolved).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </BeeYieldPageShell>
  );
};

export default SpatialCoverageView;
