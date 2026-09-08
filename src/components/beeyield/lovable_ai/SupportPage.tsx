import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, LifeBuoy, Plus, Search, Mail, Phone, MapPin, Activity, Printer, Send,
  Loader2, Trash2, ChevronRight, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  hive_label: string | null;
  body: string;
  contact_email: string | null;
  contact_phone: string | null;
  last_contact_at: string | null;
  resolution: string | null;
  created_at: string;
};

const FILTERS = ["all", "new", "in progress", "resolved"] as const;
type Filter = (typeof FILTERS)[number];

const CATEGORIES = ["Hardware calibration", "App issue", "Data interpretation", "Billing", "General"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

const EMPTY = {
  subject: "",
  category: CATEGORIES[0],
  priority: "normal",
  hive_label: "",
  body: "",
  contact_email: "",
  contact_phone: "",
};

export default function SupportPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setTickets((data ?? []) as Ticket[]);
  }, [deviceId]);

  useEffect(() => { if (isOpen) void load(); }, [isOpen, load]);

  const stats = useMemo(() => ({
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "new").length,
    progress: tickets.filter((t) => t.status === "in progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    last: tickets[0]?.created_at ? new Date(tickets[0].created_at).toLocaleDateString() : "None",
  }), [tickets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return [t.subject, t.body, t.category, t.hive_label ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [tickets, filter, query]);

  const submit = async () => {
    if (!draft.subject.trim() || !draft.body.trim()) { toast.error("Subject and description are required"); return; }
    setSaving(true);
    const { error } = await supabase.from("support_tickets").insert({
      device_id: deviceId,
      subject: draft.subject,
      category: draft.category,
      priority: draft.priority,
      status: "new",
      hive_label: draft.hive_label || null,
      body: draft.body,
      contact_email: draft.contact_email || null,
      contact_phone: draft.contact_phone || null,
      last_contact_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket raised — support notified");
    setDraft({ ...EMPTY });
    setShowForm(false);
    void load();
  };

  const advance = async (t: Ticket) => {
    const next = t.status === "new" ? "in progress" : t.status === "in progress" ? "resolved" : "new";
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: next, last_contact_at: new Date().toISOString() })
      .eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    await supabase.from("support_tickets").delete().eq("id", id);
    void load();
  };

  const exportServiceForm = () => {
    const rows = [
      ["Ticket", "Created", "Category", "Priority", "Status", "Hive", "Description"],
      ...tickets.map((t) => [
        t.subject, new Date(t.created_at).toISOString(), t.category, t.priority, t.status,
        t.hive_label ?? "", t.body.replace(/\s+/g, " "),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `beeyield-service-form-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Support <span className="text-honey">Page View</span>
            </h2>
            <p className="text-sm text-muted-foreground">High-priority assistance for your apiculture operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 rounded-lg bg-honey text-honey-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} New Ticket <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <Stat label="Total Tickets" value={String(stats.total)} />
          <Stat label="Pending" value={String(stats.pending)} />
          <Stat label="In Progress" value={String(stats.progress)} />
          <Stat label="Resolved" value={String(stats.resolved)} />
          <Stat label="Last Contact" value={stats.last} />
        </div>

        <div className="rounded-xl border border-border p-5 mb-6">
          <h3 className="font-display text-lg font-bold mb-1">
            Contact <span className="text-honey">Support</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Experts available for hardware calibration, app issues, or data interpretation.
          </p>
          <div className="grid lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start">
            <Contact icon={Mail} label="Mail" value="support@beeyield.com" href="mailto:support@beeyield.com" />
            <Contact icon={Phone} label="Phone" value="+254 700 000 000" href="tel:+254700000000" />
            <Contact icon={MapPin} label="Hub" value="Kibwezi, Kenya" />
            <div className="space-y-2 w-full lg:w-64">
              <a href="https://docs.lovable.dev" target="_blank" rel="noreferrer"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm flex items-center justify-center gap-2 hover:bg-muted">
                <Activity className="w-4 h-4" /> Troubleshooting
              </a>
              <button onClick={exportServiceForm}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm flex items-center justify-center gap-2 hover:bg-muted">
                <Printer className="w-4 h-4" /> Export Service Form
              </button>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs">
            <Activity className="w-3.5 h-3.5 text-honey" /> SLA: &lt; 2 Hours
          </span>
        </div>

        {showForm && (
          <div className="rounded-xl border border-border p-5 mb-6 space-y-3">
            <h3 className="font-semibold">Raise a ticket</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Subject">
                <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  placeholder="Scale reading drifts after rain" className="input-base" />
              </Field>
              <Field label="Hive / device (optional)">
                <input value={draft.hive_label} onChange={(e) => setDraft({ ...draft, hive_label: e.target.value })}
                  placeholder="Hive A3" className="input-base" />
              </Field>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="input-base">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="input-base">
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Reply email">
                <input value={draft.contact_email} onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })}
                  placeholder="you@example.com" className="input-base" />
              </Field>
              <Field label="Phone">
                <input value={draft.contact_phone} onChange={(e) => setDraft({ ...draft, contact_phone: e.target.value })}
                  placeholder="+254…" className="input-base" />
              </Field>
            </div>
            <Field label="Describe the issue">
              <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={4}
                placeholder="What happened, when it started, and what you have already tried." className="input-base" />
            </Field>
            <button onClick={submit} disabled={saving}
              className="px-4 py-2 rounded-lg bg-honey text-honey-foreground font-semibold text-sm flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit ticket
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wide ${filter === f ? "bg-background shadow-sm font-semibold" : "text-muted-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-honey" /></div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <Send className="w-10 h-10 mx-auto text-honey mb-3" />
              <p className="font-semibold">No Tickets Found</p>
              <p className="text-xs text-honey mt-1">All support channels are synchronized</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <div key={t.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()} · {t.category} · priority {t.priority}
                        {t.hive_label ? ` · ${t.hive_label}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => advance(t)}
                        className="px-2.5 py-1 rounded-md border border-border text-[11px] uppercase tracking-wide hover:bg-muted flex items-center gap-1">
                        {t.status === "resolved" ? <CheckCircle2 className="w-3 h-3 text-honey" /> : null}
                        {t.status}
                      </button>
                      <button onClick={() => remove(t.id)} aria-label="Delete ticket" className="p-1.5 rounded-md hover:bg-muted">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{t.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function Contact({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const body = <p className="font-semibold text-sm">{value}</p>;
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-honey" /> {label}</p>
      {href ? <a href={href} className="hover:text-honey">{body}</a> : body}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 [&_.input-base]:w-full [&_.input-base]:px-3 [&_.input-base]:py-2 [&_.input-base]:rounded-lg [&_.input-base]:border [&_.input-base]:border-border [&_.input-base]:bg-background [&_.input-base]:text-sm">
        {children}
      </div>
    </label>
  );
}
