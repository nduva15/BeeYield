import React from 'react';
import ErrorBoundary from '@/components/beeyield/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useDevices } from '@/hooks/useDevices';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { useSensorAlerts } from '@/hooks/useSensorAlerts';
import { 
    LayoutGrid, MessageSquare, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle,
    Plus, Filter, SlidersHorizontal, MoreHorizontal, Battery, Wifi, Clock, AlertTriangle, CheckCircle2,
    X, ChevronDown, MapPin, Search, ClipboardList, Calculator, LifeBuoy, Settings,
    Hand, Map, TrendingUp, Volume2, Camera, BookOpen, Droplet, Flame, Zap, Building2, Home, PieChart,
    ArrowRightLeft, FileInput, Bot, Activity, Gauge, List, Layers, BarChart3, Upload, LayoutList, Hexagon, Puzzle,
    LogIn, UserPlus, Loader2, ArrowLeft, Shield, Lock as LockIcon, Bell, Banknote, Globe, Tag, ShieldCheck, Server,
    Navigation, FileBarChart, Brain, Crosshair, Scale, FileCheck, Bug, Calendar, Heart, Award, Sparkles
} from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { useSettings } from '@/contexts/SettingsContext';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import {
    clearBeeYieldPendingOnboarding,
    getBeeYieldDashboardTarget,
    getBeeYieldPendingOnboarding,
    resolveBeeYieldOnboardingStep,
    setBeeYieldPendingOnboarding,
} from '@/lib/beeyieldOnboarding';

// View Imports
import BeeYieldOnboardingWizard from '@/components/beeyield/BeeYieldOnboardingWizard';
import { BeeYieldOnboardingStep } from '@/lib/beeyieldOnboarding';
import DashboardHomeView from '@/components/beeyield/DashboardHomeView';
import ApiariesPage from '@/components/beeyield/lovable_ai/ApiariesPage';
import MOACompare from '@/components/beeyield/lovable_ai/MOACompare';
import KnowledgeSearch from '@/components/beeyield/lovable_ai/KnowledgeSearch';
import ForageZonesPage from '@/components/beeyield/lovable_ai/ForageZonesPage';
import AboutModal from '@/components/beeyield/lovable_ai/AboutModal';
import LovableBeeYieldAI from '@/components/beeyield/lovable_ai/LovableIndex';
import PollinationEngine from '@/components/beeyield/PollinationEngine';
import PrecisionPollinationView from '@/components/beeyield/PrecisionPollinationView';
import HpaOptimizer from '@/components/beeyield/HpaOptimizer';
import ForageZonesView from '@/components/beeyield/ForageZonesView';
import HiveLogisticsSecurity from '@/components/beeyield/HiveLogisticsSecurity';
import FlightMapping from '@/pages/pollination/FlightMapping';
import PollinationReports from '@/pages/pollination/PollinationReports';
import PollinationCalcs from '@/components/beeyield/lovable_ai/PollinationCalcs';
import SensorAlertsView from '@/components/beeyield/SensorAlertsView';
import BloomPhenology from '@/pages/BloomPhenology';
import BeeCalculatorSuite from '@/pages/BeeCalculatorSuite';
import VpmAutoCounter from '@/components/beeyield/VpmAutoCounter';
import BeeFlightHoursForecast from '@/components/beeyield/BeeFlightHoursForecast';
import PredictiveSuccessEngine from '@/components/beeyield/PredictiveSuccessEngine';
import SensorHealthView from '@/components/beeyield/SensorHealthView';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldHivesView from '@/components/beeyield/BeeYieldHivesView';
import InspectionsView from '@/components/beeyield/InspectionsView';
import HarvestsView from '@/components/beeyield/HarvestsView';
import FlightMapView from '@/components/beeyield/FlightMapView';

import DeviceDetailView from '@/components/beeyield/DeviceDetailView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import IntegrationsView from '@/components/beeyield/IntegrationsView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';
import SettingsView from '@/components/beeyield/SettingsView';
import ImageAnalysisView from '@/components/beeyield/ImageAnalysisView';
import SoundAnalysisView from '@/components/beeyield/SoundAnalysisView';
import SoundAnalysis from '@/components/beeyield/lovable_ai/SoundAnalysis';
import AcousticSpectralView from '@/components/beeyield/AcousticSpectralView';
import HealthGuideView from '@/components/beeyield/HealthGuideView';
import ReportsExportsView from '@/components/beeyield/ReportsExportsView';
import LabelGeneratorView from '@/components/beeyield/LabelGeneratorView';
import PollinationPlanning from '@/components/beeyield/lovable_ai/PollinationPlanning';
import PollinationLookup from '@/components/beeyield/lovable_ai/PollinationLookup';
import PollinationCharts from '@/components/beeyield/lovable_ai/PollinationCharts';
import BeeDiseasesPage from '@/components/beeyield/lovable_ai/BeeDiseasesPage';
import BloomPhenologyEmbed from '@/components/beeyield/lovable_ai/BloomPhenology';
import FlightTrackerEmbed from '@/components/beeyield/lovable_ai/BeeFlightTracker';
import AlertsPage from '@/components/beeyield/lovable_ai/AlertsPage';
import HarvestCalculator from '@/components/beeyield/lovable_ai/HarvestCalculator';
import ActivityCounter from '@/components/beeyield/lovable_ai/ActivityCounter';
import ActivityForecaster from '@/components/beeyield/lovable_ai/ActivityForecaster';
import HivePlacementMap from '@/components/beeyield/lovable_ai/HivePlacementMap';
import PrecisionDrilldown from '@/components/beeyield/lovable_ai/PrecisionDrilldown';
import MOAView from '@/components/beeyield/lovable_ai/MOAView';
import FloragePage from '@/components/beeyield/lovable_ai/FloragePage';
import BeeyieldCalculators from '@/components/beeyield/lovable_ai/BeeyieldCalculators';
import VarroaSimulator from '@/components/beeyield/lovable_ai/VarroaSimulator';
import DatasetImport from '@/components/beeyield/lovable_ai/DatasetImport';
import FeedingSchedule from '@/components/beeyield/lovable_ai/FeedingSchedule';
import ApiarySizing from '@/components/beeyield/lovable_ai/ApiarySizing';
import YieldProjection from '@/components/beeyield/lovable_ai/YieldProjection';
import MeasurementDataTools from '@/components/beeyield/lovable_ai/MeasurementDataTools';
import HiveHealthDashboard from '@/components/beeyield/lovable_ai/HiveHealthDashboard';
import SupportPageModal from '@/components/beeyield/lovable_ai/SupportPageModal';
import SupportPage from '@/components/beeyield/lovable_ai/SupportPage';
import SettingsPage from '@/components/beeyield/lovable_ai/SettingsPage';
import InspectionsPage from '@/components/beeyield/lovable_ai/InspectionsPage';
import TasksPage from '@/components/beeyield/lovable_ai/TasksPage';
import HarvestsPage from '@/components/beeyield/lovable_ai/HarvestsPage';
import IntegrationsPage from '@/components/beeyield/lovable_ai/IntegrationsPage';

type AuthMode = 'login' | 'register' | 'forgot-password';
const NEW_ACCOUNT_ONBOARDING_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

const BeeYieldDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut, beeyieldUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { moduleFlags } = useSettings();
    const effectiveUser = beeyieldUser || user;
    const effectiveEmail = beeyieldUser?.email || user?.email;

    const isDirectAiRoute = location.pathname === '/beeyield-ai' || location.pathname === '/assistant';
    const [activeTab, setActiveTab] = React.useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || (isDirectAiRoute ? 'assistant' : 'home');
    });
    const [aiInitialMessage, setAiInitialMessage] = React.useState<string | null>(null);
    const [viewParams, setViewParams] = React.useState<{ message?: string, action?: string } | null>(null);
    const [dashboardOpenedAt] = React.useState(() => Date.now());

    const { data: rawApiaries, isLoading: apiariesLoading, refetch: refetchApiaries } = useApiaries();
    const { data: rawHives, isLoading: hivesLoading, refetch: refetchHives } = useHives();
    const { data: rawDevices, isLoading: devicesLoading, refetch: refetchDevices } = useDevices();
    const { data: rawReadings, isLoading: readingsLoading } = useSensorReadings(undefined, 24 * 7);

    const { apiaries, hives, devices, readings } = React.useMemo(() => ({
        apiaries: rawApiaries || [],
        hives: rawHives || [],
        devices: rawDevices || [],
        readings: rawReadings || [],
    }), [rawApiaries, rawHives, rawDevices, rawReadings]);

    const loading = apiariesLoading || hivesLoading || devicesLoading || readingsLoading;
    
        const hasCompletedOnboarding = React.useMemo(() => {
        if (!effectiveUser?.id) return false;
        return (
            localStorage.getItem(`beeyield_onboarding_completed_${effectiveUser.id}`) === 'true' ||
            localStorage.getItem(`beeyield_onboarding_dismissed_${effectiveUser.id}`) === 'true'
        );
    }, [effectiveUser?.id]);

    const pendingOnboarding = React.useMemo(
        () => (effectiveEmail ? getBeeYieldPendingOnboarding(effectiveEmail) : null),
        [effectiveEmail]
    );

    // Enforce 3-step sequence for new signups:
    // Step 1: Register primary Apiary
    // Step 2: Register Hives with initial Harvest logging
    // Step 3: Log IoT Devices (with skip option)
    const onboardingStep = React.useMemo<BeeYieldOnboardingStep | null>(() => {
        if (authLoading || loading) return null;
        if (!effectiveUser) return null;
        if (hasCompletedOnboarding) return null;

        // Step 1: Register Apiary (if no apiaries exist)
        if (apiaries.length === 0) {
            return 'apiary';
        }

        // Step 2: Hives with Harvests (if no hives exist)
        if (hives.length === 0) {
            return 'hive';
        }

        // Step 3: Log Devices (unless skipped)
        const hasSkippedDevices = localStorage.getItem(`beeyield_skipped_devices_${effectiveUser.id}`) === 'true';
        if (devices.length === 0 && !hasSkippedDevices) {
            return 'device';
        }

        return null;
    }, [authLoading, loading, effectiveUser, hasCompletedOnboarding, apiaries.length, hives.length, devices.length]);

    const handleTabChange = (tab: string, message?: string, action?: string) => {
        if (tab === 'assistant' && message) {
            setAiInitialMessage(message);
        }
        setViewParams({ message, action });
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/shop');
        toast.success(t('disconnected_success'));
    };

    const refreshTelemetryData = React.useCallback(async () => {}, []);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const message = params.get('message');
        const action = params.get('action');
        if (tab) {
            setActiveTab(tab);
            setViewParams({ message: message || undefined, action: action || undefined });
        }
        if (message) {
            setAiInitialMessage(message);
        }
    }, []);

    React.useEffect(() => {
        if (authLoading || loading) return;
        const pendingState = effectiveEmail ? getBeeYieldPendingOnboarding(effectiveEmail) : null;
        if (!pendingState || !effectiveUser?.created_at) return;

        const accountCreatedAtMs = new Date(effectiveUser.created_at).getTime();
        if (Number.isNaN(accountCreatedAtMs) || (Date.now() - accountCreatedAtMs) > NEW_ACCOUNT_ONBOARDING_WINDOW_MS) {
            clearBeeYieldPendingOnboarding();
            return;
        }

        const requiredStep = resolveBeeYieldOnboardingStep({
            apiaries: apiaries.length,
            hives: hives.length,
            devices: devices.length,
        });

        if (!requiredStep) {
            clearBeeYieldPendingOnboarding();
            return;
        }

        const target = getBeeYieldDashboardTarget(requiredStep, {
            apiaryId: pendingState?.apiaryId,
            hiveId: pendingState?.hiveId,
        });

        setBeeYieldPendingOnboarding({
            step: requiredStep,
            email: effectiveEmail || undefined,
            apiaryId: pendingState?.apiaryId,
            hiveId: pendingState?.hiveId,
        });

        if (activeTab !== target.tab || viewParams?.action !== target.action) {
            handleTabChange(target.tab, undefined, target.action);
            const params = new URLSearchParams(window.location.search);
            params.set('tab', target.tab);
            params.set('action', target.action);
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
    }, [authLoading, loading, effectiveEmail, effectiveUser?.created_at, apiaries.length, hives.length, devices.length, activeTab, viewParams?.action]);

    const navItems: NavItem[] = React.useMemo(() => [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'assistant', label: 'BeeYield AI', icon: Hexagon },
        {
            id: 'precision-pollination-folder',
            label: 'Pollination',
            icon: Calculator,
            submenuItems: [
                {
                    title: 'Strategy & Ops',
                    items: [
                                                { id: 'pollination-grid', label: 'Precision Pollination', icon: LayoutGrid },
                        { id: 'pollination-calcs', label: 'Pollination Calcs', icon: Calculator },
                        { id: 'pollination-planning-ai', label: 'AI Pollination Plan', icon: Sparkles },
                        { id: 'beeyield-calculators', label: 'Calculator Hub', icon: Calculator },
                        { id: 'varroa-simulator', label: 'Varroa Simulator', icon: TrendingUp },
                        { id: 'pollination-engine', label: 'Pollination planning', icon: Cpu },
                        { id: 'hpa-optimizer', label: 'Performance planning', icon: Cpu },
                    ]
                },
                {
                    title: 'Field Logistics',
                    items: [
                        { id: 'forage-zones', label: 'Forage zones', icon: MapPin },
                        { id: 'flight-mapping-tactical', label: 'Flight Mapping', icon: Navigation },
                        { id: 'site-reports-tactical', label: 'Pollination Site Reports', icon: FileBarChart },
                    ]
                },
                {
                    title: 'Alerts & Phenology',
                    items: [
                        { id: 'sensor-alerts', label: 'Sensor Alerts', icon: Bell },
                        { id: 'bloom-tracking', label: 'Bloom Phenology', icon: Zap },
                    ]
                },
                {
                    title: 'Analysis & Yield',
                    items: [
                        { id: 'pollination-lookup', label: 'PSI Lookup', icon: Search },
                        { id: 'pollination-analytics', label: 'Pollination Data', icon: BarChart3 },
                        { id: 'vpm-counter', label: 'Activity counter', icon: Camera },
                        { id: 'bfh-forecast', label: 'Activity forecast', icon: Zap },
                        { id: 'yield-predict', label: 'Production estimate', icon: BarChart3 },
                        { id: 'moa-view', label: 'MOA View', icon: Layers },
                        { id: 'florage-page', label: 'Florage Database', icon: Crosshair },
                        { id: 'site-map', label: 'Hive Placement Map', icon: MapPin },
                    ]
                },
                {
                    title: 'Knowledge & Planning',
                    items: [
                        { id: 'dataset-import', label: 'Dataset Import & Re-index', icon: FileInput },
                        { id: 'feeding-schedule', label: 'Feeding Schedule Timeline', icon: Calendar },
                        { id: 'apiary-sizing', label: 'Apiary & Equipment Sizing', icon: Layers },
                        { id: 'yield-projection', label: 'Honey Yield Projection', icon: BarChart3 },
                    ]
                },
                {
                    title: 'System View',
                    items: [
                        { id: 'sensor-vitals', label: 'Hive Health', icon: Heart },
                        { id: 'bee-diseases', label: 'Pathogen Database', icon: AlertTriangle },
                    ]
                },
            ]
        },
        { id: 'places', label: 'Apiaries', icon: MapPin },
        {
            id: 'beeyield',
            label: 'Hives',
            icon: Hexagon,
            submenuItems: [
                { id: 'inspections', label: 'Inspections', icon: Search },
                { id: 'harvests', label: 'Harvests', icon: Hand },
                { id: 'flight-map', label: 'Flight Map', icon: Map },
                { id: 'varroa', label: 'Varroa', icon: TrendingUp },
                { id: 'sound', label: 'Sound', icon: Volume2 },
                { id: 'image-analysis', label: 'Image Analysis', icon: Camera },
                { id: 'health-guide', label: 'Health Guide', icon: BookOpen },
            ]
        },
        { id: 'reports-exports', label: 'Reports & Exports', icon: FileBarChart },
        { id: 'label-generator', label: 'Label Generator & QR Codes', icon: Tag },
        { id: 'measurement-tools', label: 'Measurement Data Tools', icon: Activity },
        { id: 'notes', label: 'My Notes', icon: FileText },
        { id: 'requests', label: 'My Requests', icon: HelpCircle },
        { id: 'task', label: 'My Tasks', icon: ClipboardList },
        { id: 'buy', label: 'Buy BeeYield Hub', icon: Cpu },
        {
            id: 'meters',
            label: 'Meters',
            icon: LayoutList,
            submenuItems: [
                { id: 'meters-dashboard', label: 'Dashboard', icon: Gauge },
                { id: 'meters-list', label: 'Meter List', icon: List },
                { id: 'meters-alarms', label: 'Alarms/Events', icon: Bell },
                { id: 'meters-payments', label: 'Payments', icon: Banknote },
                { id: 'meters-reports', label: 'Telemetry Reports', icon: FileText },
                { id: 'meters-settings', label: 'Meter Configurations', icon: Settings },
            ]
        },
        { id: 'integrations', label: 'Integrations', icon: Puzzle },
        { id: 'support', label: 'Support', icon: LifeBuoy },
        { id: 'settings', label: 'Settings', icon: Settings },
    ], []);

        const renderContent = () => {
        if (onboardingStep) {
            return (
                <ErrorBoundary>
                    <BeeYieldOnboardingWizard
                        step={onboardingStep}
                        apiaries={apiaries}
                        hives={hives}
                        devices={devices}
                        onComplete={async () => {
                            clearBeeYieldPendingOnboarding();
                            if (effectiveUser?.id) {
                                localStorage.setItem(`beeyield_onboarding_completed_${effectiveUser.id}`, 'true');
                            }
                            await Promise.all([
                                refetchApiaries(),
                                refetchHives(),
                                refetchDevices(),
                            ]);
                            handleTabChange('home');
                        }}
                        onRefreshData={async () => {
                            await Promise.all([
                                refetchApiaries(),
                                refetchHives(),
                                refetchDevices(),
                            ]);
                        }}
                    />
                </ErrorBoundary>
            );
        }
        return (
            <ErrorBoundary>
                {renderBaseContent()}
            </ErrorBoundary>
        );
    };

    const renderEmbedded = (component: React.ReactNode) => (
        <div className="w-full max-w-full mx-auto space-y-4 sm:space-y-6 pb-12 sm:pb-20 px-1 sm:px-2 beeyield-embedded-tool overflow-x-hidden">
            {component}
        </div>
    );

    const renderBaseContent = () => {
        switch (activeTab) {
            case 'dashboard':
            case 'home': return <DashboardHomeView devices={devices} readings={readings} apiaries={apiaries} onTabChange={handleTabChange} />;
            case 'assistant':
            case 'agro-intelligence': return (
                <LovableBeeYieldAI
                    embedded={true}
                    initialMessage={aiInitialMessage || viewParams?.message}
                    onInitialMessageConsumed={() => { setAiInitialMessage(null); setViewParams(null); }}
                    onTabChange={handleTabChange}
                />
            );
            case 'precision-pollination-folder':
            case 'precision-pollination-home': return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="home" />;
            case 'pollination-grid':
            case 'precision-drilldown':
            case 'precision-pollination-grid': return renderEmbedded(<PrecisionDrilldown isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'pollination-engine': return <PollinationEngine onTabChange={handleTabChange} />;
            case 'pollination-calcs': return renderEmbedded(<PollinationCalcs isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'harvest-calculator':
            case 'bee-calculator':
            case 'yield-predict': return renderEmbedded(<HarvestCalculator isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'activity-counter':
            case 'vpm-counter': return renderEmbedded(<ActivityCounter isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'activity-forecast':
            case 'bfh-forecast': return renderEmbedded(<ActivityForecaster isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'moa-viewer':
            case 'moa-view': return renderEmbedded(<MOAView isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'apiaries-weather':
            case 'apiaries': return renderEmbedded(<ApiariesPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'moa-compare': return renderEmbedded(<MOACompare isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'knowledge-search': return renderEmbedded(<KnowledgeSearch isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'forage-zones':
            case 'forage-zones-page': return renderEmbedded(<ForageZonesPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'sound-audit':
            case 'sound-analysis': return renderEmbedded(<SoundAnalysis isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'about-beeyield-ai':
            case 'about-ai': return renderEmbedded(<AboutModal open={true} onOpenChange={() => handleTabChange('home')} />);
            case 'about': navigate('/about'); return null;
            case 'blogs': navigate('/blogs'); return null;
            case 'auth': navigate('/beeyield-login'); return null;

            case 'florage-database':
            case 'florage-page': return renderEmbedded(<FloragePage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'site-map': return renderEmbedded(<HivePlacementMap isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'pollination-planning-ai': return renderEmbedded(<PollinationPlanning isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'pollination-planning': return <PollinationEngine onTabChange={handleTabChange} embedded={true} />;
            case 'hpa-optimizer': return <HpaOptimizer embedded={true} />;
            case 'pollination-lookup': return renderEmbedded(<PollinationLookup isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'pollination-analytics': return renderEmbedded(<PollinationCharts isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'bloom-tracking':
            case 'bloom-phenology': return renderEmbedded(<BloomPhenologyEmbed isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'flight-mapping-tactical':
            case 'flight-tracker': return renderEmbedded(<FlightTrackerEmbed isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'bee-diseases': return renderEmbedded(<BeeDiseasesPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'beeyield-calculators': return renderEmbedded(<BeeyieldCalculators isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'varroa-simulator': return renderEmbedded(<VarroaSimulator isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'dataset-import': return renderEmbedded(<DatasetImport isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'feeding-schedule': return renderEmbedded(<FeedingSchedule isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'apiary-sizing': return renderEmbedded(<ApiarySizing isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'yield-projection': return renderEmbedded(<YieldProjection isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'site-reports-tactical': return <PollinationReports />;
            case 'sensor-alerts':
            case 'alerts': return renderEmbedded(<AlertsPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'hive-health': return renderEmbedded(<HiveHealthDashboard isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'sensor-vitals': return <SensorHealthView onTabChange={handleTabChange} />;
            case 'places': return <MyPlacesView onTabChange={handleTabChange} initialParams={viewParams} onboardingMode={onboardingStep === 'apiary'} />;
            case 'hives':
            case 'beeyield': return renderEmbedded(<BeeYieldHivesView onTabChange={handleTabChange} initialParams={viewParams} onboardingMode={onboardingStep === 'hive'} embedded={true} onClose={() => handleTabChange('home')} />);
            case 'inspections': return renderEmbedded(<InspectionsPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'harvests-page':
            case 'harvests': return renderEmbedded(<HarvestsPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} onTabChange={handleTabChange} />);
            case 'flight-map': return <FlightMapView />;

            case 'varroa': return renderEmbedded(<VarroaSimulator isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'acoustic-spectral': return <AcousticSpectralView onTabChange={handleTabChange} embedded={true} />;
            case 'sound': return <SoundAnalysisView onTabChange={handleTabChange} embedded={true} />;
            case 'image-analysis': return <ImageAnalysisView onTabChange={handleTabChange} />;
            case 'health-guide': return <HealthGuideView onTabChange={handleTabChange} initialParams={viewParams} />;
            case 'reports-exports': return <ReportsExportsView onTabChange={handleTabChange} />;
            case 'label-generator':
            case 'labels': return <LabelGeneratorView onTabChange={handleTabChange} />;
            case 'data':
            case 'devices':
            case 'online':
            case 'bluetooth':
            case 'usb':
            case 'measurement-tools': return renderEmbedded(<MeasurementDataTools isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'notes': return <MyNotesView onTabChange={handleTabChange} />;
            case 'requests': return <MyRequestsView onTabChange={handleTabChange} />;
            case 'tasks':
            case 'task': return renderEmbedded(<TasksPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'buy': return <BuyBeeYieldHubView onTabChange={handleTabChange} />;
            case 'meters': 
            case 'meters-dashboard':
            case 'meters-list':
            case 'meters-alarms':
            case 'meters-payments':
            case 'meters-reports':
            case 'meters-settings': return <MetersView onTabChange={handleTabChange} activeSubTab={activeTab} />;
            case 'integrations': return renderEmbedded(<IntegrationsPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'support': return renderEmbedded(<SupportPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            case 'settings': return renderEmbedded(<SettingsPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />);
            default: return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-muted/30 rounded-[2.5rem] border border-dashed border-primary/20">
                    <h3 className="text-lg font-medium text-foreground">{navItems.find(i => i.id === activeTab)?.label || t('view_content')}</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm font-medium">{t('under_development')}</p>
                </div>
            );
        }
    };

    if (authLoading) return <BeeYieldPageShell className="bg-background flex flex-col items-center justify-center gap-4 p-0 md:p-0 -m-4 md:-m-6"><img src="/logo.png" alt="Loading..." className="h-16 w-auto animate-pulse" /></BeeYieldPageShell>;

    const isBeeYieldActive = Boolean(effectiveUser) || !!user?.user_metadata?.beeyield_active || ['timothynduva349@gmail.com', SUPER_ADMIN_EMAIL.toLowerCase()].includes(effectiveEmail?.toLowerCase() || '') || !!beeyieldUser;

    if (!effectiveUser || !isBeeYieldActive) {
        return (
            <BeeYieldPageShell className="bg-background flex flex-col items-center justify-center p-8 font-sans text-foreground antialiased">
                <div className="max-w-lg w-full text-center space-y-8">
                    <div className="w-20 h-20 rounded-3xl bg-card border border-border/40 flex items-center justify-center mx-auto shadow-sm">
                        <div className="flex flex-col text-center">
                            <span className="text-2xl font-bold text-foreground tracking-tighter leading-none">Beeeyield <span className="text-primary">Dashboard</span></span>
                            <span className="text-[9px] font-bold text-primary mt-1 uppercase tracking-widest">Operational OS</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-foreground">Sign in to continue</h1>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">You need an account to access the Beeeyield Dashboard.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/beeyield-login')} className="h-12 px-8 rounded-xl bg-beeyield-green text-foreground font-black text-sm tracking-tight hover:bg-beeyield-green/90 transition-colors flex items-center justify-center gap-2"><LockIcon className="w-4 h-4" />Sign in</button>
                        <button onClick={() => navigate('/')} className="h-12 px-8 rounded-xl bg-card border border-border/40 text-foreground font-bold text-sm hover:bg-muted/50 transition-colors">Back home</button>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} navItems={navItems} hideHeader={!!onboardingStep} hideSidebar={true} hideBanner={!!onboardingStep}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;
