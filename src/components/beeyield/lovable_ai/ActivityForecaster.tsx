import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { X, CloudSun, Loader2, Sparkles, Plane, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import MarkdownRenderer from "./MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { evaluateAlerts } from "./AlertsPage";

type Forecast = {
  date: string;
  hour: number;
  tempC: number;
  windKmh: number;
  precipMm: number;
  predictedBpm: number;
  band: string;
};

type SnapshotRow = {
  created_at: string;
  forecast_for_date: string;
  predicted_bees_per_min: number;
  temp_c: number | null;
  wind_kmh: number | null;
  precip_mm: number | null;
  band: string | null;
  hive_label: string;
};

type FlightLogRow = {
  observed_at: string;
  bees_per_minute: number;
  hive_label: string;
};

type ForecastPoint = {
  forecastDate: string;
  rawForecastDate: string;
  predicted: number;
  tempC: number | null;
  windKmh: number | null;
  precipMm: number | null;
  band: string | null;
};

type ForecastRun = {
  id: string;
  createdAt: string;
  hiveLabel: string;
  points: ForecastPoint[];
  avgPredicted: number;
};

const emptyInsight = {
  bestDay: "No run selected",
  weakestDay: "No run selected",
  avgPrediction: 0,
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRunStamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function isoDateFromValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function inferForecastDate(runCreatedAt: string, index: number) {
  const base = new Date(runCreatedAt);
  if (Number.isNaN(base.getTime())) return "";
  base.setHours(0, 0, 0, 0);
  return addDays(base, index).toISOString().slice(0, 10);
}

function compareMonthDay(a: string, b: string) {
  return a.slice(5, 10).localeCompare(b.slice(5, 10));
}

export default function ActivityForecaster({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [lat, setLat] = useState("-2.4078");
  const [lng, setLng] = useState("37.9658");
  const [baseline, setBaseline] = useState(100);
  const [florageScore, setFlorageScore] = useState(1.0);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [snapshotRows, setSnapshotRows] = useState<SnapshotRow[]>([]);
  const [flightLogs, setFlightLogs] = useState<FlightLogRow[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [compareRunId, setCompareRunId] = useState("latest");
  const [selectedTargetDate, setSelectedTargetDate] = useState("");

  const fetchForecast = async () => {
    setLoading(true);
    setAiText("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,wind_speed_10m,precipitation&forecast_days=7&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        toast.error("Open-Meteo request failed");
        setLoading(false);
        return;
      }
      const data = await response.json();
      const times: string[] = data.hourly?.time || [];
      const temps: number[] = data.hourly?.temperature_2m || [];
      const winds: number[] = data.hourly?.wind_speed_10m || [];
      const precs: number[] = data.hourly?.precipitation || [];
      const out: Forecast[] = [];

      for (let index = 0; index < times.length; index += 1) {
        const temp = temps[index];
        const wind = winds[index];
        const precip = precs[index];
        const hour = parseInt(times[index].slice(11, 13), 10);
        if (hour < 7 || hour > 19) continue;

        const tempFactor =
          temp < 12 ? 0 : temp < 18 ? (temp - 12) / 6 : temp < 28 ? 1 : temp < 35 ? 1 - (temp - 28) * 0.07 : 0.5;
        const windFactor = wind < 8 ? 1 : wind < 30 ? 1 - ((wind - 8) * 0.7) / 22 : 0;
        const precipFactor = precip < 0.1 ? 1 : precip < 1 ? 0.4 : 0;
        const predictedBpm = Math.round(baseline * tempFactor * windFactor * precipFactor * florageScore);
        const band =
          predictedBpm < 20
            ? "weak"
            : predictedBpm < 60
              ? "normal"
              : predictedBpm < 120
                ? "healthy"
                : predictedBpm < 250
                  ? "strong"
                  : "peak";

        out.push({
          date: times[index].slice(0, 10),
          hour,
          tempC: temp,
          windKmh: wind,
          precipMm: precip,
          predictedBpm,
          band,
        });
      }

      setForecast(out);
      toast.success(`Loaded ${out.length} hourly forecasts`);

      const dayMap = new Map<string, Forecast[]>();
      for (const point of out) {
        if (!dayMap.has(point.date)) dayMap.set(point.date, []);
        dayMap.get(point.date)?.push(point);
      }

      const snapshots = Array.from(dayMap.entries()).map(([dateKey, points]) => ({
        device_id: deviceId,
        hive_label: hiveLabel,
        forecast_for_date: dateKey,
        predicted_bees_per_min: Math.round(points.reduce((sum, point) => sum + point.predictedBpm, 0) / points.length),
        temp_c: Math.round((points.reduce((sum, point) => sum + point.tempC, 0) / points.length) * 10) / 10,
        wind_kmh: Math.round((points.reduce((sum, point) => sum + point.windKmh, 0) / points.length) * 10) / 10,
        precip_mm: Math.round((points.reduce((sum, point) => sum + point.precipMm, 0) / points.length) * 10) / 10,
        band: points[0]?.band || "normal",
      }));

      await (supabase as any).from("forecast_snapshots").insert(snapshots);

      for (const snapshot of snapshots) {
        await evaluateAlerts(deviceId, {
          hive_label: hiveLabel,
          metric: "predicted_bees_per_min",
          value: snapshot.predicted_bees_per_min,
          snapshotDate: snapshot.forecast_for_date,
        });
        await evaluateAlerts(deviceId, {
          hive_label: hiveLabel,
          metric: "wind_kmh",
          value: snapshot.wind_kmh,
          snapshotDate: snapshot.forecast_for_date,
        });
        await evaluateAlerts(deviceId, {
          hive_label: hiveLabel,
          metric: "temp_c",
          value: snapshot.temp_c,
          snapshotDate: snapshot.forecast_for_date,
        });
        await evaluateAlerts(deviceId, {
          hive_label: hiveLabel,
          metric: "precip_mm",
          value: snapshot.precip_mm,
          snapshotDate: snapshot.forecast_for_date,
        });
      }

      await loadHistory();
    } catch (error) {
      console.error(error);
      toast.error("Forecast failed");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = useCallback(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [{ data: snaps }, { data: actuals }] = await Promise.all([
      (supabase as any)
        .from("forecast_snapshots")
        .select("created_at,forecast_for_date,predicted_bees_per_min,temp_c,wind_kmh,precip_mm,band,hive_label")
        .eq("device_id", deviceId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("bee_flight_logs")
        .select("observed_at,bees_per_minute,hive_label")
        .eq("device_id", deviceId)
        .gte("observed_at", thirtyDaysAgo.toISOString())
        .order("observed_at", { ascending: false }),
    ]);

    setSnapshotRows((snaps as SnapshotRow[]) || []);
    setFlightLogs((actuals as FlightLogRow[]) || []);
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen, loadHistory]);

  const hiveOptions = useMemo(() => {
    const seen = new Set<string>();
    const labels: string[] = [];
    [hiveLabel, ...snapshotRows.map((row) => row.hive_label), ...flightLogs.map((row) => row.hive_label)].forEach((label) => {
      const trimmed = label?.trim();
      if (!trimmed || seen.has(trimmed)) return;
      seen.add(trimmed);
      labels.push(trimmed);
    });
    return labels;
  }, [flightLogs, hiveLabel, snapshotRows]);

  const forecastRuns = useMemo<ForecastRun[]>(() => {
    const grouped = new Map<string, SnapshotRow[]>();

    for (const row of snapshotRows) {
      const key = `${row.hive_label}::${row.created_at}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    }

    return Array.from(grouped.entries())
      .map(([key, rows]) => {
        const [runHiveLabel, createdAt] = key.split("::");
        const points = [...rows]
          .sort((left, right) => compareMonthDay(left.forecast_for_date, right.forecast_for_date))
          .map((row, index) => ({
            forecastDate: inferForecastDate(createdAt, index),
            rawForecastDate: row.forecast_for_date,
            predicted: row.predicted_bees_per_min,
            tempC: row.temp_c,
            windKmh: row.wind_kmh,
            precipMm: row.precip_mm,
            band: row.band,
          }));

        return {
          id: key,
          createdAt,
          hiveLabel: runHiveLabel,
          points,
          avgPredicted: average(points.map((point) => point.predicted)),
        };
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [snapshotRows]);

  const actualByDate = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const log of flightLogs) {
      if (log.hive_label !== hiveLabel) continue;
      const dateKey = isoDateFromValue(log.observed_at);
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey)?.push(log.bees_per_minute);
    }

    return new Map<string, number>(
      Array.from(grouped.entries()).map(([dateKey, values]) => [dateKey, average(values)]),
    );
  }, [flightLogs, hiveLabel]);

  const runsForHive = useMemo(
    () => forecastRuns.filter((run) => run.hiveLabel === hiveLabel),
    [forecastRuns, hiveLabel],
  );

  useEffect(() => {
    if (!runsForHive.length) {
      setSelectedRunId("");
      return;
    }
    if (!selectedRunId || !runsForHive.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(runsForHive[0].id);
    }
  }, [runsForHive, selectedRunId]);

  const selectedRun = useMemo(
    () => runsForHive.find((run) => run.id === selectedRunId) || null,
    [runsForHive, selectedRunId],
  );

  useEffect(() => {
    if (!selectedRun || runsForHive.length < 2) {
      setCompareRunId("latest");
      return;
    }
    if (compareRunId === "latest" || !runsForHive.some((run) => run.id === compareRunId)) {
      const fallback = runsForHive.find((run) => run.id !== selectedRun.id);
      setCompareRunId(fallback?.id || "latest");
    }
  }, [compareRunId, runsForHive, selectedRun]);

  const compareRun = useMemo(() => {
    if (!selectedRun || runsForHive.length < 2) return null;
    if (compareRunId === "latest") {
      return runsForHive.find((run) => run.id !== selectedRun.id) || null;
    }
    return runsForHive.find((run) => run.id === compareRunId) || null;
  }, [compareRunId, runsForHive, selectedRun]);

  const selectedRunChartData = useMemo(() => {
    if (!selectedRun) return [];

    const comparePoints = new Map(compareRun?.points.map((point) => [point.forecastDate, point]) || []);
    return selectedRun.points.map((point) => ({
      date: point.forecastDate,
      label: formatShortDate(point.forecastDate),
      predicted: point.predicted,
      previousPredicted: comparePoints.get(point.forecastDate)?.predicted ?? null,
      actual: actualByDate.get(point.forecastDate) ?? null,
      tempC: point.tempC,
      windKmh: point.windKmh,
      precipMm: point.precipMm,
    }));
  }, [actualByDate, compareRun, selectedRun]);

  const targetDateOptions = useMemo(
    () => selectedRunChartData.map((row) => row.date),
    [selectedRunChartData],
  );

  useEffect(() => {
    if (!targetDateOptions.length) {
      setSelectedTargetDate("");
      return;
    }
    if (!selectedTargetDate || !targetDateOptions.includes(selectedTargetDate)) {
      setSelectedTargetDate(targetDateOptions[0]);
    }
  }, [selectedTargetDate, targetDateOptions]);

  const revisionTimelineData = useMemo(() => {
    if (!selectedTargetDate) return [];

    return [...runsForHive]
      .reverse()
      .map((run) => {
        const point = run.points.find((candidate) => candidate.forecastDate === selectedTargetDate);
        if (!point) return null;
        return {
          runId: run.id,
          label: new Date(run.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          runStamp: formatRunStamp(run.createdAt),
          predicted: point.predicted,
          actual: actualByDate.get(selectedTargetDate) ?? null,
          isSelected: selectedRun?.id === run.id,
        };
      })
      .filter(Boolean) as Array<{
      runId: string;
      label: string;
      runStamp: string;
      predicted: number;
      actual: number | null;
      isSelected: boolean;
    }>;
  }, [actualByDate, runsForHive, selectedRun, selectedTargetDate]);

  const selectedTargetComparison = useMemo(() => {
    if (!selectedRun || !selectedTargetDate) return null;
    const current = selectedRun.points.find((point) => point.forecastDate === selectedTargetDate) || null;
    const previous = compareRun?.points.find((point) => point.forecastDate === selectedTargetDate) || null;
    const actual = actualByDate.get(selectedTargetDate) ?? null;
    if (!current) return null;
    return {
      current: current.predicted,
      previous: previous?.predicted ?? null,
      actual,
      deltaFromPrevious: previous ? current.predicted - previous.predicted : null,
      varianceToActual: actual !== null ? current.predicted - actual : null,
    };
  }, [actualByDate, compareRun, selectedRun, selectedTargetDate]);

  const selectedRunInsight = useMemo(() => {
    if (!selectedRun) return emptyInsight;
    const sortedByPrediction = [...selectedRun.points].sort((left, right) => right.predicted - left.predicted);
    return {
      bestDay: sortedByPrediction[0]?.forecastDate || "No run selected",
      weakestDay: sortedByPrediction[sortedByPrediction.length - 1]?.forecastDate || "No run selected",
      avgPrediction: selectedRun.avgPredicted,
    };
  }, [selectedRun]);

  const dailyAverage = useMemo(() => {
    return [...new Set(forecast.map((point) => point.date))].map((date) => {
      const points = forecast.filter((point) => point.date === date);
      return {
        date,
        label: formatShortDate(date),
        avgBpm: Math.round(points.reduce((sum, point) => sum + point.predictedBpm, 0) / points.length),
        avgTemp: Math.round((points.reduce((sum, point) => sum + point.tempC, 0) / points.length) * 10) / 10,
        avgWind: Math.round((points.reduce((sum, point) => sum + point.windKmh, 0) / points.length) * 10) / 10,
      };
    });
  }, [forecast]);

  const runAI = async () => {
    if (forecast.length === 0) {
      toast.error("Fetch forecast first");
      return;
    }
    setAiLoading(true);
    setAiText("");

    const peakDay = [...new Set(forecast.map((point) => point.date))].map((date) => {
      const points = forecast.filter((point) => point.date === date);
      return {
        date,
        avgBpm: Math.round(points.reduce((sum, point) => sum + point.predictedBpm, 0) / points.length),
      };
    });

    const prompt = `As Beeyield AI, write a 7-Day Bee Activity Forecast Report for hive ${hiveLabel} at lat ${lat}, lng ${lng}.

Inputs:
- Baseline activity: ${baseline} bees/min (peak-season estimate)
- Florage abundance multiplier: ${florageScore}x (1.0 = average, >1 abundant, <1 dearth)
- Daily averages (predicted bees/min, daylight hours only): ${peakDay.map((day) => `${day.date}=${day.avgBpm}`).join(", ")}

Provide: (1) best foraging day and why; (2) weakest day and cause (cold, wind, or rain); (3) hive-management actions per day band (feed, inspect, harvest, swarm-watch); (4) supplementary feeding recommendations.`;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "flight" }),
      });

      if (!response.ok || !response.body) {
        toast.error("AI failed");
        setAiLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let complete = "";
      let done = false;

      while (!done) {
        const { done: readDone, value } = await reader.read();
        if (readDone) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf("\n");

        while (newlineIndex !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) {
            newlineIndex = buffer.indexOf("\n");
            continue;
          }
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              complete += chunk;
              setAiText(complete);
            }
          } catch {
            // Streaming partial.
          }
          newlineIndex = buffer.indexOf("\n");
        }
      }
    } catch {
      toast.error("AI failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm custom-scroll">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudSun className="h-7 w-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Bee Activity Forecaster</h1>
              <p className="text-xs text-muted-foreground">
                Forecast run history, hive drilldown, and predicted vs actual overlays
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-4 md:grid-cols-6">
          <Field label="Hive label">
            <input list="forecast-hive-options" value={hiveLabel} onChange={(event) => setHiveLabel(event.target.value)} className={inputCls} />
            <datalist id="forecast-hive-options">
              {hiveOptions.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </Field>
          <Field label="Latitude">
            <input value={lat} onChange={(event) => setLat(event.target.value)} className={inputCls} />
          </Field>
          <Field label="Longitude">
            <input value={lng} onChange={(event) => setLng(event.target.value)} className={inputCls} />
          </Field>
          <Field label="Baseline bees/min">
            <input type="number" value={baseline} onChange={(event) => setBaseline(+event.target.value)} className={inputCls} />
          </Field>
          <Field label={`Florage score: ${florageScore.toFixed(1)}x`}>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={florageScore}
              onChange={(event) => setFlorageScore(+event.target.value)}
              className="w-full accent-honey"
            />
          </Field>
          <Field label="Timeline compare run">
            <select value={compareRunId} onChange={(event) => setCompareRunId(event.target.value)} className={inputCls}>
              <option value="latest">Previous forecast run</option>
              {runsForHive
                .filter((run) => run.id !== selectedRun?.id)
                .map((run) => (
                  <option key={run.id} value={run.id}>
                    {formatRunStamp(run.createdAt)}
                  </option>
                ))}
            </select>
          </Field>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <button
            onClick={fetchForecast}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-amber px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudSun className="h-4 w-4" />}
            Fetch 7-day forecast
          </button>
          <button
            onClick={runAI}
            disabled={aiLoading || forecast.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg border border-honey/40 bg-honey/5 px-4 py-2.5 font-medium text-honey disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI forecast narrative
          </button>
        </div>

        {dailyAverage.length > 0 && (
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <Plane className="h-4 w-4 text-honey" />
              Current 7-day forecast for {hiveLabel}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={dailyAverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="avgBpm" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.3} name="Predicted bees/min" />
                <Line yAxisId="right" type="monotone" dataKey="avgTemp" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Avg C" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgWind" stroke="hsl(217,91%,60%)" strokeWidth={2} name="Wind km/h" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {runsForHive.length > 0 && (
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                  <HistoryIcon className="h-4 w-4 text-honey" />
                  Forecast history timeline
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Compare forecast runs for {hiveLabel}. Pick a run from {formatLongDate(runsForHive[runsForHive.length - 1].createdAt)} through {formatLongDate(runsForHive[0].createdAt)}.
                </p>
              </div>
              <div className="rounded-lg border border-honey/30 bg-honey/5 px-3 py-2 text-right text-xs">
                <div className="font-semibold text-honey">{runsForHive.length} saved forecast runs</div>
                <div className="text-muted-foreground">{flightLogs.filter((log) => log.hive_label === hiveLabel).length} actual flight logs</div>
              </div>
            </div>

            <div className="mb-4 flex gap-3 overflow-x-auto pb-1 custom-scroll">
              {runsForHive.map((run) => {
                const isActive = run.id === selectedRun?.id;
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`min-w-[220px] rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? "border-honey bg-honey/10 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Forecast fetch</div>
                    <div className="text-sm font-semibold text-foreground">{formatRunStamp(run.createdAt)}</div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{run.points.length} forecast days</span>
                      <span className="font-semibold text-honey">{run.avgPredicted} bpm avg</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <StatCard label="Selected run" value={selectedRun ? formatShortDate(selectedRun.createdAt) : "None"} note={selectedRun ? formatRunStamp(selectedRun.createdAt) : "Pick a run"} />
              <StatCard label="Strongest predicted day" value={formatShortDate(selectedRunInsight.bestDay)} note={selectedRun ? `${selectedRunInsight.avgPrediction} bpm average across run` : "No run selected"} />
              <StatCard label="Weakest predicted day" value={formatShortDate(selectedRunInsight.weakestDay)} note={compareRun ? `Comparing against ${formatShortDate(compareRun.createdAt)}` : "No comparison run yet"} />
            </div>
          </div>
        )}

        {selectedRunChartData.length > 0 && (
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Run drilldown: predicted vs actual for {hiveLabel}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Selected forecast run: {formatRunStamp(selectedRun?.createdAt || "")}
                  {compareRun ? ` · comparison run: ${formatRunStamp(compareRun.createdAt)}` : ""}
                </p>
              </div>
              <Field label="Target date focus">
                <select value={selectedTargetDate} onChange={(event) => setSelectedTargetDate(event.target.value)} className={inputCls}>
                  {targetDateOptions.map((date) => (
                    <option key={date} value={date}>
                      {formatLongDate(date)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <ResponsiveContainer width="100%" height={270}>
              <ComposedChart data={selectedRunChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value: number | null, name: string) => {
                    if (value === null || value === undefined) return ["No data", name];
                    return [`${value} bees/min`, name];
                  }}
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date as string | undefined;
                    return date ? formatLongDate(date) : "";
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="predicted" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.22} name="Selected run prediction" />
                {compareRun && (
                  <Line
                    type="monotone"
                    dataKey="previousPredicted"
                    stroke="hsl(217,91%,60%)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Comparison run prediction"
                    connectNulls
                  />
                )}
                <Line type="monotone" dataKey="actual" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ r: 3 }} name="Actual logged" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>

            {selectedTargetComparison && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <StatCard label={`Prediction on ${formatShortDate(selectedTargetDate)}`} value={`${selectedTargetComparison.current} bpm`} note="Selected forecast run" highlight />
                <StatCard
                  label="Previous forecast"
                  value={selectedTargetComparison.previous !== null ? `${selectedTargetComparison.previous} bpm` : "No prior run"}
                  note={
                    selectedTargetComparison.deltaFromPrevious !== null
                      ? `${selectedTargetComparison.deltaFromPrevious > 0 ? "+" : ""}${selectedTargetComparison.deltaFromPrevious} bpm change`
                      : "Need another run to compare"
                  }
                />
                <StatCard
                  label="Actual logged"
                  value={selectedTargetComparison.actual !== null ? `${selectedTargetComparison.actual} bpm` : "No actual yet"}
                  note="Average from Bee Flight Tracker"
                />
                <StatCard
                  label="Prediction variance"
                  value={
                    selectedTargetComparison.varianceToActual !== null
                      ? `${selectedTargetComparison.varianceToActual > 0 ? "+" : ""}${selectedTargetComparison.varianceToActual} bpm`
                      : "Awaiting actual"
                  }
                  note="Selected run minus actual"
                />
              </div>
            )}
          </div>
        )}

        {revisionTimelineData.length > 0 && (
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <HistoryIcon className="h-4 w-4 text-honey" />
              Revision history for {formatLongDate(selectedTargetDate)}
            </h3>
            <p className="mb-3 text-[11px] text-muted-foreground">
              This chart shows how the prediction for {hiveLabel} changed from earlier runs to the latest one, which is the direct yesterday-vs-today comparison path.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revisionTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value: number | null, name: string) => {
                    if (value === null || value === undefined) return ["No data", name];
                    return [`${value} bees/min`, name];
                  }}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.runStamp as string) || ""}
                />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ r: 3 }} name="Run prediction" />
                <Line type="monotone" dataKey="actual" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ r: 3 }} name="Actual logged" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {aiText && (
          <div className="mb-4 rounded-xl border border-honey/30 bg-card p-5">
            <MarkdownRenderer content={aiText} />
          </div>
        )}

        <div className="rounded-lg border border-honey/30 bg-honey/5 p-3 text-xs">
          <b className="text-honey">Linked tools:</b> Forecast runs now stay comparable by hive, feed Bee Flight Tracker actuals into each run drilldown, and let you inspect how a target day changed across older versus newer forecasts.
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-honey/30 bg-honey/5" : "border-border bg-muted/20"}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>
    </div>
  );
}
