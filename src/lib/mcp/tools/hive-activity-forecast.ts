import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function band(bpm: number) {
  return bpm < 20 ? "weak" : bpm < 60 ? "normal" : bpm < 120 ? "healthy" : bpm < 250 ? "strong" : "peak";
}

// Same activity model as the in-app Bee Activity Forecaster.
function predict(tempC: number, windKmh: number, precipMm: number, baseline: number, florage: number) {
  const tF =
    tempC < 12 ? 0 : tempC < 18 ? (tempC - 12) / 6 : tempC < 28 ? 1 : tempC < 35 ? 1 - (tempC - 28) * 0.07 : 0.5;
  const wF = windKmh < 8 ? 1 : windKmh < 30 ? 1 - ((windKmh - 8) * 0.7) / 22 : 0;
  const pF = precipMm < 0.1 ? 1 : precipMm < 1 ? 0.4 : 0;
  return { bpm: Math.round(baseline * tF * wF * pF * florage), tF, wF, pF };
}

export default defineTool({
  name: "hive_activity_forecast",
  title: "Hive activity & bloom/flight forecast",
  description:
    "Predicted bees/min plus bloom and flight conditions for a hive over a requested forecast window " +
    "(default 48 hours). Accepts a hive_id from the user's apiary, or explicit latitude/longitude.",
  inputSchema: {
    hive_id: z.string().uuid().optional().describe("Hive UUID owned by the signed-in user; supplies coordinates."),
    latitude: z.number().min(-90).max(90).optional().describe("Used when hive_id is not given."),
    longitude: z.number().min(-180).max(180).optional(),
    hours: z.number().int().min(6).max(168).default(48).describe("Forecast window length in hours."),
    baseline_bees_per_min: z.number().positive().default(100).describe("Colony baseline traffic at ideal conditions."),
    florage_score: z.number().min(0.3).max(2).default(1).describe("Local forage availability multiplier."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ hive_id, latitude, longitude, hours, baseline_bees_per_min, florage_score }, ctx) => {
    let lat = latitude;
    let lng = longitude;
    let hiveName: string | null = null;

    if (hive_id) {
      if (!ctx.isAuthenticated()) {
        return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
      }
      const { data, error } = await supabaseForUser(ctx)
        .from("hives")
        .select("name,latitude,longitude,apiaries(latitude,longitude,name)")
        .eq("id", hive_id)
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!data) return { content: [{ type: "text", text: `Hive ${hive_id} not found.` }], isError: true };
      const ap = (data as Record<string, unknown>).apiaries as { latitude?: number; longitude?: number } | null;
      hiveName = (data as { name: string }).name;
      lat = (data as { latitude: number | null }).latitude ?? ap?.latitude ?? lat;
      lng = (data as { longitude: number | null }).longitude ?? ap?.longitude ?? lng;
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return {
        content: [{ type: "text", text: "Provide latitude and longitude, or a hive_id that has coordinates." }],
        isError: true,
      };
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,relative_humidity_2m` +
      `&forecast_days=${Math.min(7, Math.ceil(hours / 24) + 1)}&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Weather provider error ${res.status}` }], isError: true };
    }
    const data = await res.json();
    const times: string[] = data.hourly?.time ?? [];
    const temps: number[] = data.hourly?.temperature_2m ?? [];
    const winds: number[] = data.hourly?.wind_speed_10m ?? [];
    const dirs: number[] = data.hourly?.wind_direction_10m ?? [];
    const precs: number[] = data.hourly?.precipitation ?? [];
    const hums: number[] = data.hourly?.relative_humidity_2m ?? [];

    const now = Date.now();
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 0; i < times.length && rows.length < hours; i++) {
      const ts = new Date(times[i]).getTime();
      if (ts < now - 3600_000) continue;
      const hour = Number(times[i].slice(11, 13));
      const { bpm, tF, wF, pF } = predict(temps[i], winds[i], precs[i], baseline_bees_per_min, florage_score);
      const daylight = hour >= 7 && hour <= 19;
      const flyable = daylight && tF > 0 && wF > 0 && pF > 0;
      rows.push({
        time: times[i],
        temp_c: temps[i],
        humidity_pct: hums[i],
        wind_kmh: winds[i],
        wind_dir_deg: dirs[i],
        precip_mm: precs[i],
        daylight,
        predicted_bees_per_min: daylight ? bpm : 0,
        band: daylight ? band(bpm) : "night",
        flight_conditions: flyable ? (wF > 0.8 && pF === 1 ? "good" : "marginal") : "no-fly",
        // Bloom conditions: nectar secretion favours warm, humid, calm, dry-canopy hours.
        bloom_conditions:
          temps[i] >= 16 && temps[i] <= 32 && precs[i] < 0.5 && hums[i] >= 40 && hums[i] <= 85
            ? "nectar-favourable"
            : precs[i] >= 0.5
              ? "washed-out"
              : "suppressed",
      });
    }

    const flying = rows.filter((r) => r.flight_conditions !== "no-fly");
    const bloomOk = rows.filter((r) => r.bloom_conditions === "nectar-favourable");
    const peak = rows.reduce(
      (best, r) => ((r.predicted_bees_per_min as number) > (best?.predicted_bees_per_min as number ?? -1) ? r : best),
      rows[0],
    );

    const summary = {
      hive_id: hive_id ?? null,
      hive_name: hiveName,
      latitude: lat,
      longitude: lng,
      window_hours: rows.length,
      avg_predicted_bees_per_min: rows.length
        ? Math.round(rows.reduce((s, r) => s + (r.predicted_bees_per_min as number), 0) / rows.length)
        : 0,
      peak_predicted_bees_per_min: (peak?.predicted_bees_per_min as number) ?? 0,
      peak_time: peak?.time ?? null,
      flyable_hours: flying.length,
      nectar_favourable_hours: bloomOk.length,
      verdict:
        flying.length === 0
          ? "No flight window in this period — keep colonies fed and unmoved."
          : bloomOk.length >= rows.length * 0.4
            ? "Strong foraging window: good nectar conditions and workable flight hours."
            : "Mixed conditions: bees can fly, but nectar secretion will be limited.",
      hourly: rows,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
