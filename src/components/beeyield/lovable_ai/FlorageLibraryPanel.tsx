import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, FileUp, Pencil, Plus, RefreshCcw, Search, Sprout, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useFlorageLibrary } from "@/hooks/useFlorageLibrary";
import {
  buildFlorageImportPreview,
  buildFloragePlanSummary,
  createFloragePlant,
  type FlorageImportPreview,
  type FloragePlant,
  type FloragePlantInput,
} from "@/lib/florage";
import { cn } from "@/lib/utils";

type PanelMode = "full" | "compact";

type Props = {
  mode?: PanelMode;
  title?: string;
  subtitle?: string;
  className?: string;
  onSelectPlant?: (plant: FloragePlant) => void;
  selectedId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  coveragePct?: number;
  hives?: number;
};

const EMPTY_FORM: FloragePlantInput = {
  name: "",
  latin: "",
  bloom: "",
  nectar: 7,
  pollen: 7,
  radius: 800,
  notes: "",
  source: "manual",
  region: "",
  tags: "",
};

export default function FlorageLibraryPanel({
  mode = "full",
  title = "Florage Library",
  subtitle = "Validated plants shared across forecast, flight, planning, and MOA tools.",
  className,
  onSelectPlant,
  selectedId,
  dateFrom,
  dateTo,
  coveragePct,
  hives,
}: Props) {
  const { plants, createPlant, editPlant, deletePlant, replaceAll, resetLibrary } = useFlorageLibrary();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FloragePlantInput>(EMPTY_FORM);
  const [importPreview, setImportPreview] = useState<FlorageImportPreview | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(selectedId || null);

  useEffect(() => {
    setActiveId(selectedId || null);
  }, [selectedId]);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return plants;
    return plants.filter((plant) =>
      [plant.name, plant.latin, plant.bloom, plant.region, plant.tags, plant.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [plants, query]);

  const summary = useMemo(() => buildFloragePlanSummary({
    plants,
    dateFrom,
    dateTo,
    coveragePct,
    hives,
  }), [coveragePct, dateFrom, dateTo, hives, plants]);

  const selectedPlant = useMemo(
    () => filteredPlants.find((plant) => plant.id === activeId) || filteredPlants[0] || null,
    [activeId, filteredPlants],
  );

  useEffect(() => {
    if (!selectedPlant) return;
    onSelectPlant?.(selectedPlant);
  }, [onSelectPlant, selectedPlant]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (plant: FloragePlant) => {
    setEditingId(plant.id);
    setForm({
      name: plant.name,
      latin: plant.latin,
      bloom: plant.bloom,
      nectar: plant.nectar,
      pollen: plant.pollen,
      radius: plant.radius,
      notes: plant.notes,
      source: plant.source,
      region: plant.region,
      tags: plant.tags,
    });
  };

  const handleSubmit = () => {
    try {
      if (editingId) {
        editPlant(editingId, form);
        toast.success("Florage plant updated");
      } else {
        const created = createPlant(form);
        setActiveId(created.id);
        toast.success("Florage plant created");
      }
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Validation failed";
      toast.error(message);
    }
  };

  const handleDelete = (plant: FloragePlant) => {
    deletePlant(plant.id);
    if (activeId === plant.id) setActiveId(null);
    if (editingId === plant.id) resetForm();
    toast.success("Florage plant deleted");
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const preview = await buildFlorageImportPreview(file);
      setImportPreview(preview);
      setImportFileName(file.name);
      if (preview.errors.length > 0) {
        toast.error(`Validation failed on ${preview.errors.length} row${preview.errors.length === 1 ? "" : "s"}`);
      } else {
        toast.success(`Validated ${preview.plants.length} CSV row${preview.plants.length === 1 ? "" : "s"}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse CSV";
      toast.error(message);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const commitImport = (replaceExisting: boolean) => {
    if (!importPreview || importPreview.errors.length > 0) return;
    const imported = importPreview.plants.map((plant) => createFloragePlant(plant));
    replaceAll(replaceExisting ? imported : [...plants, ...imported]);
    setImportPreview(null);
    setImportFileName("");
    toast.success(`${replaceExisting ? "Replaced" : "Imported"} ${imported.length} florage row${imported.length === 1 ? "" : "s"}`);
  };

  const compact = mode === "compact";

  return (
    <section className={cn("rounded-2xl border border-border bg-card", className)}>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-honey">
              <Sprout className="h-4 w-4" />
              <h3 className="font-display text-sm font-bold">{title}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              New
            </button>
            <button
              type="button"
              onClick={() => {
                resetLibrary();
                resetForm();
                setImportPreview(null);
                toast.success("Florage library reset to defaults");
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className="mr-1 inline h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className={cn("grid gap-4 p-4", compact ? "lg:grid-cols-[1.2fr_0.9fr]" : "xl:grid-cols-[1.4fr_1fr]")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Plants" value={`${plants.length}`} />
            <Metric label="Weighted score" value={`${summary.weightedScore}`} emphasize />
            <Metric label="Active bloom" value={`${summary.activePlants.length}`} />
            <Metric label="Diversity" value={`${summary.diversityScore}%`} />
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search florage by plant, bloom, region, or notes"
                className="w-full bg-transparent text-sm text-foreground outline-none"
              />
            </label>
          </div>

          {!compact && (
            <div className="rounded-xl border border-dashed border-honey/40 bg-honey/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-honey">CSV import</p>
                  <p className="text-xs text-muted-foreground">
                    Required columns: `name`, `latin`, `bloom`, `nectar`, `pollen`, `radius`. Optional: `notes`, `source`, `region`, `tags`.
                  </p>
                </div>
                <label className="cursor-pointer rounded-lg border border-honey/40 bg-background px-3 py-2 text-xs font-medium text-honey hover:bg-honey/10">
                  <FileUp className="mr-1 inline h-3.5 w-3.5" />
                  {importing ? "Validating..." : "Validate CSV"}
                  <input type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
                </label>
              </div>

              {importPreview && (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{importFileName || "Validated import"}</p>
                      <p className="text-xs text-muted-foreground">
                        {importPreview.plants.length} valid row{importPreview.plants.length === 1 ? "" : "s"} · {importPreview.errors.length} error{importPreview.errors.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {importPreview.errors.length === 0 && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => commitImport(false)} className="rounded-lg border border-honey/40 px-3 py-2 text-xs font-medium text-honey hover:bg-honey/10">
                          Append import
                        </button>
                        <button type="button" onClick={() => commitImport(true)} className="rounded-lg bg-honey px-3 py-2 text-xs font-medium text-black hover:opacity-90">
                          Replace library
                        </button>
                      </div>
                    )}
                  </div>

                  {importPreview.columns.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Columns: {importPreview.columns.join(", ")}
                    </p>
                  )}

                  {importPreview.errors.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                      {importPreview.errors.slice(0, 8).map((error, index) => (
                        <div key={`${error.rowNumber}-${index}`} className="flex items-start gap-2 text-xs text-foreground">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-destructive" />
                          <span>Row {error.rowNumber}: {error.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                      Validation passed. Choose whether to append these rows or replace the current florage library.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Library rows</p>
              <button
                type="button"
                onClick={() => {
                  const csv = [
                    ["name", "latin", "bloom", "nectar", "pollen", "radius", "notes", "source", "region", "tags"],
                    ...filteredPlants.map((plant) => [plant.name, plant.latin, plant.bloom, plant.nectar, plant.pollen, plant.radius, plant.notes, plant.source, plant.region, plant.tags]),
                  ]
                    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `beeyield-florage-${Date.now()}.csv`;
                  link.click();
                  toast.success("Florage CSV exported");
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Download className="mr-1 inline h-3.5 w-3.5" />
                Export
              </button>
            </div>

            <div className="max-h-[28rem] space-y-2 overflow-y-auto custom-scroll">
              {filteredPlants.map((plant) => {
                const isActive = plant.id === selectedPlant?.id;
                return (
                  <div
                    key={plant.id}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      isActive ? "border-honey/50 bg-honey/5" : "border-border bg-muted/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveId(plant.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{plant.name}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{plant.bloom}</span>
                        </div>
                        <div className="mt-1 text-xs italic text-muted-foreground">{plant.latin}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          <span>Nectar {plant.nectar}/10</span>
                          <span>Pollen {plant.pollen}/10</span>
                          <span>{plant.radius} m</span>
                          {plant.region && <span>{plant.region}</span>}
                        </div>
                      </button>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => startEdit(plant)} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(plant)} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {!compact && plant.notes && (
                      <p className="mt-2 text-xs text-muted-foreground">{plant.notes}</p>
                    )}
                  </div>
                );
              })}

              {filteredPlants.length === 0 && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  No plants match the current search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedPlant && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedPlant.name}</p>
                  <p className="text-xs italic text-muted-foreground">{selectedPlant.latin}</p>
                </div>
                <div className="rounded-full bg-honey/10 px-3 py-1 text-[11px] font-semibold text-honey">
                  {selectedPlant.bloom}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Metric label="Nectar" value={`${selectedPlant.nectar}/10`} />
                <Metric label="Pollen" value={`${selectedPlant.pollen}/10`} />
                <Metric label="Radius" value={`${selectedPlant.radius}m`} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{selectedPlant.notes || "No notes for this plant yet."}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{editingId ? "Edit florage plant" : "Create florage plant"}</p>
                <p className="text-xs text-muted-foreground">Changes save into the shared florage library used by every embedded tool panel.</p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Plant name">
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputCls} />
              </Field>
              <Field label="Latin name">
                <input value={form.latin} onChange={(event) => setForm((current) => ({ ...current, latin: event.target.value }))} className={inputCls} />
              </Field>
              <Field label="Bloom window">
                <input value={form.bloom} onChange={(event) => setForm((current) => ({ ...current, bloom: event.target.value }))} className={inputCls} placeholder="Apr-May" />
              </Field>
              <Field label="Region">
                <input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} className={inputCls} />
              </Field>
              <Field label="Nectar score">
                <input type="number" min={0} max={10} value={form.nectar} onChange={(event) => setForm((current) => ({ ...current, nectar: Number(event.target.value) }))} className={inputCls} />
              </Field>
              <Field label="Pollen score">
                <input type="number" min={0} max={10} value={form.pollen} onChange={(event) => setForm((current) => ({ ...current, pollen: Number(event.target.value) }))} className={inputCls} />
              </Field>
              <Field label="Flight radius (m)">
                <input type="number" min={50} max={5000} value={form.radius} onChange={(event) => setForm((current) => ({ ...current, radius: Number(event.target.value) }))} className={inputCls} />
              </Field>
              <Field label="Source">
                <input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} className={inputCls} />
              </Field>
              <Field label="Tags">
                <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className={inputCls} placeholder="orchard, late-season, cover-crop" />
              </Field>
              <Field label="Notes" className="md:col-span-2">
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className={cn(inputCls, "resize-y")} />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={handleSubmit} className="rounded-lg bg-honey px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
                {editingId ? "Save changes" : "Create plant"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Clear form
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Florage-weighted plan</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric label="Nectar avg" value={`${summary.nectarAverage}/10`} />
              <Metric label="Pollen avg" value={`${summary.pollenAverage}/10`} />
              <Metric label="Radius avg" value={`${summary.radiusAverage}m`} />
              <Metric label="Top plants" value={`${summary.dominantPlants.length}`} />
            </div>
            <div className="mt-3 space-y-2">
              {summary.dominantPlants.map((plant) => (
                <div key={plant.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{plant.name}</span> · {plant.bloom} · nectar {plant.nectar}/10 · pollen {plant.pollen}/10
                </div>
              ))}
              {summary.actions.map((action) => (
                <div key={action} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2", emphasize ? "border-honey/40 bg-honey/5" : "border-border bg-background")}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-lg font-bold", emphasize ? "text-honey" : "text-foreground")}>{value}</div>
    </div>
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
