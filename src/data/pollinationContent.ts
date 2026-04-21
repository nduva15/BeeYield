/**
 * pollinationContent.ts
 * ─────────────────────────────────────────────────────────────────
 * Centralized content store for the Precision Pollination page.
 * All marketing copy, feature arrays, and configuration data
 * are maintained here instead of being hardcoded in components.
 * ─────────────────────────────────────────────────────────────────
 */

import type { LucideIcon } from 'lucide-react';
import {
  Cpu, Wifi, LayoutDashboard, Calculator, Thermometer, Mic,
  BarChart3, MapPin, Activity, Shield, Search, Sparkles,
  Map, Layers, Volume2, Navigation, FileBarChart,
} from 'lucide-react';

/* ── Showcase Slides (BeeHUB Feature Carousel) ─────────────────── */

export interface ShowcaseSlide {
  image: string;
  title: string;
  description: string;
}

export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    image: '/images/beehub/screenshot-quick-analysis.png',
    title: 'Quick Analysis',
    description:
      'Fast statistical overview for decision-making. View activity status, brood strength, temperature, humidity, daily weight changes, and swarm/pest risk — all at a glance.',
  },
  {
    image: '/images/beehub/screenshot-acoustic-audit.png',
    title: 'Acoustic Audit',
    description:
      'Record a short sample and check for unusual sound patterns. BeeYield AI processes spectral wave data at 94.8% confidence to detect pre-swarm signatures and colony anomalies.',
  },
  {
    image: '/images/beehub/screenshot-beeyield-ai.png',
    title: 'BeeYield AI',
    description:
      "The world's most comprehensive bee knowledge system. Powered by an extensive dataset covering every bee species, honey variety, disease, treatment, pollination science, and global industry research.",
  },
  {
    image: '/images/beehub/screenshot-capabilities.png',
    title: 'Platform Capabilities',
    description:
      '20,000+ bee species covered, 300+ honey varieties, 50+ disease protocols, 750K+ research datasets, 91 million managed hives globally. Comprehensive database, image identification, and voice input.',
  },
  {
    image: '/images/beehub/screenshot-coverage-area.png',
    title: 'Coverage Area',
    description:
      'Spatial overlay of your apiary with kernel density mapping. Monitor coverage metrics, FPA targets, node efficiency, and hive spacing with live environmental telemetry and actionable insights.',
  },
  {
    image: '/images/beehub/screenshot-flight-area.png',
    title: 'Bee Flight Area',
    description:
      'Live forage, map, and route planning for your selected apiary. View forage potential, effective and maximum flight radius, land type analysis, flight heatmaps, and forage share estimates.',
  },
  {
    image: '/images/beehub/screenshot-devices.png',
    title: 'Device Management',
    description:
      'Manage your BeeHUB devices and view recent readings. Monitor total inventory, active devices, offline status, battery levels, and real-time apiary weather telemetry including humidity, pressure, wind, and UV index.',
  },
];

/* ── Feature Badges ────────────────────────────────────────────── */

export interface FeatureBadge {
  label: string;
  icon: LucideIcon;
}

export const FEATURE_BADGES: FeatureBadge[] = [
  { label: 'AI swarm detection', icon: Sparkles },
  { label: 'Flight-radius map', icon: Map },
  { label: 'Unlimited apiaries/hives', icon: Layers },
  { label: 'Image & sound analytics', icon: Volume2 },
];

/* ── Professional Suite Tools ──────────────────────────────────── */

export interface ProfessionalTool {
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
}

export const PROFESSIONAL_TOOLS: ProfessionalTool[] = [
  { label: 'Tactical Grid', icon: Layers, path: '/beeyield-dashboard', description: 'Live device monitoring' },
  { label: 'Pollination Calcs', icon: Calculator, path: '/precision-pollination/calcs', description: 'Yield & FPA analysis' },
  { label: 'Flight Mapping', icon: Navigation, path: '/precision-pollination/map', description: 'Geospatial movement' },
  { label: 'Site Reports', icon: FileBarChart, path: '/precision-pollination/reports', description: 'Audit & compliance' },
];

/* ── How It Works Items ────────────────────────────────────────── */

export interface HowItWorksItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HOW_IT_WORKS: HowItWorksItem[] = [
  {
    title: 'BeeHUB Queen',
    description:
      'Main unit with LTE/SIM and offline buffer. Measures internal/external temperature, internal humidity, acoustics, weight (via hive scale) and location. Alerts include vandalism/theft, sudden weight drops and acoustic anomalies.',
    icon: Cpu,
  },
  {
    title: 'BeeHUB Sense',
    description:
      'BLE expansion module that connects to the Queen or mobile/web app. Flexible add-ons for additional temperature/humidity points and industrial inputs.',
    icon: Mic,
  },
  {
    title: 'Secure Transmission',
    description:
      'The BeeHUB Queen sends telemetry info securely via LTE to our cloud system for real-time review, with offline buffering for remote locations.',
    icon: Wifi,
  },
  {
    title: 'Dashboard Visibility',
    description:
      'All key metrics — hive weight, sound spectrum/FFT, GPS location, battery level, and solar charging status — processed and displayed for complete accountability.',
    icon: LayoutDashboard,
  },
];

/* ── Pollination Advantages ────────────────────────────────────── */

export interface PollinationAdvantage {
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
}

export const POLLINATION_ADVANTAGES: PollinationAdvantage[] = [
  {
    title: 'Frames-Per-Acre Count',
    description:
      'Knowing the exact strength of every hive in your field means pollination can be calculated using a precise frames-per-acre model.',
    icon: Calculator,
    badge: 'Precision Calculation',
  },
  {
    title: 'Financial Prudence',
    description:
      'It\'s accurate, efficient, and cost-effective. You stop paying for "boxes" and start paying for actual pollination power.',
    icon: Shield,
    badge: 'Cost Effectiveness',
  },
  {
    title: 'Unmatched Transparency',
    description:
      'From the day the bees are delivered until the day they are removed, we are accountable to you for optimal pollination outcomes.',
    icon: Search,
    badge: 'Full Accountability',
  },
];

/* ── Advantage Table (Feature Comparison) ──────────────────────── */

export interface AdvantageRow {
  feature: string;
  technology: string;
  benefit: string;
  icon: LucideIcon;
}

export const ADVANTAGE_TABLE: AdvantageRow[] = [
  {
    feature: 'Internal Temperature',
    technology: 'BeeHUB Sense tracks colony condition and brood development in real-time.',
    benefit: 'Early detection of stress, disease risk, and optimal brood-rearing conditions.',
    icon: Thermometer,
  },
  {
    feature: 'Sound Spectrum (FFT)',
    technology: 'BeeHUB Queen captures acoustic signatures for pre-swarm detection and colony mood analysis.',
    benefit: 'Prevents swarming losses and identifies queenless colonies before visual inspection.',
    icon: Mic,
  },
  {
    feature: 'Hive Weight',
    technology: 'Continuous weight monitoring tracks forage intake, harvest timing, robbing events, and migrations.',
    benefit: 'Optimal harvest timing and immediate alerts for robbing or sudden weight drops.',
    icon: BarChart3,
  },
  {
    feature: 'GPS Location',
    technology: 'BeeHUB Queen tracks moves, theft attempts, and maintains historical route data.',
    benefit: 'Anti-theft protection with instant vandalism alerts and geofencing capability.',
    icon: MapPin,
  },
  {
    feature: 'Battery & Solar Status',
    technology: 'Device battery level and solar charging status monitored continuously for proactive maintenance.',
    benefit: 'Plan logistics and maintenance proactively — continuous operation with solar add-on.',
    icon: Activity,
  },
];

/* ── AI Capabilities List ──────────────────────────────────────── */

export const AI_CAPABILITIES: string[] = [
  'Precision Calculation — accurate frames-per-acre modeling based on hive data',
  'Financial Prudence — pay for actual pollination power, not just boxes',
  'Accountability — rapid deployment and replacement of non-performing hives',
  'Interactive Reporting — easy-to-understand metrics for drop points and activity',
  'Complete Transparency — insight from the day bees are delivered until removal',
];

/* ── BeeHUB Product Image Paths ────────────────────────────────── */

export const BEEHUB_IMAGES = {
  apiaryHero: '/images/beehub/apiary-lavender.jpg',
  queenDetail: '/images/beehub/queen-product-detail.png',
  senseUnit: '/images/beehub/sense-unit.png',
  deployed: '/images/beehub/deployed-hive-bees.jpg',
  dashboard: '/images/beehub/beeyield-dashboard.png',
} as const;

/* ── Honey Types & Color Grades (Used in Harvest Forms) ────────── */

export const HONEY_TYPES = ['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed', 'Wildflower'] as const;

export const COLOR_GRADES = ['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'] as const;
