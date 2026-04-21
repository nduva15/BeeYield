/**
 * settingsConfig.ts
 * ─────────────────────────────────────────────────────────────────
 * Centralized configuration for the Settings page modules,
 * alert options, and billing overview fields. Eliminates
 * hardcoded inline arrays from SettingsView.tsx.
 * ─────────────────────────────────────────────────────────────────
 */

import type { LucideIcon } from 'lucide-react';
import {
  Hexagon, Globe, Cpu, Activity, Bell, Smartphone,
  CreditCard, Receipt, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

/* ── Settings Tab Definitions ──────────────────────────────────── */

export interface SettingsTab {
  value: string;
  label: string;
  icon: LucideIcon;
}

// Imported inline inside SettingsView — moved to config:
import { User, Layers, ShieldCheck } from 'lucide-react';

export const SETTINGS_TABS: SettingsTab[] = [
  { value: 'identity', label: 'Profile', icon: User },
  { value: 'modules', label: 'Modules', icon: Layers },
  { value: 'alerts', label: 'Alerting', icon: Bell },
  { value: 'security', label: 'Security', icon: ShieldCheck },
  { value: 'billing', label: 'Billing', icon: CreditCard },
];

/* ── Module Toggles ────────────────────────────────────────────── */

export interface ModuleToggle {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

export const MODULE_TOGGLES: ModuleToggle[] = [
  { id: 'beehives', label: 'Commercial apiaries', desc: 'Hive health metrics and alerts.', icon: Hexagon, color: 'text-[#F4D03F]' },
  { id: 'agro', label: 'Meteo & Bloom', desc: 'Satellite weather analytics.', icon: Globe, color: 'text-[#1B9157]' },
  { id: 'trackers', label: 'Hardware add-ons', desc: 'Solar device status and metrics.', icon: Cpu, color: 'text-blue-500' },
  { id: 'patients', label: 'Biometric Lab', desc: 'Advanced veterinary disease analysis.', icon: Activity, color: 'text-red-500' },
];

/* ── Alert Type Definitions ────────────────────────────────────── */

export interface AlertToggle {
  id: string;
  title: string;
  desc: string;
  color: string;
}

export const INTERNAL_ALERTS: AlertToggle[] = [
  { id: 'aiAnomalies', title: 'Unusual readings', desc: 'Spikes or drops in sensor readings.', color: 'emerald-500' },
  { id: 'swarmRisk', title: 'Swarm risk', desc: 'Signs your hive may swarm soon.', color: 'amber-500' },
  { id: 'onboardingHints', title: 'Tips and reminders', desc: 'Helpful prompts while you work.', color: 'blue-500' },
];

export const DELIVERY_ALERTS: AlertToggle[] = [
  { id: 'malfunction', title: 'Device issues', desc: 'Critical sensor or device failures.', color: 'red-500' },
  { id: 'lowBattery', title: 'Low battery', desc: 'When a device battery gets low.', color: 'blue-500' },
  { id: 'marketing', title: 'Product updates', desc: 'News and pricing updates.', color: 'amber-500' },
];

/* ── Billing Overview Fields ───────────────────────────────────── */

export interface BillingField {
  label: string;
  key: 'total_revenue' | 'total_costs' | 'net_result';
  icon: LucideIcon;
  color: string;
}

export const BILLING_FIELDS: BillingField[] = [
  { label: 'Revenue', key: 'total_revenue', icon: Receipt, color: 'text-[#1B9157]' },
  { label: 'Costs', key: 'total_costs', icon: ArrowDownRight, color: 'text-red-500' },
  { label: 'Net', key: 'net_result', icon: ArrowUpRight, color: 'text-[#F4D03F]' },
];
