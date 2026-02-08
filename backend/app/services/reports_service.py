"""
Reports & Exports service: background report generation using Pandas and ReportLab.
Heavy work runs in background to avoid blocking the API.
"""
import io
import os
from datetime import datetime, timedelta
from typing import Any, Optional
import pandas as pd
from app.db.supabase_db import db_select, db_update

# Report types and file formats
REPORT_TYPES = ("harvest_yield", "health_audit", "sensor_logs", "pollination_cert", "financial")
FILE_FORMATS = ("pdf", "csv", "xlsx")
BUCKET = "user-reports"


def _apply_date_filter(rows: list, start: Optional[str], end: Optional[str], date_key: str) -> list:
    """Filter rows by start/end date (inclusive). date_key e.g. 'harvest_date', 'inspection_date', 'recorded_at'."""
    if not start and not end:
        return rows
    out = []
    for r in rows:
        val = r.get(date_key)
        if not val:
            continue
        if start and str(val) < start:
            continue
        if end and str(val) > end:
            continue
        out.append(r)
    return out


def _get_accessible_apiary_ids(user_id: str) -> list:
    """Return list of apiary IDs the user can access (owned + shared)."""
    owned = db_select("apiaries", filters={"user_id": user_id}, limit=5000)
    ids = [a["id"] for a in owned]
    shares = db_select("apiary_shares", filters={"shared_with_user_id": user_id}, limit=5000)
    for s in shares:
        if s["apiary_id"] not in ids:
            ids.append(s["apiary_id"])
    return ids


def _fetch_harvests(user_id: str, apiary_id: Optional[str], start: Optional[str], end: Optional[str]) -> list:
    apiary_ids = [apiary_id] if apiary_id else _get_accessible_apiary_ids(user_id)
    if not apiary_ids:
        return []
    harvests = db_select("harvests", filters={"apiary_id": apiary_ids}, limit=5000, order_by="harvest_date", ascending=False)
    # Filter by user (harvests may not have user_id in all schemas; they're per-apiary)
    harvests = [h for h in harvests if h.get("apiary_id") in apiary_ids]
    return _apply_date_filter(harvests, start, end, "harvest_date")


def _fetch_inspections(user_id: str, apiary_id: Optional[str], start: Optional[str], end: Optional[str]) -> list:
    apiary_ids = [apiary_id] if apiary_id else _get_accessible_apiary_ids(user_id)
    if not apiary_ids:
        return []
    inspections = db_select("inspections", filters={"apiary_id": apiary_ids}, limit=5000, order_by="inspection_date", ascending=False)
    return _apply_date_filter(inspections, start, end, "inspection_date")


def _fetch_sensor_readings(user_id: str, apiary_id: Optional[str], start: Optional[str], end: Optional[str]) -> list:
    # sensor_readings may be keyed by hive_id; get hives for apiary first
    apiary_ids = [apiary_id] if apiary_id else _get_accessible_apiary_ids(user_id)
    if not apiary_ids:
        return []
    hives = db_select("hives", filters={"apiary_id": apiary_ids}, limit=2000)
    hive_ids = [h["id"] for h in hives]
    if not hive_ids:
        return []
    readings = db_select("sensor_readings", filters={"hive_id": hive_ids}, limit=10000, order_by="recorded_at", ascending=False)
    return _apply_date_filter(readings, start, end, "recorded_at")


def _build_yield_summary_df(harvests: list) -> pd.DataFrame:
    if not harvests:
        return pd.DataFrame(columns=["honey_type", "quantity_kg", "harvest_count"])
    df = pd.DataFrame(harvests)
    if "quantity_kg" not in df.columns:
        df["quantity_kg"] = df["quantity_left_for_bees_kg"] if "quantity_left_for_bees_kg" in df.columns else 0
    honey_col = df["honey_type"].fillna("Multi-flower") if "honey_type" in df.columns else pd.Series(["Multi-flower"] * len(df), index=df.index)
    agg = df.groupby(honey_col).agg(
        quantity_kg=("quantity_kg", "sum"),
        harvest_count=("id", "count")
    ).reset_index()
    agg.columns = ["honey_type", "quantity_kg", "harvest_count"]
    return agg


def _build_health_audit_df(inspections: list) -> pd.DataFrame:
    if not inspections:
        return pd.DataFrame()
    df = pd.DataFrame(inspections)
    return df


def _upload_to_storage(user_id: str, report_id: str, file_ext: str, file_bytes: bytes, content_type: str) -> str:
    """Upload file to Supabase Storage. Returns storage path (e.g. user_id/report_id.pdf)."""
    path = f"{user_id}/{report_id}.{file_ext}"
    supabase = __import__("app.db.supabase_db", fromlist=["get_supabase"]).get_supabase()
    if not supabase:
        # Fallback: write to static/reports and return relative path for local serving
        report_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../static/reports"))
        os.makedirs(report_dir, exist_ok=True)
        local_path = os.path.join(report_dir, f"{report_id}.{file_ext}")
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        return f"static/reports/{report_id}.{file_ext}"
    try:
        supabase.storage.from_(BUCKET).upload(
            path,
            file_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        return path
    except Exception as e:
        # Fallback to local
        report_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../static/reports"))
        os.makedirs(report_dir, exist_ok=True)
        local_path = os.path.join(report_dir, f"{report_id}.{file_ext}")
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        return f"static/reports/{report_id}.{file_ext}"


def _generate_pollination_certificate_pdf(params: dict, harvests: list, inspections: list, output_buffer: io.BytesIO) -> None:
    """Generate Pollination Certificate PDF using ReportLab (PRD special format)."""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    gold = colors.HexColor("#F4D03F")
    dark_green = colors.HexColor("#1B9157")

    title_style = ParagraphStyle(
        "CertTitle", parent=styles["Heading1"], fontSize=20, textColor=dark_green, alignment=1, spaceAfter=12
    )
    elements = []

    elements.append(Paragraph("POLLINATION CERTIFICATE", title_style))
    elements.append(Paragraph("BeeYield — Hive Presence Verification for Farmers", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    apiary_name = params.get("apiary_name") or "All Apiaries"
    start = params.get("start") or "N/A"
    end = params.get("end") or "N/A"
    elements.append(Paragraph(f"<b>Location / Apiary:</b> {apiary_name}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Period:</b> {start} to {end}", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))

    hive_count = len({h.get("hive_id") or h.get("id") for h in (harvests + inspections) if h.get("hive_id") or h.get("id")})
    if not hive_count and harvests:
        hive_count = len({h.get("hive_id") for h in harvests if h.get("hive_id")})
    if not hive_count and inspections:
        hive_count = len({i.get("hive_id") for i in inspections if i.get("hive_id")})

    elements.append(Paragraph(
        f"This certifies that BeeYield-managed hives were present and active for pollination services "
        f"during the stated period. Total hive-units represented: <b>{hive_count or 'N/A'}</b>.",
        styles["Normal"]
    ))
    elements.append(Spacer(1, 0.3 * inch))

    if harvests:
        elements.append(Paragraph("Harvest summary (quantity by honey type)", styles["Heading2"]))
        df = _build_yield_summary_df(harvests)
        table_data = [["Honey Type", "Quantity (kg)", "Harvests"]] + [
            [str(r["honey_type"]), f"{r['quantity_kg']:.1f}", str(r["harvest_count"])]
            for _, r in df.iterrows()
        ]
        t = Table(table_data, colWidths=[2.5 * inch, 1.5 * inch, 1 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), dark_green), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTSIZE", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        elements.append(t)

    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(
        "Generated by BeeYield. This document serves as proof of hive presence for pollination agreements.",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey)
    ))
    doc.build(elements)


def _generate_yield_pdf(df: pd.DataFrame, params: dict, output_buffer: io.BytesIO) -> None:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    dark_green = colors.HexColor("#1B9157")
    elements = []
    elements.append(Paragraph("Harvest Yield Report", ParagraphStyle("Title", parent=styles["Heading1"], fontSize=18, textColor=dark_green)))
    elements.append(Paragraph(f"Period: {params.get('start', 'N/A')} to {params.get('end', 'N/A')}", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))

    if df.empty:
        elements.append(Paragraph("No harvest data in the selected period.", styles["Normal"]))
    else:
        table_data = [["Honey Type", "Quantity (kg)", "Harvests"]] + [
            [str(r["honey_type"]), f"{r['quantity_kg']:.1f}", str(r["harvest_count"])] for _, r in df.iterrows()
        ]
        t = Table(table_data, colWidths=[2.5 * inch, 1.5 * inch, 1 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), dark_green), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTSIZE", (0, 0), (-1, -1), 10), ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        elements.append(t)
    doc.build(elements)


def _generate_health_audit_pdf(df: pd.DataFrame, params: dict, output_buffer: io.BytesIO) -> None:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    dark_green = colors.HexColor("#1B9157")
    elements = []
    elements.append(Paragraph("Apiary Health Audit", ParagraphStyle("Title", parent=styles["Heading1"], fontSize=18, textColor=dark_green)))
    elements.append(Paragraph(f"Period: {params.get('start', 'N/A')} to {params.get('end', 'N/A')}", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))

    if df.empty:
        elements.append(Paragraph("No inspection data in the selected period.", styles["Normal"]))
    else:
        cols = [c for c in ["inspection_date", "hive_code", "queen_seen", "diagnosis", "notes"] if c in df.columns][:5]
        if not cols:
            cols = list(df.columns)[:5]
        table_data = [cols] + [[str(row.get(c, ""))[:30] for c in cols] for _, row in df.head(50).iterrows()]
        col_width = 1.4 * inch
        t = Table(table_data, colWidths=[col_width] * len(cols))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), dark_green), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTSIZE", (0, 0), (-1, -1), 8), ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        elements.append(t)
    doc.build(elements)


def _generate_sensor_logs_pdf(df: pd.DataFrame, params: dict, output_buffer: io.BytesIO) -> None:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph("Sensor Logs (Raw)", ParagraphStyle("Title", parent=styles["Heading1"], fontSize=18)))
    elements.append(Paragraph(f"Period: {params.get('start', 'N/A')} to {params.get('end', 'N/A')}. Sample of up to 100 rows.", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))

    if df.empty:
        elements.append(Paragraph("No sensor data in the selected period.", styles["Normal"]))
    else:
        df_sample = df.head(100)
        cols = list(df_sample.columns)[:6]
        table_data = [cols] + [[str(row.get(c, ""))[:20] for c in cols] for _, row in df_sample.iterrows()]
        t = Table(table_data, colWidths=[1.0 * inch] * len(cols))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B9157")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTSIZE", (0, 0), (-1, -1), 7), ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        elements.append(t)
    doc.build(elements)


def process_report_logic(report_id: str, user_id: str, params: dict) -> None:
    """
    Background worker: fetch data, generate file (CSV/Excel/PDF), upload to storage, update DB.
    """
    report_type = (params.get("report_type") or "").strip() or "harvest_yield"
    file_format = (params.get("file_format") or "pdf").lower()
    if file_format not in FILE_FORMATS:
        file_format = "pdf"
    apiary_id = params.get("apiary_id")
    start = params.get("start")
    end = params.get("end")

    try:
        if report_type == "harvest_yield":
            harvests = _fetch_harvests(user_id, apiary_id, start, end)
            df = _build_yield_summary_df(harvests)
        elif report_type == "health_audit":
            inspections = _fetch_inspections(user_id, apiary_id, start, end)
            df = _build_health_audit_df(inspections)
        elif report_type == "sensor_logs":
            readings = _fetch_sensor_readings(user_id, apiary_id, start, end)
            df = pd.DataFrame(readings) if readings else pd.DataFrame()
        elif report_type == "pollination_cert":
            harvests = _fetch_harvests(user_id, apiary_id, start, end)
            inspections = _fetch_inspections(user_id, apiary_id, start, end)
            apiary_name = "All Apiaries"
            if apiary_id:
                ap = db_select("apiaries", filters={"id": apiary_id}, limit=1)
                if ap:
                    apiary_name = ap[0].get("name") or apiary_name
            cert_params = {"apiary_name": apiary_name, "start": start, "end": end, **params}
            if file_format == "pdf":
                buf = io.BytesIO()
                _generate_pollination_certificate_pdf(cert_params, harvests, inspections, buf)
                buf.seek(0)
                storage_path = _upload_to_storage(user_id, report_id, "pdf", buf.read(), "application/pdf")
                db_update("generated_reports", {"status": "completed", "storage_path": storage_path}, {"id": report_id})
                return
            df = _build_yield_summary_df(harvests)
        else:
            harvests = _fetch_harvests(user_id, apiary_id, start, end)
            df = _build_yield_summary_df(harvests)

        # Generate file
        file_bytes: bytes
        content_type: str
        ext: str = file_format

        if file_format == "csv":
            buf = io.StringIO()
            df.to_csv(buf, index=False)
            file_bytes = buf.getvalue().encode("utf-8")
            content_type = "text/csv"
        elif file_format == "xlsx":
            buf = io.BytesIO()
            df.to_excel(buf, index=False, engine="openpyxl")
            file_bytes = buf.getvalue()
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            buf = io.BytesIO()
            if report_type == "harvest_yield":
                _generate_yield_pdf(df, params, buf)
            elif report_type == "health_audit":
                _generate_health_audit_pdf(df, params, buf)
            elif report_type == "sensor_logs":
                _generate_sensor_logs_pdf(df, params, buf)
            else:
                _generate_yield_pdf(df, params, buf)
            buf.seek(0)
            file_bytes = buf.read()
            content_type = "application/pdf"

        storage_path = _upload_to_storage(user_id, report_id, ext, file_bytes, content_type)
        db_update("generated_reports", {"status": "completed", "storage_path": storage_path}, {"id": report_id})
    except Exception as e:
        db_update("generated_reports", {"status": "failed"}, {"id": report_id})
        raise
