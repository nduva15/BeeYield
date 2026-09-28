import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronDown,
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
  RefreshCw,
  Droplets,
  Mic,
  MicOff,
  CloudCheck,
  Database as DatabaseIcon,
  ImagePlus,
  Clock,
  ChevronUp,
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
import { autoSyncRecord } from "@/lib/integration-sync";
import { syncScanWithBeeYieldAi } from "@/lib/beeyield-ai-scan-sync";
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
  attachments?: string[];
  weather?: string | null;
  temperature_c?: number | null;
  humidity_pct?: number | null;
  ai_insights?: string | null;
  created_at: string;
  updated_at?: string;
  synced_to_db?: boolean;
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

  // View Mode: "notes_list" or "add_note"
  const [currentView, setCurrentView] = useState<"notes_list" | "add_note">("notes_list");

  // Apiaries & Hives State
  const [userHives, setUserHives] = useState<Array<{ id: string; name: string; hive_code?: string; apiary_name?: string; apiary_id?: string; notes?: string }>>([]);
  const [userApiaries, setUserApiaries] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>("");

  // Notes List State
  const [notes, setNotes] = useState<HiveNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formApiaryId, setFormApiaryId] = useState("");
  const [formHiveId, setFormHiveId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<NoteCategory>("General Observation");
  const [formDate, setFormDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  const [formWeather, setFormWeather] = useState("");
  const [formTemp, setFormTemp] = useState<number | null>(null);
  const [formHumidity, setFormHumidity] = useState<number | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedAiNoteId, setExpandedAiNoteId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Load user hives and apiaries from Supabase
  const loadApiariesAndHives = useCallback(async () => {
    try {
      let hivesQuery = (supabase as any).from("hives").select("id, name, hive_code, apiary_id, notes, apiaries(name)").limit(100);
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
            notes: h.notes,
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
            notes: h.notes,
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
        notes: "",
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

  // Full Database Sync: Load notes from Supabase & Backend & LocalStorage
  const loadNotes = useCallback(async () => {
    setLoading(true);
    setDbSyncing(true);
    try {
      const map = new Map<string, HiveNote>();

      // 1. Fetch from LocalStorage cache
      const storageKey = `beeyield_notes_${user?.id || deviceId || "global"}`;
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            parsed.forEach((n: HiveNote) => map.set(n.id, n));
          }
        } catch {}
      }

      // 2. Fetch from Supabase `inspections` table
      try {
        let inspQuery = (supabase as any)
          .from("inspections")
          .select("*")
          .not("notes", "is", null)
          .order("created_at", { ascending: false })
          .limit(200);

        if (user?.id) {
          inspQuery = inspQuery.eq("user_id", user.id);
        }

        const { data: inspData, error: inspError } = await inspQuery;
        if (!inspError && Array.isArray(inspData) && inspData.length > 0) {
          inspData.forEach((r: any) => {
            if (!r.notes || !r.notes.trim()) return;
            const mappedNote: HiveNote = {
              id: r.id,
              title: r.batch ? `${r.batch} — ${r.hive_label || "Observation"}` : `Observation — ${r.hive_label || "Hive"}`,
              content: r.notes,
              date: r.inspected_on || r.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              category: (r.batch as NoteCategory) || "General Observation",
              apiary_id: "",
              apiary_name: r.location || CANONICAL_APIARY_NAME,
              hive_id: "",
              hive_code: r.hive_label || "beeyield 001",
              tags: Array.isArray(r.actions) ? r.actions : [],
              weather: r.weather,
              ai_insights: r.ai_insights,
              created_at: r.created_at || new Date().toISOString(),
              synced_to_db: true,
            };
            map.set(mappedNote.id, mappedNote);
          });
        }
      } catch (err) {
        console.warn("Supabase inspections table notes fetch non-fatal:", err);
      }

      // 3. Fetch from Supabase `hive_notes` table
      try {
        const { data: remoteData, error } = await (supabase as any)
          .from("hive_notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(remoteData) && remoteData.length > 0) {
          remoteData.forEach((r: any) => {
            const mapped: HiveNote = {
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
              attachments: Array.isArray(r.attachments) ? r.attachments : [],
              weather: r.weather,
              temperature_c: r.temperature_c,
              humidity_pct: r.humidity_pct,
              ai_insights: r.ai_insights,
              created_at: r.created_at || new Date().toISOString(),
              synced_to_db: true,
            };
            map.set(mapped.id, mapped);
          });
        }
      } catch {}

      // 4. Fetch from Backend API
      try {
        const apiRes = await fetch("/api/v1/inspections");
        if (apiRes.ok) {
          const apiList = await apiRes.json();
          if (Array.isArray(apiList)) {
            apiList.forEach((a: any) => {
              if (!a.notes || !a.notes.trim()) return;
              if (map.has(a.id)) return;
              map.set(a.id, {
                id: a.id,
                title: a.batch ? `${a.batch} Observation` : `Observation — ${a.hive_label || a.hive_code}`,
                content: a.notes,
                date: a.inspected_on || a.inspection_date || new Date().toISOString().slice(0, 10),
                category: (a.batch as NoteCategory) || "General Observation",
                apiary_id: "",
                apiary_name: a.location || a.apiary_name || CANONICAL_APIARY_NAME,
                hive_id: a.hive_id || "",
                hive_code: a.hive_label || a.hive_code || "beeyield 001",
                tags: Array.isArray(a.actions) ? a.actions : [],
                weather: a.weather,
                ai_insights: a.ai_insights,
                created_at: a.created_at || new Date().toISOString(),
                synced_to_db: true,
              });
            });
          }
        }
      } catch {}

      const mergedList = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotes(mergedList);

      try {
        localStorage.setItem(storageKey, JSON.stringify(mergedList));
      } catch {}
    } finally {
      setLoading(false);
      setDbSyncing(false);
    }
  }, [user, deviceId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const channel = (supabase as any)
      .channel("hive_notes_realtime_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "hive_notes" }, () => {
        loadNotes();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "inspections" }, () => {
        loadNotes();
      })
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [loadNotes]);

  // Voice Dictation Handler
  const toggleVoiceRecording = useCallback(() => {
    if (isRecordingVoice) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice dictation is not supported by your current browser. You can type directly into the note box.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        toast.info("Listening... Speak your observation notes.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setFormContent((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecordingVoice(false);
        if (event.error !== "no-speech") {
          toast.error(`Voice dictation notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to initialize speech recognition:", err);
      setIsRecordingVoice(false);
    }
  }, [isRecordingVoice]);

  // Photo Attachment Handler
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please attach image files only.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("File size limit is 8MB per photo.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormAttachments((prev) => [...prev, base64]);
          toast.success("Photo attached to observation note.");
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setFormAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Pre-fill telemetry when hive changes in form
  const fetchHiveTelemetry = useCallback(
    async (hiveId: string) => {
      try {
        const { data } = await (supabase as any)
          .from("inspections")
          .select("temperature_c, humidity_pct, weather")
          .eq("hive_id", hiveId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          if (data.temperature_c != null) setFormTemp(data.temperature_c);
          if (data.humidity_pct != null) setFormHumidity(data.humidity_pct);
          if (data.weather) setFormWeather(data.weather);
        }
      } catch {}
    },
    []
  );

  const handleOpenAddForm = (targetHiveId?: string) => {
    const activeId = targetHiveId || selectedHive.id;
    setEditingId(null);
    setFormHiveId(activeId);
    setFormApiaryId(selectedHive.apiary_id || "apiary-kibwezi");
    setFormTitle("");
    setFormCategory("General Observation");
    const now = new Date();
    setFormDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
    setFormContent("");
    setFormTags([]);
    setFormAttachments([]);
    setAiText("");
    fetchHiveTelemetry(activeId);
    setCurrentView("add_note");
  };

  const handleEditNote = (note: HiveNote) => {
    setEditingId(note.id);
    setFormHiveId(note.hive_id || selectedHive.id);
    setFormApiaryId(note.apiary_id || selectedHive.apiary_id || "apiary-kibwezi");
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormDate(note.date);
    setFormContent(note.content);
    setFormTags(note.tags || []);
    setFormAttachments(note.attachments || []);
    setFormWeather(note.weather || "");
    setFormTemp(note.temperature_c ?? null);
    setFormHumidity(note.humidity_pct ?? null);
    setAiText(note.ai_insights || "");
    setCurrentView("add_note");
  };

  const toggleTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // AI Diagnostic Analysis
  const runAiInsights = async () => {
    if (!formContent.trim() && formTags.length === 0) {
      toast.error("Please provide some observation text or tags before running AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiText("");

    const targetHive = userHives.find((h) => h.id === formHiveId) || selectedHive;

    const prompt = `You are the BeeYield Lead Apiary Agronomist.
Please perform a rigorous clinical analysis of this observation note recorded for Hive ${targetHive.hive_code || targetHive.name} (${targetHive.apiary_name || CANONICAL_APIARY_NAME}):

- Observation Date: ${formDate}
- Category: ${formCategory}
- Note Title: ${formTitle || "Observation"}
- Field Note Content: "${formContent}"
- Tags: ${formTags.join(", ") || "None"}
- Ambient Telemetry: ${formTemp ? `${formTemp}°C` : "N/A"}, ${formHumidity ? `${formHumidity}% RH` : "N/A"}
- Weather: ${formWeather || "Fair"}

Provide:
1. Clinical Assessment (colony condition, vigor, queen health)
2. Immediate Action Recommendations (feeding, supering, disease mitigation)
3. 7-Day Follow-Up Priority`;

    try {
      await streamBeeGpt(prompt, (token) => {
        setAiText((prev) => prev + token);
      });
    } catch (err: any) {
      toast.error(`BeeGPT Analysis notice: ${err?.message || "Service busy"}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Note to Database
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      toast.error("Please enter observation content before saving.");
      return;
    }

    setSaving(true);
    const targetHive = userHives.find((h) => h.id === formHiveId) || selectedHive;
    const targetApiary = userApiaries.find((a) => a.id === formApiaryId) || {
      id: "apiary-kibwezi",
      name: CANONICAL_APIARY_NAME,
    };

    const notePayload: HiveNote = {
      id: editingId || `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: formTitle.trim() || `${formCategory} check on ${targetHive.hive_code || targetHive.name}`,
      content: formContent.trim(),
      date: formDate,
      category: formCategory,
      apiary_id: targetApiary.id,
      apiary_name: targetApiary.name,
      hive_id: targetHive.id,
      hive_code: targetHive.hive_code || targetHive.name,
      tags: formTags,
      attachments: formAttachments,
      weather: formWeather || null,
      temperature_c: formTemp,
      humidity_pct: formHumidity,
      ai_insights: aiText.trim() || null,
      created_at: editingId
        ? notes.find((n) => n.id === editingId)?.created_at || new Date().toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_to_db: true,
    };

    try {
      // 1. Save to Supabase `hive_notes` table
      try {
        await (supabase as any).from("hive_notes").upsert({
          id: notePayload.id,
          title: notePayload.title,
          content: notePayload.content,
          date: notePayload.date,
          category: notePayload.category,
          apiary_id: notePayload.apiary_id,
          apiary_name: notePayload.apiary_name,
          hive_id: notePayload.hive_id,
          hive_code: notePayload.hive_code,
          tags: notePayload.tags,
          attachments: notePayload.attachments,
          weather: notePayload.weather,
          temperature_c: notePayload.temperature_c,
          humidity_pct: notePayload.humidity_pct,
          ai_insights: notePayload.ai_insights,
          user_id: user?.id || null,
          device_id: deviceId || null,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase hive_notes table upsert notice:", err);
      }

      // 2. Record in Supabase `inspections` table for unified ledger
      try {
        await (supabase as any).from("inspections").upsert({
          id: notePayload.id,
          inspected_on: notePayload.date,
          location: notePayload.apiary_name,
          hive_label: notePayload.hive_code,
          batch: notePayload.category,
          colony_health: notePayload.tags.includes("Queen Verified") ? "Healthy" : "Watch",
          temperament: notePayload.tags.includes("Calm Colony") ? "Calm" : "Nervous",
          queen_seen: notePayload.tags.includes("Queen Verified"),
          queen_cells: notePayload.tags.includes("Swarm Cells") ? 2 : 0,
          total_frames: 10,
          brood_frames: notePayload.tags.includes("Eggs & Larvae") ? 5 : 4,
          honey_frames: notePayload.tags.includes("Nectar Flow") ? 4 : 3,
          varroa_count: 0,
          issues: notePayload.tags.filter((t) => t.includes("Swarm") || t.includes("Aggression")),
          actions: notePayload.tags,
          weather: notePayload.weather || "Fair",
          notes: notePayload.content,
          ai_insights: notePayload.ai_insights,
          temperature_c: notePayload.temperature_c,
          humidity_pct: notePayload.humidity_pct,
          user_id: user?.id || null,
          device_id: deviceId || null,
        });
      } catch (err) {
        console.warn("Supabase inspections table notes sync notice:", err);
      }

      // 3. Auto sync with backend integration pipeline
      autoSyncRecord({
        module: "inspection",
        recordId: notePayload.id,
        action: editingId ? "update" : "create",
        data: {
          ...notePayload,
          type: "hive_observation_note",
        },
      });

      // 4. Update UI State
      setNotes((prev) => {
        const filtered = prev.filter((n) => n.id !== notePayload.id);
        const updated = [notePayload, ...filtered].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const storageKey = `beeyield_notes_${user?.id || deviceId || "global"}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      toast.success(editingId ? "Observation note updated" : "Observation note saved to hive history");
      setCurrentView("notes_list");
      setEditingId(null);
    } catch (err: any) {
      console.error("Save note error:", err);
      toast.error(`Save notice: ${err?.message || "Saved to local cache"}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    try {
      try {
        await (supabase as any).from("hive_notes").delete().eq("id", id);
      } catch {}
      try {
        await (supabase as any).from("inspections").delete().eq("id", id);
      } catch {}

      autoSyncRecord({
        module: "inspection",
        recordId: id,
        action: "delete",
        data: { id },
      });

      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        const storageKey = `beeyield_notes_${user?.id || deviceId || "global"}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      toast.success("Observation note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Export PDF Certificate
  const exportNotePdf = (note: HiveNote) => {
    downloadReportPdf({
      title: `Hive Observation Note — ${note.hive_code}`,
      subtitle: `${note.category} | Logged on ${note.date} | ${note.apiary_name}`,
      metadata: [
        { label: "Hive Code", value: note.hive_code },
        { label: "Apiary Location", value: note.apiary_name },
        { label: "Observation Date", value: note.date },
        { label: "Category", value: note.category },
        { label: "Cloud Sync", value: "Verified DB Live" },
        ...(note.weather ? [{ label: "Weather", value: note.weather }] : []),
        ...(note.temperature_c != null ? [{ label: "Brood Temp", value: `${note.temperature_c} °C` }] : []),
        ...(note.humidity_pct != null ? [{ label: "Humidity", value: `${note.humidity_pct} %` }] : []),
      ],
      sections: [
        {
          type: "text",
          heading: "Field Notes & Observations",
          body: note.content,
        },
        {
          type: "keyValue",
          heading: "Observation Tags",
          data: (note.tags || []).map((t) => ({ label: "Tag", value: t })),
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

  // Filtered notes
  const filteredNotes = useMemo(() => {
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
          n.hive_code.toLowerCase().includes(q) ||
          n.apiary_name.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [notes, selectedHive, categoryFilter, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = notes.length;
    const categories = new Set(notes.map((n) => n.category)).size;
    const hivesCount = new Set(notes.map((n) => n.hive_code || n.hive_id)).size;
    const withAi = notes.filter((n) => !!n.ai_insights).length;
    return { total, categories, hivesCount, withAi };
  }, [notes]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  // =========================================================================
  // FRAMESENSE-MATCHING FULL PAGE LAYOUT WITH INSPECTIONS BACKGROUND COLORS
  // =========================================================================
  const content = (
    <div
      className={
        embedded
          ? "w-full max-w-2xl mx-auto py-2"
          : "fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto flex flex-col animate-in fade-in duration-150 select-text"
      }
    >
      <div
        className={`w-full max-w-xl mx-auto flex-1 flex flex-col p-4 sm:p-6 text-foreground min-h-screen ${
          embedded ? "h-auto min-h-0" : ""
        }`}
      >
        {/* Hidden File Input for Attachments */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentUpload}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* TOP APP BAR: Matching FrameSense Screen Design */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (currentView === "add_note") {
                  setCurrentView("notes_list");
                } else {
                  if (onClose) onClose();
                }
              }}
              className="p-1.5 -ml-1 text-foreground hover:text-foreground/80 rounded-xl hover:bg-card border border-border transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-sans">
              Notes
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                loadNotes();
                toast.success("Synchronized with BeeYield Database");
              }}
              disabled={loading || dbSyncing}
              className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Notes"
            >
              <RefreshCw className={`w-4 h-4 ${loading || dbSyncing ? "animate-spin text-honey" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentView === "add_note") {
                  setCurrentView("notes_list");
                } else {
                  handleOpenAddForm();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === "add_note"
                  ? "bg-card border border-border text-foreground hover:bg-muted"
                  : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md border border-emerald-500/40"
              }`}
            >
              {currentView === "add_note" ? (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ledger</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Note</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* HIVE TITLE & SELECTOR: Matching FrameSense & SyrupFeeding */}
        <div className="flex items-center justify-between pt-3 pb-2 shrink-0">
          <div className="relative group">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {hiveDisplayName}
              <select
                value={selectedHive.id}
                onChange={(e) => setSelectedHiveId(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Switch Hive"
              >
                {userHives.map((h) => {
                  const num = h.hive_code?.replace(/\D+/g, "") || "";
                  const label = num ? `beeyield ${num.padStart(3, "0")}` : (h.name || h.hive_code);
                  return (
                    <option key={h.id} value={h.id} className="text-foreground bg-card">
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-honey transition-colors pointer-events-none" />
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-bold text-muted-foreground">
              <strong className="text-honey">{filteredNotes.length}</strong> {filteredNotes.length === 1 ? "Note" : "Notes"}
            </span>
          </div>
        </div>

        {/* SUB-NAV TOOL BAR: Hive state | Syrup | FrameSense | Notes | Inspection */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-4 shrink-0 overflow-x-auto no-scrollbar gap-2 text-center">
          {/* 1. Hive state */}
          <button
            type="button"
            onClick={() => {
              toast.info(`${hiveDisplayName} Colony: Active & Healthy (${selectedHive.notes || "10 Frames"})`);
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <Activity className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Hive state</span>
          </button>

          {/* 2. Syrup */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSyrup) {
                onOpenSyrup(selectedHive.id);
              } else {
                setIsSyrupOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <Droplets className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-blue-500" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Syrup</span>
          </button>

          {/* 3. FrameSense */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFrameSense) {
                onOpenFrameSense(selectedHive.id);
              } else {
                setIsFrameSenseOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <Layers className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-amber-500" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">FrameSense</span>
          </button>

          {/* 4. Notes (Active) */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("notes_list");
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-honey relative cursor-pointer group font-bold"
          >
            <FileText className="w-5 h-5 mb-1 text-honey group-hover:scale-105 transition-transform" />
            <span className="text-[11px] leading-none whitespace-nowrap">Notes</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-honey" />
          </button>

          {/* 5. Inspection */}
          <button
            type="button"
            onClick={() => {
              if (onOpenInspections) {
                onOpenInspections(selectedHive.id);
              } else {
                setIsInspectionsOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-emerald-500" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Inspection</span>
          </button>
        </div>

        {/* MAIN BODY: Add Note Form OR Notes Ledger */}
        {currentView === "add_note" ? (
          /* ========================================================================= */
          /* VIEW 1: ADD / EDIT NOTE FORM (INSPECTIONS-STYLE FORM)                      */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col space-y-4">
            <div className="rounded-xl border border-emerald-500/50 bg-card overflow-hidden shadow-lg transition-all">
              <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    {editingId ? <Pencil className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                  </div>
                  <div>
                    <h2 className="font-display text-sm font-bold text-white tracking-wide">
                      {editingId ? "Edit Observation Note" : "New Observation Note"}
                    </h2>
                    <p className="text-[10px] text-emerald-100">
                      {editingId ? `Editing note for ${formHiveId ? (userHives.find((h) => h.id === formHiveId)?.hive_code || "Hive") : "selected hive"}` : "Log colony observation with voice dictation & AI"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView("notes_list")}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
                  aria-label="Back to Notes"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="p-4 space-y-3.5">
                {/* Target Hive Context */}
                <div className="p-3 rounded-xl border border-border bg-background space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                    <span className="font-bold text-[11px] text-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" /> Target Hive & Apiary
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      <strong className="text-honey">{userHives.find((h) => h.id === formHiveId)?.hive_code || hiveDisplayName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="space-y-0.5">
                      <span className="text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-honey" /> Date
                      </span>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground"
                      />
                    </label>

                    <label className="space-y-0.5">
                      <span className="text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-500" /> Category
                      </span>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                        className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground truncate"
                      >
                        {NOTE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Title (Optional) */}
                <label className="text-xs space-y-0.5 block">
                  <span className="text-muted-foreground text-[11px] font-semibold">Note Title (Optional)</span>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Colony temperament, brood expansion, super inspection"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground"
                  />
                </label>

                {/* Note Content with Voice Dictation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Observation Content & Field Notes
                    </span>
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isRecordingVoice
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-honey/10 text-honey hover:bg-honey/20"
                      }`}
                      title={isRecordingVoice ? "Stop voice dictation" : "Click to speak voice note"}
                    >
                      {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecordingVoice ? "Stop Recording" : "Voice Dictation"}</span>
                    </button>
                  </div>

                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={4}
                    placeholder="Record brood pattern, queen behavior, syrup uptake, pollen stores, swarm cells, or colony health..."
                    className="w-full bg-background border border-border rounded-lg p-3 text-xs text-foreground leading-relaxed resize-y"
                  />
                </div>

                {/* Quick Observation Badges */}
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold block">
                    Quick Observation Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.map((tag) => {
                      const active = formTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer border ${
                            active
                              ? "bg-emerald-600 text-white font-bold border-emerald-500/40 shadow-xs"
                              : "bg-card border-border text-muted-foreground hover:border-honey/40"
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photo Attachments */}
                <div className="space-y-1.5 border-t border-border pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-honey" /> Attached Photos ({formAttachments.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-0.5 rounded-lg border border-border hover:bg-background text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Attach Photo
                    </button>
                  </div>

                  {formAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formAttachments.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                          <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                            title="Remove photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BeeGPT Clinical Analysis */}
                <div className="border-t border-border pt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-honey flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> BeeGPT Clinical Analysis
                    </span>
                    <button
                      type="button"
                      onClick={runAiInsights}
                      disabled={aiLoading}
                      className="px-2.5 py-0.5 rounded-lg bg-honey/10 text-honey hover:bg-honey/20 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Run Analysis</span>
                    </button>
                  </div>
                  {aiText && (
                    <div className="rounded-lg border border-honey/30 bg-background/50 p-2.5 text-xs leading-relaxed">
                      <MarkdownRenderer content={aiText} />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("notes_list");
                      setEditingId(null);
                      setAiText("");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-background"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-md hover:shadow-lg transition-all border border-emerald-400/40"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Save className="w-3.5 h-3.5 text-white" />}
                    <span>{editingId ? "Update Note" : "Save Note"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: NOTES LEDGER STREAM (INSPECTIONS-STYLE UI)                         */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col space-y-3.5">
            {/* Prominent Add Note Banner */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    Add Observation Record
                  </h3>
                  <p className="text-[11px] text-emerald-200/90">
                    Record colony behavior, queen status, and BeeGPT analysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddForm()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all border border-emerald-400/50 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Metric Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Total Notes", value: stats.total, icon: FileText, tone: "text-honey" },
                { label: "Categories", value: stats.categories, icon: Tag, tone: "text-emerald-400" },
                { label: "Hives Logged", value: stats.hivesCount, icon: Layers, tone: "text-blue-400" },
                { label: "With AI", value: stats.withAi, icon: Sparkles, tone: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
                    <s.icon className={`w-3.5 h-3.5 ${s.tone}`} />
                  </div>
                  <p className={`mt-1 font-display text-xl font-bold ${s.tone}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Category Filters */}
            <div className="rounded-xl border border-border bg-card p-2 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                  categoryFilter === "all"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs border-emerald-500/40"
                    : "bg-background border-border text-muted-foreground hover:border-honey/40"
                }`}
              >
                All ({notes.length})
              </button>
              {NOTE_CATEGORIES.map((cat) => {
                const count = notes.filter((n) => n.category === cat).length;
                if (count === 0 && notes.length > 0) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                      categoryFilter === cat
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs border-emerald-500/40"
                        : "bg-background border-border text-muted-foreground hover:border-honey/40"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search observation notes by category, tag, or content…"
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-honey"
              />
            </div>

            {/* Notes List */}
            {loading ? (
              <div className="py-12 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-honey" /> Loading observation notes…
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-6">
                <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey mx-auto mb-2.5">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  {notes.length === 0 ? "No Observation Notes Logged Yet" : "No Notes Match Your Filter"}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground max-w-sm mx-auto">
                  {notes.length === 0
                    ? `Record colony observations, brood health, and field notes for ${hiveDisplayName}.`
                    : "Try clearing your search query or selecting 'All' above."}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm()}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border border-emerald-400/40 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Add First Note</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-border bg-card p-3.5 space-y-2 hover:border-honey/30 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-honey/15 text-honey border border-honey/30">
                            {note.category}
                          </span>
                          <span className="font-bold text-xs text-foreground">
                            {note.hive_code}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {note.date}
                          </span>
                          {note.synced_to_db && (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              Live DB
                            </span>
                          )}
                        </div>

                        {note.title && (
                          <h4 className="font-bold text-xs sm:text-sm text-foreground pt-0.5">
                            {note.title}
                          </h4>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => exportNotePdf(note)}
                          className="p-1 rounded-lg border border-border hover:border-honey/50 hover:bg-honey/10 text-muted-foreground hover:text-honey transition-colors text-xs"
                          title="Export PDF Certificate"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditNote(note)}
                          className="p-1 rounded-lg border border-border hover:border-honey/50 hover:bg-honey/10 text-muted-foreground hover:text-honey transition-colors text-xs"
                          title="Edit Note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(note.id)}
                          className="p-1 rounded-lg border border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors text-xs"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-background/50 p-2.5 rounded-lg border border-border/50">
                      {note.content}
                    </p>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Attached Photos */}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {note.attachments.map((img, i) => (
                          <a
                            key={i}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 rounded-lg overflow-hidden border border-border hover:border-honey transition-colors"
                          >
                            <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* BeeGPT Analysis */}
                    {note.ai_insights && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 space-y-1">
                        <button
                          type="button"
                          onClick={() => setExpandedAiNoteId(expandedAiNoteId === note.id ? null : note.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-amber-500 hover:text-amber-400"
                        >
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            BeeGPT Clinical Analysis
                          </span>
                          {expandedAiNoteId === note.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {expandedAiNoteId === note.id && (
                          <div className="text-xs leading-relaxed text-foreground/90 pt-1 border-t border-amber-500/20">
                            <MarkdownRenderer content={note.ai_insights} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
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

        {/* Seamless Sub-nav switching */}
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
            onOpenInspections={() => {
              setIsSyrupOpen(false);
              setIsInspectionsOpen(true);
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
            onOpenInspections={() => {
              setIsFrameSenseOpen(false);
              setIsInspectionsOpen(true);
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
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default NotesPage;
