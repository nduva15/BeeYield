import jsPDF from "jspdf";

export type AssumptionsBlock = {
  region_climate?: string;
  bloom_window?: string;
  hhi_source?: string;
  data_caveats?: string;
};

export type ExportPayload = {
  crop: string;
  hives: number;
  acres: number;
  frame_type: string;
  kgPerFrame: number;
  framesPerHive: number;
  fillPct: number;
  hhi: number;
  region: string;
  notes?: string | null;
  reserve: number;
  grossPerHive: number;
  netPerHive: number;
  ethicalPerHive: number;
  apiaryHarvest: number;
  aiText?: string | null;
  versionLabel?: string;
  assumptions?: AssumptionsBlock | null;
  // Standard vs precision frames/acre
  framesPerAcreStandard?: number | null;
  framesPerAcrePrecision?: number | null;
};

const csvEscape = (v: string | number) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function buildHarvestCSV(p: ExportPayload): string {
  const a = p.assumptions || {};
  const rows: (string | number)[][] = [
    ["Field", "Value"],
    ["Generated", new Date().toISOString()],
    ["Version", p.versionLabel || "current"],
    ["Hives", p.hives],
    ["Crop", p.crop],
    ["Acres", p.acres],
    ["Frame type", p.frame_type],
    ["kg per frame", p.kgPerFrame],
    ["Frames per hive", p.framesPerHive],
    ["Frame fill %", p.fillPct],
    ["HHI", p.hhi],
    ["Region", p.region],
    ["Reserve held back (kg)", p.reserve],
    ["Gross per hive (kg)", p.grossPerHive.toFixed(2)],
    ["Net per hive (kg)", p.netPerHive.toFixed(2)],
    ["Ethical per hive (kg)", p.ethicalPerHive.toFixed(2)],
    ["Apiary total (kg)", p.apiaryHarvest.toFixed(2)],
    ["Frames/acre (standard)", p.framesPerAcreStandard != null ? p.framesPerAcreStandard.toFixed(2) : ""],
    ["Frames/acre (precision)", p.framesPerAcrePrecision != null ? p.framesPerAcrePrecision.toFixed(2) : ""],
    ["Notes", p.notes || ""],
    ["[Assumptions] Region/climate", a.region_climate || ""],
    ["[Assumptions] Bloom window", a.bloom_window || ""],
    ["[Assumptions] HHI source", a.hhi_source || ""],
    ["[Assumptions] Data caveats", a.data_caveats || ""],
    ["AI forecast (markdown)", p.aiText || ""],
  ];
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

export function downloadCSV(p: ExportPayload) {
  const csv = buildHarvestCSV(p);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `beeyield-harvest-${p.crop.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${p.versionLabel || "current"}-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPDF(p: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;

  const ensureRoom = (h: number) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };
  const writeLine = (txt: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 30]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(txt, pageW - margin * 2);
    lines.forEach((ln: string) => {
      ensureRoom(size + 4);
      doc.text(ln, margin, y);
      y += size + 4;
    });
  };

  // Header band
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BeeYield Harvest Forecast", margin, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${new Date().toLocaleString()}  ·  Version: ${p.versionLabel || "current"}`, margin, 56);
  y = 100;

  writeLine("Inputs", 14, true, [180, 100, 0]);
  writeLine(`Hives: ${p.hives}    Crop: ${p.crop}    Acres: ${p.acres}`);
  writeLine(`Frame type: ${p.frame_type} (${p.kgPerFrame} kg/frame)    Frames/hive: ${p.framesPerHive}`);
  writeLine(`Fill: ${p.fillPct}%    HHI: ${p.hhi}    Region: ${p.region}`);
  if (p.notes && p.notes.trim()) {
    y += 4;
    writeLine("Notes", 12, true, [180, 100, 0]);
    writeLine(p.notes.trim(), 10);
  }
  y += 8;

  writeLine("Worked Math (50/50 Ethical Rule)", 14, true, [180, 100, 0]);
  writeLine(`H_frame  = ${p.kgPerFrame} kg × (${p.fillPct}%/100) = ${(p.kgPerFrame * p.fillPct / 100).toFixed(2)} kg/frame`);
  writeLine(`H_gross  = ${p.framesPerHive} × ${(p.kgPerFrame * p.fillPct / 100).toFixed(2)} = ${p.grossPerHive.toFixed(1)} kg/hive`);
  writeLine(`Reserve  (${p.region}) = ${p.reserve} kg → Net = ${p.netPerHive.toFixed(1)} kg`);
  writeLine(`Ethical  = min(50% × gross, net) = ${p.ethicalPerHive.toFixed(1)} kg/hive`);
  writeLine(`Apiary   = ${p.ethicalPerHive.toFixed(1)} × ${p.hives} × (${p.hhi}/100) = ${p.apiaryHarvest.toFixed(0)} kg`, 11, true, [180, 100, 0]);
  if (p.framesPerAcreStandard != null || p.framesPerAcrePrecision != null) {
    y += 4;
    writeLine("Frames per acre", 12, true, [180, 100, 0]);
    if (p.framesPerAcreStandard != null) writeLine(`Standard mode: ${p.framesPerAcreStandard.toFixed(2)} frames/ac (rule-of-thumb)`);
    if (p.framesPerAcrePrecision != null) writeLine(`Precision mode: ${p.framesPerAcrePrecision.toFixed(2)} frames/ac (geometric coverage-based)`);
  }
  y += 8;

  // Assumptions block
  const a = p.assumptions || {};
  const hasAny = a.region_climate || a.bloom_window || a.hhi_source || a.data_caveats;
  writeLine("Assumptions", 14, true, [180, 100, 0]);
  if (!hasAny) {
    writeLine("(No custom assumptions captured for this run.)", 10, false, [120, 120, 120]);
  } else {
    if (a.region_climate) writeLine(`Region / climate: ${a.region_climate}`);
    if (a.bloom_window)   writeLine(`Bloom window:    ${a.bloom_window}`);
    if (a.hhi_source)     writeLine(`HHI source:      ${a.hhi_source}`);
    if (a.data_caveats)   writeLine(`Data caveats:    ${a.data_caveats}`);
  }
  y += 8;

  if (p.aiText) {
    writeLine("Beeyield AI Forecast", 14, true, [180, 100, 0]);
    const plain = p.aiText
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
    writeLine(plain, 10);
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`BeeYield • ${p.versionLabel || "current"} • Page ${i} / ${total}`, pageW - margin, pageH - 20, { align: "right" });
  }

  const fname = `beeyield-harvest-${p.crop.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${p.versionLabel || "current"}-${Date.now()}.pdf`;
  doc.save(fname);
}
