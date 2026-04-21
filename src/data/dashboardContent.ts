/**
 * dashboardContent.ts
 * ─────────────────────────────────────────────────────────────────
 * Centralized content for the Dashboard Home View.
 * Quick-access views, weather readiness thresholds, and
 * stat card definitions are all defined here.
 * ─────────────────────────────────────────────────────────────────
 */

import type { LucideIcon } from 'lucide-react';
import {
  Cpu, Activity, FileBarChart, ClipboardList, HelpCircle, Puzzle,
} from 'lucide-react';

/* ── Quick-Access View Shortcuts ───────────────────────────────── */

export interface QuickAccessView {
  id: string;
  label: string;
  icon: LucideIcon;
  sub: string;
}

export const QUICK_ACCESS_VIEWS: QuickAccessView[] = [
  { id: 'devices', label: 'Devices', icon: Cpu, sub: 'Sensors & activity' },
  { id: 'meters', label: 'Meters', icon: Activity, sub: 'Usage & alarms' },
  { id: 'precision-pollination-folder', label: 'Pollination', icon: FileBarChart, sub: 'Plans & exports' },
  { id: 'task', label: 'My Task', icon: ClipboardList, sub: 'Tasks & setup' },
  { id: 'requests', label: 'Requests', icon: HelpCircle, sub: 'Support tickets' },
  { id: 'integrations', label: 'Integrations', icon: Puzzle, sub: 'QuickBooks / Shopify' },
];

/* ── Weather Readiness Thresholds ──────────────────────────────── */

export interface WeatherReadinessLevel {
  label: string;
  tone: string;
  detail: string;
}

export const WEATHER_READINESS = {
  hold: {
    label: 'Hold',
    tone: 'border-[#f3c4be] bg-[#fff1ef] text-[#b45309]',
    detail: 'Flight activity may stay grounded until temperatures recover.',
  } satisfies WeatherReadinessLevel,
  watch: {
    label: 'Watch',
    tone: 'border-[#f4df9b] bg-[#fff7de] text-[#a16207]',
    detail: 'Telemetry suggests moderate stress for foraging routes.',
  } satisfies WeatherReadinessLevel,
  ready: {
    label: 'Ready',
    tone: 'border-[#cde7cf] bg-[#eefaf0] text-[#166534]',
    detail: 'Conditions are supportive for inspections and active forage windows.',
  } satisfies WeatherReadinessLevel,
} as const;

/* ── Thresholds for readiness resolution ───────────────────────── */

export const WEATHER_THRESHOLDS = {
  coldTemperatureC: 10,
  highWindKmh: 22,
  highHumidityPct: 88,
} as const;
