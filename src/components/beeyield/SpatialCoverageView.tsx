import React from 'react';
import {
  Activity,
  AlertCircle,
  Layers,
  MapPin,
  Navigation,
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
  BeeYieldPageHeader,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import {
  describeCoverageAction,
  deriveCoverageMetrics,
  filterAlertsByApiary,
} from '@/lib/pollinationInsights';
import { beeyieldService, CropPollinationRequirement } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';

const getNumeric = (...values: Array<number | string | null | undefined>) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const SpatialCoverageView: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'kernel' | 'nodes'>('kernel');
  const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
  const [selectedHiveId, setSelectedHiveId] = React.useState<string | null>(null);
  const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);

  const apiariesQuery = useApiaries();
  const alertsQuery = useSensorAlerts(false);
  const apiaries = apiariesQuery.data || [];
  const selectedApiary = React.useMemo(
    () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
    [apiaries, selectedApiaryId],
  );

  const { hives, isLoading: hivesLoading, refetch: refetchHives } = useHivesWithTelemetry(selectedApiaryId || undefined);
  const { data: weatherSummary, isLoading: weatherLoading } = useApiaryWeatherSummary(selectedApiary?.id);
  const activeAlerts = React.useMemo(
    () => filterAlertsByApiary(alertsQuery.data || [], selectedApiaryId, hives),
    [alertsQuery.data, hives, selectedApiaryId],
  );

  React.useEffect(() => {
    if (!selectedApiaryId && apiaries.length > 0) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, selectedApiaryId]);

  React.useEffect(() => {
    if (!nodePositions.length) {
      setSelectedHiveId(null);
      return;
    }

    if (!selectedHiveId || !nodePositions.some((node) => node.id === selectedHiveId)) {
      setSelectedHiveId(nodePositions[0].id);
    }
  }, [nodePositions, selectedHiveId]);

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
    <BeeYieldPageShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <BeeYieldPageHeader
          icon={Navigation}
          label="Coverage Area"
          title={
            <>
              Coverage <span className="text-[#1B9157]">Area</span>
            </>
          }
          subtitle="Selected-apiary coverage density, hive spacing, and live environmental context."
          onRefresh={handleRefresh}
          actions={
            <div className="flex items-center gap-3 rounded-2xl border border-[#F4D03F]/20 bg-white/70 px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2 border-r border-gray-100 pr-3">
                <Wind className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black text-gray-500">
                  {weatherLoading ? '...' : weatherWind !== null ? `${Math.round(weatherWind)} km/h` : 'No wind'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] font-black text-gray-500">
                  {weatherLoading ? '...' : weatherTemperature !== null ? `${Math.round(weatherTemperature)}°C` : 'No temp'}
                </span>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <div className={cn(glass.section, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-[#F4D03F]/10 px-5 py-4 bg-white/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1B9157]/20 bg-[#1B9157]/10">
                    <Layers className="h-5 w-5 text-[#1B9157]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Spatial Overlay</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      {selectedApiary?.name || 'Choose an apiary'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#F4D03F]/15 bg-white/80 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('kernel')}
                    className={cn(
                      'rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                      viewMode === 'kernel' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-[#F4D03F]/10',
                    )}
                  >
                    Kernel
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('nodes')}
                    className={cn(
                      'rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                      viewMode === 'nodes' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-[#F4D03F]/10',
                    )}
                  >
                    Nodes
                  </button>
                </div>
              </div>

              <div className="relative min-h-[520px] bg-[#F9F7F2] p-5">
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
                    <div className="absolute left-5 top-5 z-10 space-y-2">
                      <select
                        value={selectedApiaryId}
                        onChange={(event) => setSelectedApiaryId(event.target.value)}
                        className={cn(glass.input, 'h-10 min-w-[220px] bg-white/80')}
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

                    <svg viewBox="0 0 500 380" className="h-full w-full">
                      <path
                        d="M55,55 L445,55 L425,330 L85,350 Z"
                        fill="rgba(255,255,255,0.9)"
                        stroke="#DAD7CD"
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
                            fill={node.active ? 'rgba(27, 145, 87, 0.12)' : 'rgba(239, 68, 68, 0.08)'}
                            stroke={node.active ? 'rgba(27, 145, 87, 0.24)' : 'rgba(239, 68, 68, 0.18)'}
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
                          className="cursor-pointer"
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
                              fill="rgba(244, 208, 63, 0.18)"
                              stroke="#F4D03F"
                              strokeWidth="1.5"
                            />
                          )}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={selectedNode?.id === node.id ? '10' : '8'}
                            fill={node.active ? '#1B9157' : '#EF4444'}
                            stroke="#1A1A1A"
                            strokeWidth={selectedNode?.id === node.id ? '2' : '1'}
                          />
                          <text
                            x={node.x + 12}
                            y={node.y + 4}
                            fontSize="8"
                            fontWeight="900"
                            fill="#1A1A1A"
                          >
                            {node.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className="absolute bottom-5 left-5 rounded-2xl border border-[#F4D03F]/15 bg-white/80 p-4 shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Coverage legend</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-3 text-[11px] text-gray-600">
                          <span className="h-3 w-3 rounded-full bg-[#1B9157]" />
                          Active hive coverage
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-600">
                          <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
                          Hive needs attention
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-5 right-5 max-w-[280px] rounded-2xl border border-[#F4D03F]/15 bg-white/85 p-4 shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">Selected hive</p>
                      {selectedNode ? (
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-sm font-black text-[#1A1A1A]">{selectedNode.hive.hive_code}</p>
                            <p className="text-[10px] font-bold text-gray-500">{selectedNode.hive.status || 'Unspecified status'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Frames</p>
                              <p className="text-[11px] font-black text-[#1A1A1A]">{selectedNode.hive.frame_count || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Placement</p>
                              <p className="text-[11px] font-black text-[#1A1A1A]">
                                {selectedNode.hive.latitude && selectedNode.hive.longitude ? 'Saved GPS' : 'Coverage node'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Precision coordinates</p>
                            <p className="text-[11px] font-black text-[#1A1A1A]">
                              {selectedNode.hive.latitude && selectedNode.hive.longitude
                                ? `${Number(selectedNode.hive.latitude).toFixed(6)}, ${Number(selectedNode.hive.longitude).toFixed(6)}`
                                : 'No saved hive coordinates yet'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-[11px] font-bold text-gray-500">Select a node to inspect hive placement.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className={cn(glass.section, 'p-6')}>
              <div className="flex items-center gap-3 border-b border-[#F4D03F]/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1B9157]/20 bg-[#1B9157]/10">
                  <Activity className="h-5 w-5 text-[#1B9157]" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Coverage Metrics</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Live apiary summary</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Current FPA</p>
                  <p className="text-2xl font-black text-[#1A1A1A]">{coverage.currentFpa.toFixed(1)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Target FPA</p>
                  <p className="text-2xl font-black text-[#1B9157]">{coverage.targetFpa.toFixed(1)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Coverage Gap</p>
                  <p className="text-2xl font-black text-red-600">{coverage.coverageGapPercent.toFixed(0)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Node Efficiency</p>
                  <p className="text-2xl font-black text-[#1B9157]">{coverage.nodeEfficiency.toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#F4D03F]/20 bg-white/70 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#F4D03F]" />
                  <h4 className="text-xs font-black tracking-tight text-[#1A1A1A]">Actionable Insight</h4>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-gray-600">{describeCoverageAction(coverage)}</p>
              </div>
            </div>

            <WeatherTelemetryPanel
              summary={weatherSummary}
              isLoading={weatherLoading}
              compact
              title="Environmental telemetry"
            />

            <div className={cn(glass.card, 'p-6')}>
              <div className="flex items-center gap-3 border-b border-[#F4D03F]/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/20 bg-[#F4D03F]/10">
                  <Satellite className="h-5 w-5 text-[#F4D03F]" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Flight Weather Context</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Telemetry-backed route signals</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Wind resistance</span>
                  <span className="text-sm font-black text-[#1A1A1A]">{windStatus}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Humidity load</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {weatherHumidity !== null ? `${Math.round(weatherHumidity)}%` : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Foraging radius</span>
                  <span className="text-sm font-black text-[#1B9157]">{foragingRadius}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Linked devices</span>
                  <span className="text-sm font-black text-[#1A1A1A]">{telemetryLinks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Open alerts</span>
                  <span className="text-sm font-black text-red-600">{activeAlerts.filter((alert) => !alert.resolved).length}</span>
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
