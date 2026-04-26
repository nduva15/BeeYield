import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useDevices } from '@/hooks/useDevices';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { useSensorAlerts } from '@/hooks/useSensorAlerts';
import { 
    LayoutGrid, MessageSquare, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle,
    Plus, Filter, SlidersHorizontal, MoreHorizontal, Battery, Wifi, Clock, AlertTriangle, CheckCircle2,
    X, ChevronDown, MapPin, Search, ClipboardList, Calculator, Receipt, LifeBuoy, Settings,
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
import DashboardHomeView from '@/components/beeyield/DashboardHomeView';
import LovableBeeYieldAI from '@/components/beeyield/lovable_ai/LovableIndex';
import AgroIntelligenceView from '@/components/beeyield/AgroIntelligenceView';
import PollinationIntelligence from '@/components/beeyield/PollinationIntelligence';
import PollinationEngine from '@/components/beeyield/PollinationEngine';
import PrecisionPollinationView from '@/components/beeyield/PrecisionPollinationView';
import SpatialCoverageView from '@/components/beeyield/SpatialCoverageView';
import HpaOptimizer from '@/components/beeyield/HpaOptimizer';
import MasterMapView from '@/pages/MasterMapView';
import OrchardMapper from '@/components/beeyield/OrchardMapper';
import ForageZonesView from '@/components/beeyield/ForageZonesView';
import HiveLogisticsSecurity from '@/components/beeyield/HiveLogisticsSecurity';
import FlightMapping from '@/pages/pollination/FlightMapping';
import PollinationReports from '@/pages/pollination/PollinationReports';
import PollinationCalcs from '@/components/beeyield/lovable_ai/PollinationCalcs';
import DigitalHealthAudit from '@/components/beeyield/DigitalHealthAudit';
import ComplianceReport from '@/components/beeyield/ComplianceReport';
import SensorAlertsView from '@/components/beeyield/SensorAlertsView';
import BloomPhenology from '@/pages/BloomPhenology';
import AcousticMoodTransformer from '@/components/beeyield/AcousticMoodTransformer';
import BeeCalculatorSuite from '@/pages/BeeCalculatorSuite';
import ForagingOptimizer from '@/components/beeyield/ForagingOptimizer';
import VpmAutoCounter from '@/components/beeyield/VpmAutoCounter';
import BeeFlightHoursForecast from '@/components/beeyield/BeeFlightHoursForecast';
import PredictiveSuccessEngine from '@/components/beeyield/PredictiveSuccessEngine';
import SensorHealthView from '@/components/beeyield/SensorHealthView';
import ContinuousMonitor from '@/components/beeyield/ContinuousMonitor';
import YardOperations from '@/components/beeyield/YardOperations';
import GatewayHub from '@/components/beeyield/GatewayHub';
import HiveTelemetryView from '@/components/beeyield/HiveTelemetryView';
import ContractVerificationModule from '@/components/beeyield/ContractVerificationModule';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldHivesView from '@/components/beeyield/BeeYieldHivesView';
import InspectionsView from '@/components/beeyield/InspectionsView';
import HarvestsView from '@/components/beeyield/HarvestsView';
import FlightMapView from '@/components/beeyield/FlightMapView';
import GlobalHiveNetwork from '@/pages/GlobalHiveNetwork';
import VarroaView from '@/components/beeyield/VarroaView';
import MeasurementDataView from '@/components/beeyield/MeasurementDataView';
import { BeeYieldOnlineView, USBView } from '@/components/beeyield/RemainingViews';
import { BluetoothConnectivityView } from '@/components/beeyield/BluetoothConnectivityView';
import MyDevicesView from '@/components/beeyield/MyDevicesView';
import DeviceDetailView from '@/components/beeyield/DeviceDetailView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import BillingView from '@/components/beeyield/BillingView';
import IntegrationsView from '@/components/beeyield/IntegrationsView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';
import SettingsView from '@/components/beeyield/SettingsView';
import ImageAnalysisView from '@/components/beeyield/ImageAnalysisView';
import SoundAnalysisView from '@/components/beeyield/SoundAnalysisView';
import HealthGuideView from '@/components/beeyield/HealthGuideView';
import ReportsExportsView from '@/components/beeyield/ReportsExportsView';
import LabelGeneratorView from '@/components/beeyield/LabelGeneratorView';
import PollinationPlanning from '@/components/beeyield/lovable_ai/PollinationPlanning';
import PollinationLookup from '@/components/beeyield/lovable_ai/PollinationLookup';
import PollinationCharts from '@/components/beeyield/lovable_ai/PollinationCharts';
import BeeDiseasesPage from '@/components/beeyield/lovable_ai/BeeDiseasesPage';
import BeeGallery from '@/components/beeyield/lovable_ai/BeeGallery';
import BloomPhenologyEmbed from '@/components/beeyield/lovable_ai/BloomPhenology';
import FlightTrackerEmbed from '@/components/beeyield/lovable_ai/BeeFlightTracker';
import HarvestCalculator from '@/components/beeyield/lovable_ai/HarvestCalculator';
import ActivityCounter from '@/components/beeyield/lovable_ai/ActivityCounter';
import ActivityForecaster from '@/components/beeyield/lovable_ai/ActivityForecaster';
import HivePlacementMap from '@/components/beeyield/lovable_ai/HivePlacementMap';
import PrecisionDrilldown from '@/components/beeyield/lovable_ai/PrecisionDrilldown';
import MOAView from '@/components/beeyield/lovable_ai/MOAView';
import FloragePage from '@/components/beeyield/lovable_ai/FloragePage';

type AuthMode = 'login' | 'register' | 'forgot-password';
const NEW_ACCOUNT_ONBOARDING_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

const BeeYieldDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut, beeyieldUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { moduleFlags } = useSettings();
    const effectiveUser = beeyieldUser || user;
    const effectiveEmail = beeyieldUser?.email || user?.email;

    const [activeTab, setActiveTab] = React.useState('home');
    const [aiInitialMessage, setAiInitialMessage] = React.useState<string | null>(null);
    const [viewParams, setViewParams] = React.useState<{ message?: string, action?: string } | null>(null);
    const [dashboardOpenedAt] = React.useState(() => Date.now());

    const { data: rawApiaries, isLoading: apiariesLoading } = useApiaries();
    const { data: rawHives, isLoading: hivesLoading } = useHives();
    const { data: rawDevices, isLoading: devicesLoading } = useDevices();
    const { data: rawReadings, isLoading: readingsLoading } = useSensorReadings(undefined, 24 * 7);

    const { apiaries, hives, devices, readings } = React.useMemo(() => ({
        apiaries: rawApiaries || [],
        hives: rawHives || [],
        devices: rawDevices || [],
        readings: rawReadings || [],
    }), [rawApiaries, rawHives, rawDevices, rawReadings]);

    const loading = apiariesLoading || hivesLoading || devicesLoading || readingsLoading;
    
    const requiredOnboardingStep = React.useMemo(() => resolveBeeYieldOnboardingStep({
        apiaries: apiaries.length,
        hives: hives.length,
        devices: devices.length,
    }), [apiaries.length, hives.length, devices.length]);

    const pendingOnboarding = React.useMemo(
        () => (effectiveEmail ? getBeeYieldPendingOnboarding(effectiveEmail) : null),
        [effectiveEmail]
    );

    const shouldForceOnboarding = React.useMemo(() => {
        if (!pendingOnboarding || !effectiveUser?.created_at) return false;
        const createdAtMs = new Date(effectiveUser.created_at).getTime();
        if (Number.isNaN(createdAtMs)) return false;
        return (dashboardOpenedAt - createdAtMs) <= NEW_ACCOUNT_ONBOARDING_WINDOW_MS;
    }, [dashboardOpenedAt, pendingOnboarding, effectiveUser?.created_at]);

    const onboardingStep = shouldForceOnboarding ? requiredOnboardingStep : null;

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
        { id: 'agro-intelligence', label: 'Strategic Insights', icon: LayoutGrid },
        {
            id: 'precision-pollination-folder',
            label: 'Pollination',
            icon: Calculator,
            submenuItems: [
                {
                    title: 'Strategy & Ops',
                    items: [
                        { id: 'intelligence', label: 'Insights', icon: Brain },
                        { id: 'pollination-grid', label: 'Precision Pollination', icon: LayoutGrid },
                        { id: 'pollination-calcs', label: 'Pollination Calcs', icon: Calculator },
                        { id: 'pollination-planning-ai', label: 'AI Pollination Plan', icon: Sparkles },
                        { id: 'pollination-engine', label: 'Pollination planning', icon: Cpu },
                        { id: 'saturation-math', label: 'Coverage area', icon: Scale },
                        { id: 'hpa-optimizer', label: 'Performance planning', icon: Cpu },
                    ]
                },
                {
                    title: 'Field Logistics',
                    items: [
                        { id: 'master-map', label: 'Master Map', icon: Map },
                        { id: 'orchard-mapper', label: 'Orchard Mapper', icon: Layers },
                        { id: 'forage-zones', label: 'Forage zones', icon: MapPin },
                        { id: 'flight-mapping-tactical', label: 'Flight Mapping', icon: Navigation },
                        { id: 'site-reports-tactical', label: 'Site Reports', icon: FileBarChart },
                    ]
                },
                {
                    title: 'Health & Compliance',
                    items: [
                        { id: 'digital-audit', label: 'Health check', icon: FileCheck },
                        { id: 'compliance-report', label: 'Compliance Report', icon: Award },
                        { id: 'sensor-alerts', label: 'Sensor Alerts', icon: Bell },
                        { id: 'bloom-tracking', label: 'Bloom Phenology', icon: Zap },
                    ]
                },
                {
                    title: 'Analysis & Yield',
                    items: [
                        { id: 'acoustic-transformer', label: 'Sound analysis', icon: Volume2 },
                        { id: 'pollination-lookup', label: 'PSI Lookup', icon: Search },
                        { id: 'pollination-analytics', label: 'Pollination Data', icon: BarChart3 },
                        { id: 'foraging-optimizer', label: 'Foraging guide', icon: Crosshair },
                        { id: 'vpm-counter', label: 'Activity counter', icon: Camera },
                        { id: 'bfh-forecast', label: 'Activity forecast', icon: Zap },
                        { id: 'yield-predict', label: 'Production estimate', icon: BarChart3 },
                        { id: 'moa-view', label: 'MOA View', icon: Layers },
                        { id: 'florage-page', label: 'Florage Database', icon: Crosshair },
                        { id: 'site-map', label: 'Hive Placement Map', icon: MapPin },
                    ]
                },
                {
                    title: 'System View',
                    items: [
                        { id: 'sensor-vitals', label: 'Hive Health', icon: Heart },
                        { id: 'continuous-monitor', label: 'Live Stream', icon: Activity },
                        { id: 'yard-ops', label: 'Bee Yard', icon: Building2 },
                        { id: 'gateway-hub', label: 'Device gateway', icon: Server },
                        { id: 'hive-telemetry', label: 'Advanced sensor data', icon: Signal },
                        { id: 'contract-verification', label: 'Verified contracts', icon: ShieldCheck },
                        { id: 'bee-diseases', label: 'Pathogen Database', icon: AlertTriangle },
                        { id: 'bee-gallery', label: 'Bee Species', icon: Bug },
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
                { id: 'reports-exports', label: 'Reports & Exports', icon: FileText },
                { id: 'label-generator', label: 'Label Generator', icon: Tag },
                { id: 'global-hive-network', label: 'Global Hive Network', icon: Globe },
            ]
        },
        {
            id: 'data',
            label: 'Measurement Data',
            icon: Activity,
            submenuItems: [
                { id: 'online', label: 'Online', icon: Signal },
                { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
                { id: 'devices', label: 'My Devices', icon: Cpu },
                { id: 'usb', label: 'USB', icon: Usb },
            ]
        },
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
                { id: 'meters-reports', label: 'Reports', icon: FileText },
                { id: 'meters-settings', label: 'Settings', icon: Settings },
            ]
        },
        { id: 'billing', label: 'Billing', icon: Receipt },
        { id: 'integrations', label: 'Integrations', icon: Puzzle },
        { id: 'support', label: 'Support', icon: LifeBuoy },
        { id: 'settings', label: 'Settings', icon: Settings },
    ], []);

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <DashboardHomeView devices={devices} readings={readings} apiaries={apiaries} onTabChange={handleTabChange} />;
            case 'assistant': return <LovableBeeYieldAI />;
            case 'agro-intelligence': return <AgroIntelligenceView onTabChange={handleTabChange} />;
            case 'precision-pollination-folder':
            case 'precision-pollination-home': return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="home" />;
            case 'pollination-grid':
            case 'precision-pollination-grid': return <PrecisionDrilldown isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'pollination-intelligence':
            case 'intelligence': return <PollinationIntelligence onTabChange={handleTabChange} />;
            case 'pollination-engine': return <PollinationEngine onTabChange={handleTabChange} />;
            case 'pollination-calcs': return <PollinationCalcs isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'bee-calculator':
            case 'yield-predict': return <HarvestCalculator isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'activity-counter':
            case 'vpm-counter': return <ActivityCounter isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'activity-forecast':
            case 'bfh-forecast': return <ActivityForecaster isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'moa-viewer':
            case 'moa-view': return <MOAView isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'florage-database':
            case 'florage-page': return <FloragePage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'site-map': return <HivePlacementMap isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'pollination-planning-ai': return <PollinationPlanning isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'pollination-planning': return <PollinationEngine onTabChange={handleTabChange} embedded={true} />;
            case 'saturation-math': return <SpatialCoverageView />;
            case 'pollination-lookup': return <PollinationLookup isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'pollination-analytics': return <PollinationCharts isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'bloom-tracking':
            case 'bloom-phenology': return <BloomPhenologyEmbed isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'flight-mapping-tactical':
            case 'flight-tracker': return <FlightTrackerEmbed isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'bee-diseases': return <BeeDiseasesPage isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'bee-gallery': return <BeeGallery isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'orchard-mapper': return <OrchardMapper onTabChange={handleTabChange} />;
            case 'master-map': return <MasterMapView />;
            case 'forage-zones': return <ForageZonesView />;
            case 'precision-drilldown': return <PrecisionDrilldown isOpen={true} onClose={() => handleTabChange('home')} embedded={true} />;
            case 'sensor-vitals': return <SensorHealthView onTabChange={handleTabChange} />;
            case 'continuous-monitor': return <ContinuousMonitor onTabChange={handleTabChange} />;
            case 'yard-ops': return <YardOperations onTabChange={handleTabChange} />;
            case 'gateway-hub': return <GatewayHub />;
            case 'hive-telemetry': return <HiveTelemetryView />;
            case 'contract-verification': return <ContractVerificationModule />;
            case 'places': return <MyPlacesView onTabChange={handleTabChange} initialParams={viewParams} onboardingMode={onboardingStep === 'apiary'} />;
            case 'beeyield': return <BeeYieldHivesView onTabChange={handleTabChange} initialParams={viewParams} onboardingMode={onboardingStep === 'hive'} />;
            case 'inspections': return <InspectionsView onTabChange={handleTabChange} />;
            case 'harvests': return <HarvestsView onTabChange={handleTabChange} />;
            case 'flight-map': return <FlightMapView />;
            case 'global-hive-network': return <GlobalHiveNetwork />;
            case 'varroa': return <VarroaView />;
            case 'sound': return <SoundAnalysisView onTabChange={handleTabChange} />;
            case 'image-analysis': return <ImageAnalysisView onTabChange={handleTabChange} />;
            case 'health-guide': return <HealthGuideView onTabChange={handleTabChange} />;
            case 'reports-exports': return <ReportsExportsView onTabChange={handleTabChange} />;
            case 'label-generator': return <LabelGeneratorView onTabChange={handleTabChange} />;
            case 'data': return <MeasurementDataView onTabChange={handleTabChange} />;
            case 'online': return <BeeYieldOnlineView onTabChange={handleTabChange} />;
            case 'bluetooth': return <BluetoothConnectivityView onTabChange={handleTabChange} />;
            case 'usb': return <USBView onTabChange={handleTabChange} />;
            case 'devices': return <MyDevicesView devices={devices} readings={readings} apiaries={apiaries} hives={hives} onTabChange={handleTabChange} />;
            case 'device': return <DeviceDetailView deviceId={viewParams?.action || ''} devices={devices} readings={readings} apiaries={apiaries} hives={hives} onBack={() => handleTabChange('devices')} onRefresh={refreshTelemetryData} />;
            case 'notes': return <MyNotesView onTabChange={handleTabChange} />;
            case 'requests': return <MyRequestsView onTabChange={handleTabChange} />;
            case 'task': return <MyTaskView onTabChange={handleTabChange} />;
            case 'buy': return <BuyBeeYieldHubView onTabChange={handleTabChange} />;
            case 'meters': 
            case 'meters-dashboard':
            case 'meters-list':
            case 'meters-alarms':
            case 'meters-payments':
            case 'meters-reports':
            case 'meters-settings': return <MetersView onTabChange={handleTabChange} activeSubTab={activeTab} />;
            case 'billing': return <BillingView onTabChange={handleTabChange} />;
            case 'integrations': return <IntegrationsView />;
            case 'support': return <SupportCenterView onTabChange={handleTabChange} />;
            case 'settings': return <SettingsView onTabChange={handleTabChange} />;
            default: return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-muted/30 rounded-[2.5rem] border border-dashed border-primary/20">
                    <h3 className="text-lg font-medium text-foreground">{navItems.find(i => i.id === activeTab)?.label || t('view_content')}</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm font-medium">{t('under_development')}</p>
                </div>
            );
        }
    };

    if (authLoading) return <BeeYieldPageShell className="bg-background flex flex-col items-center justify-center gap-4 p-0 md:p-0 -m-4 md:-m-6"><img src="/logo.png" alt="Loading..." className="h-16 w-auto animate-pulse" /></BeeYieldPageShell>;

    const isBeeYieldActive = !!user?.user_metadata?.beeyield_active || ['timothynduva349@gmail.com', SUPER_ADMIN_EMAIL.toLowerCase()].includes(effectiveEmail?.toLowerCase() || '') || !!beeyieldUser;

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
                        <button onClick={() => navigate('/login')} className="h-12 px-8 rounded-xl bg-beeyield-green text-foreground font-black text-sm tracking-tight hover:bg-beeyield-green/90 transition-colors flex items-center justify-center gap-2"><LockIcon className="w-4 h-4" />Sign in</button>
                        <button onClick={() => navigate('/')} className="h-12 px-8 rounded-xl bg-card border border-border/40 text-foreground font-bold text-sm hover:bg-muted/50 transition-colors">Back home</button>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} navItems={navItems} hideHeader={!!onboardingStep} hideSidebar={!!onboardingStep} hideBanner={!!onboardingStep}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;
