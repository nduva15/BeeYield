import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Sprout, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { z } from "zod";

import FlorageLibraryPanel from "@/components/beeyield/lovable_ai/FlorageLibraryPanel";
import { useFlorageLibrary } from "@/hooks/useFlorageLibrary";

const TIMELINE_STORAGE_KEY = "beeyield.timeline-tracker.v1";

const timelineEventSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(2),
  date: z.string().trim().min(1),
  phase: z.enum(["pre-bloom", "bloom", "peak", "post-bloom"]),
  owner: z.string().trim().default("Ops"),
  plantId: z.string().nullable(),
  notes: z.string().trim().default(""),
});

type TimelineEvent = z.infer<typeof timelineEventSchema>;

type TimelineForm = Omit<TimelineEvent, "id">;

const EMPTY_EVENT: TimelineForm = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  phase: "pre-bloom",
  owner: "Ops",
  plantId: null,
  notes: "",
};

function loadEvents(): TimelineEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TIMELINE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = z.array(timelineEventSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function saveEvents(events: TimelineEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events));
}

export default function TimelineTracker({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const { plants } = useFlorageLibrary();
  const [events, setEvents] = useState<TimelineEvent[]>(() => loadEvents());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TimelineForm>(EMPTY_EVENT);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => left.date.localeCompare(right.date)),
    [events],
  );

  const grouped = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return {
      upcoming: sortedEvents.filter((event) => event.date >= now),
      past: sortedEvents.filter((event) => event.date < now),
    };
  }, [sortedEvents]);

  const handleSubmit = () => {
    const parsed = timelineEventSchema.omit({ id: true }).safeParse(form);
    if (!parsed.success) return;

    if (editingId) {
      setEvents((current) => current.map((event) => (event.id === editingId ? { ...event, ...parsed.data } : event)));
    } else {
      setEvents((current) => [...current, { id: nanoid(), ...parsed.data }]);
    }
    setEditingId(null);
    setForm(EMPTY_EVENT);
  };

  const startEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.date,
      phase: event.phase,
      owner: event.owner,
      plantId: event.plantId,
      notes: event.notes,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={embedded ? "h-full overflow-y-auto rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl custom-scroll" : "fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm custom-scroll"}>
      <div className="mx-auto max-w-7xl p-6">
        {!embedded && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-7 w-7 text-honey" />
              <div>
                <h1 className="font-display text-2xl font-bold text-honey">Timeline Tracker</h1>
                <p className="text-sm text-muted-foreground">Track pre-bloom, bloom, peak, and post-bloom actions against the shared florage library.</p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{editingId ? "Edit timeline event" : "Create timeline event"}</h2>
                  <p className="text-sm text-muted-foreground">Link operational milestones to a florage plant and bloom phase.</p>
                </div>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setForm(EMPTY_EVENT); }} className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Task">
                  <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputCls} />
                </Field>
                <Field label="Date">
                  <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className={inputCls} />
                </Field>
                <Field label="Phase">
                  <select value={form.phase} onChange={(event) => setForm((current) => ({ ...current, phase: event.target.value as TimelineForm["phase"] }))} className={inputCls}>
                    <option value="pre-bloom">Pre-bloom</option>
                    <option value="bloom">Bloom</option>
                    <option value="peak">Peak</option>
                    <option value="post-bloom">Post-bloom</option>
                  </select>
                </Field>
                <Field label="Owner">
                  <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} className={inputCls} />
                </Field>
                <Field label="Linked plant">
                  <select value={form.plantId || ""} onChange={(event) => setForm((current) => ({ ...current, plantId: event.target.value || null }))} className={inputCls}>
                    <option value="">No linked plant</option>
                    {plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.name}</option>)}
                  </select>
                </Field>
                <Field label="Notes" className="md:col-span-2">
                  <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className={`${inputCls} resize-y`} />
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleSubmit} className="rounded-lg bg-honey px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
                  <Plus className="mr-1 inline h-4 w-4" />
                  {editingId ? "Save event" : "Add event"}
                </button>
              </div>
            </div>

            <TimelineSection title={`Upcoming (${grouped.upcoming.length})`} events={grouped.upcoming} plants={plants} onEdit={startEdit} onDelete={(id) => setEvents((current) => current.filter((event) => event.id !== id))} />
            <TimelineSection title={`Past (${grouped.past.length})`} events={grouped.past} plants={plants} onEdit={startEdit} onDelete={(id) => setEvents((current) => current.filter((event) => event.id !== id))} />
          </div>

          <FlorageLibraryPanel
            mode="compact"
            title="Embedded Florage CRUD"
            subtitle="Manage linked plants without leaving the timeline page."
          />
        </div>
      </div>
    </div>
  );
}

function TimelineSection({
  title,
  events,
  plants,
  onEdit,
  onDelete,
}: {
  title: string;
  events: TimelineEvent[];
  plants: ReturnType<typeof useFlorageLibrary>["plants"];
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3">
        {events.length === 0 && <p className="text-sm text-muted-foreground">No events in this section yet.</p>}
        {events.map((event) => {
          const plant = plants.find((item) => item.id === event.plantId) || null;
          return (
            <div key={event.id} className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{event.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{event.date} · {event.phase} · owner {event.owner}</div>
                  {plant && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-honey/10 px-2 py-1 text-[11px] text-honey">
                      <Sprout className="h-3 w-3" />
                      {plant.name}
                    </div>
                  )}
                  {event.notes && <p className="mt-2 text-sm text-muted-foreground">{event.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(event)} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(event.id)} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none";
