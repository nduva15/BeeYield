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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, LifeBuoy, Plus, Search, Mail, Phone, MapPin, Activity, Printer, Send,
  Loader2, Trash2, ChevronRight, CheckCircle2, Pencil, Save, AlertCircle, ShieldCheck
} from "lucide-react";
import { supportTicketService, type Ticket } from "@/services/supportTicketService";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

const FILTERS = ["all", "new", "in progress", "resolved"] as const;
type Filter = (typeof FILTERS)[number];

const CATEGORIES = [
  "Hardware calibration",
  "Acoustic sensors",
  "App issue",
  "Data interpretation",
  "Billing & orders",
  "General apiculture inquiry",
];
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

export default function SupportPage({
  isOpen,
  onClose,
  embedded = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}) {
  const deviceId = useDeviceId();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ ...EMPTY });

  // Edit ticket state
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    category: "",
    priority: "",
    status: "",
    hive_label: "",
    body: "",
    resolution: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportTicketService.getTickets(deviceId);
      setTickets(data);
    } catch (err) {
      console.warn("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "new").length,
      progress: tickets.filter((t) => t.status === "in progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      last: tickets[0]?.created_at
        ? new Date(tickets[0].created_at).toLocaleDateString()
        : "None",
    }),
    [tickets]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return [t.subject, t.body, t.category, t.hive_label ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tickets, filter, query]);

  const submit = async () => {
    if (!draft.subject.trim() || !draft.body.trim()) {
      toast.error("Subject and description are required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await supportTicketService.createTicket(
        {
          subject: draft.subject,
          category: draft.category,
          priority: draft.priority,
          hive_label: draft.hive_label || null,
          body: draft.body,
          contact_email: draft.contact_email || null,
          contact_phone: draft.contact_phone || null,
        },
        deviceId
      );

      setTickets((prev) => [data, ...prev.filter((t) => t.id !== data.id)]);
      toast.success("Ticket registered — support notified");
      setDraft({ ...EMPTY });
      setShowForm(false);
      void load();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to register ticket");
    } finally {
      setSaving(false);
    }
  };

  const advance = async (t: Ticket) => {
    try {
      const updated = await supportTicketService.advanceTicket(t, deviceId);
      setTickets((prev) =>
        prev.map((item) => (item.id === t.id ? updated : item))
      );
      toast.success(`Ticket status updated to ${updated.status}`);
    } catch (err) {
      console.error("Advance error:", err);
    }
  };

  const startEdit = (t: Ticket) => {
    setEditingTicket(t);
    setEditForm({
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      hive_label: t.hive_label || "",
      body: t.body,
      resolution: t.resolution || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingTicket) return;
    setIsUpdating(true);
    try {
      const updated = await supportTicketService.updateTicket(
        {
          id: editingTicket.id,
          subject: editForm.subject.trim() || editingTicket.subject,
          category: editForm.category,
          priority: editForm.priority,
          status: editForm.status,
          hive_label: editForm.hive_label.trim() || null,
          body: editForm.body.trim() || editingTicket.body,
          resolution: editForm.resolution.trim() || null,
        },
        deviceId
      );
      setTickets((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Ticket updated successfully");
      setEditingTicket(null);
    } catch (err) {
      toast.error("Failed to update ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);

  const confirmDeleteTicket = async () => {
    if (!deleteTicketId) return;
    const id = deleteTicketId;
    setDeleteTicketId(null);
    try {
      await supportTicketService.deleteTicket(id, deviceId);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.info("Ticket removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete ticket");
    }
  };

  const exportServiceForm = () => {
    const rows = [
      [
        "Ticket",
        "Created",
        "Category",
        "Priority",
        "Status",
        "Hive",
        "Description",
      ],
      ...tickets.map((t) => [
        t.subject,
        new Date(t.created_at).toISOString(),
        t.category,
        t.priority,
        t.status,
        t.hive_label ?? "",
        t.body.replace(/\s+/g, " "),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `beeyield-service-form-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen && !embedded) return null;

  return (
    <div
      className={
        embedded
          ? "w-full space-y-6"
          : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"
      }
    >
      <div className={embedded ? "w-full space-y-6" : "max-w-6xl mx-auto p-6"}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Support <span className="text-honey">Page View</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              High-priority assistance for your apiculture operations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 text-sm flex items-center gap-2 hover:opacity-90"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{" "}
              New Ticket <ChevronRight className="w-4 h-4" />
            </button>
            {!embedded && onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
            Experts available for hardware calibration, app issues, or data
            interpretation.
          </p>
          <div className="grid lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start">
            <Contact
              icon={Mail}
              label="Mail"
              value="support@beeyield.com"
              href="mailto:support@beeyield.com"
            />
            <Contact
              icon={Phone}
              label="Phone"
              value="+254 742 004 187"
              href="tel:+254742004187"
            />
            <Contact icon={MapPin} label="Location" value="Kibwezi, Kenya" />
            <div className="space-y-2 w-full lg:w-64">
              <a
                href="https://docs.lovable.dev"
                target="_blank"
                rel="noreferrer"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm flex items-center justify-center gap-2 hover:bg-muted"
              >
                <Activity className="w-4 h-4" /> Troubleshooting
              </a>
              <button
                onClick={exportServiceForm}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm flex items-center justify-center gap-2 hover:bg-muted"
              >
                <Printer className="w-4 h-4" /> Export Service Form
              </button>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs">
            <Activity className="w-3.5 h-3.5 text-honey" /> SLA: &lt; 2 Hours
          </span>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <div className="rounded-xl border border-emerald-500/40 bg-card p-5 mb-6 space-y-3 shadow-lg">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Raise a New Support Ticket
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Subject">
                <input
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  placeholder="e.g. Scale reading drifts after rainfall"
                  className="input-base"
                />
              </Field>
              <Field label="Hive / Device Tag (optional)">
                <input
                  value={draft.hive_label}
                  onChange={(e) =>
                    setDraft({ ...draft, hive_label: e.target.value })
                  }
                  placeholder="e.g. HIVE-01 / DEV-99"
                  className="input-base"
                />
              </Field>
              <Field label="Category">
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                  className="input-base"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft({ ...draft, priority: e.target.value })
                  }
                  className="input-base"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Reply Email">
                <input
                  value={draft.contact_email}
                  onChange={(e) =>
                    setDraft({ ...draft, contact_email: e.target.value })
                  }
                  placeholder="you@example.com"
                  className="input-base"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  value={draft.contact_phone}
                  onChange={(e) =>
                    setDraft({ ...draft, contact_phone: e.target.value })
                  }
                  placeholder="+254 7..."
                  className="input-base"
                />
              </Field>
            </div>
            <Field label="Describe the issue in detail">
              <textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={4}
                placeholder="What happened, when it started, and any symptoms or troubleshooting steps already attempted."
                className="input-base"
              />
            </Field>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40 text-xs flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
                Submit Ticket
              </button>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wide font-bold transition-all ${
                  filter === f
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets by subject, category, hive..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm"
            />
          </div>
        </div>

        {/* Ticket List */}
        <div className="rounded-xl border border-border p-4 bg-card">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-honey" />
            </div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <Send className="w-10 h-10 mx-auto text-honey mb-3 opacity-60" />
              <p className="font-semibold text-foreground">No Tickets Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                All support channels are synchronized with backend and Supabase
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Submit First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-background/60 p-4 transition-all hover:border-honey/40 space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-honey font-bold">
                          {t.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground">
                          {t.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            t.priority === "urgent" || t.priority === "critical"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : t.priority === "high"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">{t.subject}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()} • {t.category}
                        {t.hive_label ? ` • Hive: ${t.hive_label}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => advance(t)}
                        className={`px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wide font-bold flex items-center gap-1 transition-all ${
                          t.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : t.status === "in progress"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                        }`}
                        title="Click to advance status"
                      >
                        {t.status === "resolved" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : null}
                        {t.status}
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        aria-label="Edit ticket"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                        title="Edit ticket"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTicketId(t.id)}
                        aria-label="Delete ticket"
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 border border-border transition-colors active:scale-95"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 whitespace-pre-wrap pt-1 border-t border-border/40">
                    {t.body}
                  </p>

                  {t.resolution && (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2 text-xs text-emerald-300">
                      <strong>Resolution:</strong> {t.resolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingTicket(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Pencil className="w-4 h-4 text-honey" /> Edit Support Ticket
              </h3>
              <button
                onClick={() => setEditingTicket(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <Field label="Subject">
                <input
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="input-base"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="input-base"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input-base"
                  >
                    <option value="new">New</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Priority">
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="input-base"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Hive Tag">
                  <input
                    value={editForm.hive_label}
                    onChange={(e) => setEditForm({ ...editForm, hive_label: e.target.value })}
                    className="input-base"
                  />
                </Field>
              </div>

              <Field label="Issue Description">
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  rows={3}
                  className="input-base"
                />
              </Field>

              <Field label="Resolution Notes (optional)">
                <textarea
                  value={editForm.resolution}
                  onChange={(e) => setEditForm({ ...editForm, resolution: e.target.value })}
                  rows={2}
                  placeholder="Steps taken to resolve issue..."
                  className="input-base"
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
          <AlertDialog open={!!deleteTicketId} onOpenChange={(open) => !open && setDeleteTicketId(null)}>
        <AlertDialogContent className="rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Support Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTicket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function Contact({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const body = <p className="font-semibold text-sm text-foreground">{value}</p>;
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-honey" /> {label}
      </p>
      {href ? (
        <a href={href} className="hover:text-honey transition-colors">
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 [&_.input-base]:w-full [&_.input-base]:px-3 [&_.input-base]:py-2 [&_.input-base]:rounded-lg [&_.input-base]:border [&_.input-base]:border-border [&_.input-base]:bg-background [&_.input-base]:text-sm [&_.input-base]:text-foreground">
        {children}
      </div>
    </label>
  );
}
