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
    image: '/images/app-screenshots/hive-list-varroa.png',
    title: 'Live Apiary & Hive Overview',
    description:
      'Real-time telemetry showing live VitalSensor Bluetooth signals, battery health, internal brood temperatures (30.5°C), and automated colony state classifications (Healthy vs. Varroa alert) across each hive unit.',
  },
  {
    image: '/images/app-screenshots/varroa-detail.png',
    title: 'AI Disease & Varroa Diagnostics',
    description:
      'Automated pathogen tracking with mite drop thresholds (>11/day, >5% wash), infestation duration records, and step-by-step veterinary protocols including powdered sugar roll tests to prevent colony collapse.',
  },
  {
    image: '/images/app-screenshots/hive-conditions.png',
    title: 'In-Hive Microclimate Telemetry',
    description:
      'Continuous precision monitoring of core hive temperature (30.5°C), internal relative humidity (57%), and local atmospheric barometric pressure (907 hPa) for complete climate stability.',
  },
  {
    image: '/images/app-screenshots/honey-gain-chart.png',
    title: '24h Diurnal Honey Gain Dynamics',
    description:
      'Continuous hourly weight change analytics (+0.5 kg 24h gain) showing real-time forage curves, peak foraging hours, and night-time moisture evaporation from fresh nectar.',
  },
  {
    image: '/images/app-screenshots/weight-chart.png',
    title: 'Precision Colony Weight Telemetry',
    description:
      'Continuous sub-milligram load cell telemetry tracking total hive mass (40.5 kg) with interactive 24h, 7-day, 1-month, 3-month, and 6-month historical harvest trends.',
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
  { label: 'Tactical Grid', icon: Layers, path: '/beeyield-dashboard?tab=pollination-grid', description: 'Live device monitoring' },
  { label: 'Pollination Calcs', icon: Calculator, path: '/beeyield-dashboard?tab=pollination-calcs', description: 'Yield & FPA analysis' },
  { label: 'Flight Mapping', icon: Navigation, path: '/beeyield-dashboard?tab=flight-mapping-tactical', description: 'Geospatial movement' },
  { label: 'Site Reports', icon: FileBarChart, path: '/beeyield-dashboard?tab=site-reports-tactical', description: 'Audit & compliance' },
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

/* ── BeeHUB Product Image Paths (Authentic Devices, Hives & Bees Only) ────────── */

export const BEEHUB_IMAGES = {
  apiaryHero: '/images/pollination/hive-comb-inspection-8.png',
  queenDetail: '/images/pollination/gateway-solar-node.png',
  senseUnit: '/images/pollination/hive-scale-loadcell.png',
  deployed: '/images/pollination/hive-comb-inspection-6.png',
  dashboard: '/images/pollination/hive-comb-inspection-7.png',
  solarGateway: '/images/pollination/gateway-solar-node.png',
  hiveScale: '/images/pollination/hive-scale-loadcell.png',
  broodProbe: '/images/diseases/hive-inspection-1.png',
  activeCluster: '/images/diseases/hive-inspection-2.png',
  combIntegration: '/images/pollination/hive-comb-inspection-7.png',
} as const;

/* ── In-Hive Real Field Telemetry Slideshow Dataset ─────────────── */

export interface InHiveFieldSlide {
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
}

export const IN_HIVE_FIELD_SLIDES: InHiveFieldSlide[] = [
  {
    image: '/images/pollination/gateway-solar-node.png',
    title: 'Autonomous Solar IoT Gateway',
    subtitle: 'High-gain dual antenna LTE gateway with integrated solar harvest panel',
    badge: 'Solar IoT Gateway',
    description: 'Weatherproof off-grid transmission hub communicating with up to 100 in-hive sensors across an entire commercial apiary with zero grid power required.',
  },
  {
    image: '/images/pollination/hive-scale-loadcell.png',
    title: 'Precision Under-Hive Scale Mount',
    subtitle: 'Continuous industrial load cell scale installed below hive floor frame',
    badge: 'Hive Weight Telemetry',
    description: 'Tracks daily honey accumulation, nectar flow dynamics, robbing alerts, and colony biomass changes in real time with gram-level precision.',
  },
  {
    image: '/images/diseases/hive-inspection-1.png',
    title: 'In-Hive Sensor Deployment',
    subtitle: 'Vertical telemetry probe positioned directly between active brood frames',
    badge: 'Brood Core Telemetry',
    description: 'Measures continuous internal temperature, relative humidity, volatile organic compounds, and acoustics right at the colony core.',
  },
  {
    image: '/images/diseases/hive-inspection-2.png',
    title: 'Live Colony & Worker Bee Cluster',
    subtitle: 'Natural worker bee cluster and active inspection around sensor housing',
    badge: 'Colony Health & Vitality',
    description: 'Bees embrace the food-grade biocompatible casing, maintaining standard brood care, queen attendance, and foraging without behavioral disruption.',
  },
  {
    image: '/images/pollination/hive-comb-inspection-7.png',
    title: 'Natural Comb & Wax Building',
    subtitle: 'Fresh white honeycomb drawn seamlessly along the sensor frame',
    badge: 'Non-Invasive Biocompatibility',
    description: 'Colony draws healthy wax comb right against the probe, proving 100% biocompatibility and zero chemical or acoustic interference.',
  },
  {
    image: '/images/pollination/hive-comb-inspection-6.png',
    title: 'Acoustic Diagnostic Sampling',
    subtitle: 'High-fidelity audio sampling for swarm and stress detection',
    badge: 'Acoustic AI Analysis',
    description: 'Analyzes colony buzzing frequencies in real time to detect queenlessness, pre-swarm piping, and defensive agitation days in advance.',
  },
  {
    image: '/images/diseases/hive-inspection-3.png',
    title: 'Early Disease & Pathogen Defense',
    subtitle: 'Gas & VOC monitoring for Foulbrood, Varroa, and Nosema',
    badge: 'Pathogen Defense',
    description: 'Continuous chemical signatures detect microbial decay and pathogen presence up to 2-3 weeks before visual symptoms manifest.',
  },
  {
    image: '/images/pollination/hive-comb-inspection-8.png',
    title: 'Top-Down Multi-Frame Coverage',
    subtitle: 'Broad-spectrum colony monitoring for commercial precision pollination',
    badge: 'Precision Pollination',
    description: 'Guarantees growers verified frames-per-acre strength and continuous pollination performance throughout the crop flowering window.',
  }
];

/* ── Honey Types & Color Grades (Used in Harvest Forms) ────────── */

export const HONEY_TYPES = ['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed', 'Wildflower'] as const;

export const COLOR_GRADES = ['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'] as const;
