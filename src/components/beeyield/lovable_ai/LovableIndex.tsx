import { streamBeeGpt } from "@/lib/beegpt-stream";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  Image,
  Mic,
  MicOff,
  X,
  User,
  Sun,
  Moon,
  History,
  Info,
  Download,
  Bug,
  HeartPulse,
  BarChart3,
  Flower2,
  Calculator,
  Target,
  MapPin,
  Plane,
  Sprout,
  Menu,
  Layers,
  Cpu,
  LogIn,
  LogOut,
  ClipboardList,
  AudioLines,
  Plug,
  LifeBuoy,
  Settings as SettingsIcon,
  Package,
  Trees,
  CheckSquare,
  Compass,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import { useTheme } from "@/hooks/use-theme";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { supabase } from "@/integrations/supabase/client";
import ChatHistory, { type Conversation } from "./ChatHistory";
import AboutModal from "./AboutModal";
import MessageActions from "./MessageActions";
import MarkdownRenderer from "./MarkdownRenderer";
import BeeDiseasesPage from "./BeeDiseasesPage";
import PollinationCharts from "./PollinationCharts";
import PollinationLookup from "./PollinationLookup";
import HarvestCalculator from "./HarvestCalculator";
import PrecisionDrilldown from "./PrecisionDrilldown";
import { HivePlacementMap } from "./LazyMaps";
import BeeFlightTracker from "./BeeFlightTracker";
import BloomPhenology from "./BloomPhenology";
import { MOAView } from "./LazyMaps";
import MeasurementDataTools from "./MeasurementDataTools";
import ToolSidebar, { type ToolGroup } from "./ToolSidebar";
import FloragePage from "./FloragePage";
import ActivityCounter from "./ActivityCounter";
import ActivityForecaster from "./ActivityForecaster";
import PollinationPlanning from "./PollinationPlanning";
import PollinationCalcs from "./PollinationCalcs";
import AlertsPage from "./AlertsPage";
import MOACompare from "./MOACompare";
import BeeyieldCalculators from "./BeeyieldCalculators";
import VarroaSimulator from "./VarroaSimulator";
import DatasetImport from "./DatasetImport";
import FeedingSchedule from "./FeedingSchedule";
import KnowledgeSearch from "./KnowledgeSearch";
import ApiarySizing from "./ApiarySizing";
import ApiariesPage from "./ApiariesPage";
import YieldProjection from "./YieldProjection";
import InspectionsPage from "./InspectionsPage";
import TasksPage from "./TasksPage";
import ForageZonesPage from "./ForageZonesPage";
import HarvestsPage from "./HarvestsPage";
import SoundAnalysis from "./SoundAnalysis";
import IntegrationsPage from "./IntegrationsPage";
import SettingsPage from "./SettingsPage";
import HiveHealthDashboard from "./HiveHealthDashboard";
import SupportPage from "./SupportPage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  audioName?: string;
};

const SUGGESTIONS = [
  "What are all types of honey bees and their subspecies?",
  "Explain Varroa destructor — lifecycle, damage, and all treatment options",
  "Compare all 300 plus honey varieties and their medicinal properties",
  "What causes Colony Collapse Disorder and what are the solutions?",
  "Precision pollination data — which crops need bees and economic value?",
  "List every bee disease with cause, symptoms, and cure",
  "What are world records related to bees, honey, and hives?",
  "Explain bee venom therapy and apitherapy research",
  "How does the waggle dance work and what did Karl von Frisch discover?",
  "What are the latest research findings on bee cognition and intelligence?",
  "Which bee species are endangered and why?",
  "Compare all hive types: Langstroth, Warré, Flow Hive, Top-Bar and more",
];

async function streamBeeyield(
  messages: { role: string; content: string }[],
  imageBase64: string | null,
  imageType: string | null,
  audioBase64: string | null,
  audioType: string | null,
  promptVariant: string,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  const resp = await fetch("/api/public/beegpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      imageBase64,
      imageType,
      audioBase64,
      audioType,
      promptVariant,
    }),
  });

  if (!resp.ok) {
    try {
      const lastMsg = [...messages].reverse().find(m => m.role === 'user');
      const userPrompt = typeof lastMsg?.content === 'string' ? lastMsg.content : "BeeYield AI analysis";
      await streamBeeGpt(userPrompt, (delta) => onDelta(delta));
      onDone();
      return;
    } catch {
      onError("BeeGPT service is temporarily reconnecting. Please retry.");
      return;
    }
  }
  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rdDone, value } = await reader.read();
    if (rdDone) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        done = true;
        break;
      }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        /* partial */
      }
    }
  }
  onDone();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface IndexProps {
  embedded?: boolean;
  initialMessage?: string;
  onInitialMessageConsumed?: () => void;
  onTabChange?: (tab: string) => void;
}

export default function Index({ embedded = false, initialMessage, onInitialMessageConsumed, onTabChange }: IndexProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const deviceId = useDeviceId();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Conversation state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [diseasesOpen, setDiseasesOpen] = useState(false);
  const [pollinationOpen, setPollinationOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [siteMapOpen, setSiteMapOpen] = useState(false);
  const [flightTrackerOpen, setFlightTrackerOpen] = useState(false);
  const [bloomPhenologyOpen, setBloomPhenologyOpen] = useState(false);
  const [moaOpen, setMoaOpen] = useState(false);
  const [floragePageOpen, setFloragePageOpen] = useState(false);
  const [activityCounterOpen, setActivityCounterOpen] = useState(false);
  const [activityForecasterOpen, setActivityForecasterOpen] = useState(false);
  const [measurementToolsOpen, setMeasurementToolsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);


  const [pollinationPlanningOpen, setPollinationPlanningOpen] = useState(false);
  const [pollinationCalcsOpen, setPollinationCalcsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [moaCompareOpen, setMoaCompareOpen] = useState(false);
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);
  const [varroaSimOpen, setVarroaSimOpen] = useState(false);
  const [datasetImportOpen, setDatasetImportOpen] = useState(false);
  const [feedingScheduleOpen, setFeedingScheduleOpen] = useState(false);
  const [knowledgeSearchOpen, setKnowledgeSearchOpen] = useState(false);
  const [apiarySizingOpen, setApiarySizingOpen] = useState(false);
  const [apiariesOpen, setApiariesOpen] = useState(false);
  const [yieldProjectionOpen, setYieldProjectionOpen] = useState(false);
  const [inspectionsOpen, setInspectionsOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [forageZonesOpen, setForageZonesOpen] = useState(false);
  const [harvestsOpen, setHarvestsOpen] = useState(false);
  const [soundAnalysisOpen, setSoundAnalysisOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [healthDashOpen, setHealthDashOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [promptVariant, setPromptVariant] = useState<
    "baseline" | "bloom" | "flight" | "bloom_flight"
  >("baseline");

  // Media state
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<File | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageSeq = useRef(0);
  const nextMessageId = useCallback(() => `m_${++messageSeq.current}`, []);

  // Voice input
  const handleVoiceResult = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
    toast.success("Voice captured");
  }, []);
  const {
    isListening,
    isSupported: voiceSupported,
    toggleListening,
  } = useVoiceInput(handleVoiceResult);

  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("device_id", deviceId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }, [deviceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async (id: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(
        data.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
      );
      setConversationId(id);
    }
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
  };

  const createConversation = async (title: string): Promise<string> => {
    const { data } = await supabase
      .from("conversations")
      .insert({ device_id: deviceId, title })
      .select("id")
      .single();
    if (!data) throw new Error("Failed to create conversation");
    loadConversations();
    return data.id;
  };

  const clearAttachments = useCallback(() => {
    setAttachedImage(null);
    setImagePreviewUrl(null);
    setAttachedAudio(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    setAttachedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Audio must be under 20 MB");
      return;
    }
    setAttachedAudio(file);
    setAttachedImage(null);
    setImagePreviewUrl(null);
    toast.success(`Audio attached: ${file.name}`);
  };

  const initialConsumedRef = useRef(false);
  const sendRef = useRef<(t: string) => void>(() => {});
  useEffect(() => {
    sendRef.current = send;
  });
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialConsumedRef.current) {
      initialConsumedRef.current = true;
      sendRef.current(initialMessage);
      onInitialMessageConsumed?.();
    }
  }, [initialMessage, onInitialMessageConsumed]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let imgBase64: string | null = null;
    let imgType: string | null = null;
    let audioBase64: string | null = null;
    let audioType: string | null = null;

    if (attachedImage) {
      imgBase64 = await fileToBase64(attachedImage);
      imgType = attachedImage.type;
    }
    if (attachedAudio) {
      audioBase64 = await fileToBase64(attachedAudio);
      audioType = attachedAudio.type;
    }

    const userMsg: Message = {
      id: nextMessageId(),
      role: "user",
      content: text,
      imagePreview: imagePreviewUrl || undefined,
      audioName: attachedAudio?.name,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    clearAttachments();
    setIsLoading(true);

    // Create or reuse conversation
    let convId = conversationId;
    if (!convId) {
      try {
        const title = text.length > 50 ? text.slice(0, 50) + "…" : text;
        convId = await createConversation(title);
        setConversationId(convId);
      } catch {
        toast.error("Failed to save conversation");
      }
    }

    // Save user message
    if (convId) saveMessage(convId, "user", text);

    const history = newMessages.map((m) => ({ role: m.role, content: m.content }));
    let assistantContent = "";

    try {
      await streamBeeyield(
        history,
        imgBase64,
        imgType,
        audioBase64,
        audioType,
        promptVariant,
        (chunk) => {
          assistantContent += chunk;
          setMessages((p) => {
            const last = p[p.length - 1];
            if (last?.role === "assistant") {
              return p.map((m, i) =>
                i === p.length - 1 ? { ...m, content: assistantContent } : m,
              );
            }
            return [
              ...p,
              { id: nextMessageId(), role: "assistant" as const, content: assistantContent },
            ];
          });
        },
        () => {
          setIsLoading(false);
          // Save assistant message
          if (convId && assistantContent) {
            saveMessage(convId, "assistant", assistantContent);
            // Update conversation timestamp
            supabase
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", convId)
              .then(() => loadConversations());
          }
        },
        (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      );
    } catch {
      toast.error("Failed to connect to Beeyield AI");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setConversationId(null);
    clearAttachments();
  };

  const handleDeleteConversation = async (id: string) => {
    await supabase.from("chat_messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);
    if (conversationId === id) resetChat();
    loadConversations();
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    await supabase.from("conversations").update({ title: newTitle }).eq("id", id);
    loadConversations();
  };

  const toolGroups: ToolGroup[] = [
    {
      label: "Apiary operations",
      items: [
        {
          label: "Apiaries & Live Weather",
          icon: Compass,
          onClick: () => setApiariesOpen(true),
        },
        {
          label: "Hive Health Dashboard",
          icon: HeartPulse,
          onClick: () => setHealthDashOpen(true),
        },
        {
          label: "Inspections & Diagnostics",
          icon: ClipboardList,
          onClick: () => setInspectionsOpen(true),
        },
        {
          label: "My Tasks & Schedules",
          icon: CheckSquare,
          onClick: () => setTasksOpen(true),
        },
        {
          label: "Acoustic Audit (Sound Analysis)",
          icon: AudioLines,
          onClick: () => setSoundAnalysisOpen(true),
        },
        { label: "Alerts", icon: Bug, onClick: () => setAlertsOpen(true) },
        { label: "Hive Placement Map", icon: MapPin, onClick: () => setSiteMapOpen(true) },
        {
          label: "Feeding Schedule Timeline",
          icon: Calculator,
          onClick: () => setFeedingScheduleOpen(true),
        },
        {
          label: "Apiary & Equipment Sizing",
          icon: Layers,
          onClick: () => setApiarySizingOpen(true),
        },
      ],
    },
    {
      label: "Yield & pollination",
      items: [
        { label: "Harvest Logs & Verification", icon: Package, onClick: () => setHarvestsOpen(true) },
        { label: "Harvest Calculator", icon: Calculator, onClick: () => setCalculatorOpen(true) },
        {
          label: "Honey Yield Projection",
          icon: BarChart3,
          onClick: () => setYieldProjectionOpen(true),
        },
        {
          label: "Precision Pollination Drilldown",
          icon: Target,
          onClick: () => setDrilldownOpen(true),
        },
        {
          label: "Pollination Planning",
          icon: Target,
          onClick: () => setPollinationPlanningOpen(true),
        },
        {
          label: "Pollination Calcs",
          icon: Calculator,
          onClick: () => setPollinationCalcsOpen(true),
        },
        {
          label: "Pollination Data & Charts",
          icon: BarChart3,
          onClick: () => setPollinationOpen(true),
        },
        { label: "Stocking Density Lookup", icon: Flower2, onClick: () => setLookupOpen(true) },
        { label: "MOA — Multi-Objective View", icon: Layers, onClick: () => setMoaOpen(true) },
        { label: "MOA Run Comparison", icon: Layers, onClick: () => setMoaCompareOpen(true) },
      ],
    },
    {
      label: "Bloom & flight",
      items: [
        { label: "Bloom Phenology", icon: Sprout, onClick: () => setBloomPhenologyOpen(true) },
        {
          label: "Bee Flight & Activity Tracker",
          icon: Plane,
          onClick: () => setFlightTrackerOpen(true),
        },
        {
          label: "Quick Activity Counter",
          icon: Plane,
          onClick: () => setActivityCounterOpen(true),
        },
        {
          label: "Bee Activity Forecaster",
          icon: BarChart3,
          onClick: () => setActivityForecasterOpen(true),
        },
        { label: "Florage Database", icon: Sprout, onClick: () => setFloragePageOpen(true) },
        { label: "Forage Zones & Floral Resources", icon: Flower2, onClick: () => setForageZonesOpen(true) },
      ],
    },
    {
      label: "Knowledge & reference",
      items: [
        {
          label: "Bee Diseases (Editable)",
          icon: HeartPulse,
          onClick: () => setDiseasesOpen(true),
        },
        { label: "Varroa Simulator", icon: HeartPulse, onClick: () => setVarroaSimOpen(true) },
        {
          label: "Beeyield Calculators",
          icon: Calculator,
          onClick: () => setCalculatorsOpen(true),
        },
        { label: "Knowledge Base Search", icon: Info, onClick: () => setKnowledgeSearchOpen(true) },
        {
          label: "Dataset Import & Re-index",
          icon: Download,
          onClick: () => setDatasetImportOpen(true),
        },
      ],
    },
    {
      label: "Business & devices",
      items: [
        {
          label: "Integrations (Shopify, QuickBooks, eTIMS)",
          icon: Plug,
          onClick: () => setIntegrationsOpen(true),
        },
        {
          label: "My Devices, USB, Bluetooth & Online",
          icon: Cpu,
          onClick: () => (user ? setMeasurementToolsOpen(true) : navigate("/auth?next=/")),
        },
        { label: "Support & Tickets", icon: LifeBuoy, onClick: () => setSupportOpen(true) },
        {
          label: "Settings — Control Center",
          icon: SettingsIcon,
          onClick: () => setSettingsOpen(true),
        },
        { label: "About Beeyield AI", icon: Info, onClick: () => setAboutOpen(true) },
        user
          ? {
              label: `Sign out${profile?.full_name ? ` (${profile.full_name})` : ""}`,
              icon: LogOut,
              onClick: () => void signOut(),
            }
          : { label: "Sign in / Sign up", icon: LogIn, onClick: () => navigate("/auth?next=/") },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background honeycomb-bg overflow-hidden">
      <ToolSidebar groups={toolGroups} open={toolsOpen} onClose={() => setToolsOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatHistory
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNew={() => {
            resetChat();
            setHistoryOpen(false);
          }}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        {/* Header */}
        <header className="flex-shrink-0 border-b border-border bg-sidebar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground bg-muted"
              title="Chat history"
            >
              <History className="w-4 h-4" />
              <span className="text-xs font-medium">History</span>
            </button>
            <img src={beeyieldLogo} alt="Beeyield" className="h-9 w-auto" />
            <div className="hidden sm:block">
              <div className="font-display font-bold text-foreground text-base leading-tight">
                Beeyield AI
              </div>
              <div className="text-xs text-muted-foreground">
                The World's Most Comprehensive Bee Knowledge System
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground bg-muted"
              title={toolsOpen ? "Hide tools" : "Show tools"}
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Tools</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const text = messages
                    .map((m) => `${m.role === "user" ? "You" : "Beeyield AI"}: ${m.content}`)
                    .join("\n\n");
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `beeyield-chat-${new Date().toISOString().slice(0, 10)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Chat exported");
                }}
                className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
                title="Export chat"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <select
              value={promptVariant}
              onChange={(e) => setPromptVariant(e.target.value as typeof promptVariant)}
              className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-foreground hover:border-primary/50 shadow-sm"
              title="BeeGPT prompt variant"
            >
              <option value="baseline">AI: Baseline</option>
              <option value="bloom">AI: Bloom-only</option>
              <option value="flight">AI: Flight-only</option>
              <option value="bloom_flight">AI: Bloom + Flight</option>
            </select>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={resetChat}
              className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 px-3 py-1.5 rounded-lg transition-all"
            >
              New Chat
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto custom-scroll px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in max-w-3xl mx-auto w-full">
              <img src={beeyieldLogo} alt="Beeyield" className="h-16 w-auto mb-4 opacity-90" />
              <h1 className="font-display text-3xl font-bold text-honey mb-2">
                Welcome to Beeyield AI
              </h1>
              <p className="text-muted-foreground max-w-xl mb-6 text-sm leading-relaxed">
                The world's most comprehensive bee knowledge system. Powered by an extensive dataset
                covering every bee species, honey variety, disease, treatment, pollination science,
                and global industry research. Ask anything.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3 py-2.5 rounded-lg text-xs border border-border hover:border-primary/50 hover:bg-muted transition-all text-muted-foreground hover:text-foreground leading-relaxed"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`group flex gap-3 max-w-4xl mx-auto w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-background border border-border shadow-sm">
                  <img src={beeyieldLogo} alt="Beeyield AI" className="w-6 h-6 object-contain" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[80%]">
                {msg.imagePreview && (
                  <img
                    src={msg.imagePreview}
                    alt="Attached"
                    className="rounded-lg max-h-48 object-contain border border-border self-end"
                  />
                )}
                {msg.audioName && (
                  <div className="text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-1.5 self-end flex items-center gap-2">
                    <Mic className="w-3 h-3" />
                    {msg.audioName}
                  </div>
                )}
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "chat-user whitespace-pre-wrap" : "chat-assistant"}`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "assistant" && msg.content && (
                  <MessageActions content={msg.content} />
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 justify-start max-w-4xl mx-auto w-full">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-background border border-border flex items-center justify-center shadow-sm">
                <img src={beeyieldLogo} alt="Beeyield AI" className="w-6 h-6 object-contain" />
              </div>
              <div className="chat-assistant px-4 py-3 flex items-center gap-1">
                <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-primary inline-block" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border bg-sidebar px-4 pb-4 pt-3">
          {messages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3 max-w-4xl mx-auto">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  {s.length > 40 ? s.slice(0, 40) + "…" : s}
                </button>
              ))}
            </div>
          )}

          {(attachedImage || attachedAudio) && (
            <div className="flex items-center gap-3 mb-3 max-w-4xl mx-auto">
              {imagePreviewUrl && (
                <div className="relative">
                  <img
                    src={imagePreviewUrl}
                    alt="Attached"
                    className="h-16 w-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => {
                      setAttachedImage(null);
                      setImagePreviewUrl(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    aria-label="Remove attached image"
                    title="Remove attached image"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
              {attachedAudio && (
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  <Mic className="w-3.5 h-3.5 text-honey" />
                  <span className="max-w-[200px] truncate">{attachedAudio.name}</span>
                  <button
                    onClick={() => {
                      setAttachedAudio(null);
                      if (audioInputRef.current) audioInputRef.current.value = "";
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    aria-label="Remove attached audio"
                    title="Remove attached audio"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end max-w-4xl mx-auto">
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-9 h-9 rounded-xl border border-border bg-muted hover:border-primary/50 hover:bg-muted/80 flex items-center justify-center transition-all text-muted-foreground hover:text-honey"
                title="Attach image"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-9 h-9 rounded-xl border border-border bg-muted hover:border-primary/50 hover:bg-muted/80 flex items-center justify-center transition-all text-muted-foreground hover:text-honey"
                title="Attach audio file"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Beeyield AI anything about bees, honey, diseases, pollination, research..."
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none min-h-[48px] max-h-[140px]"
              rows={1}
              disabled={isLoading}
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
              }}
            />

            {/* Voice input button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
                    : "border-border bg-muted text-muted-foreground hover:text-honey hover:border-primary/50"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage && !attachedAudio) || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-amber text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageSelect}
            aria-label="Attach image"
            title="Attach image"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/*"
            className="hidden"
            onChange={handleAudioSelect}
            aria-label="Attach audio"
            title="Attach audio"
          />

          <div className="text-center text-xs text-muted-foreground mt-2 max-w-4xl mx-auto space-y-1">
            <p>
              Beeyield AI — Specialized exclusively in bees, honey, apiculture, and pollination
              science
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground/80">
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Partners:</span>
              <span className="text-foreground/80">Farmers</span>
              <span>•</span>
              <a href="https://apisense.ai/en" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">ApiSense</a>
              <span>•</span>
              <a href="https://intelligenthives.eu/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Intelligent Hives</a>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
      <BeeDiseasesPage isOpen={diseasesOpen} onClose={() => setDiseasesOpen(false)} />
      <PollinationCharts isOpen={pollinationOpen} onClose={() => setPollinationOpen(false)} />
      <PollinationLookup isOpen={lookupOpen} onClose={() => setLookupOpen(false)} />
      <HarvestCalculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onOpenPlanning={() => setPollinationPlanningOpen(true)}
      />
      <PrecisionDrilldown
        isOpen={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        onOpenPlanning={() => setPollinationPlanningOpen(true)}
      />
      <HivePlacementMap isOpen={siteMapOpen} onClose={() => setSiteMapOpen(false)} />
      <BeeFlightTracker isOpen={flightTrackerOpen} onClose={() => setFlightTrackerOpen(false)} />
      <BloomPhenology isOpen={bloomPhenologyOpen} onClose={() => setBloomPhenologyOpen(false)} />
      <MOAView isOpen={moaOpen} onClose={() => setMoaOpen(false)} />
      <FloragePage isOpen={floragePageOpen} onClose={() => setFloragePageOpen(false)} />
      <ActivityCounter isOpen={activityCounterOpen} onClose={() => setActivityCounterOpen(false)} />
      <MeasurementDataTools
        isOpen={measurementToolsOpen}
        onClose={() => setMeasurementToolsOpen(false)}
      />
      <ActivityForecaster
        isOpen={activityForecasterOpen}
        onClose={() => setActivityForecasterOpen(false)}
      />
      <PollinationPlanning
        isOpen={pollinationPlanningOpen}
        onClose={() => setPollinationPlanningOpen(false)}
      />
      <PollinationCalcs
        isOpen={pollinationCalcsOpen}
        onClose={() => setPollinationCalcsOpen(false)}
      />
      <AlertsPage isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <MOACompare isOpen={moaCompareOpen} onClose={() => setMoaCompareOpen(false)} />
      <BeeyieldCalculators isOpen={calculatorsOpen} onClose={() => setCalculatorsOpen(false)} />
      <VarroaSimulator isOpen={varroaSimOpen} onClose={() => setVarroaSimOpen(false)} />
      <DatasetImport isOpen={datasetImportOpen} onClose={() => setDatasetImportOpen(false)} />
      <FeedingSchedule isOpen={feedingScheduleOpen} onClose={() => setFeedingScheduleOpen(false)} />
      <KnowledgeSearch isOpen={knowledgeSearchOpen} onClose={() => setKnowledgeSearchOpen(false)} />
      <ApiarySizing isOpen={apiarySizingOpen} onClose={() => setApiarySizingOpen(false)} />
      <YieldProjection isOpen={yieldProjectionOpen} onClose={() => setYieldProjectionOpen(false)} />
      <InspectionsPage isOpen={inspectionsOpen} onClose={() => setInspectionsOpen(false)} />
      <TasksPage isOpen={tasksOpen} onClose={() => setTasksOpen(false)} />
      <ForageZonesPage isOpen={forageZonesOpen} onClose={() => setForageZonesOpen(false)} />
      <HarvestsPage isOpen={harvestsOpen} onClose={() => setHarvestsOpen(false)} />
      <SoundAnalysis isOpen={soundAnalysisOpen} onClose={() => setSoundAnalysisOpen(false)} />
      <IntegrationsPage isOpen={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      <SettingsPage isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HiveHealthDashboard isOpen={healthDashOpen} onClose={() => setHealthDashOpen(false)} />
      <SupportPage isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      <ApiariesPage isOpen={apiariesOpen} onClose={() => setApiariesOpen(false)} />
    </div>
  );
}
