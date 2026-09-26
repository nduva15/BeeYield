import React from "react";
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Layers,
  Droplets,
  Wind,
  Edit,
  Trash2,
  ChevronRight,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
} from "lucide-react";
import { ApiarySite, LiveWeatherData } from "./ApiariesPage";

function normalizeApiaryName(name?: string): string {
  if (!name) return "BeeYield Apiary";
  return name.trim();
}

function normalizeApiaryLocation(loc?: string): string {
  if (!loc) return "Kibwezi, Kenya";
  return loc.trim();
}

function getUserHivesCount(userKey: string, apiaryId: string, fallbackCount: number): number {
  try {
    const raw = localStorage.getItem(`beeyield_user_hives_${userKey}_${apiaryId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
    }
  } catch {}
  return fallbackCount;
}

function getWeatherMeta(code: number) {
  switch (code) {
    case 0:
      return { text: "Clear sky", Icon: Sun, color: "text-amber-500" };
    case 1:
      return { text: "Mainly clear", Icon: Sun, color: "text-amber-400" };
    case 2:
      return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
    case 3:
      return { text: "Overcast", Icon: Cloud, color: "text-slate-400" };
    case 45:
    case 48:
      return { text: "Fog", Icon: CloudFog, color: "text-slate-400" };
    case 51:
    case 53:
    case 55:
      return { text: "Light drizzle", Icon: CloudDrizzle, color: "text-blue-400" };
    case 61:
    case 63:
    case 65:
      return { text: "Rain", Icon: CloudRain, color: "text-blue-500" };
    case 80:
    case 81:
    case 82:
      return { text: "Rain showers", Icon: CloudRain, color: "text-blue-500" };
    case 95:
    case 96:
    case 99:
      return { text: "Thunderstorm", Icon: CloudLightning, color: "text-purple-500" };
    default:
      return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
  }
}

export function ApisenseWeatherCard({
  apiary,
  weather,
  userKey,
  onEdit,
  onDelete,
  onOpenDetails,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  userKey?: string;
  onEdit: (apiary: ApiarySite) => void;
  onDelete?: (apiaryId: string, apiaryName: string) => void;
  onOpenDetails: (apiary: ApiarySite) => void;
}) {
  const displayName = normalizeApiaryName(apiary.name);
  const displayLocation = normalizeApiaryLocation(apiary.location_name);
  const hiveCount = userKey ? getUserHivesCount(userKey, apiary.id, apiary.active_hives) : apiary.active_hives;
  const currentCondition = weather?.conditionText || "Partly cloudy";
  const minTemp = weather?.todayMin ?? 18;
  const maxTemp = weather?.todayMax ?? 29;
  const { Icon: WeatherIcon } = getWeatherMeta(weather?.weatherCode ?? 2);

  const getGradientOffsets = (min: number, max: number) => {
    const baseMin = 14;
    const baseMax = 36;
    const leftPct = Math.max(0, Math.min(100, ((min - baseMin) / (baseMax - baseMin)) * 100));
    const widthPct = Math.max(15, Math.min(100 - leftPct, ((max - min) / (baseMax - baseMin)) * 100));
    return { leftPct, widthPct };
  };

  return (
    <div
      onClick={() => onOpenDetails(apiary)}
      className="group rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#1C1A17] text-stone-900 dark:text-stone-100 p-5 shadow-sm transition-all duration-200 hover:shadow-xl hover:border-amber-500/50 cursor-pointer space-y-4 relative overflow-hidden select-none"
    >
      {/* Top Banner on Hover Cue */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-400 font-black shadow-sm group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 pointer-events-none select-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {displayName}
              </h3>
              <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all pointer-events-none select-none" />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              {displayLocation}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <ShieldCheck className="w-3.5 h-3.5 pointer-events-none select-none" /> Optimal
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Layers className="w-3.5 h-3.5 text-amber-600 pointer-events-none select-none" /> {hiveCount} Hives
          </span>
        </div>
      </div>

      {/* Live Current Weather Hero Card */}
      <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <WeatherIcon className="w-7 h-7 pointer-events-none select-none" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {weather?.currentTemp !== undefined ? `${weather.currentTemp}°C` : "—"}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  ({apiary.size_acres} Acres)
                </span>
              </div>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {currentCondition} • High: {maxTemp}° / Low: {minTemp}°
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 font-semibold text-[11px]">
              <Droplets className="w-3.5 h-3.5 text-blue-500 pointer-events-none select-none" />
              {weather?.currentHumidity !== undefined ? `${weather.currentHumidity}% Humidity` : "—"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 font-semibold text-[11px]">
              <Wind className="w-3.5 h-3.5 text-emerald-500 pointer-events-none select-none" />
              {weather?.currentWind !== undefined ? `${weather.currentWind} km/h Wind` : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Open-Meteo Live API
          </span>
          <span className="font-mono">Synced: {weather?.lastUpdated || "Live"}</span>
        </div>
      </div>

      {/* Hourly Weather Forecast */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Hourly Microclimate Forecast
        </p>
        <div className="overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          <div className="flex items-center justify-between gap-2 min-w-[280px]">
            {(weather?.hourly || []).map((slot, idx) => {
              const { Icon } = getWeatherMeta(slot.code);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 text-center flex-1 py-1.5 px-1 rounded-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60"
                >
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">{slot.time}</span>
                  <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 pointer-events-none select-none" />
                  <span className="text-xs font-black text-stone-800 dark:text-stone-200">{slot.temp}°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-Day Temperature Forecast */}
      <div className="space-y-2 pt-1 border-t border-stone-200 dark:border-stone-800">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          5-Day Forecast
        </p>
        {(weather?.daily || []).map((dayItem, dIdx) => {
          const { Icon } = getWeatherMeta(dayItem.code);
          const { leftPct, widthPct } = getGradientOffsets(dayItem.min, dayItem.max);

          return (
            <div key={dIdx} className="grid grid-cols-12 items-center gap-2 text-xs">
              <span className="col-span-3 font-bold text-stone-700 dark:text-stone-300 text-[11px]">
                {dayItem.day}
              </span>
              <div className="col-span-1 flex justify-center">
                <Icon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 pointer-events-none select-none" />
              </div>
              <span className="col-span-2 text-right text-stone-500 dark:text-stone-400 font-medium text-[11px]">
                {dayItem.min}°
              </span>
              <div className="col-span-4 px-1">
                <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
                    style={{
                      marginLeft: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
              </div>
              <span className="col-span-2 text-left font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                {dayItem.max}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info: Forage Flora & Action buttons */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-600 dark:text-stone-400 truncate max-w-[220px]">
          🌸 <strong className="font-semibold text-stone-700 dark:text-stone-300">{apiary.forage_type}</strong>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(apiary);
            }}
            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 p-1 hover:underline active:scale-95 transition-transform"
          >
            <Edit className="w-3 h-3 pointer-events-none select-none" /> Edit
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(apiary.id, displayName);
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 p-1 hover:underline active:scale-95 transition-transform"
              title="Delete apiary"
            >
              <Trash2 className="w-3 h-3 pointer-events-none select-none" /> Delete
            </button>
          )}
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
            View Details <ChevronRight className="w-3 h-3 pointer-events-none select-none" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default ApisenseWeatherCard;
