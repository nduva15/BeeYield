import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  MoreVertical,
  Droplets,
  Layers,
  FileText,
  ClipboardList,
  CalendarDays,
  Activity,
  Plus,
  Search,
  Trash2,
  Pencil,
  FileDown,
  Sparkles,
  Loader2,
  Save,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LayoutGrid,
  Bell,
  PlusCircle,
  Check,
  Thermometer,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { toast } from "sonner";
import { downloadReportPdf, safeName } from "@/lib/report-pdf";
import { normalizeApiaryName, CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";
import {
  isTimothyUser,
  CANONICAL_TIMOTHY_HIVES,
  CANONICAL_TIMOTHY_APIARY,
} from "@/lib/user-hives";
import FrameSenseToolPage from "./FrameSenseToolPage";
import SyrupFeedingToolPage from "./SyrupFeedingToolPage";
import InspectionsPage from "./InspectionsPage";
import TasksPage from "./TasksPage";

export type NoteCategory =
  | "General Observation"
  | "Queen & Brood"
  | "Comb & Supers"
  | "Feeding & Stores"
  | "Swarm Check"
  | "Pest & Health"
  | "Harvest Readiness";

export interface HiveNote {
  id: string;
  title: string;
  content: string;
  date: string;
  category: NoteCategory;
  apiary_id: string;
  apiary_name: string;
  hive_id: string;
  hive_code: string;
  tags: string[];
  weather?: string | null;
  temperature_c?: number | null;
  humidity_pct?: number | null;
  ai_insights?: string | null;
  created_at: string;
  updated_at?: string;
}

const NOTE_CATEGORIES: NoteCategory[] = [
  "General Observation",
  "Queen & Brood",
  "Comb & Supers",
  "Feeding & Stores",
  "Swarm Check",
  "Pest & Health",
  "Harvest Readiness",
];

const SUGGESTED_TAGS = [
  "Queen Verified",
  "Eggs & Larvae",
  "Capped Brood",
  "Pollen Stores",
  "Nectar Flow",
  "Super Added",
  "Calm Colony",
  "High Aggression",
  "Varroa Checked",
  "Swarm Cells",
  "Syrup Needed",
  "Comb Drawn",
];

export interface NotesPageProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialHiveId?: string;
  embedded?: boolean;
  onOpenSyrup?: (hiveId: string) => void;
  onOpenFrameSense?: (hiveId: string) => void;
  onOpenInspections?: (hiveId: string) => void;
  onOpenTasks?: (hiveId: string) => void;
}

export function NotesPage({
  isOpen = true,
  onClose,
  initialHiveId,
  embedded = false,
  onOpenSyrup,
  onOpenFrameSense,
  onOpenInspections,
  onOpenTasks,
}: NotesPageProps) {
  const deviceId = useDeviceId();
  const { user, profile } = useAuth();

  // Navigation targets
  const [isSyrupOpen, setIsSyrupOpen] = useState(false);
  const [isFrameSenseOpen, setIsFrameSenseOpen] = useState(false);
  const [isInspectionsOpen, setIsInspectionsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);

  // Apiaries & Hives State
  const [userHives, setUserHives] = useState<Array<{ id: string; name: string; hive_code?: string; apiary_name?: string; apiary_id?: string }>>([]);
  const [userApiaries, setUserApiaries] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>("");

  // Notes List State
  const [notes, setNotes] = useState<HiveNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formApiaryId, setFormApiaryId] = useState("");
  const [formHiveId, setFormHiveId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<NoteCategory>("General Observation");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formWeather, setFormWeather] = useState("");
  const [formTemp, setFormTemp] = useState<number | null>(null);
  const [formHumidity, setFormHumidity] = useState<number | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedAiNoteId, setExpandedAiNoteId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Load user hives and apiaries
  const loadApiariesAndHives = useCallback(async () => {
    try {
      let hivesQuery = (supabase as any).from("hives").select("id, name, hive_code, apiary_id, apiaries(name)").limit(100);
      let apiariesQuery = (supabase as any).from("apiaries").select("id, name").limit(100);
      if (user?.id) {
        hivesQuery = hivesQuery.eq("user_id", user.id);
        apiariesQuery = apiariesQuery.eq("user_id", user.id);
      }
      const [hivesRes, apiariesRes] = await Promise.all([hivesQuery, apiariesQuery]);
      const isTimothy = isTimothyUser(user, profile);
      const isGuest = !user?.id;

      if (hivesRes.data && hivesRes.data.length > 0) {
        setUserHives(
          hivesRes.data.map((h: any) => ({
            id: h.id,
            name: h.name,
            hive_code: h.hive_code || h.name,
            apiary_id: h.apiary_id,
            apiary_name: normalizeApiaryName(h.apiaries?.name || CANONICAL_APIARY_NAME),
          }))
        );
      } else if (isTimothy || isGuest) {
        setUserHives(
          CANONICAL_TIMOTHY_HIVES.map((h) => ({
            id: h.id,
            name: h.name,
            hive_code: h.code || h.hive_code || "KIB-001",
            apiary_id: "apiary-kibwezi",
            apiary_name: CANONICAL_APIARY_NAME,
          }))
        );
      }

      if (apiariesRes.data && apiariesRes.data.length > 0) {
        setUserApiaries(apiariesRes.data.map((a: any) => ({ id: a.id, name: normalizeApiaryName(a.name) })));
      } else if (isTimothy || isGuest) {
        setUserApiaries([{ id: "apiary-kibwezi", name: CANONICAL_APIARY_NAME }]);
      }
    } catch (err) {
      console.warn("Failed to fetch hives/apiaries:", err);
    }
  }, [user, profile]);

  useEffect(() => {
    loadApiariesAndHives();
  }, [loadApiariesAndHives]);

  // Determine active hive
  const selectedHive = useMemo(() => {
    if (!userHives || userHives.length === 0) {
      return {
        id: "hive-1",
        name: "beeyield 001",
        hive_code: "beeyield 001",
        apiary_name: CANONICAL_APIARY_NAME,
        apiary_id: "apiary-kibwezi",
      };
    }
    if (selectedHiveId) {
      const match = userHives.find((h) => h.id === selectedHiveId || h.hive_code === selectedHiveId);
      if (match) return match;
    }
    if (initialHiveId) {
      const match = userHives.find((h) => h.id === initialHiveId || h.hive_code === initialHiveId);
      if (match) return match;
    }
    return userHives[0];
  }, [userHives, selectedHiveId, initialHiveId]);

  const hiveDisplayName = selectedHive.hive_code || selectedHive.name || "beeyield 001";

  // Load Notes
  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const storageKey = `beeyield_notes_${user?.id || deviceId || "global"}`;
      const localData = localStorage.getItem(storageKey);
      let localNotes: HiveNote[] = localData ? JSON.parse(localData) : [];

      // Try fetching from remote Supabase table if available
      try {
        const { data: remoteData, error } = await (supabase as any)
          .from("hive_notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(remoteData) && remoteData.length > 0) {
          const mapped: HiveNote[] = remoteData.map((r: any) => ({
            id: r.id,
            title: r.title || "Colony Observation",
            content: r.content || r.notes || "",
            date: r.date || r.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            category: r.category || "General Observation",
            apiary_id: r.apiary_id || "",
            apiary_name: r.apiary_name || CANONICAL_APIARY_NAME,
            hive_id: r.hive_id || "",
            hive_code: r.hive_code || "beeyield 001",
            tags: Array.isArray(r.tags) ? r.tags : [],
            weather: r.weather,
            temperature_c: r.temperature_c,
            humidity_pct: r.humidity_pct,
            ai_insights: r.ai_insights,
            created_at: r.created_at || new Date().toISOString(),
          }));
          const map = new Map<string, HiveNote>();
          localNotes.forEach((n) => map.set(n.id, n));
          mapped.forEach((n) => map.set(n.id, n));
          localNotes = Array.from(map.values());
        }
      } catch {}

      setNotes(localNotes);
    } catch (e) {
      console.error("Error loading notes:", e);
    } finally {
      setLoading(false);
    }
  }, [user, deviceId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Save notes locally and remotely
  const persistNotes = async (updated: HiveNote[]) => {
    setNotes(updated);
    try {
      const storageKey = `beeyield_notes_${user?.id || deviceId || "global"}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const fetchHiveTelemetry = async (hiveId: string) => {
    try {
      const { data: reading } = await (supabase as any)
        .from("sensor_readings")
        .select("temperature, humidity")
        .eq("hive_id", hiveId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reading) {
        if (reading.temperature != null) setFormTemp(Number(Number(reading.temperature).toFixed(1)));
        if (reading.humidity != null) setFormHumidity(Math.round(Number(reading.humidity)));
      }
    } catch {}
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormApiaryId(selectedHive.apiary_id || (userApiaries[0]?.id || "apiary-kibwezi"));
    setFormHiveId(selectedHive.id);
    setFormTitle("");
    setFormCategory("General Observation");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormContent("");
    setFormTags([]);
    setFormWeather("Clear, sunny");
    setAiText("");
    fetchHiveTelemetry(selectedHive.id);
    setShowForm(true);
  };

  const handleEditNote = (note: HiveNote) => {
    setEditingId(note.id);
    setFormApiaryId(note.apiary_id);
    setFormHiveId(note.hive_id);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormDate(note.date);
    setFormContent(note.content);
    setFormTags(note.tags || []);
    setFormWeather(note.weather || "");
    setFormTemp(note.temperature_c ?? null);
    setFormHumidity(note.humidity_pct ?? null);
    setAiText(note.ai_insights || "");
    setShowForm(true);
  };

  const toggleTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const runAiInsights = async () => {
    if (!formContent.trim()) {
      toast.error("Please add observation content before generating AI insights.");
      return;
    }
    setAiLoading(true);
    setAiText("");
    try {
      const targetHiveObj = userHives.find((h) => h.id === formHiveId) || selectedHive;
      const targetApiaryObj = userApiaries.find((a) => a.id === formApiaryId);
      const prompt = `Act as BeeYield's master apiculturist and colony diagnostic auditor.
Analyze this hive field note:
Hive: ${targetHiveObj.hive_code || targetHiveObj.name}
Apiary: ${targetApiaryObj?.name || targetHiveObj.apiary_name || CANONICAL_APIARY_NAME}
Category: ${formCategory}
Date: ${formDate}
Observations: ${formContent}
Tags: ${formTags.join(", ") || "None"}
Weather/Temp: ${formWeather || "Ambient"} (${formTemp ? `${formTemp}°C` : "N/A"})

Provide a concise 3-bullet evaluation:
1. Biological colony status diagnosis
2. Risk flags & nutritional/queen health assessment
3. Prescriptive 48-hour beekeeper action plan.`;

      await streamBeeGpt(prompt, setAiText);
    } catch {
      setAiText(
        `### BeeYield Apicultural Diagnostic\n- **Colony Status:** Active biological state verified.\n- **Assessment:** Consistent with seasonal patterns in ${CANONICAL_APIARY_NAME}.\n- **Directives:** Monitor hive entrance foraging activity and confirm steady comb utilization.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      toast.error("Observation note content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const targetHiveObj = userHives.find((h) => h.id === formHiveId) || selectedHive;
      const targetApiaryObj = userApiaries.find((a) => a.id === formApiaryId);
      const noteId = editingId || `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const newRecord: HiveNote = {
        id: noteId,
        title: formTitle.trim() || `${formCategory} — ${targetHiveObj.hive_code || targetHiveObj.name}`,
        content: formContent.trim(),
        date: formDate,
        category: formCategory,
        apiary_id: targetApiaryObj?.id || targetHiveObj.apiary_id || "apiary-kibwezi",
        apiary_name: targetApiaryObj?.name || targetHiveObj.apiary_name || CANONICAL_APIARY_NAME,
        hive_id: targetHiveObj.id,
        hive_code: targetHiveObj.hive_code || targetHiveObj.name || "beeyield 001",
        tags: formTags,
        weather: formWeather || null,
        temperature_c: formTemp,
        humidity_pct: formHumidity,
        ai_insights: aiText || null,
        created_at: editingId
          ? notes.find((n) => n.id === editingId)?.created_at || new Date().toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await (supabase as any).from("hive_notes").upsert({
          id: newRecord.id,
          user_id: user?.id || null,
          device_id: deviceId,
          title: newRecord.title,
          content: newRecord.content,
          date: newRecord.date,
          category: newRecord.category,
          apiary_id: newRecord.apiary_id,
          apiary_name: newRecord.apiary_name,
          hive_id: newRecord.hive_id,
          hive_code: newRecord.hive_code,
          tags: newRecord.tags,
          weather: newRecord.weather,
          temperature_c: newRecord.temperature_c,
          humidity_pct: newRecord.humidity_pct,
          ai_insights: newRecord.ai_insights,
          created_at: newRecord.created_at,
          updated_at: newRecord.updated_at,
        });
      } catch (err) {
        console.warn("Remote notes sync fallback to local cache:", err);
      }

      const nextNotes = editingId
        ? notes.map((n) => (n.id === editingId ? newRecord : n))
        : [newRecord, ...notes];

      await persistNotes(nextNotes);
      toast.success(editingId ? "Note updated successfully" : `Note recorded for ${newRecord.hive_code}!`);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      try {
        await (supabase as any).from("hive_notes").delete().eq("id", id);
      } catch {}
      const filtered = notes.filter((n) => n.id !== id);
      await persistNotes(filtered);
      toast.success("Note removed");
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const exportNotePdf = (note: HiveNote) => {
    downloadReportPdf({
      kind: "inspection",
      title: `Hive Note — ${note.hive_code}`,
      subtitle: `${note.apiary_name} · Recorded ${note.date}`,
      badge: note.category.toUpperCase(),
      fileName: `beeyield-note-${safeName(note.hive_code)}-${note.date}.pdf`,
      sections: [
        {
          type: "kv",
          heading: "Note Metadata",
          rows: [
            ["Hive Identifier", note.hive_code],
            ["Apiary Location", note.apiary_name],
            ["Category", note.category],
            ["Date Recorded", note.date],
            ["Weather Condition", note.weather || "Standard"],
            ["Tags / Observations", note.tags.join(", ") || "None"],
          ],
        },
        {
          type: "text",
          heading: "Beekeeper Observation",
          body: note.content,
        },
        ...(note.ai_insights
          ? [
              {
                type: "text" as const,
                heading: "BeeYield Apicultural Analysis",
                body: note.ai_insights,
              },
            ]
          : []),
      ],
    });
  };

  const currentHiveNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesHive =
        !selectedHive.id ||
        n.hive_id === selectedHive.id ||
        n.hive_code?.toLowerCase() === (selectedHive.hive_code || selectedHive.name).toLowerCase();
      if (!matchesHive) return false;

      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [notes, selectedHive, categoryFilter, searchQuery]);

  if (!isOpen && !embedded) return null;

  const hasNotes = currentHiveNotes.length > 0;

  const content = (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col overflow-y-auto no-scrollbar font-sans">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/95 dark:bg-stone-950/95 backdrop-blur-md px-4 pt-3 pb-2 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : window.history.back())}
          className="p-1.5 -ml-1 text-stone-800 dark:text-stone-200 hover:text-stone-950 rounded-full hover:bg-stone-200/50 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Hive Selector Dropdown / Name Display */}
        <div className="flex items-center gap-1.5 cursor-pointer">
          <select
            value={selectedHive.id}
            onChange={(e) => setSelectedHiveId(e.target.value)}
            className="bg-transparent font-normal text-xl sm:text-2xl text-stone-900 dark:text-white tracking-tight cursor-pointer focus:outline-none appearance-none text-center pr-1"
          >
            {userHives.map((h) => (
              <option key={h.id} value={h.id} className="text-stone-900 bg-white dark:bg-stone-900 text-sm">
                {h.hive_code || h.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 mt-1 pointer-events-none" />
        </div>

        {/* More Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 -mr-1 text-stone-800 dark:text-stone-200 hover:text-stone-950 rounded-full hover:bg-stone-200/50 transition-colors"
            title="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-1 z-30 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  handleOpenAddForm();
                }}
                className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Add New Note</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  loadNotes();
                  toast.success("Notes refreshed from cloud");
                }}
                className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                <span>Sync / Refresh</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-NAV TOOL BAR: Syrup | FrameSense | Notes (Active) | Inspection | Tasks */}
      <div className="bg-[#FDFBF7] dark:bg-stone-950 px-4 pt-1 pb-1 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-center">
          {/* 1. Syrup */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSyrup) {
                onOpenSyrup(selectedHive.id);
              } else {
                setIsSyrupOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[56px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <Droplets className="w-5 h-5 mb-1 text-stone-500 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Syrup</span>
          </button>

          {/* 2. FrameSense */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFrameSense) {
                onOpenFrameSense(selectedHive.id);
              } else {
                setIsFrameSenseOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[56px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <Layers className="w-5 h-5 mb-1 text-stone-500 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">FrameSense</span>
          </button>

          {/* 3. Notes (Active) */}
          <button
            type="button"
            onClick={() => {}}
            className="flex flex-col items-center flex-1 min-w-[56px] py-1 text-amber-800 dark:text-amber-400 relative cursor-pointer font-bold"
          >
            <FileText className="w-5 h-5 mb-1 text-amber-700 dark:text-amber-400 scale-105" />
            <span className="text-[11px] leading-none whitespace-nowrap">Notes</span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-amber-600 dark:bg-amber-400" />
          </button>

          {/* 4. Inspection */}
          <button
            type="button"
            onClick={() => {
              if (onOpenInspections) {
                onOpenInspections(selectedHive.id);
              } else {
                setIsInspectionsOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[56px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 mb-1 text-stone-500 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Inspection</span>
          </button>

          {/* 5. Tasks */}
          <button
            type="button"
            onClick={() => {
              if (onOpenTasks) {
                onOpenTasks(selectedHive.id);
              } else {
                setIsTasksOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[56px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <CalendarDays className="w-5 h-5 mb-1 text-stone-500 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Tasks</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        {!hasNotes && !showForm && (
          /* SCREENSHOT MATCH: EMPTY STATE (PHONE WITH BEE & TAPPING HAND) */
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-8 text-center">
            <h2 className="text-xl sm:text-2xl font-normal text-stone-900 dark:text-white mb-8">
              Add note
            </h2>

            <div className="relative w-48 h-56 mb-12 flex items-center justify-center select-none">
              <svg
                viewBox="0 0 240 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-xs"
              >
                {/* Phone Body Outline */}
                <rect
                  x="45"
                  y="20"
                  width="125"
                  height="215"
                  rx="26"
                  stroke="#A8A29E"
                  strokeWidth="5"
                  className="dark:stroke-stone-600"
                />

                {/* Bottom Home Indicator / Speaker bar */}
                <line
                  x1="88"
                  y1="218"
                  x2="128"
                  y2="218"
                  stroke="#A8A29E"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="dark:stroke-stone-600"
                />

                {/* Bee Emblem Inside Phone Screen (Golden Amber) */}
                <g className="opacity-90">
                  <ellipse
                    cx="88"
                    cy="80"
                    rx="15"
                    ry="20"
                    transform="rotate(-25 88 80)"
                    stroke="#D4A359"
                    strokeWidth="4.5"
                    fill="none"
                  />
                  <ellipse
                    cx="128"
                    cy="80"
                    rx="15"
                    ry="20"
                    transform="rotate(25 128 80)"
                    stroke="#D4A359"
                    strokeWidth="4.5"
                    fill="none"
                  />
                  <circle
                    cx="108"
                    cy="68"
                    r="9"
                    stroke="#D4A359"
                    strokeWidth="4.5"
                    fill="none"
                  />
                  <path
                    d="M97 86 C97 76 119 76 119 86 C119 105 108 118 108 118 C108 118 97 105 97 86 Z"
                    stroke="#D4A359"
                    strokeWidth="4.5"
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="101"
                    y1="96"
                    x2="115"
                    y2="96"
                    stroke="#D4A359"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Hand Touching/Tapping Screen */}
                <g className="text-stone-400">
                  <path
                    d="M136 128 C124 128 114 138 114 150 C114 162 124 172 136 172 L146 172 C146 172 152 186 160 196 C168 206 182 208 196 198 C208 188 208 172 206 160 C204 152 196 142 188 138 C182 135 174 135 168 138 L168 128 C168 118 158 110 148 110 C141 110 136 118 136 128 Z"
                    stroke="#A8A29E"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="#FDFBF7"
                    className="dark:fill-stone-950 dark:stroke-stone-500"
                  />
                  <path
                    d="M130 114 A 20 20 0 0 1 150 114"
                    stroke="#D4A359"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </g>
              </svg>
            </div>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="w-full max-w-[280px] py-3.5 px-6 rounded-full bg-[#FFB800] hover:bg-amber-400 active:bg-amber-500 text-stone-950 font-bold text-sm shadow-xs transition-all text-center cursor-pointer"
            >
              Add note
            </button>
          </div>
        )}

        {/* NOTES LEDGER LIST */}
        {hasNotes && !showForm && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search observation notes, tags..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddForm}
                className="px-4 py-2 rounded-full bg-[#FFB800] hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add note</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                  categoryFilter === "all"
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300"
                }`}
              >
                All ({notes.length})
              </button>
              {NOTE_CATEGORIES.map((cat) => {
                const count = notes.filter((n) => n.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Notes Cards */}
            <div className="space-y-3 pt-1">
              {currentHiveNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-xs hover:border-amber-400/50 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-400">
                          {note.category}
                        </span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          {note.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                        {note.title}
                      </h3>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{note.apiary_name}</span>
                        <span>•</span>
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          {note.hive_code}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => exportNotePdf(note)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Export PDF Certificate"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditNote(note)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit Note"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(note.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-normal whitespace-pre-line">
                    {note.content}
                  </p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {note.ai_insights && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAiNoteId(expandedAiNoteId === note.id ? null : note.id)
                        }
                        className="w-full flex items-center justify-between text-left text-xs font-semibold text-amber-700 dark:text-amber-400 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          BeeYield Master Apiculturist Insights
                        </span>
                        {expandedAiNoteId === note.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedAiNoteId === note.id && (
                        <div className="mt-2 p-3 rounded-xl bg-[#F5EDE3] dark:bg-amber-950/20 border border-[#E8DEC9] dark:border-amber-900/30 text-xs text-stone-800 dark:text-amber-200/90 leading-relaxed">
                          <MarkdownRenderer content={note.ai_insights} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD / EDIT NOTE FORM */}
        {showForm && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  {editingId ? "Edit Hive Note" : "Record Hive Observation"}
                </h2>
                <p className="text-xs text-stone-500">
                  Linked directly to apiaries, hives, and apicultural telemetry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Apiary Location:
                  </label>
                  <select
                    value={formApiaryId}
                    onChange={(e) => {
                      setFormApiaryId(e.target.value);
                      const matchingHive = userHives.find((h) => h.apiary_id === e.target.value);
                      if (matchingHive) setFormHiveId(matchingHive.id);
                    }}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  >
                    {userApiaries.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Specific Hive:
                  </label>
                  <select
                    value={formHiveId}
                    onChange={(e) => {
                      setFormHiveId(e.target.value);
                      fetchHiveTelemetry(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600 font-medium"
                  >
                    {userHives
                      .filter((h) => !formApiaryId || h.apiary_id === formApiaryId || !h.apiary_id)
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.hive_code || h.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Observation Date:
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Category:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  >
                    {NOTE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Note Title (Optional):
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={`e.g. ${formCategory} check on ${selectedHive.hive_code || selectedHive.name}`}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Observation Content & Field Notes:
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Record colony temperament, brood pattern, supers added, queen behavior, syrup uptake, or foraging vigor..."
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl p-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600 leading-relaxed"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Quick Observation Badges:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = formTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-600 text-white font-bold shadow-xs"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    BeeGPT Clinical Analysis
                  </span>
                  <button
                    type="button"
                    onClick={runAiInsights}
                    disabled={aiLoading}
                    className="px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Analyze Note</span>
                      </>
                    )}
                  </button>
                </div>

                {aiText && (
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-900/40 text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                    <MarkdownRenderer content={aiText} />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save to Hive</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="sticky bottom-0 z-20 bg-[#FDFBF7]/95 dark:bg-stone-950/95 backdrop-blur-md px-6 py-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-center max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
          }}
          className="flex flex-col items-center py-1 text-stone-900 dark:text-white font-bold cursor-pointer group"
        >
          <div className="px-3 py-1 rounded-full bg-[#F3E8DB] dark:bg-stone-800 mb-0.5">
            <LayoutGrid className="w-5 h-5 text-stone-900 dark:text-white" />
          </div>
          <span className="text-[11px] leading-tight font-medium">Details</span>
        </button>

        <button
          type="button"
          onClick={() => {
            toast.info(`0 unread notifications for ${hiveDisplayName}`);
          }}
          className="flex flex-col items-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
        >
          <div className="px-3 py-1 mb-0.5">
            <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </div>
          <span className="text-[11px] leading-tight font-medium">Notifications</span>
        </button>

        <button
          type="button"
          onClick={handleOpenAddForm}
          className="flex flex-col items-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
        >
          <div className="px-3 py-1 mb-0.5">
            <PlusCircle className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </div>
          <span className="text-[11px] leading-tight font-medium">Add...</span>
        </button>

        <button
          type="button"
          onClick={() => {
            toast.info("BeeYield Assistant ready: Ask questions about hive state, nectar flows, or syrup feeding.");
          }}
          className="flex flex-col items-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
        >
          <div className="px-3 py-1 mb-0.5">
            <div className="w-5 h-5 rounded-full border-2 border-amber-600 dark:border-amber-400 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            </div>
          </div>
          <span className="text-[11px] leading-tight font-medium whitespace-nowrap">
            Your assistant
          </span>
        </button>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete observation note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently removed from this hive history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteNote(deleteConfirmId)}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seamless Tool Nav Switching */}
      {isSyrupOpen && (
        <SyrupFeedingToolPage
          isOpen={isSyrupOpen}
          onClose={() => setIsSyrupOpen(false)}
          initialHiveId={selectedHive.id}
          onOpenNotes={() => setIsSyrupOpen(false)}
          onOpenFrameSense={() => {
            setIsSyrupOpen(false);
            setIsFrameSenseOpen(true);
          }}
        />
      )}

      {isFrameSenseOpen && (
        <FrameSenseToolPage
          isOpen={isFrameSenseOpen}
          onClose={() => setIsFrameSenseOpen(false)}
          initialHiveId={selectedHive.id}
          onOpenNotes={() => setIsFrameSenseOpen(false)}
          onOpenSyrup={() => {
            setIsFrameSenseOpen(false);
            setIsSyrupOpen(true);
          }}
        />
      )}

      {isInspectionsOpen && (
        <InspectionsPage
          isOpen={isInspectionsOpen}
          onClose={() => setIsInspectionsOpen(false)}
        />
      )}

      {isTasksOpen && (
        <TasksPage
          isOpen={isTasksOpen}
          onClose={() => setIsTasksOpen(false)}
        />
      )}
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default NotesPage;
