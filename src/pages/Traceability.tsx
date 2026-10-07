import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceabilityVerifier } from "@/services/WasmTraceability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart, Shield, Droplets, Home, Users, Award, ClipboardList,
  CheckCircle2, Box, Activity, Thermometer, Waves, Loader2, X, Search, Globe, ShieldCheck, Zap, Lock as LockIcon, FileDown, Wheat, TreePine, Scale, Cpu,
  Link2, Check, ArrowRight, Building2, Store, Truck, Layers, FileCheck, Sparkles, AlertTriangle, ShieldAlert, FileText, CheckCircle, Eye, Clock, Microscope, Download, ExternalLink, HelpCircle, ChevronRight, BookOpen, FileSpreadsheet, ArrowLeftRight, ChevronDown, CheckCircle as CheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HoneyTracePDF from "@/components/HoneyTracePDF";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LOGO from '@/assets/Logo.png';
import PLACEHOLDER_SVG from '@/assets/placeholder.svg';
import TIMOTHY_PHOTO from '@/assets/timothy-nduva.png';
import { getPublicTraceabilityBatches, traceBatch, TraceResponse, TraceJourneyStep } from "@/services/traceabilityService";
import { adminService } from "@/services/adminService";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";
import { beeyieldService, ApiaryWeatherSummary } from "@/services/beeyieldService";
import { getCompanyStory, getCompanyStats, CompanyStory, CompanyStat } from "@/services/companyService";
import { getESGMetrics, ESGMetric } from "@/services/servicesService";
import {
  buildConservationFacts,
  buildDeepTraceabilityStory,
  buildHarvestFacts,
  buildSensorFacts,
  buildWeatherFacts,
} from "@/lib/traceabilityNarrative";

const DEFAULT_EXAMPLE_CODES = [
  "BEE-2026-01-0420",
  "BEE-2026-01-0419",
  "BEE-2026-01-0418",
];

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false); // New state for sync animation
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exampleCodes, setExampleCodes] = useState<string[]>(DEFAULT_EXAMPLE_CODES);
  const [apiaryWeather, setApiaryWeather] = useState<ApiaryWeatherSummary | null>(null);
  const [companyStory, setCompanyStory] = useState<CompanyStory | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStat[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<ESGMetric[]>([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState<"all" | "beekeepers" | "exporters" | "importers" | "packers">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeResourceCategory, setActiveResourceCategory] = useState<"all" | "templates" | "protocols" | "guides">("all");
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const missingDataLabel = "Missing backend data";

  const hasValue = useCallback((value: unknown) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
    return true;
  }, []);

  const textOrMissing = useCallback((value: unknown, fallback = missingDataLabel) => {
    return hasValue(value) ? String(value) : fallback;
  }, [hasValue]);

  const numberOrMissing = useCallback((value: unknown, unit = "", digits?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return missingDataLabel;
    const rendered = typeof digits === "number" ? value.toFixed(digits) : String(value);
    return `${rendered}${unit}`;
  }, []);

  const dateOrMissing = useCallback((value: unknown) => {
    if (!hasValue(value)) return missingDataLabel;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  }, [hasValue]);

  const renderMetricValue = useCallback((value: unknown, suffix = "") => {
    if (!hasValue(value)) return missingDataLabel;
    return `${String(value)}${suffix}`;
  }, [hasValue]);

  const formatSyncTime = useCallback((value: unknown) => {
    if (!hasValue(value)) return missingDataLabel;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [hasValue]);

  const handleTrace = useCallback(async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setTraceData(null);

    try {
      // Fetch trace data
      const data = await traceBatch(code);
      if (!data) throw new Error("Batch not found - Please check the code.");

      setTraceData(data);

      // Verify trace data
      setVerifying(true);

      const verifier = TraceabilityVerifier.getInstance();
      await verifier.verifyBatchIntegrity(code, data, "0");

      setVerifying(false);

      setIsModalOpen(true);

      adminService.logTrace({
        batch_code: code,
        honey_type: data.product_name || 'Unknown Honey',
        farmer_name: data.farmer?.name || 'Timothy Nduva',
        trace_source: 'website_scan',
        is_authenticated: true
      }).catch(err => console.error("Failed to log trace:", err));

      toast({
        title: "Verified",
        description: `Batch ${code} verified.`,
      });
    } catch (error) {
      console.error("Trace error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please check the code and try again.";
      const isConnectionError = errorMessage.includes("Connection Error") || errorMessage.includes("Network error") || errorMessage.includes("timeout");
      
      toast({
        variant: "destructive",
        title: isConnectionError ? "Backend Server Unreachable" : "Couldn’t verify",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const { code: routeCode } = useParams<{ code?: string }>();

  // Handle direct trace from route params or URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawCode = routeCode || params.get("code") || (location.pathname.startsWith('/verify/') ? location.pathname.split('/verify/')[1] : null);
    if (rawCode) {
      const cleanCode = decodeURIComponent(rawCode).trim();
      setQrCode(cleanCode);
      handleTrace(cleanCode);
    }
  }, [location.search, location.pathname, routeCode, handleTrace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrace(qrCode);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setQrCode(decodedText);
          setShowScanner(false);
          handleTrace(decodedText);
          if (scanner) scanner.clear();
        },
        (error) => {
          // console.warn(error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [showScanner, handleTrace]);

  useEffect(() => {
    let active = true;

    const loadExampleCodes = async () => {
      const batches = await getPublicTraceabilityBatches(12);
      if (!active || batches.length === 0) return;

      const latestYear = batches
        .map((batch) => Number.parseInt(String(batch.harvest_date || "").slice(0, 4), 10))
        .find((year) => Number.isFinite(year));

      const currentBatches = latestYear
        ? batches.filter((batch) => String(batch.harvest_date || "").startsWith(String(latestYear)))
        : batches;

      const liveCodes = Array.from(
        new Set(
          currentBatches
            .sort((left, right) => {
              const dateCompare = String(right.harvest_date || "").localeCompare(String(left.harvest_date || ""));
              if (dateCompare !== 0) return dateCompare;
              return String(right.batch_code || "").localeCompare(String(left.batch_code || ""));
            })
            .map((batch) => batch.batch_code)
            .filter((code): code is string => typeof code === "string" && code.trim().length > 0)
        )
      ).slice(0, 3);

      if (active && liveCodes.length === 3) {
        setExampleCodes(liveCodes);
      }
    };

    void loadExampleCodes();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      const [story, stats, metrics] = await Promise.all([
        getCompanyStory(),
        getCompanyStats(),
        getESGMetrics(),
      ]);

      if (!active) return;
      setCompanyStory(story);
      setCompanyStats(stats);
      setEsgMetrics(metrics);
    };

    void loadContext();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      if (!traceData?.apiary?.apiary_id) {
        setApiaryWeather(null);
        return;
      }

      const summary = await beeyieldService.getApiaryWeatherSummary(traceData.apiary.apiary_id);
      if (!active) return;
      setApiaryWeather(summary);
    };

    void loadWeather();

    return () => {
      active = false;
    };
  }, [traceData?.apiary?.apiary_id]);

  // Scroll to results when trace data is loaded
  useEffect(() => {
    if (traceData) {
      const resultsElement = document.getElementById("trace-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [traceData]);

  const traceabilityFeatures = [
    { icon: MapPin, label: "Hive-to-Jar Tracking", description: "GPS-verified tracking of every honey batch from apiary to shelf — in real time" },
    { icon: Calendar, label: "Digital Harvest Logbooks", description: "Timestamped records of every harvest with moisture levels, weights, and inspector data" },
    { icon: Shield, label: "Compliance Records", description: "Automatically generated audit-ready documentation for food safety and export standards" },
    { icon: Globe, label: "GPS-verified Apiaries", description: "Precise coordinates logged for every apiary, hive, and harvest activity" },
    { icon: LockIcon, label: "Immutable Audit Trail", description: "Complete chain-of-custody showing who harvested what, when, and where — permanently recorded" },
    { icon: Leaf, label: "Field Condition Logging", description: "Real-time weather, flora, and colony health data captured where the work actually happens" },
  ];

  const stakeholderBenefits = [
    {
      id: "beekeepers",
      title: "Beekeepers",
      badge: "Apiary Origins",
      tagline: "Verify Identity & Command Premium Value",
      headline: "Verify your identity, location, and hives. Become a trusted supplier worldwide.",
      icon: Users,
      accent: "text-amber-800 bg-amber-100 border-amber-200",
      points: [
        "Cryptographic proof of registered beekeeper identity and hive ownership",
        "Field-locked GPS logging verifying authentic Kenyan flora provenance",
        "Direct visibility and fair-trade recognition without predatory middleman discounting",
        "Digital harvest weigh-in records ensuring complete payment transparency",
      ],
      quote: "Transform traditional apiculture into a globally verified, premium export brand.",
    },
    {
      id: "exporters",
      title: "Exporters",
      badge: "Global Trade",
      tagline: "De-Risk Procurement & Homogenization",
      headline: "Combine testing and traceability to manage the authenticity risk of the honey you are purchasing and track the blending of batches.",
      icon: Scale,
      accent: "text-emerald-800 bg-emerald-100 border-emerald-200",
      points: [
        "Pre-purchase laboratory test verification to prevent buying adulterated stock",
        "Cryptographic blend tracking to record exact multi-lot blending proportions",
        "Audit-ready blockchain logbooks that speed up international customs clearance",
        "Zero-risk compliance with EU, US FDA, and Middle Eastern import regulations",
      ],
      quote: "Scale export volumes with bulletproof batch provenance and blend accountability.",
    },
    {
      id: "importers",
      title: "Importers",
      badge: "Cross-Border Assurance",
      tagline: "Pre-Clear Lots Before Capital Deployment",
      headline: "Manage risk by checking the authenticity of batches before importing them and manage your suppliers.",
      icon: ShieldCheck,
      accent: "text-blue-800 bg-blue-100 border-blue-200",
      points: [
        "Verify batch authenticity, moisture, and NMR purity before shipping containers",
        "Manage global suppliers with transparent historical quality scorecards",
        "Eliminate expensive border detentions, laboratory re-tests, and port rejections",
        "Ensure complete adherence to food safety standards and traceability mandates",
      ],
      quote: "Never gamble on imported honey purity. Inspect certified lab proofs in real time.",
    },
    {
      id: "packers",
      title: "Packers & Retailers",
      badge: "Brand & Shelf Integrity",
      tagline: "Inspire Unshakeable Consumer Loyalty",
      headline: "Visualise the full honey journey from hive to jar for confidence in your products and build consumer trust.",
      icon: Box,
      accent: "text-orange-800 bg-orange-100 border-orange-200",
      points: [
        "On-jar interactive QR codes that show consumers the genuine hive-to-jar journey",
        "Shield your private-label and retail brands from global honey fraud scandals",
        "Differentiate on store shelves with verifiable raw, monofloral, and ethical claims",
        "Strengthen ESG credentials with verified 50/50 conservation and farmer support",
      ],
      quote: "Give modern shoppers transparent proof that commands trust and shelf velocity.",
    },
  ];

  const beeyieldTraceKeyFeatures = [
    {
      icon: LockIcon,
      title: "Secure Blockchain Solution",
      tag: "Immutable Ledger",
      description: "Decentralized, tamper-evident cryptographic architecture. Once harvest data, GPS coordinates, and lab results are written to the blockchain, they cannot be modified, deleted, or falsified.",
    },
    {
      icon: Eye,
      title: "Visibility of Data for Appropriate Stakeholders",
      tag: "Granular Access",
      description: "Customized data visibility for each participant. Beekeepers, quality auditors, exporters, port customs authorities, retailers, and end-consumers each view verified data relevant to their role.",
    },
    {
      icon: ShieldCheck,
      title: "Integrates with Intertek’s ATIC Services",
      tag: "ATIC Standards",
      description: "Built to integrate seamlessly with global ATIC (Assurance, Testing, Inspection, and Certification) services, including Intertek's honey authenticity and food safety protocols for gold-standard compliance.",
    },
    {
      icon: MapPin,
      title: "Local Support Available Where Needed",
      tag: "Field Extension",
      description: "Dedicated regional apiculture officers, field agronomists, and local technical teams present across harvesting areas to assist beekeepers, calibrate scales, and verify physical hive sites.",
    },
    {
      icon: Zap,
      title: "Immediate & 24/7 Access to Data",
      tag: "Real-Time 24/7",
      description: "Continuous real-time access to batch authenticity data via mobile camera QR scanning, web verifier portal, and enterprise REST/GraphQL APIs with zero downtime.",
    },
  ];

  const beeyieldTraceBenefits = [
    {
      title: "Protect Your Brand with a 360° Approach",
      subtitle: "Comprehensive Security & Transparency",
      description: "Unite physical tamper-evident seals, field IoT telemetry, accredited laboratory assays, and blockchain ledgers to safeguard your brand from adulteration risks and counterfeiting.",
      icon: Shield,
    },
    {
      title: "End-to-End Visibility of the Supply Chain",
      subtitle: "Unbroken Chain of Custody",
      description: "Monitor every critical milestone from remote acacia apiaries through processing, blending, testing, export transit, packaging, and final retail delivery.",
      icon: Globe,
    },
    {
      title: "Manage Risk by Checking Authenticity",
      subtitle: "Proactive Risk Mitigation",
      description: "Detect adulterants, unauthorized syrups (C4/C3), high moisture, or low-quality dilution early before batches are blended, containerized, or distributed to markets.",
      icon: Scale,
    },
    {
      title: "Build Reputation and Consumer Trust",
      subtitle: "Customer Brand Equity",
      description: "Turn transparency into your strongest competitive edge. Consumers scan on-jar QR codes to explore the genuine origin, beekeeper story, and lab certification of their specific jar.",
      icon: Award,
    },
    {
      title: "One-Stop Shop for Authenticity Risk",
      subtitle: "ATIC & Honey Services Synergy",
      description: "Supports other Intertek honey services to provide a true one-stop shop for managing authenticity risk with blockchain traceability, auditing, testing, and field inspections.",
      icon: Layers,
    },
  ];

  const lowCostResources = [
    {
      id: "logbook",
      category: "templates",
      title: "Digital Apiary Harvest Logbook",
      format: "Spreadsheet & Printable PDF",
      description: "A free, standardized field sheet for smallholders to log GPS coordinates, colony health, harvest weight, and moisture percentage without expensive hardware.",
      badge: "Free Template",
      downloadText: "Download Field Template",
      href: "/beeyield",
      type: "Template",
      icon: FileSpreadsheet,
    },
    {
      id: "sop",
      category: "protocols",
      title: "One-Step-Forward / One-Step-Backward SOP",
      format: "Standard Operating Procedure",
      description: "Step-by-step framework detailing how collection centers and processors capture data one step forward to buyers and one step backward to apiary suppliers.",
      badge: "Operational SOP",
      downloadText: "View SOP Protocol",
      href: "/beeyield",
      type: "Protocol",
      icon: ArrowLeftRight,
    },
    {
      id: "isolation",
      category: "protocols",
      title: "Village-Level Rapid Problem Isolation Protocol",
      format: "Quality Control Checklist",
      description: "Action plan to isolate contaminated or off-spec batches back to the exact distant village and individual hive within minutes to protect entire bulk containers.",
      badge: "Quality Control",
      downloadText: "Download Isolation Plan",
      href: "/beeyield",
      type: "Protocol",
      icon: AlertTriangle,
    },
    {
      id: "coding",
      category: "guides",
      title: "Standard Batch Identification & QR Coding Guide",
      format: "Implementation Guide",
      description: "Practical guide to setting up human-readable lot IDs and printable QR seals using free tools to achieve retailer-grade jar traceability at low cost.",
      badge: "Implementation Guide",
      downloadText: "Read Coding Guide",
      href: "/beeyield",
      type: "Guide",
      icon: QrCode,
    },
    {
      id: "economics",
      category: "guides",
      title: "Honey Fraud Economics: Spot Testing vs. Traceability",
      format: "Whitepaper & Decision Matrix",
      description: "Cost-benefit comparison demonstrating why continuous blockchain traceability is vastly more reliable and cost-effective than recurring spot lab tests alone.",
      badge: "Industry Whitepaper",
      downloadText: "Explore Whitepaper",
      href: "/learn",
      type: "Whitepaper",
      icon: BookOpen,
    },
    {
      id: "api",
      category: "guides",
      title: "BeeYield Open Traceability API Quickstart",
      format: "Developer Documentation",
      description: "Lightweight REST API endpoints to push harvest records directly to the BeeYield Trace blockchain ledger from any existing inventory management software.",
      badge: "Developer API",
      downloadText: "API Documentation",
      href: "/beeyield",
      type: "Integration",
      icon: Cpu,
    },
  ];

  const honeyTraceabilityFaqs = [
    {
      q: "What is a honey traceability system?",
      a: "A honey traceability system is a documented framework that tracks the movement of honey throughout the supply chain from beekeeper to consumer. It relies on data collected and stored by each participant in the chain, with each actor recording data one step forward (processors, traders, customers) and one step backward (suppliers) through all stages of production, processing, and distribution.",
    },
    {
      q: "How does BeeYield Trace isolate problems in the supply chain?",
      a: "Because each batch is tied to field-level records, if a quality problem is detected in honey collected from a distant village, the system immediately pinpoints where the issue originated, which apiary was involved, and who must be contacted to correct it before the product reaches consumers or is blended into larger batches.",
    },
    {
      q: "Why is a traceability system better than spot testing alone for combating honey fraud?",
      a: "Honey spot testing (such as NMR spectroscopy or C3/C4 isotope testing) is very expensive and not wholly foolproof on its own, especially when adulterators use sophisticated designer syrups. A robust, blockchain-backed traceability system proves authentic provenance at every touchpoint, establishing an unbroken chain of custody that spot testing alone cannot provide.",
    },
    {
      q: "How does BeeYield Trace integrate with Intertek's ATIC services?",
      a: "BeeYield Trace is designed to connect with Intertek's ATIC (Assurance, Testing, Inspection, and Certification) services. This allows accredited laboratory test reports, sanitary inspections, and export compliance documents to be bound directly to the blockchain batch record.",
    },
    {
      q: "Can smallholder beekeepers implement this system at low cost?",
      a: "Yes. BeeYield Trace is specifically architected to support low-cost field entry. Smallholder beekeepers and aggregators can use paper-based or low-bandwidth mobile logbooks that sync with the blockchain, providing enterprise-grade traceability without high capital expense.",
    },
  ];

  const growthMilestone = companyStory?.milestones?.find((milestone) => /hives/i.test(milestone.title) || /hives/i.test(milestone.description));
  const treeMetric = companyStats.find((stat) => /tree/i.test(stat.stat_key) || /tree/i.test(stat.stat_label));
  const carbonMetric = companyStats.find((stat) => /carbon|co2|climate/i.test(stat.stat_key) || /carbon|co2|climate/i.test(stat.stat_label));
  const communityMetric = companyStats.find((stat) => /farmer|beekeeper|community/i.test(stat.stat_key) || /farmer|beekeeper|community/i.test(stat.stat_label));
  const esgHighlights = esgMetrics.slice(0, 3);
  const traceStoryParagraphs = buildDeepTraceabilityStory(traceData);
  const harvestFacts = buildHarvestFacts(traceData);
  const conservationFacts = buildConservationFacts(traceData);
  const sensorFacts = buildSensorFacts(traceData);
  const weatherFacts = buildWeatherFacts(traceData, apiaryWeather).map((item) => {
    if (item.value !== missingDataLabel) return item;
    return item;
  });

  return (
    <BeeYieldPageShell className="bg-background">
      <SEO 
        title="BeeYield Trace | Blockchain Honey Traceability & Verification System"
        description="BeeYield Trace is a blockchain-based honey traceability system tracking pure honey from hive to jar. Combat honey fraud, verify origin, swiftly isolate batch problems, and access low-cost apiculture traceability resources."
        keywords="honey traceability, honey traceability system, blockchain honey, BeeYield Trace, combat honey fraud, honey authenticity, one step forward one step backward, isolate honey batch problems, verify honey purity, Kenya honey origin, honey supply chain visibility, Intertek ATIC honey"
        url="/traceability"
        image="/og-image.png"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://beeyield.co.ke/traceability#webpage",
              "url": "https://beeyield.co.ke/traceability",
              "name": "BeeYield Trace | Blockchain Honey Traceability & Verification System",
              "description": "End-to-end blockchain traceability platform for the honey industry tracking honey from hive to jar."
            },
            {
              "@type": "HowTo",
              "name": "How to Trace Your Honey Jar with BeeYield Trace",
              "description": "Follow these simple steps to verify the authenticity, origin, and purity of your honey jar on the blockchain.",
              "step": [
                {
                  "@type": "HowToStep",
                  "text": "Locate the unique batch code on your honey jar label (e.g., BEE-2026-01-0420)."
                },
                {
                  "@type": "HowToStep",
                  "text": "Enter the code into the search field or use your smartphone camera to scan the QR seal."
                },
                {
                  "@type": "HowToStep",
                  "text": "Inspect the verified harvest data, GPS apiary coordinates, moisture levels, and blockchain audit trail."
                }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": honeyTraceabilityFaqs.map((faq) => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.a
                }
              }))
            }
          ]
        }}
      />
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/95" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={LOGO}
              alt="BeeYield Logo"
              className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
            />
            <Badge className="mb-6 bg-amber-500/10 text-amber-800 border-amber-200 px-5 py-2 font-semibold text-xs rounded-full backdrop-blur-sm inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              BeeYield Trace • Blockchain Honey Provenance
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900"
            >
              Verify Honey <br />
              <span className="text-beeyield-green">Origin & Purity</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
            >
              Audit the complete lifecycle of your honey jar with <strong className="text-neutral-900 font-bold">BeeYield Trace</strong> — our blockchain-based traceability solution tracking honey from hive to jar. Enter your batch code or scan the QR seal to inspect GPS apiary origins, laboratory test results, and certified harvest records.
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              {[
                { value: "100%", label: "GPS-Verified Origin" },
                { value: "Blockchain", label: "Immutable Ledger" },
                { value: "24/7", label: "Traceability & Access" },
                { value: "ATIC-Ready", label: "Quality & Compliance" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 bg-white border border-neutral-100 rounded-2xl shadow-sm"
                >
                  <span className="text-xl font-bold text-beeyield-green">{stat.value}</span>
                  <span className="text-[11px] font-bold text-neutral-500">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trace Your Honey Section */}
      <div className="py-24 -mt-16 relative z-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <Card className="border-none shadow-2xl overflow-hidden bg-[#FFF9F0]/95 backdrop-blur-md rounded-[2.5rem]">
              <CardContent className="p-0">
                {showScanner ? (
                  <div className="p-10">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight">Scan Honey QR</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)} className="rounded-full">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div id="reader" className="overflow-hidden rounded-3xl border-4 border-dashed border-amber-500/30" />
                    <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
                      Allow camera access and frame the QR code on your BeeYield jar.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2">
                    <div className="p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
                      <h2 className="mb-4 text-3xl font-black tracking-tight">Verify Your Honey</h2>
                      <p className="mb-8 text-muted-foreground">
                        Enter the unique batch code found on your jar label to inspect authenticated harvest records.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                          <Input
                            id="qrCode"
                            name="qrCode"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                            placeholder={`e.g. ${exampleCodes[0] ?? DEFAULT_EXAMPLE_CODES[0]}`}
                            className="h-16 pl-12 pr-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-amber-500 transition-all text-lg font-bold"
                            disabled={loading}
                          />
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#F4D03F] transition-colors" />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading || !qrCode.trim()}
                          className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-[#1A1A1A] text-lg font-black rounded-2xl shadow-xl hover:shadow-amber-500/20 transition-all"
                        >
                          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Batch"}
                        </Button>
                      </form>

                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-xs font-black text-slate-400 mb-4">Latest verified harvest batches</p>
                        <div className="flex flex-wrap gap-2">
                          {exampleCodes.map(code => (
                            <Button
                              key={code}
                              variant="ghost"
                              size="sm"
                              className="text-[10px] font-bold bg-[#F9F7F2] hover:bg-amber-50 hover:text-[#F4D03F] rounded-full h-8"
                              onClick={() => {
                                setQrCode(code);
                                handleTrace(code);
                              }}
                            >
                              {code}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <ShieldCheck className="h-4 w-4 text-[#1B9157]" />
                          <span className="text-xs font-bold text-muted-foreground italic">Every batch is permanently recorded and verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center text-center">
                      <div className="mb-6 w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center">
                        <QrCode className="h-10 w-10 text-[#F4D03F]" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight mb-4 text-[#1A1A1A]">Quick Scan</h3>
                      <p className="text-muted-foreground mb-8 text-sm">
                        Use your smartphone camera to instantly verify your honey's authenticity and see its full origin story.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-16 border-2 border-amber-500/20 hover:border-amber-500 text-[#F4D03F] font-black rounded-2xl transition-all"
                        onClick={() => setShowScanner(true)}
                      >
                        <Zap className="mr-2 h-5 w-5 fill-amber-500" />
                        Open Scanner
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification overlay */}
            <AnimatePresence>
              {verifying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-neutral-950/95 backdrop-blur-2xl flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="max-w-md w-full px-8 text-center"
                  >
                    <div className="relative mb-12">
                      <div className="absolute inset-0 bg-[#F4D03F] rounded-full blur-[120px] opacity-60"></div>

                      {/* High-Tech Scanner Visual */}
                      <div className="relative h-56 w-56 mx-auto bg-neutral-900 rounded-[3rem] shadow-2xl flex items-center justify-center border border-[#F4D03F]/20 overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#15803d_0%,transparent_70%)] opacity-20"></div>

                        {/* Scanning Line */}
                        <motion.div
                          animate={{ y: ["-100%", "100%", "-100%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/50 to-transparent h-16 w-full z-20 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                        />

                        <div className="relative z-10 flex flex-col items-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Cpu className="h-16 w-16 text-[#F4D03F] mb-3" />
                          </motion.div>
                          <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="h-1 w-6 rounded-full bg-[#1B9157] overflow-hidden">
                                <motion.div
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                  className="h-full bg-green-500 w-1/2"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl"></div>
                        <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl"></div>
                        <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl"></div>
                        <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl"></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-3xl font-black tracking-tight text-[#1A1A1A] italic">Verifying</h3>
                      <p className="text-neutral-500 font-black text-[10px]">
                        Checking this batch
                      </p>

                      <div className="flex items-center justify-center gap-3 py-4">
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                        <span className="text-[10px] font-mono text-[#1B9157]">Checking…</span>
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F9F7F2] backdrop-blur-md p-4 rounded-3xl border border-[#F4D03F]/20 text-left">
                          <p className="text-[8px] font-black text-neutral-500 mb-1">Status</p>
                          <p className="text-xs font-mono font-bold text-[#1A1A1A]">Verifying</p>
                        </div>
                        <div className="bg-[#F9F7F2] backdrop-blur-md p-4 rounded-3xl border border-[#F4D03F]/20 text-left">
                          <p className="text-[8px] font-black text-neutral-500 mb-1">Batch Key</p>
                          <p className="text-xs font-mono font-bold text-[#1A1A1A]">{qrCode || "Pending"}</p>
                        </div>
                      </div>

                      <div className="pt-8">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center justify-center gap-3 text-[#1B9157] font-black text-[11px]"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Verified
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-[#FFF9F0] rounded-[2rem] border-none shadow-2xl">
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full bg-[#FFF9F0]/80 backdrop-blur-md hover:bg-[#FFF9F0] text-[#1A1A1A] shadow-lg">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="px-10 pb-10 -mt-14">
                  {/* Header / Brand */}
                  <div className="bg-[#F0F7F0] -mx-10 px-10 py-10 flex flex-col items-center text-center relative overflow-hidden mb-10 rounded-t-[2rem]">
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="hex-dialog" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#hex-dialog)" />
                      </svg>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 relative z-10">
                      <div className="relative group scale-110">
                        <div className="absolute -inset-6 bg-[#F4D03F] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        <img src={LOGO} alt="BeeYield Logo" className="h-32 md:h-40 object-contain relative z-10 hover:scale-110 transition-transform duration-500 filter drop-shadow-2xl" />
                      </div>

                      <div className="h-1 md:h-24 w-24 md:w-1 bg-gradient-to-b from-transparent via-green-200 to-transparent hidden md:block" />

                      <div className="relative">
                        <div className="absolute -inset-3 bg-gradient-to-r from-amber-400 to-green-500 rounded-full blur-xl opacity-20"></div>
                        <img
                          src={traceData?.farmer?.photo_url || TIMOTHY_PHOTO || PLACEHOLDER_SVG}
                          alt={traceData?.farmer?.name || "Timothy Nduva"}
                          className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white relative z-10 shadow-2xl bg-white"
                        />
                      </div>
                    </div>

                    <Badge className="bg-green-100 text-[#1B9157] border-green-200 text-xs px-4 py-2 hover:bg-[#1B9157] transition-colors inline-flex items-center font-bold mb-4">
                      <ShieldCheck className="mr-1.5 h-4 w-4" /> {textOrMissing(traceData?.verification_status, "Verification pending")}
                    </Badge>

                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">BeeYield Trace Report</h2>
                    <p className="text-neutral-600 font-medium">Batch: <span className="text-[#1B9157] font-bold">{traceData?.batch_code}</span> • <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Blockchain Verified</span></p>
                  </div>

                  {/* Mission Story Section */}
                  <div className="bg-[#F9F7F2] rounded-[2.5rem] p-8 md:p-10 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">The BeeYield Story</h3>
                    </div>

                    <div className="hidden space-y-4 text-lg text-neutral-800 leading-relaxed font-medium">
                      <p>
                        Founded with a mission for sustainable apiculture in rural Makueni, BeeYield connects ethical beekeeping directly with verifiable biological data and modern IoT technology.
                      </p>
                      <p>
                        Today, our operations span thriving Kenyan apiary networks adhering to our radical commitment: we harvest only surplus honey, leaving ample nourishment in every hive for colony health and vitality.
                      </p>
                      <p className="text-neutral-600 font-normal">
                        Our apiculture and engineering teams pair traditional beekeeping stewardship with in-hive sensor intelligence — ensuring end-to-end transparency, protecting the African honeybee, and safeguarding biodiversity across Kenya.
                      </p>
                    </div>

                    <div className="space-y-4 text-lg text-neutral-800 leading-relaxed font-medium">
                      {traceStoryParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      <p className="text-neutral-600 font-normal">
                        {growthMilestone?.description || "Every reported batch is tied back to the beekeeper, apiary, hive, harvest date, and conservation promise so the story stays attached to the product."}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 pt-6 border-t border-slate-200 mt-6 md:mt-8">
                      <div className="rounded-3xl border border-emerald-200 bg-white/80 p-5">
                        <p className="text-[10px] font-black tracking-[0.18em] text-[#1B9157] uppercase mb-2">50/50 Harvest</p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {conservationFacts.find((item) => item.label === "50/50 reserve left for bees")?.value !== missingDataLabel
                            ? `${conservationFacts.find((item) => item.label === "50/50 reserve left for bees")?.value} was recorded as the reserve left in the hive for colony nutrition on this harvest.`
                            : "BeeYield documents the 50/50 harvest commitment and shows reserve values whenever the backend provides them."}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-amber-200 bg-white/80 p-5">
                        <p className="text-[10px] font-black tracking-[0.18em] text-[#A16207] uppercase mb-2">Flora Stewardship</p>
                        <p className="text-2xl font-black text-[#1A1A1A]">Protected</p>
                        <p className="text-xs font-semibold text-slate-500">Indigenous acacia & wild flowering forage corridor</p>
                      </div>
                      <div className="rounded-3xl border border-sky-200 bg-white/80 p-5">
                        <p className="text-[10px] font-black tracking-[0.18em] text-sky-700 uppercase mb-2">ESG Commitment</p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {esgHighlights.length
                            ? esgHighlights.map((metric) => `${metric.metric_name}: ${metric.metric_value} ${metric.metric_unit}`.trim()).join(" | ")
                            : "Environmental, social, and governance metrics will appear here as soon as the backend ESG tables are populated."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200 mt-6 md:mt-8">
                      <Badge className="bg-amber-100 text-[#F4D03F] border-amber-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 2: Zero Hunger</Badge>
                      <Badge className="bg-green-100 text-[#1B9157] border-green-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 13: Climate Action</Badge>
                      <Badge className="bg-emerald-100 text-[#1B9157] border-emerald-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 15: Life on Land</Badge>
                    </div>
                  </div>

                  {/* Real-time Hive Metrics (Dashboard Data) */}
                  <div className="hidden mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Hive Conditions</h3>
                      <Badge variant="outline" className="bg-green-50 text-[#1B9157] border-green-200 font-bold gap-1.5 py-1 px-3">
                        <Activity className="h-3 w-3 animate-pulse" /> Verified Data
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-none bg-orange-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                          <Thermometer className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-black text-[#1A1A1A]">
                          {typeof traceData?.sensor_snapshot?.avg_temp === 'number' ? `${traceData.sensor_snapshot.avg_temp.toFixed(1)}°C` : missingDataLabel}
                        </p>
                        <p className="text-xs font-bold text-slate-500">Temperature</p>
                      </Card>
                      <Card className="border-none bg-blue-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Droplets className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-[#1A1A1A]">
                          {typeof traceData?.sensor_snapshot?.avg_humidity === 'number' ? `${traceData.sensor_snapshot.avg_humidity.toFixed(1)}%` : missingDataLabel}
                        </p>
                        <p className="text-xs font-bold text-slate-500">Humidity</p>
                      </Card>
                      <Card className="border-none bg-amber-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                          <Box className="h-5 w-5 text-[#F4D03F]" />
                        </div>
                        <p className="text-2xl font-black text-[#1A1A1A]">{typeof traceData?.sensor_snapshot?.weight_kg === 'number' ? `${traceData.sensor_snapshot.weight_kg}kg` : missingDataLabel}</p>
                        <p className="text-xs font-bold text-slate-500">Hive Weight</p>
                      </Card>
                      <Card className="border-none bg-indigo-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-black text-[#1A1A1A]">{textOrMissing(traceData?.sensor_snapshot?.acoustics_status)}</p>
                        <p className="text-xs font-bold text-slate-500">Colony Status</p>
                      </Card>
                    </div>
                  </div>

                  {/* Main Grid: Origin & Beekeeper */}
                  <div className="hidden grid md:grid-cols-2 gap-8 mb-12">
                    {/* Origin Details Card */}
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-[#FFF9F0] h-full relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Globe className="h-24 w-24 text-[#F4D03F]" />
                      </div>

                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Origin Details</h3>
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-[#F4D03F]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-8 relative z-10">
                        {/* Batch Identifier */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black text-slate-400 mb-1">Batch Identifier</p>
                          <p className="text-xl font-black text-[#1A1A1A] leading-none">{traceData?.batch_code}</p>
                        </div>

                        {/* Harvest Date */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black text-slate-400 mb-1">Harvest Date</p>
                          <p className="text-xl font-black text-[#1A1A1A] leading-none">
                            {textOrMissing(traceData?.timeline?.find(s => s.title === "Harvest Day")?.date || traceData?.harvest_date)}
                          </p>
                        </div>

                        {/* Apiary Stats */}
                        <div className="col-span-2">
                          <div className="bg-[#F9F7F2] rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                              <Home className="h-4 w-4 text-[#F4D03F]" />
                              <span className="font-black text-[#1A1A1A] tracking-wide text-xs">Harvest Context</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400">Selected Hives</p>
                                <p className="text-lg font-black text-[#1A1A1A]">
                                  <span className="text-[#1B9157]">{textOrMissing(traceData?.impact_stats?.harvested_hives, "—")}</span> <span className="text-slate-400 text-sm">/ {textOrMissing(traceData?.impact_stats?.hive_count?.replace(/\D/g, ''), "—")}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400">Total Harvest</p>
                                <p className="text-lg font-black text-[#1A1A1A]">
                                  {textOrMissing(traceData?.impact_stats?.total_honey_kg, "—")} kg
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                                <p className="text-[10px] font-bold text-primary">Your Jar</p>
                                <p className="text-lg font-black text-[#1A1A1A]">{textOrMissing(traceData?.extra_metadata?.production_lot_size)}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-[10px] text-slate-500 font-medium italic">
                                {textOrMissing(traceData?.extra_metadata?.harvest_context)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Apiary Site */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-black text-slate-400 mb-1">Apiary Location</p>
                          <p className="text-lg font-black text-[#1A1A1A] leading-tight mb-0.5">{textOrMissing(traceData?.apiary?.name)}</p>
                          <p className="text-xs font-semibold text-slate-500">{textOrMissing(traceData?.apiary?.location_name)}, Kenya</p>
                        </div>

                        {/* Flora Sources */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-black text-slate-400 mb-2">Flower Sources</p>
                          <div className="flex flex-wrap gap-2">
                            {traceData?.apiary?.flora_types?.length ? traceData.apiary.flora_types.map((flora: string) => (
                              <Badge key={flora} className="bg-green-100 text-[#1B9157] border-green-200 text-xs font-bold px-3 py-1 rounded-lg">
                                {flora}
                              </Badge>
                            )) : (
                              <span className="text-sm font-semibold text-slate-500">{missingDataLabel}</span>
                            )}
                          </div>
                        </div>

                        {/* Water Source */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black text-slate-400 mb-1">Water Source</p>
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="font-bold text-[#1A1A1A]">{textOrMissing(traceData?.apiary?.water_source)}</span>
                          </div>
                        </div>

                        {/* Hive Details */}
                        {traceData?.hive && (
                          <div className="col-span-2 pt-6 border-t border-slate-100 mt-2">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-black text-[#1B9157] flex items-center gap-1.5">
                                <Zap className="h-3 w-3" /> Hive Sensor Data
                              </p>
                              <Badge variant="outline" className="border-emerald-200 text-[#1B9157] text-[10px] font-bold px-2 py-0.5 bg-emerald-50 flex items-center gap-1">
                                <Activity className="h-2.5 w-2.5" /> Updated: {formatSyncTime(traceData.sensor_snapshot?.sync_time)}
                              </Badge>
                            </div>

                            <div className="bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-[#1A1A1A] rounded-[2rem] p-6 overflow-hidden relative border border-[#1B9157] shadow-2xl">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  <pattern id="grid-p" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                                  </pattern>
                                  <rect width="100%" height="100%" fill="url(#grid-p)" />
                                </svg>
                              </div>

                              <div className="relative z-10">
                                {/* Header: Hive ID & Queen Status */}
                                <div className="flex justify-between items-start mb-6 pb-6 border-b border-[#F4D03F]/20">
                                  <div className="flex items-center gap-4">
                              <div className="relative">
                                      <div className="absolute -inset-2 bg-[#F4D03F] rounded-full blur-lg opacity-60" />
                                      <div className="h-14 w-14 bg-[#F4D03F]/10 backdrop-blur-md rounded-2xl border border-[#F4D03F]/40 flex items-center justify-center relative z-10 shadow-lg group-hover:bg-gray-200 transition-all duration-500">
                                        <div className="text-center">
                                          <Cpu className="h-5 w-5 text-[#F4D03F] mb-0.5 mx-auto" />
                                          <p className="text-[10px] font-black text-[#1A1A1A] leading-none">{traceData.hive.hive_code}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-black leading-tight tracking-tight flex items-center gap-2">
                                        Hive <span className="px-1.5 py-0.5 bg-[#1B9157] border border-[#1B9157] text-[10px] rounded text-white font-mono">{traceData.hive.hive_code.replace(/\D/g, '')}</span>
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        {traceData.sensor_snapshot?.queen_status === 'present' ? (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1B9157] border border-[#1B9157] rounded-full">
                                            <span className="text-[10px] text-[#1B9157] font-bold leading-none">🛡️</span>
                                            <span className="text-[9px] font-black text-[#1B9157]">Queen Present</span>
                                          </div>
                                        ) : traceData.sensor_snapshot?.queen_status === 'absent' ? (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                            <span className="text-[10px] leading-none">⚠️</span>
                                            <span className="text-[9px] font-black text-red-300">Colony Alert</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#F9F7F2] border border-[#F4D03F]/20 rounded-full">
                                            <span className="text-[10px] leading-none text-slate-400 italic">?</span>
                                            <span className="text-[9px] font-black text-slate-300 italic">State Unknown</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right glass-panel p-2 rounded-xl bg-[#1B9157] border border-[#1B9157]">
                                    <p className="text-[8px] font-black text-[#1B9157] mb-0.5">GPS Location</p>
                                    <p className="text-[10px] font-mono font-bold text-[#1A1A1A] mb-0.5">{textOrMissing(traceData.sensor_snapshot?.latitude)}</p>
                                    <p className="text-[10px] font-mono font-bold text-[#1A1A1A]">{textOrMissing(traceData.sensor_snapshot?.longitude)}</p>
                                  </div>
                                </div>

                                {/* Precision Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  {/* Acoustics */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Hive Sound Level</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{renderMetricValue(traceData.sensor_snapshot?.colony_acoustics, "Hz")}</span>
                                      <span className="text-[10px] text-[#1B9157] font-bold flex items-center">• {textOrMissing(traceData.sensor_snapshot?.acoustics_status)}</span>
                                    </div>
                                  </div>

                                  {/* Flight Activity */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Bee Activity</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{renderMetricValue(traceData.sensor_snapshot?.flight_activity, " visits/min")}</span>
                                      <span className="text-[10px] text-[#1B9157] font-bold flex items-center">• {textOrMissing(traceData.sensor_snapshot?.activity_status)}</span>
                                    </div>
                                  </div>

                                  {/* Brood Temp */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Nursery Temperature</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{renderMetricValue(traceData.sensor_snapshot?.brood_temp, "°C")}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-[#F4D03F] font-bold flex items-center italic">Live</span>
                                        <span className="text-[10px] text-[#F4D03F] font-bold flex items-center">▲ {textOrMissing(traceData.sensor_snapshot?.temp_trend)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Nest Humidity */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Inside Humidity</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{renderMetricValue(traceData.sensor_snapshot?.nest_humidity, "%")}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-[#F4D03F] font-bold flex items-center italic">Live</span>
                                        <span className="text-[10px] text-[#F4D03F] font-bold flex items-center">▲ {textOrMissing(traceData.sensor_snapshot?.humidity_trend)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Vibration Index */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Hive Movement</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{renderMetricValue(traceData.sensor_snapshot?.vibration_index, "m/s²")}</span>
                                      <span className="text-[10px] text-[#1B9157] font-bold flex items-center">• {textOrMissing(traceData.sensor_snapshot?.vibration_status)}</span>
                                    </div>
                                  </div>

                                  {/* Queen Pheromone */}
                                  <div className="space-y-1">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-[#1B9157] tracking-wide">Queen Health Signal</p>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black">{textOrMissing(traceData.sensor_snapshot?.queen_pheromone)}</span>
                                        <span className="text-[10px] text-[#F4D03F] font-bold flex items-center">▲ {textOrMissing(traceData.sensor_snapshot?.pheromone_trend)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-[#1B9157]">Forage and Weather</p>
                                    <div className="rounded-2xl bg-[#022c22]/50 border border-[#1B9157] p-4 space-y-4">
                                      <div>
                                        <p className="text-[10px] font-bold text-[#1B9157] tracking-wide mb-2">Specific Florage</p>
                                        <div className="flex flex-wrap gap-2">
                                          {traceData?.apiary?.flora_types?.length ? traceData.apiary.flora_types.map((flora: string) => (
                                            <Badge key={`forage-${flora}`} className="bg-[#1B9157]/15 text-white border border-[#1B9157]/40 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                              {flora}
                                            </Badge>
                                          )) : (
                                            <span className="text-xs text-slate-300">{missingDataLabel}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Weather Status</p>
                                          <p className="font-semibold text-white">{textOrMissing(apiaryWeather?.weather_summary?.status || traceData?.extra_metadata?.weather_conditions)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Apiary Terrain</p>
                                          <p className="font-semibold text-white">{textOrMissing(traceData?.apiary?.environment_type)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Air Temperature</p>
                                          <p className="font-semibold text-white">{numberOrMissing(apiaryWeather?.current?.temperature_c, "°C", 1)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Humidity</p>
                                          <p className="font-semibold text-white">{numberOrMissing(apiaryWeather?.current?.humidity_pct, "%", 0)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Wind Speed</p>
                                          <p className="font-semibold text-white">{numberOrMissing(apiaryWeather?.current?.wind_speed_kph, " kph", 1)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-[#1B9157] mb-1">Rainfall</p>
                                          <p className="font-semibold text-white">{numberOrMissing(apiaryWeather?.daily_summary?.precipitation_mm, " mm", 1)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2 flex flex-col">
                                    <p className="text-[10px] font-black text-[#1B9157]">Record Integrity</p>
                                    <div className="bg-[#022c22]/40 rounded-2xl p-5 border border-[#1B9157] flex-1 flex flex-col justify-between">
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-[#1B9157] rounded-xl border border-[#1B9157]">
                                          <div className="h-8 w-8 rounded-full bg-[#1B9157] flex items-center justify-center">
                                            <ShieldCheck className="h-4 w-4 text-[#1B9157]" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-[#1A1A1A] leading-tight">Batch Fingerprint</p>
                                            <p className="text-[9px] font-medium text-[#1B9157]/80">{textOrMissing(traceData?.blockchain_status?.overall, "verification pending")}</p>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-xs font-semibold text-[#1B9157] mb-1">BeeYield Ledger</p>
                                            <p className="text-sm font-black text-white">{(traceData?.blockchain_status?.beeyield_ledger?.verified ?? traceData?.blockchain_status?.honeychain?.verified) ? "Verified" : "Not verified"}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs font-semibold text-[#1B9157] mb-1">Polygon</p>
                                            <p className="text-sm font-black text-white">{traceData?.blockchain_status?.polygon?.verified ? "Verified" : "Not verified"}</p>
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-xs font-semibold text-[#1B9157] mb-1">Block Hash</p>
                                          <p className="text-[11px] font-mono text-slate-200 break-all">{textOrMissing(traceData?.blockchain_status?.block_hash)}</p>
                                        </div>
                                      </div>

                                      <div className="mt-4 pt-4 border-t border-[#F4D03F]/10 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <LockIcon className="h-3 w-3 text-[#1B9157]" />
                                          <span className="text-xs font-semibold text-[#1B9157]">Secure record</span>
                                        </div>
                                        <span className="text-xs font-semibold text-[#D4AC0D]">{textOrMissing(traceData?.verification_status)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Stats */}
                                  <div className="flex items-center gap-6 pt-5 border-t border-[#F4D03F]/20">
                                  <div className="flex items-center gap-2 bg-[#F9F7F2] px-3 py-1.5 rounded-full border border-[#F4D03F]/10">
                                    <span className="text-[11px] font-semibold text-[#1B9157]">Hive quality:</span>
                                    <span className="text-xs font-black text-[#1A1A1A]">{renderMetricValue(traceData.sensor_snapshot?.fob, "/10")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-[#F9F7F2] px-3 py-1.5 rounded-full border border-[#F4D03F]/10">
                                    <span className="text-[11px] font-semibold text-[#1B9157]">Tracking:</span>
                                    <span className="text-xs font-black text-[#1B9157]">Hive to Jar</span>
                                  </div>
                                  <div className="flex-1 text-right">
                                    <p className="text-[11px] font-semibold text-[#D4AC0D]">Hive: {textOrMissing(traceData?.hive?.hive_code)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Master Beekeeper Card */}
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-[#1A1A1A] p-8 relative overflow-hidden h-full">
                      <h3 className="text-sm font-semibold opacity-70 mb-8 text-[#1B9157]">Your beekeeper</h3>

                      <div className="flex gap-6 items-start relative z-10 mb-8">
                        {/* Photo & Logo */}
                        <div className="shrink-0 relative">
                          {/* Farmer photo */}
                          <div className="flex items-center gap-8">
                            <div className="relative group">
                              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 to-green-500 rounded-[1.8rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                              <img src={traceData?.farmer?.photo_url || TIMOTHY_PHOTO || PLACEHOLDER_SVG} alt={traceData?.farmer?.name || "Timothy Nduva"} className="h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] object-cover border-2 border-[#F4D03F]/40 shadow-2xl relative z-10" />
                            </div>
                            <div className="relative flex flex-col items-center gap-2 group">
                              <img src={LOGO} alt="BeeYield" className="h-20 w-20 md:h-24 md:w-24 object-contain transition-transform group-hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                              <span className="text-[10px] font-black text-[#F4D03F]/80">Verified</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-3">
                        <div className="text-2xl font-black tracking-tighter">{traceData?.farmer?.name || "Timothy Nduva"}</div>
                        <Badge className="bg-[#F4D03F] hover:bg-amber-600 text-[#1A1A1A] border-none font-bold text-[10px] px-2 py-0.5 inline-flex items-center gap-1">
                          <Award className="h-3 w-3" /> Head Beekeeper
                        </Badge>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center gap-2 text-[#1B9157]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{traceData?.farmer?.location_name || "Makueni"}, Kenya</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#1B9157]">
                            <div className="h-3.5 w-3.5 flex items-center justify-center font-serif font-black bg-[#1B9157] text-[#1B9157] rounded-full text-[9px]">E</div>
                            <span className="text-xs font-bold">{traceData?.farmer?.experience_years || "6"}+ Years Experience</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-[#1B9157] relative z-10">
                        <p className="text-[10px] font-black text-[#1B9157] mb-4">Our Commitment</p>
                        <div className="bg-[#1B9157] rounded-xl p-4 mb-6 backdrop-blur-sm border border-[#1B9157]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-[#1B9157] flex items-center justify-center">
                              <Scale className="h-4 w-4 text-[#1B9157]" />
                            </div>
                            <p className="font-bold text-lg text-[#1A1A1A]">50% Harvest Promise</p>
                          </div>
                          <p className="text-xs text-[#1B9157] leading-relaxed">
                            {conservationFacts.find((item) => item.label === "50/50 reserve left for bees")?.value !== missingDataLabel
                              ? `${conservationFacts.find((item) => item.label === "50/50 reserve left for bees")?.value} is recorded as the portion left in the hive for colony resilience.`
                              : "We strictly ensure half of every harvest remains in the hive to nourish the colony through dry seasons."}
                          </p>
                        </div>

                        <p className="text-[10px] font-black text-[#1B9157] mb-4">Our Story</p>
                        <div className="space-y-3">
                          {traceStoryParagraphs.slice(0, 2).map((paragraph) => (
                            <p key={paragraph} className="text-sm font-medium text-[#1B9157] italic leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Decorative BG Blob */}
                      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#1B9157] rounded-full blur-3xl pointer-events-none" />
                    </Card>
                  </div>

                  <div className="grid gap-8 mb-12 md:grid-cols-2">
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-[#FFF9F0]">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Origin Details</h3>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-bold">
                          {textOrMissing(traceData?.completeness?.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          ...harvestFacts,
                          { label: "Water source", value: textOrMissing(traceData?.apiary?.water_source) },
                          { label: "Experience", value: hasValue(traceData?.farmer?.experience_years) ? `${traceData?.farmer?.experience_years} years` : missingDataLabel },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-[10px] font-black text-slate-400 mb-1">{item.label}</p>
                            <p className="font-semibold text-[#1A1A1A]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-white">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black tracking-tighter">Verification & Telemetry</h3>
                        <Badge className="bg-white/10 text-white border-white/20 font-bold">
                          {textOrMissing(traceData?.verification_status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          { label: "Blockchain", value: textOrMissing(traceData?.blockchain_status?.overall) },
                          { label: "Verification URL", value: textOrMissing(traceData?.verification_url) },
                          ...sensorFacts,
                          ...weatherFacts,
                          { label: "Health status", value: textOrMissing(traceData?.health_snapshot?.status) },
                          {
                            label: "Completeness",
                            value: traceData?.completeness
                              ? `${traceData.completeness.present} present, ${traceData.completeness.derivable} derivable, ${traceData.completeness.missing} missing`
                              : missingDataLabel,
                          },
                        ].map((item) => (
                          <div key={item.label} className={item.label === "Verification URL" || item.label === "Completeness" ? "col-span-2" : ""}>
                            <p className="text-[10px] font-black text-white/60 mb-1">{item.label}</p>
                            <p className="font-semibold break-all">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div className="grid gap-8 mb-12 md:grid-cols-2">
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-[#FFF9F0]">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Conservation and ESG</h3>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">BeeYield Commitment</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {conservationFacts.map((item) => (
                          <div key={item.label}>
                            <p className="text-[10px] font-black text-slate-400 mb-1">{item.label}</p>
                            <p className="font-semibold text-[#1A1A1A]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-[#FFF9F0]">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Specific Chain of Custody</h3>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold">Field to Jar</Badge>
                      </div>
                      <div className="space-y-4 text-sm text-slate-700">
                        <p>
                          Farmer <span className="font-black text-[#1A1A1A]">{traceData?.farmer?.name || "Timothy Nduva"}</span> harvested batch <span className="font-black text-[#1A1A1A]">{textOrMissing(traceData?.batch_code)}</span> from hive <span className="font-black text-[#1A1A1A]">{textOrMissing(traceData?.hive?.hive_code)}</span> at apiary <span className="font-black text-[#1A1A1A]">{textOrMissing(traceData?.apiary?.name)}</span> on <span className="font-black text-[#1A1A1A]">{dateOrMissing(traceData?.harvest_date || traceData?.timeline?.find(s => s.title === "Harvest Day")?.date)}</span>.
                        </p>
                        <p>
                          Florage recorded for this lot: <span className="font-black text-[#1A1A1A]">{traceData?.apiary?.flora_types?.length ? traceData.apiary.flora_types.join(", ") : textOrMissing(traceData?.florage_type)}</span>.
                        </p>
                        <p>
                          Weather record: <span className="font-black text-[#1A1A1A]">{weatherFacts.find((item) => item.label === "Recorded harvest weather")?.value || missingDataLabel}</span>.
                        </p>
                        <p>
                          Latest sensor sync tied to this trace: <span className="font-black text-[#1A1A1A]">{sensorFacts.find((item) => item.label === "Last sensor sync")?.value || missingDataLabel}</span>.
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Journey Timeline */}
                  <div className="space-y-8 mb-8 bg-[#FFF9F0] rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">The Honey Journey</h3>
                      <Badge variant="outline" className="bg-[#F9F7F2] text-slate-500 border-slate-200 font-bold gap-1.5 py-1.5 pl-2 pr-3 hidden sm:flex">
                        <LockIcon className="h-3 w-3" /> Permanently Recorded
                      </Badge>
                    </div>


                    <div className="space-y-12 relative px-4 sm:px-12">
                      {/* The Golden Thread - High Fidelity Animated Line */}
                      <div className="absolute left-[4rem] sm:left-[6rem] top-4 bottom-4 w-1 bg-neutral-100 overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-beeyield-gold to-transparent opacity-80"
                          animate={{
                            top: ["-100%", "100%"]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="absolute inset-0 bg-beeyield-gold/20 blur-[1px]" />
                      </div>

                      {/* 1. Hive Origin Step */}
                      {traceData?.hive && (
                        <div className="flex gap-8 sm:gap-14 group relative">
                          <div className="relative z-10 shrink-0">
                            <motion.div
                              whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                              className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-[#FFF9F0] border-4 border-beeyield-gold flex items-center justify-center text-beeyield-gold shadow-glow-amber group-hover:scale-110 transition-transform duration-500"
                            >
                              <Home className="h-8 w-8 sm:h-10 sm:w-10" />
                            </motion.div>
                            <div className="mt-3 text-center text-[10px] font-black text-beeyield-gold">
                              Origin
                            </div>
                          </div>
                          <div className="flex-1 pb-12 border-b border-slate-50">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <h4 className="font-black text-2xl sm:text-3xl text-[#1A1A1A] tracking-tighter">Hive #{traceData.hive.hive_code}</h4>
                              <Badge className="bg-amber-100 text-[#F4D03F] border-none font-black text-[10px] px-3 py-1">Start</Badge>
                            </div>
                            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-4">
                              Deep within the <span className="text-[#1A1A1A] font-black italic">{traceData.apiary?.name}</span>, a resilient colony of <span className="text-beeyield-gold font-bold">{traceData.hive.bee_type}</span> began their harvest.
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="bg-[#F4D03F]/10 text-slate-500 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border border-slate-200">
                                <Globe className="h-3.5 w-3.5" /> {traceData.apiary?.location_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Flora Step - Connecting the Thread to Botanical Origin */}
                      <div className="flex gap-8 sm:gap-14 group relative">
                        <div className="relative z-10 shrink-0">
                          <motion.div
                            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-[#FFF9F0] border-4 border-beeyield-green flex items-center justify-center text-beeyield-green shadow-glow-green group-hover:scale-110 transition-transform duration-500"
                          >
                            <Leaf className="h-8 w-8 sm:h-10 sm:w-10" />
                          </motion.div>
                          <div className="mt-3 text-center text-[10px] font-black text-beeyield-green">
                            Flora
                          </div>
                        </div>
                        <div className="flex-1 pb-12 border-b border-slate-50">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h4 className="font-black text-2xl sm:text-3xl text-[#1A1A1A] tracking-tighter">Botanical Record</h4>
                            <Badge className="bg-green-100 text-[#1B9157] border-none font-black text-[10px] px-3 py-1">BIO-VERIFIED</Badge>
                          </div>
                          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-4">
                            Nectar sourced from <span className="text-beeyield-green font-black">{traceData?.apiary?.flora_types?.join(' & ') || 'Mixed Wildflowers'}</span> during peak blooming cycles.
                          </p>
                          <p className="text-sm text-slate-400 font-medium italic">Verified by ecosystem acoustic patterns and environmental sensor snapshots.</p>
                        </div>
                      </div>

                      {/* 3. Ethical Harvest Step */}
                      <div className="flex gap-8 sm:gap-14 group relative">
                        <div className="relative z-10 shrink-0">
                          <motion.div
                            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-[#FFF9F0] border-4 border-amber-600 flex items-center justify-center text-[#F4D03F] shadow-glow-amber group-hover:scale-110 transition-transform duration-500"
                          >
                            <Scale className="h-8 w-8 sm:h-10 sm:w-10" />
                          </motion.div>
                          <div className="mt-3 text-center text-[10px] font-black text-[#F4D03F]">
                            Ethics
                          </div>
                        </div>
                        <div className="flex-1 pb-12 border-b border-slate-50">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h4 className="font-black text-2xl sm:text-3xl text-[#1A1A1A] tracking-tighter">Harvest steps</h4>
                            <Badge className="bg-beeyield-gold text-[#1A1A1A] border-none font-black text-[10px] px-3 py-1 shadow-lg">50/50 PROMISE</Badge>
                          </div>
                          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-4">
                            Precision harvest of <span className="text-[#1A1A1A] font-black">{hasValue(traceData?.impact_stats?.total_honey_kg) ? `${traceData?.impact_stats?.total_honey_kg}kg` : missingDataLabel}</span>. Exactly half remains for colony vitality.
                          </p>
                          <div className="inline-flex items-center gap-2 p-3 bg-[#FFF9F0] rounded-2xl border border-beeyield-gold/30 shadow-glow-amber-small">
                            <div className="relative">
                              <ShieldCheck className="h-4 w-4 text-beeyield-gold" />
                              <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-beeyield-gold/30 rounded-full"
                              />
                            </div>
                            <span className="text-sm font-semibold text-beeyield-gold">Verified record</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Journey Closure: Your Jar */}
                      <div className="flex gap-8 sm:gap-14 group relative">
                        <div className="relative z-10 shrink-0">
                          <motion.div
                            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2.5rem] bg-[#FFF9F0] border-4 border-amber-400 flex items-center justify-center text-[#F4D03F] shadow-glow-amber group-hover:scale-110 transition-transform duration-500"
                          >
                            <Box className="h-8 w-8 sm:h-10 sm:w-10" />
                          </motion.div>
                          <div className="mt-3 text-center text-[11px] font-semibold text-[#D4AC0D]">
                            Your Jar
                          </div>
                        </div>
                        <div className="flex-1 last:pb-0">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h4 className="font-black text-2xl sm:text-3xl text-[#1A1A1A] tracking-tighter">Final Custody</h4>
                            <Badge className="bg-[#FFF9F0] text-[#1A1A1A] border-none font-black text-[10px] px-3 py-1">Final Step</Badge>
                          </div>
                          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-4">
                            Hand-bottled and assigned to batch <span className="text-beeyield-gold font-black underline underline-offset-4 decoration-2">{traceData?.batch_code}</span>. Destination: Excellence.
                          </p>
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-2 text-beeyield-gold font-black text-[10px]"
                          >
                            <div className="h-1 w-1 rounded-full bg-beeyield-gold" />
                            Traceability verified
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    {traceData && (
                      <PDFDownloadLink
                        document={<HoneyTracePDF traceData={traceData} weatherSummary={apiaryWeather} />}
                        fileName={`BeeYield-Trace-${traceData.batch_code}.pdf`}
                        className="w-full sm:flex-1"
                      >
                        {({ loading }) => (
                          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-[#1A1A1A] font-black h-14 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
                            Download Certificate
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto h-14 rounded-2xl font-black px-8">
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>


          </div>
        </div>
      </div>

      {/* ─── SECTION 1: THE HONEY CRISIS & BEEYIELD TRACE BLOCKCHAIN ─── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Global Honey Authenticity Challenge
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              End-to-End Traceability for the <br />
              <span className="text-beeyield-green">Honey Industry</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Honey is valued by consumers around the world as a high-quality natural product that uniquely reflects the environment it’s produced in. However, honey is one of the most frequently adulterated food products worldwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* The Authenticity Challenge Card */}
            <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-bl-[100px] pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-orange-100 border border-orange-200 rounded-full text-orange-800 text-xs font-bold mb-6">
                  <ShieldAlert className="h-4 w-4 text-orange-600" />
                  The Growing Challenge
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 tracking-tight">
                  Combating Non-Authentic Honey
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-6 font-medium">
                  Ensuring the quality and authenticity of honey is a growing challenge for the global food industry. Non-authentic honey regularly appears throughout the supply chain due to blending low-quality batches or the addition of additives such as syrups, colours, and flavours.
                </p>
                <div className="space-y-3.5 mb-8">
                  {[
                    "Blending low-quality batches to disguise product origin and quality",
                    "Addition of additives such as cheap industrial syrups (corn, rice, beet)",
                    "Artificial colours, chemical clarifying agents, and synthetic flavours",
                    "Expensive, slow spot testing that fails to detect sophisticated syrup blends",
                  ].map((risk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        ✕
                      </div>
                      <span className="text-sm text-neutral-700 font-medium">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border border-orange-200/60 text-xs text-neutral-600 font-medium italic">
                The global honey sector suffers from massive brand erosion, customs rejections, and regulatory penalties due to adulteration.
              </div>
            </div>

            {/* The BeeYield Trace Blockchain Solution Card */}
            <div className="bg-[#F0F7F0] border border-emerald-200/80 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 rounded-bl-[100px] pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800 text-xs font-bold mb-6">
                  <LockIcon className="h-3.5 w-3.5 text-emerald-700" />
                  BeeYield Trace • Blockchain Solution
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 tracking-tight">
                  Cryptographic Traceability From Hive to Jar
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-6 font-medium">
                  <strong className="text-neutral-900 font-bold">BeeYield Trace</strong> is a blockchain-based traceability solution that combines our years of industry expertise to track honey from hive to jar.
                </p>
                <p className="text-neutral-700 leading-relaxed mb-6 font-medium">
                  Our BeeYield Trace platform provides visibility at each step in your supply chain, so you have confidence in your products’ origin, safety, and compliance.
                </p>
                <div className="space-y-3.5 mb-8">
                  {[
                    "Decentralized, tamper-evident blockchain ledger recording every harvest event",
                    "GPS beekeeper verification connecting each jar to verified rural apiaries",
                    "Full custody tracking through extraction, bulk aggregation, testing, and bottling",
                    "Integrates with Intertek ATIC testing standards for verifiable authenticity",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-800" />
                      </div>
                      <span className="text-sm text-neutral-800 font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border border-emerald-200/80 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-beeyield-green shrink-0" />
                <span>Complete confidence in origin, safety, and compliance at every touchpoint.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHAT IS A HONEY TRACEABILITY SYSTEM? ("ONE STEP FORWARD, ONE STEP BACKWARD") ─── */}
      <section className="py-24 bg-[#FAF9F5] relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-beeyield-green" />
              Documented Supply Chain Framework
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              What is a Honey <span className="text-beeyield-green">Traceability System?</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto font-medium">
              A honey traceability system is a documented framework that tracks the movement of honey throughout the chain from beekeeper to consumer.
            </p>
          </div>

          {/* Principle Card: One Step Forward, One Step Backward */}
          <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-neutral-200/80 p-8 sm:p-12 shadow-sm mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-8 border-b border-neutral-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-beeyield-green flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">The "One Step Forward, One Step Backward" Chain</h3>
                  <p className="text-sm text-neutral-500 font-medium">Standardized data collection stored by every participant</p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold px-4 py-1.5 rounded-full text-xs">
                Global Best Practice
              </Badge>
            </div>

            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium mb-8">
              The system relies on data being collected and stored by each participant in the chain. Each actor will have data one step forward in the chain, and one step backward in the chain, through all stages of production, processing, and distribution. It identifies where honey comes from (suppliers) and where it goes next (processors, traders, customers).
            </p>

            {/* Visual Process Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center relative group">
                <div className="h-10 w-10 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Apiary Producers</h4>
                <p className="text-xs text-neutral-500 font-medium">Step Backward: Hive & Flora Origin<br />Step Forward: Primary Collector</p>
              </div>

              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center relative group">
                <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Collection Centers</h4>
                <p className="text-xs text-neutral-500 font-medium">Step Backward: Village Beekeepers<br />Step Forward: Central Processor</p>
              </div>

              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center relative group">
                <div className="h-10 w-10 mx-auto rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Processing & Packaging</h4>
                <p className="text-xs text-neutral-500 font-medium">Step Backward: Consolidated Batches<br />Step Forward: Exporters & Retailers</p>
              </div>

              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center relative group">
                <div className="h-10 w-10 mx-auto rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                  04
                </div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Retail & Consumers</h4>
                <p className="text-xs text-neutral-500 font-medium">Step Backward: Bottled Batch Key<br />Step Forward: End Consumer Pantry</p>
              </div>
            </div>
          </div>

          {/* Two Pillars: Swift Problem Isolation & Provenance vs Spot Testing */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pillar A: Swiftly Isolating Problems */}
            <div className="bg-white rounded-[2.5rem] border border-neutral-200/80 p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-amber-700" />
                </div>
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold mb-3">
                  Rapid Incident Response
                </Badge>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
                  Swiftly Isolating Problems
                </h3>
                <p className="text-neutral-600 leading-relaxed font-medium mb-6">
                  A honey traceability system can ensure honey safety and quality by swiftly isolating problems. For example, if a problem is detected in a batch of honey which is collected from a distant village, the associated data should be able to indicate where the problem originated and who must be contacted to correct it.
                </p>
              </div>
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/50 text-xs font-semibold text-amber-900">
                Pinpoint root-cause issues down to the village apiary within minutes — avoiding massive product recalls and isolating risk before batch blending.
              </div>
            </div>

            {/* Pillar B: Proving Authenticity vs. Spot Testing Alone */}
            <div className="bg-white rounded-[2.5rem] border border-neutral-200/80 p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-emerald-700" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold mb-3">
                  Combatting Honey Fraud
                </Badge>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
                  Traceability vs. Spot Testing
                </h3>
                <p className="text-neutral-600 leading-relaxed font-medium mb-6">
                  A fully traceable supply chain enables verification of product origin and authenticity. This is especially important because the honey sector is much affected by honey fraud. Combatting honey fraud through honey spot testing alone is very expensive and not wholly foolproof. For many honey producers, a robust traceability system is the best way to prove honey authenticity.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 text-xs font-semibold text-emerald-900">
                Replace expensive, recurring spot tests with an unassailable blockchain audit trail that proves authentic origin from hive to shelf.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: USING A TRACEABILITY PLATFORM TO COMBAT AUTHENTICITY ISSUES (24/7 MONITORING) ─── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              Risk Management Toolkit
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              Using a Traceability Platform to <br />
              <span className="text-beeyield-green">Combat Authenticity Issues</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              BeeYield Trace is a powerful addition to your authenticity risk management toolkit. With data available 24/7 you can monitor all aspects of your global supply chain, from GPS beekeeper verification to storing laboratory test results and tracking the blending of batches.
            </p>
          </div>

          {/* 4 Feature Pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-neutral-200/70 shadow-sm hover:shadow-lg hover:border-beeyield-green/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-amber-700" />
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-3 text-[11px] font-bold">Origin Verification</Badge>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">GPS Beekeeper Verification</h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                  Verify your beekeepers' identity, exact apiary GPS coordinates, and registered hive numbers directly on-site to guarantee true rural provenance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center text-xs font-bold text-amber-800">
                <span>Verified Field Origins</span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-neutral-200/70 shadow-sm hover:shadow-lg hover:border-beeyield-green/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Microscope className="h-7 w-7 text-emerald-700" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-3 text-[11px] font-bold">Laboratory Purity</Badge>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Storing Lab Test Results</h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                  Store accredited laboratory certificates on-chain — including moisture content, NMR spectrometry, pollen analysis, and antibiotic screenings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center text-xs font-bold text-emerald-800">
                <span>Tamper-Proof Assay Vault</span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-neutral-200/70 shadow-sm hover:shadow-lg hover:border-beeyield-green/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="h-7 w-7 text-blue-700" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-3 text-[11px] font-bold">Blending Audits</Badge>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Tracking Batch Blending</h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                  Cryptographically audit the blending of batches. Monitor blending ratios, track parent lots, and prevent unauthorized syrup dilution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center text-xs font-bold text-blue-800">
                <span>Unbroken Lot Lineage</span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-neutral-200/70 shadow-sm hover:shadow-lg hover:border-beeyield-green/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-purple-700" />
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-3 text-[11px] font-bold">Continuous Access</Badge>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Immediate 24/7 Visibility</h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                  Enjoy immediate and 24/7 access to authenticated batch data for importers, auditors, regulators, retailers, and end-consumers worldwide.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center text-xs font-bold text-purple-800">
                <span>Zero Downtime Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: HOW DOES IT BENEFIT ME? (STAKEHOLDER VALUE MATRIX) ─── */}
      <section className="py-24 bg-[#FAF9F5] relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-beeyield-green" />
              Ecosystem Advantages
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              How Does BeeYield Trace <span className="text-beeyield-green">Benefit You?</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Purpose-built value propositions addressing the core operational, quality, and commercial needs of every participant in the honey value chain.
            </p>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "all", label: "View All Roles" },
                { id: "beekeepers", label: "Beekeepers" },
                { id: "exporters", label: "Exporters" },
                { id: "importers", label: "Importers" },
                { id: "packers", label: "Packers & Retailers" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStakeholder(tab.id as any)}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm",
                    selectedStakeholder === tab.id
                      ? "bg-neutral-900 text-white shadow-md scale-105"
                      : "bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stakeholder Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stakeholderBenefits
              .filter((item) => selectedStakeholder === "all" || selectedStakeholder === item.id)
              .map((stakeholder) => (
                <motion.div
                  key={stakeholder.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2.5rem] border border-neutral-200/80 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-neutral-50 flex items-center justify-center group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green">
                        <stakeholder.icon className="h-7 w-7" />
                      </div>
                      <Badge className={cn("text-[10px] font-bold px-3 py-1 rounded-full", stakeholder.accent)}>
                        {stakeholder.badge}
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stakeholder.title}</h3>
                    <p className="text-xs font-bold text-beeyield-green uppercase tracking-wider mb-4">{stakeholder.tagline}</p>
                    
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-sm font-bold text-neutral-900 leading-snug mb-6">
                      “{stakeholder.headline}”
                    </div>

                    <div className="space-y-3 mb-6">
                      {stakeholder.points.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-beeyield-green shrink-0 mt-0.5" />
                          <span className="text-xs text-neutral-600 font-medium leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[11px] font-medium text-neutral-500 italic">
                      {stakeholder.quote}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: KEY FEATURES OF BEEYIELD TRACE ─── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              Technology Architecture
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              Key Features of <span className="text-beeyield-green">BeeYield Trace</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Enterprise-grade blockchain engineering combined with on-the-ground beekeeping domain expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {beeyieldTraceKeyFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-neutral-50/70 rounded-[2.5rem] border border-neutral-200/80 p-8 shadow-sm hover:shadow-lg hover:border-beeyield-green/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-beeyield-green group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <Badge className="bg-neutral-200/70 text-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full">
                      {feature.tag}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            {/* 6th Complementary Box: Intertek ATIC Certification Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-emerald-900 to-neutral-900 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-800/60 border border-emerald-500/30 flex items-center justify-center text-beeyield-gold">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <Badge className="bg-emerald-800 text-emerald-200 border-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full">
                    Global ATIC Standard
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">ATIC Compliance Ready</h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed font-medium">
                  Designed for frictionless synchronization with Intertek and certified testing laboratories for global export approvals.
                </p>
              </div>
              <div className="pt-6 border-t border-emerald-800/60 flex items-center gap-2 text-xs font-bold text-beeyield-gold">
                <span>Auditing, Testing, Inspection, Certification</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: STRATEGIC BENEFITS & 360° APPROACH ─── */}
      <section className="py-24 bg-[#FAF9F5] relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-beeyield-green" />
              360° Brand Protection
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              Strategic Benefits: A <span className="text-beeyield-green">360° Approach</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Protect your brand with a 360 approach to security and transparency, supported by industry-leading inspection and auditing capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {beeyieldTraceBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-beeyield-green flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <Badge className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                    {benefit.subtitle}
                  </Badge>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-medium">{benefit.description}</p>
                </div>
              </motion.div>
            ))}

            {/* Highlight Banner: One-Stop Shop Advantage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-[2.5rem] text-neutral-900 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 text-neutral-900">
                  <Sparkles className="h-7 w-7" />
                </div>
                <Badge className="bg-white/30 text-neutral-950 text-[10px] font-black px-3 py-1 rounded-full mb-3">
                  One-Stop Authenticity
                </Badge>
                <h3 className="text-2xl font-black text-neutral-950 mb-3 tracking-tight">Full Authenticity Suite</h3>
                <p className="text-sm text-neutral-900/90 leading-relaxed font-semibold">
                  Supports other Intertek honey services to provide a one stop shop for managing authenticity risk with traceability, auditing, testing and inspections.
                </p>
              </div>
              <div className="pt-6 border-t border-black/10 flex items-center justify-between text-xs font-black">
                <span>360° Risk Mitigation</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: LOW-COST HONEY TRACEABILITY RESOURCES & STARTER TOOLKIT ─── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100" id="traceability-resources">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-beeyield-green" />
              Free Practical Resources
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              Establish Honey Traceability at <br />
              <span className="text-beeyield-green">Relatively Low Cost</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Here you will find some resources to help you establish a honey traceability system at relatively low cost — empowering smallholders, cooperative aggregators, and commercial beekeepers.
            </p>

            {/* Category filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "all", label: "All Resources" },
                { id: "templates", label: "Field Templates" },
                { id: "protocols", label: "Quality Protocols" },
                { id: "guides", label: "Implementation Guides" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveResourceCategory(pill.id as any)}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm",
                    activeResourceCategory === pill.id
                      ? "bg-neutral-900 text-white shadow-md scale-105"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {lowCostResources
              .filter((res) => activeResourceCategory === "all" || activeResourceCategory === res.category)
              .map((res) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#FAF9F5] rounded-[2.5rem] border border-neutral-200/80 p-8 shadow-sm hover:shadow-lg hover:border-beeyield-green/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-beeyield-green group-hover:scale-110 transition-transform">
                        <res.icon className="h-7 w-7" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px] font-bold px-3 py-1 rounded-full">
                        {res.badge}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">{res.title}</h3>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">{res.format}</p>
                    <p className="text-sm text-neutral-600 leading-relaxed font-medium mb-6">{res.description}</p>
                  </div>

                  <div className="pt-6 border-t border-neutral-200/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: res.title,
                          description: `Resource ready: ${res.format}. Connecting to BeeYield resource repository.`,
                        });
                      }}
                      className="w-full h-11 rounded-xl font-bold text-xs border-neutral-300 hover:border-beeyield-green hover:bg-white text-neutral-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-3.5 w-3.5 text-beeyield-green" />
                      {res.downloadText}
                    </Button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: FAQ & SEO STRUCTURED KNOWLEDGE ─── */}
      <section className="py-24 bg-[#FAF9F5] relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 px-5 py-2 font-semibold text-xs rounded-full mb-6 inline-flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
              Honey Traceability & <span className="text-beeyield-green">Authenticity FAQs</span>
            </h2>
            <div className="h-1.5 w-24 bg-beeyield-green mx-auto mb-8 rounded-full" />
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Key insights into implementing one-step-forward / one-step-backward systems, isolating batch issues, and combating food fraud.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {honeyTraceabilityFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 sm:p-8 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-lg font-bold text-neutral-900">{faq.q}</span>
                    <div className={cn(
                      "h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 bg-beeyield-green/10 text-beeyield-green"
                    )}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 text-neutral-600 leading-relaxed font-medium text-sm sm:text-base border-t border-neutral-100"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TECHNICAL FIELD FEATURES ─── */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">Built for Field Reality</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
              Traceability Built for <span className="text-beeyield-green">Real</span> Beekeeping
            </h2>
            <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              BeeYield's verified operations platform captures real harvest data where it happens — with GPS verification, instant logging, and automatic compliance documentation for every jar.
            </p>
          </div>

          {/* ─── FEATURES GRID ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {traceabilityFeatures.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white p-10 rounded-[2rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-beeyield-green/20 transition-all duration-500"
              >
                <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-5 tracking-tight">{feature.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
              Traceability Process
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">How It Works</h2>
            <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">From hive to jar, every step is verified and permanently recorded.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { step: "1", title: "Record Harvest", desc: "Log field activities with GPS location, timestamp, moisture levels, and harvest weight.", icon: ClipboardList },
              { step: "2", title: "Verify Provenance", desc: "Confirm every batch is GPS-verified with hive origin, flora source, and colony health data.", icon: ShieldCheck },
              { step: "3", title: "Generate Logbooks", desc: "Create comprehensive digital records with the full operational history of each batch.", icon: FileDown },
              { step: "4", title: "Audit-Ready Reports", desc: "Get compliance documentation ready for regulatory review, export certification, or customer inquiry.", icon: Award },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-12 rounded-[2.5rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-beeyield-green/20 transition-all duration-500 group text-center"
              >
                <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green relative">
                  <item.icon className="h-7 w-7" />
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-5 tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-gradient-to-b from-[#f0f7f0] to-[#e8f4e8] text-neutral-900 relative overflow-hidden border-t border-emerald-100">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-6 text-neutral-900">
              Get Started with <br />
              <span className="text-beeyield-green">Verified</span> Honey Traceability
            </h2>
            <p className="text-lg text-neutral-600 leading-relaxed mb-12 max-w-2xl mx-auto">
              Deploy BeeYield's hive-to-jar traceability, GPS-verified harvest records, and field logging system for compliance and operational confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  const traceSection = document.getElementById("qrCode");
                  traceSection?.scrollIntoView({ behavior: "smooth" });
                  traceSection?.focus();
                }}
                className="h-14 px-10 bg-beeyield-green text-neutral-950 font-bold text-xs rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                <Search className="mr-2 h-4 w-4" />
                Trace a Batch Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/beeyield")}
                className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all backdrop-blur-sm"
              >
                Explore BeeYield Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Traceability;
