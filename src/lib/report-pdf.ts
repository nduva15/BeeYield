import jsPDF from "jspdf";

/**
 * Shared PDF builder for BeeYield findings reports (inspections and acoustic
 * audits). Produces a downloadable, shareable A4 document with the honey/wax
 * brand colours used across the app.
 */

const HONEY: [number, number, number] = [214, 158, 46];
const INK: [number, number, number] = [38, 32, 24];
const MUTED: [number, number, number] = [120, 110, 96];

export type ReportSection =
  | { type: "kv"; heading: string; rows: [string, string][] }
  | { type: "bars"; heading: string; rows: { label: string; pct: number; note?: string }[] }
  | { type: "text"; heading: string; body: string }
  | { type: "list"; heading: string; items: string[] };

export type ReportDoc = {
  kind: string;
  title: string;
  subtitle: string;
  badge: string;
  fileName: string;
  sections: ReportSection[];
  footer?: string;
};

export function downloadReportPdf(doc: ReportDoc) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const M = 48;
  const W = pageW - M * 2;
  let y = 0;

  const nextPage = () => {
    pdf.addPage();
    y = M;
  };
  const room = (h: number) => {
    if (y + h > pageH - M) nextPage();
  };

  /* ---------------------------------------------------------- header ---- */
  pdf.setFillColor(...INK);
  pdf.rect(0, 0, pageW, 92, "F");
  pdf.setTextColor(...HONEY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("BeeYield", M, 40);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.text(doc.title, M, 62);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(215, 205, 190);
  pdf.text(doc.subtitle, M, 78);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...HONEY);
  pdf.text(doc.badge, pageW - M, 40, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(215, 205, 190);
  pdf.text(`Generated ${new Date().toLocaleString()}`, pageW - M, 56, { align: "right" });

  y = 122;

  const heading = (text: string) => {
    room(40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...INK);
    pdf.text(text.toUpperCase(), M, y);
    pdf.setDrawColor(...HONEY);
    pdf.setLineWidth(1.2);
    pdf.line(M, y + 5, M + W, y + 5);
    y += 22;
  };

  for (const section of doc.sections) {
    heading(section.heading);

    if (section.type === "kv") {
      pdf.setFontSize(9.5);
      const colW = W / 2;
      let col = 0;
      for (const [k, v] of section.rows) {
        room(20);
        const x = M + col * colW;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...MUTED);
        pdf.text(k, x, y);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...INK);
        const value = pdf.splitTextToSize(String(v), colW - 100)[0] ?? "";
        pdf.text(value, x + colW - 12, y, { align: "right" });
        if (col === 1) y += 17;
        col = col === 0 ? 1 : 0;
      }
      if (col === 1) y += 17;
      y += 8;
    }

    if (section.type === "bars") {
      for (const row of section.rows) {
        room(38);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...INK);
        pdf.text(row.label, M, y);
        pdf.setTextColor(...HONEY);
        pdf.text(`${Math.round(row.pct)}%`, M + W, y, { align: "right" });
        pdf.setFillColor(232, 226, 214);
        pdf.rect(M, y + 5, W, 6, "F");
        pdf.setFillColor(...HONEY);
        pdf.rect(M, y + 5, Math.max(2, (W * Math.min(100, Math.max(0, row.pct))) / 100), 6, "F");
        y += 17;
        if (row.note) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(...MUTED);
          for (const line of pdf.splitTextToSize(row.note, W) as string[]) {
            room(12);
            pdf.text(line, M, y);
            y += 11;
          }
        }
        y += 6;
      }
      y += 4;
    }

    if (section.type === "text") {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...INK);
      const clean = section.body.replace(/[*#`>]/g, "").replace(/\r/g, "");
      for (const para of clean.split("\n")) {
        if (!para.trim()) {
          y += 6;
          continue;
        }
        for (const line of pdf.splitTextToSize(para.trim(), W) as string[]) {
          room(14);
          pdf.text(line, M, y);
          y += 13;
        }
      }
      y += 10;
    }

    if (section.type === "list") {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...INK);
      if (section.items.length === 0) {
        room(14);
        pdf.setTextColor(...MUTED);
        pdf.text("None recorded", M, y);
        y += 16;
      }
      for (const item of section.items) {
        for (const [i, line] of (pdf.splitTextToSize(item, W - 14) as string[]).entries()) {
          room(14);
          if (i === 0) {
            pdf.setFillColor(...HONEY);
            pdf.circle(M + 3, y - 3, 2, "F");
          }
          pdf.text(line, M + 14, y);
          y += 13;
        }
      }
      y += 10;
    }
  }

  /* --------------------------------------------------------- footers ---- */
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(doc.footer ?? "BeeYield — apiary intelligence. Acoustic and visual findings support, not replace, physical inspection.", M, pageH - 24);
    pdf.text(`Page ${p} of ${pages}`, pageW - M, pageH - 24, { align: "right" });
  }

  pdf.save(doc.fileName);
}

export const safeName = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
