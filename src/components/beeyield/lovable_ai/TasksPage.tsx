import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, CheckSquare, Plus, Search, Trash2, Clock, CheckCircle2, AlertCircle,
  Sparkles, Loader2, Save, CalendarDays, MapPin, Layers, Pencil, RefreshCw,
  Tag, ArrowUpDown, ChevronRight, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { toast } from "sonner";
import { autoSyncRecord } from "@/lib/integration-sync";

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  apiary_id?: string | null;
  hive_id?: string | null;
  apiary_name?: string | null;
  hive_label?: string | null;
  location?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  notes?: string | null;
  ai_insights?: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Inspection",
  "Feeding",
  "Treatment",
  "Harvest",
  "Hive Maintenance",
  "Queen Check",
  "Equipment Setup",
  "General",
];

const PRIORITIES = ["low", "medium", "high"] as const;
const STATUSES = ["pending", "in_progress", "completed"] as const;

const EMPTY_DRAFT = {
  title: "",
  description: "",
  due_date: new Date().toISOString().slice(0, 10),
  status: "pending" as "pending" | "in_progress" | "completed",
  priority: "medium" as "low" | "medium" | "high",
  category: "Inspection",
  apiary_name: "",
  hive_label: "",
  location: "",
  notes: "",
};

function priorityTone(p: string) {
  if (p === "high") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  if (p === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  return "text-blue-400 bg-blue-500/10 border-blue-500/30";
}

function statusTone(s: string) {
  if (s === "completed") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (s === "in_progress") return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  return "text-amber-400 bg-amber-500/10 border-amber-500/30";
}

export default function TasksPage({
  isOpen = true,
  onClose,
  embedded = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}) {
  const deviceId = useDeviceId();
  const { user } = useAuth();

  const [rows, setRows] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [draft, setDraft] = useState({ ...EMPTY_DRAFT });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [expandedAiTaskId, setExpandedAiTaskId] = useState<string | null>(null);

  // Apiaries & Hives for dropdown selection
  const [userHives, setUserHives] = useState<{ id: string; name: string; apiary: string }[]>([]);
  const [userApiaries, setUserApiaries] = useState<{ id: string; name: string }[]>([]);

  const loadUserHivesAndApiaries = useCallback(async () => {
    try {
      if (user?.id) {
        const { data: apiaryData } = await supabase.from("apiaries").select("id, name").eq("user_id", user.id);
        if (apiaryData && apiaryData.length > 0) {
          setUserApiaries(apiaryData);
        }
        const { data: hiveData } = await supabase.from("hives").select("id, name, apiary_id").eq("user_id", user.id);
        if (hiveData && hiveData.length > 0) {
          setUserHives(hiveData.map((h: any) => ({ id: h.id, name: h.name, apiary: h.apiary_id })));
        }
      }
    } catch { void 0; }
  }, [user?.id]);

  const load = useCallback(async () => {
    setLoading(true);
    const userTasks: TaskItem[] = [];
    const taskIds = new Set<string>();

    try {
      // 1. Backend API (FastAPI)
      try {
        const headers: Record<string, string> = {};
        if (user?.id) headers["x-user-id"] = user.id;
        if (deviceId) headers["x-device-id"] = deviceId;

        const res = await fetch("/api/v1/tasks", { headers });
        if (res.ok) {
          const apiData = await res.json();
          if (Array.isArray(apiData)) {
            apiData.forEach((d: any) => {
              const item: TaskItem = {
                id: String(d.id),
                title: d.title || "Untitled Task",
                description: d.description || null,
                due_date: d.due_date || new Date().toISOString().slice(0, 10),
                status: (d.status || (d.is_completed ? "completed" : "pending")) as any,
                priority: (d.priority || "medium") as any,
                category: d.category || "General",
                apiary_id: d.apiary_id || null,
                hive_id: d.hive_id || null,
                apiary_name: d.apiary_name || null,
                hive_label: d.hive_label || null,
                location: d.location || null,
                is_completed: Boolean(d.is_completed || d.status === "completed"),
                completed_at: d.completed_at || null,
                notes: d.notes || null,
                ai_insights: d.ai_insights || null,
                created_at: d.created_at || new Date().toISOString(),
              };
              if (!taskIds.has(item.id)) {
                taskIds.add(item.id);
                userTasks.push(item);
              }
            });
          }
        }
      } catch { void 0; }

      // 2. Supabase tasks table
      try {
        let query = (supabase as any).from("tasks").select("*");
        if (user?.id) {
          query = query.eq("user_id", user.id);
        }
        const { data, error } = await query.order("due_date", { ascending: true }).limit(300);
        if (!error && Array.isArray(data)) {
          data.forEach((d: any) => {
            const item: TaskItem = {
              id: String(d.id),
              title: d.title || "Untitled Task",
              description: d.description || null,
              due_date: d.due_date ? String(d.due_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
              status: (d.status || (d.is_completed ? "completed" : "pending")) as any,
              priority: (d.priority || "medium") as any,
              category: d.category || "General",
              apiary_id: d.apiary_id || null,
              hive_id: d.hive_id || null,
              apiary_name: d.apiary_name || null,
              hive_label: d.hive_label || null,
              location: d.location || null,
              is_completed: Boolean(d.is_completed || d.status === "completed"),
              completed_at: d.completed_at || null,
              notes: d.notes || null,
              ai_insights: d.ai_insights || null,
              created_at: d.created_at || new Date().toISOString(),
            };
            if (!taskIds.has(item.id)) {
              taskIds.add(item.id);
              userTasks.push(item);
            }
          });
        }
      } catch { void 0; }

      // 3. Merge with LocalStorage (clean out any legacy mock tasks)
      try {
        const raw = localStorage.getItem("beeyield_local_tasks_v1");
        if (raw) {
          const localItems: TaskItem[] = JSON.parse(raw);
          const cleanLocal = localItems.filter((item) => !item.id?.startsWith("mock-task-"));
          cleanLocal.forEach((item) => {
            if (!taskIds.has(item.id)) {
              taskIds.add(item.id);
              userTasks.push(item);
            }
          });
          if (cleanLocal.length !== localItems.length) {
            localStorage.setItem("beeyield_local_tasks_v1", JSON.stringify(cleanLocal));
          }
        }
      } catch { void 0; }

      // Sort tasks by due date
      userTasks.sort((a, b) => a.due_date.localeCompare(b.due_date));
      setRows(userTasks);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, deviceId]);

  useEffect(() => {
    if (isOpen || embedded) {
      void load();
      void loadUserHivesAndApiaries();
    }
  }, [isOpen, embedded, load, loadUserHivesAndApiaries]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending" || r.status === "in_progress").length;
    const completed = rows.filter((r) => r.status === "completed" || r.is_completed).length;
    const highPriority = rows.filter((r) => r.priority === "high" && !r.is_completed).length;
    return { total, pending, completed, highPriority };
  }, [rows]);

  // Filtered Rows
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        [r.title, r.description || "", r.category, r.apiary_name || "", r.hive_label || "", r.location || ""]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && (r.status === "completed" || r.is_completed)) ||
        (statusFilter === "pending" && (r.status === "pending" && !r.is_completed)) ||
        (statusFilter === "in_progress" && r.status === "in_progress");

      const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [rows, query, statusFilter, priorityFilter, categoryFilter]);

  const startEdit = (t: TaskItem) => {
    setEditingId(t.id);
    setDraft({
      title: t.title,
      description: t.description || "",
      due_date: t.due_date,
      status: t.status,
      priority: t.priority,
      category: t.category,
      apiary_name: t.apiary_name || "",
      hive_label: t.hive_label || "",
      location: t.location || "",
      notes: t.notes || "",
    });
    setAiText(t.ai_insights || "");
    setShowForm(true);
  };

  const handleAskBeeGpt = async () => {
    if (!draft.title.trim()) {
      toast.error("Please enter a task title first");
      return;
    }
    setAiLoading(true);
    setAiText("");
    const prompt = `As an elite master commercial apiculturist and BeeYield field supervisor, provide actionable SOP execution instructions for this hive task:
Task: "${draft.title}"
Category: ${draft.category}
Priority: ${draft.priority}
Apiary/Location: ${draft.apiary_name || draft.location || "Commercial Apiary"}
Hive: ${draft.hive_label || "Active Colony"}
Notes: ${draft.description || "Routine maintenance"}

Provide concise, bulleted steps:
1. Preparation & PPE requirements
2. Field execution SOP
3. Diagnostic checks & critical warnings
4. Post-operation logging criteria`;

    try {
      await streamBeeGpt(prompt, (token) => setAiText((prev) => prev + token));
    } catch (e: any) {
      toast.error(e?.message || "AI consultation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleComplete = async (t: TaskItem) => {
    const isNowCompleted = !t.is_completed;
    const newStatus: "completed" | "pending" = isNowCompleted ? "completed" : "pending";
    const completedAt = isNowCompleted ? new Date().toISOString() : null;

    // Optimistic UI
    setRows((prev) =>
      prev.map((r) =>
        r.id === t.id ? { ...r, is_completed: isNowCompleted, status: newStatus, completed_at: completedAt } : r
      )
    );

    // 1. Backend API
    try {
      await fetch(`/api/v1/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: isNowCompleted, status: newStatus, completed_at: completedAt }),
      });
    } catch { void 0; }

    // 2. Supabase
    try {
      await (supabase as any)
        .from("tasks")
        .update({ is_completed: isNowCompleted, status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", t.id);
    } catch { void 0; }

    // 3. LocalStorage
    try {
      const stored: TaskItem[] = JSON.parse(localStorage.getItem("beeyield_local_tasks_v1") || "[]");
      const nextLocal = stored.map((r) =>
        r.id === t.id ? { ...r, is_completed: isNowCompleted, status: newStatus, completed_at: completedAt } : r
      );
      localStorage.setItem("beeyield_local_tasks_v1", JSON.stringify(nextLocal));
    } catch { void 0; }

    toast.success(isNowCompleted ? "Task completed! Great job." : "Task marked as pending.");
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      toast.error("Please provide a task title");
      return;
    }

    setSaving(true);
    const taskId = editingId || "task-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const isCompleted = draft.status === "completed";

    const currentRecord: TaskItem = {
      id: taskId,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      due_date: draft.due_date || new Date().toISOString().slice(0, 10),
      status: draft.status,
      priority: draft.priority,
      category: draft.category,
      apiary_name: draft.apiary_name.trim() || null,
      hive_label: draft.hive_label.trim() || null,
      location: draft.location.trim() || null,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      notes: draft.notes.trim() || null,
      ai_insights: aiText || null,
      created_at: new Date().toISOString(),
    };

    // 1. Backend API (FastAPI)
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/v1/tasks/${editingId}` : "/api/v1/tasks";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user?.id) headers["x-user-id"] = user.id;
      if (deviceId) headers["x-device-id"] = deviceId;

      await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...currentRecord,
          user_id: user?.id,
        }),
      });
    } catch (err) {
      console.warn("Backend task sync notice:", err);
    }

    // 2. Supabase DB Sync
    try {
      if (editingId) {
        await (supabase as any)
          .from("tasks")
          .update({
            title: draft.title.trim(),
            description: draft.description.trim() || null,
            due_date: draft.due_date,
            status: draft.status,
            priority: draft.priority,
            category: draft.category,
            is_completed: isCompleted,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
      } else {
        const payload: any = {
          id: taskId,
          title: draft.title.trim(),
          description: draft.description.trim() || null,
          due_date: draft.due_date,
          status: draft.status,
          priority: draft.priority,
          category: draft.category,
          is_completed: isCompleted,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (user?.id) payload.user_id = user.id;
        await (supabase as any).from("tasks").insert(payload);
      }
    } catch (e) {
      console.warn("Supabase task sync notice:", e);
    }

    // 3. LocalStorage Sync
    try {
      const stored: TaskItem[] = JSON.parse(localStorage.getItem("beeyield_local_tasks_v1") || "[]");
      let nextLocal: TaskItem[];
      if (editingId) {
        nextLocal = stored.map((t) => (t.id === editingId ? currentRecord : t));
        if (!nextLocal.some((t) => t.id === editingId)) {
          nextLocal.unshift(currentRecord);
        }
      } else {
        nextLocal = [currentRecord, ...stored.filter((t) => t.id !== taskId)];
      }
      localStorage.setItem("beeyield_local_tasks_v1", JSON.stringify(nextLocal));
    } catch { void 0; }

    // 4. Update UI
    if (editingId) {
      setRows((prev) => prev.map((r) => (r.id === editingId ? currentRecord : r)));
      toast.success("Task updated successfully");
    } else {
      setRows((prev) => [currentRecord, ...prev]);
      toast.success("Task created successfully");
    }

    // 5. Offline Auto-sync Integration
    void autoSyncRecord({
      deviceId,
      kind: "task",
      recordId: currentRecord.id,
      hiveLabel: draft.hive_label || draft.apiary_name,
      title: `Task: ${draft.title} (${draft.priority})`,
      summary: draft.description || `Task due on ${draft.due_date}. Status: ${draft.status}.`,
      status: draft.status,
      occurredAt: draft.due_date,
      metrics: {
        priority: draft.priority,
        status: draft.status,
        isCompleted: currentRecord.is_completed,
      },
    });

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT });
    setAiText("");
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    // 1. Backend API
    try {
      await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Backend task delete notice:", e);
    }

    // 2. Supabase
    try {
      await (supabase as any).from("tasks").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase task delete notice:", e);
    }

    // 3. LocalStorage
    try {
      const stored: TaskItem[] = JSON.parse(localStorage.getItem("beeyield_local_tasks_v1") || "[]");
      const nextLocal = stored.filter((t) => t.id !== id);
      localStorage.setItem("beeyield_local_tasks_v1", JSON.stringify(nextLocal));
    } catch { void 0; }

    // 4. Update UI
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Task deleted");
  };

  if (!isOpen && !embedded) return null;

  const mainContent = (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My <span className="text-honey">Tasks</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Personal account tasks & apiary workflow ledger</span>
              {user?.email && <span className="font-mono text-honey">· {user.email}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-honey" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setDraft({ ...EMPTY_DRAFT });
              setAiText("");
              setShowForm((s) => !s);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"
            title="Add Task"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-white">Add Task</span>
          </button>
          {!embedded && onClose && (
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prominent Add Task Banner (matching InspectionsPage) */}
      {!showForm && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-white">
                Add Apiary Field Task & Operation
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Schedule colony feeding, mite treatments, super rotations, and routine apiary workflows.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setDraft({ ...EMPTY_DRAFT });
              setAiText("");
              setShowForm(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-400/50 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-white">Add Task</span>
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total tasks", value: stats.total, icon: CheckSquare, tone: "text-honey" },
          { label: "Pending tasks", value: stats.pending, icon: Clock, tone: "text-amber-400" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, tone: "text-emerald-400" },
          { label: "High priority", value: stats.highPriority, icon: AlertCircle, tone: "text-rose-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.tone}`} />
            </div>
            <p className={`mt-2 font-display text-3xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks by title, category, apiary, or notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-honey focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "pending", "in_progress", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors border ${
                  statusFilter === st
                    ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 border-honey font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Priority Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Tag className="w-3 h-3 text-honey" /> Priority:
          </span>
          {["all", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2 py-0.5 rounded-md text-[11px] capitalize border transition-colors ${
                priorityFilter === p
                  ? "bg-honey/20 border-honey text-honey font-bold"
                  : "bg-card border-border text-muted-foreground hover:border-honey/40"
              }`}
            >
              {p}
            </button>
          ))}

          <span className="text-[11px] text-muted-foreground font-medium ml-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-honey" /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 rounded-md text-[11px] bg-card border border-border text-foreground focus:border-honey focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add / Edit Task Form (Expandable) */}
      {showForm && (
        <form onSubmit={saveDraft} className="rounded-2xl border border-honey/30 bg-card p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-honey" />
              <h3 className="font-display font-bold text-sm text-foreground">
                {editingId ? "Edit Field Task" : "Add New Field Task"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setDraft({ ...EMPTY_DRAFT });
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Task Title *</label>
              <input
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Inspect brood comb and apply thymol varroa strips"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Due Date *</label>
              <input
                type="date"
                required
                value={draft.due_date}
                onChange={(e) => setDraft((d) => ({ ...d, due_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Priority</label>
              <select
                value={draft.priority}
                onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Apiary / Location</label>
              <input
                type="text"
                value={draft.apiary_name}
                onChange={(e) => setDraft((d) => ({ ...d, apiary_name: e.target.value }))}
                placeholder="e.g. Kibwezi North Apiary"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
                list="apiary-suggestions"
              />
              <datalist id="apiary-suggestions">
                {userApiaries.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Hive Label / Code</label>
              <input
                type="text"
                value={draft.hive_label}
                onChange={(e) => setDraft((d) => ({ ...d, hive_label: e.target.value }))}
                placeholder="e.g. BY-H001"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
                list="hive-suggestions"
              />
              <datalist id="hive-suggestions">
                {userHives.map((h) => (
                  <option key={h.id} value={h.name} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Description & Protocol Notes</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Provide task notes, required equipment, treatment doses, or safety checklist..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:border-honey focus:outline-none"
              />
            </div>
          </div>

          {/* AI Task Guidance Generator */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-honey" />
                <span className="text-xs font-semibold text-foreground">BeeGPT Field Procedure Assistant</span>
              </div>
              <button
                type="button"
                onClick={handleAskBeeGpt}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-lg border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Field SOP
              </button>
            </div>
            {aiText && (
              <div className="mt-3 p-3.5 rounded-xl border border-border bg-background text-xs space-y-1">
                <MarkdownRenderer content={aiText} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setDraft({ ...EMPTY_DRAFT });
              }}
              className="px-3.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md border border-emerald-500/40"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editingId ? "Update Task" : "Save Task"}
            </button>
          </div>
        </form>
      )}

      {/* Task Cards List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card/20">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <CheckSquare className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">No Field Tasks Logged Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {query || statusFilter !== "all" || priorityFilter !== "all"
              ? "No tasks match your current search and filter criteria."
              : "Keep your apiary operations organized. Add inspections, syrup feeding, treatments, or queen checks to your schedule."}
          </p>
          <button
            onClick={() => {
              setEditingId(null);
              setDraft({ ...EMPTY_DRAFT });
              setAiText("");
              setShowForm(true);
            }}
            className="mt-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md border border-emerald-500/40"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const isDueToday = t.due_date === new Date().toISOString().slice(0, 10);
            const isOverdue = t.due_date < new Date().toISOString().slice(0, 10) && !t.is_completed;

            return (
              <div
                key={t.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all bg-card/60 hover:bg-card ${
                  t.is_completed
                    ? "border-border/60 opacity-80"
                    : isOverdue
                    ? "border-rose-500/40 bg-rose-500/5 shadow-sm"
                    : "border-border hover:border-honey/40 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleComplete(t)}
                      aria-label={t.is_completed ? "Mark pending" : "Mark completed"}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        t.is_completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border hover:border-emerald-400 bg-background"
                      }`}
                    >
                      {t.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-display text-sm sm:text-base font-bold text-foreground truncate ${
                            t.is_completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {t.title}
                        </h4>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusTone(t.status)}`}>
                          {t.status.replace("_", " ")}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityTone(t.priority)}`}>
                          {t.priority}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground text-[10px] font-medium border border-border">
                          {t.category}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">{t.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? "text-rose-400 font-bold"
                              : isDueToday
                              ? "text-amber-400 font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          {isOverdue ? `Overdue (${t.due_date})` : isDueToday ? "Due Today" : `Due ${t.due_date}`}
                        </span>

                        {t.apiary_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-honey" />
                            {t.apiary_name}
                          </span>
                        )}

                        {t.hive_label && (
                          <span className="flex items-center gap-1 font-mono font-medium text-foreground/80">
                            <Layers className="w-3.5 h-3.5 text-honey" />
                            {t.hive_label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                    {t.ai_insights && (
                      <button
                        type="button"
                        onClick={() => setExpandedAiTaskId((prev) => (prev === t.id ? null : t.id))}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                          expandedAiTaskId === t.id
                            ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 border-honey font-bold"
                            : "border-border text-honey hover:bg-honey/10"
                        }`}
                        title="View AI Instructions"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[10px]">SOP</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit Task"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded AI Insights */}
                {expandedAiTaskId === t.id && t.ai_insights && (
                  <div className="mt-3 pt-3 border-t border-border text-xs bg-background/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-honey font-semibold mb-1 text-[11px]">
                      <Sparkles className="w-3 h-3" /> Field SOP & Procedure:
                    </div>
                    <MarkdownRenderer content={t.ai_insights} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return <div className="w-full space-y-6">{mainContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">{mainContent}</div>
    </div>
  );
}
