from __future__ import annotations

from datetime import date, datetime, timedelta
import math
from typing import Any, Optional

from app.db.supabase_db import db_select
from app.services.weather_summary_service import fetch_provider_weather


CROP_BASELINES: dict[str, dict[str, float]] = {
    "general": {"yield_per_hive_day": 0.045, "vegetation_bias": 0.6},
    "acacia": {"yield_per_hive_day": 0.052, "vegetation_bias": 0.7},
    "avocado": {"yield_per_hive_day": 0.061, "vegetation_bias": 0.72},
    "coffee": {"yield_per_hive_day": 0.058, "vegetation_bias": 0.68},
    "citrus": {"yield_per_hive_day": 0.057, "vegetation_bias": 0.69},
    "macadamia": {"yield_per_hive_day": 0.064, "vegetation_bias": 0.74},
    "sunflower": {"yield_per_hive_day": 0.05, "vegetation_bias": 0.66},
    "wildflower": {"yield_per_hive_day": 0.048, "vegetation_bias": 0.65},
}


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _to_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    if value in (None, ""):
        return default
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if number != number:
        return default
    return number


def _to_date(value: Any) -> Optional[date]:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _uniq_strings(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        text = str(value or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        ordered.append(text)
    return ordered


def _normalize_crop_profile(value: Any) -> str:
    raw = str(value or "general").strip().lower()
    return raw if raw in CROP_BASELINES else "general"


def _normalize_density_score(value: Any) -> Optional[float]:
    number = _to_float(value)
    if number is None:
        return None
    if number <= 1:
        return _clamp(number, 0.0, 1.0)
    return _clamp(number / 100.0, 0.0, 1.0)


def _pick_activity_value(row: dict[str, Any]) -> Optional[float]:
    readings = row.get("readings") if isinstance(row.get("readings"), dict) else {}
    merged = {**readings, **row}

    pct_keys = ("bee_activity_pct", "activity_pct", "bee_activity", "activity")
    for key in pct_keys:
        number = _to_float(merged.get(key))
        if number is None:
            continue
        if 0 <= number <= 1:
            return number * 100.0
        if 0 <= number <= 100:
            return number

    vpm_keys = ("vpm", "visits_per_minute", "activity_vpm")
    for key in vpm_keys:
        number = _to_float(merged.get(key))
        if number is None:
            continue
        return _clamp(number * 3.2, 0.0, 100.0)

    return None


def _label_for_location(apiary: Optional[dict[str, Any]], latitude: float, longitude: float) -> str:
    if apiary:
        name = str(apiary.get("name") or "Apiary").strip()
        location_name = str(apiary.get("location_name") or "").strip()
        return f"{name} - {location_name}" if location_name else name
    return f"{latitude:.5f}, {longitude:.5f}"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_km = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    return 2 * radius_km * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def _get_relevant_user_ids(user_id: str, token: Optional[str]) -> list[str]:
    relevant = [user_id]
    farmers = await db_select("farmers", filters={"user_id": user_id}, limit=1, token=token)
    if farmers and farmers[0].get("id"):
        relevant.append(str(farmers[0]["id"]))
    return _uniq_strings(relevant)


async def _get_accessible_apiaries(user_id: str, token: Optional[str]) -> list[dict[str, Any]]:
    relevant_ids = await _get_relevant_user_ids(user_id, token)
    owned = await db_select("apiaries", filters={"user_id": relevant_ids}, order_by="created_at", ascending=False, token=token)

    if not owned and len(relevant_ids) > 1:
        owned = await db_select("apiaries", filters={"farmer_id": relevant_ids[1]}, order_by="created_at", ascending=False, token=token)

    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
    shared_ids = _uniq_strings([row.get("apiary_id") for row in shares or []])
    shared = await db_select("apiaries", filters={"id": shared_ids}, token=token) if shared_ids else []

    seen: set[str] = set()
    combined: list[dict[str, Any]] = []
    for row in [*(owned or []), *(shared or [])]:
        row_id = str(row.get("id") or "")
        if not row_id or row_id in seen:
            continue
        seen.add(row_id)
        combined.append(row)
    return combined


def _resolve_context_apiary(
    accessible_apiaries: list[dict[str, Any]],
    apiary_id: Optional[str],
    latitude: float,
    longitude: float,
) -> tuple[Optional[dict[str, Any]], Optional[float]]:
    if apiary_id:
        for apiary in accessible_apiaries:
            if str(apiary.get("id")) == str(apiary_id):
                return apiary, 0.0
        raise ValueError("Selected apiary is not accessible for this account.")

    closest_apiary: Optional[dict[str, Any]] = None
    closest_distance_km: Optional[float] = None
    for apiary in accessible_apiaries:
        apiary_lat = _to_float(apiary.get("latitude"))
        apiary_lng = _to_float(apiary.get("longitude"))
        if apiary_lat is None or apiary_lng is None:
            continue
        distance = _haversine_km(latitude, longitude, apiary_lat, apiary_lng)
        if closest_distance_km is None or distance < closest_distance_km:
            closest_apiary = apiary
            closest_distance_km = distance

    if closest_apiary and closest_distance_km is not None and closest_distance_km <= 25:
        return closest_apiary, closest_distance_km
    return None, closest_distance_km


def _weather_score(provider_weather: Optional[dict[str, Any]]) -> tuple[float, str, dict[str, Any]]:
    current = (provider_weather or {}).get("current") or {}
    temperature = _to_float(current.get("temperature_c"))
    humidity = _to_float(current.get("humidity_pct"))
    wind_speed = _to_float(current.get("wind_speed_kmh"))
    cloud_cover = _to_float(current.get("cloud_cover_pct"), 35.0) or 35.0

    temp_score = 56.0 if temperature is None else _clamp(100.0 - abs(temperature - 26.0) * 6.0, 18.0, 100.0)
    humidity_score = 62.0 if humidity is None else _clamp(100.0 - abs(humidity - 58.0) * 2.2, 20.0, 100.0)
    wind_score = 66.0 if wind_speed is None else _clamp(100.0 - max(0.0, wind_speed - 8.0) * 4.2, 18.0, 100.0)
    cloud_score = _clamp(100.0 - max(0.0, cloud_cover - 55.0) * 0.9, 35.0, 100.0)

    score = round((temp_score * 0.38) + (humidity_score * 0.26) + (wind_score * 0.24) + (cloud_score * 0.12), 1)
    if score >= 72:
        status = "Optimal"
    elif score >= 52:
        status = "Watch"
    else:
        status = "Constrained"

    return score, status, current


def _vegetation_score(
    crop_profile: str,
    apiary: Optional[dict[str, Any]],
    forage_zones: list[dict[str, Any]],
) -> tuple[float, str]:
    crop_meta = CROP_BASELINES[crop_profile]
    bias = crop_meta["vegetation_bias"]

    zone_scores = [
        density
        for density in (_normalize_density_score(zone.get("density_score")) for zone in forage_zones)
        if density is not None
    ]
    zone_component = sum(zone_scores) / len(zone_scores) if zone_scores else None

    primary_forage = str((apiary or {}).get("primary_forage") or (apiary or {}).get("forage_type") or "").lower()
    forage_match_bonus = 0.08 if primary_forage and crop_profile in primary_forage else 0.0
    acreage_bonus = min((_to_float((apiary or {}).get("size_acres"), 0.0) or 0.0) / 120.0, 0.06)

    normalized = (
        (zone_component if zone_component is not None else bias) * 0.62
        + bias * 0.3
        + forage_match_bonus
        + acreage_bonus
    )
    score = round(_clamp(normalized * 100.0, 28.0, 94.0), 1)

    detail = (
        f"{len(zone_scores)} forage zone densities blended with {crop_profile.upper()} profile"
        if zone_scores
        else f"{crop_profile.upper()} crop baseline used because no forage zones were saved"
    )
    return score, detail


def _history_baseline(
    harvest_rows: list[dict[str, Any]],
    date_from: date,
    date_to: date,
    active_hives: int,
    crop_profile: str,
) -> tuple[float, int, float, Optional[float]]:
    window_days = max(1, (date_to - date_from).days + 1)
    harvest_points: list[tuple[date, float]] = []
    for row in harvest_rows:
        harvest_date = _to_date(row.get("harvest_date") or row.get("date"))
        quantity_kg = _to_float(row.get("quantity_kg"), 0.0) or 0.0
        if not harvest_date or quantity_kg <= 0:
            continue
        harvest_points.append((harvest_date, quantity_kg))

    harvest_points.sort(key=lambda item: item[0])
    harvest_count = len(harvest_points)
    recent_cutoff = date.today() - timedelta(days=365)
    recent_total_kg = sum(quantity for harvest_date, quantity in harvest_points if harvest_date >= recent_cutoff)

    if harvest_points:
        earliest = harvest_points[0][0]
        latest = harvest_points[-1][0]
        observed_days = max(365, (latest - earliest).days + 1)
        annualized_total = recent_total_kg if recent_total_kg > 0 else (sum(quantity for _, quantity in harvest_points) / observed_days) * 365.0
        base_expected_kg = (annualized_total / 365.0) * window_days
    else:
        baseline_per_hive_day = CROP_BASELINES[crop_profile]["yield_per_hive_day"]
        base_expected_kg = active_hives * baseline_per_hive_day * window_days

    comparable_end = date_from - timedelta(days=1)
    comparable_start = comparable_end - timedelta(days=window_days - 1)
    comparable_total = sum(
        quantity
        for harvest_date, quantity in harvest_points
        if comparable_start <= harvest_date <= comparable_end
    )

    return round(base_expected_kg, 2), harvest_count, round(recent_total_kg, 2), (round(comparable_total, 2) if comparable_total > 0 else None)


def _activity_score(
    sensor_rows: list[dict[str, Any]],
    bee_activity_pct: Optional[float],
) -> tuple[float, int, str]:
    if bee_activity_pct is not None:
        normalized = _clamp(bee_activity_pct, 0.0, 100.0)
        return round(normalized, 1), 0, "Manual field activity override"

    values = [
        score
        for score in (_pick_activity_value(row) for row in sensor_rows)
        if score is not None
    ]
    if not values:
        return 56.0, 0, "No recent bee activity packets; dashboard baseline applied"

    average_value = sum(values) / len(values)
    return round(_clamp(average_value, 12.0, 98.0), 1), len(values), f"{len(values)} sensor packets blended into activity score"


def _history_score(harvest_count: int, recent_total_kg: float) -> float:
    score = 34.0 + min(28.0, harvest_count * 4.5) + min(32.0, recent_total_kg * 0.18)
    return round(_clamp(score, 18.0, 94.0), 1)


def _build_timeline(
    date_from: date,
    date_to: date,
    expected_yield_kg: float,
    low_kg: float,
    high_kg: float,
    activity_score: float,
    weather_score: float,
    vegetation_score: float,
) -> list[dict[str, Any]]:
    total_days = max(1, (date_to - date_from).days + 1)
    point_count = min(12, total_days)
    if point_count == 1:
        weights = [1.0]
    else:
        weights = []
        for index in range(point_count):
            position = index / (point_count - 1)
            wave = 0.88 + 0.16 * math.sin(position * math.pi) + 0.07 * math.cos(position * math.pi * 2)
            weights.append(max(0.2, wave))
        total_weight = sum(weights) or 1.0
        weights = [weight / total_weight for weight in weights]

    timeline: list[dict[str, Any]] = []
    step = max(1, round(total_days / point_count))
    for index, weight in enumerate(weights):
        point_date = min(date_to, date_from + timedelta(days=index * step))
        drift = (index - ((point_count - 1) / 2)) * 1.5
        timeline.append(
            {
                "date": point_date.isoformat(),
                "yield_kg": round(expected_yield_kg * weight, 2),
                "lower_kg": round(low_kg * weight, 2),
                "upper_kg": round(high_kg * weight, 2),
                "activity_index": round(_clamp(activity_score + drift, 0.0, 100.0), 1),
                "weather_index": round(_clamp(weather_score - (drift * 0.6), 0.0, 100.0), 1),
                "vegetation_index": round(_clamp(vegetation_score + (abs(drift) * 0.5), 0.0, 100.0), 1),
            }
        )
    return timeline


def _impact(score: float, positive_threshold: float = 70.0, neutral_threshold: float = 52.0) -> str:
    if score >= positive_threshold:
        return "positive"
    if score >= neutral_threshold:
        return "neutral"
    return "negative"


async def build_yield_forecast(
    *,
    user_id: str,
    token: Optional[str],
    apiary_id: Optional[str],
    latitude: Optional[float],
    longitude: Optional[float],
    date_from: date,
    date_to: date,
    radius_m: int,
    vegetation_index: str,
    crop_profile: str,
    bee_activity_pct: Optional[float],
) -> dict[str, Any]:
    if latitude is None or longitude is None:
        raise ValueError("Latitude and longitude are required.")

    if date_to < date_from:
        raise ValueError("Date range is invalid.")

    crop_profile = _normalize_crop_profile(crop_profile)
    accessible_apiaries = await _get_accessible_apiaries(user_id, token)
    selected_apiary, nearest_distance_km = _resolve_context_apiary(accessible_apiaries, apiary_id, latitude, longitude)

    if selected_apiary:
        latitude = _to_float(selected_apiary.get("latitude"), latitude) or latitude
        longitude = _to_float(selected_apiary.get("longitude"), longitude) or longitude

    context_apiary_ids = [str(selected_apiary["id"])] if selected_apiary else _uniq_strings([apiary.get("id") for apiary in accessible_apiaries])
    hives = await db_select("hives", filters={"apiary_id": context_apiary_ids}, limit=1000, token=token) if context_apiary_ids else []
    harvests = await db_select("harvests", filters={"apiary_id": context_apiary_ids}, limit=1000, order_by="harvest_date", ascending=False, token=token) if context_apiary_ids else []
    forage_zones = await db_select("forage_zones", filters={"apiary_id": context_apiary_ids}, limit=1000, token=token) if context_apiary_ids else []

    hive_ids = _uniq_strings([hive.get("id") for hive in hives])
    sensor_rows = await db_select("sensor_readings", filters={"hive_id": hive_ids}, limit=500, order_by="timestamp", ascending=False, token=token) if hive_ids else []

    active_hives = len([hive for hive in hives if "inactive" not in str(hive.get("status") or "").lower()])
    if active_hives <= 0:
        active_hives = int(_to_float((selected_apiary or {}).get("expected_hives"), 0.0) or 0)
    if active_hives <= 0:
        active_hives = max(6, math.ceil(len(accessible_apiaries) * 2.5)) if accessible_apiaries else 12

    provider_weather = await fetch_provider_weather(latitude, longitude)
    weather_score, weather_status, current_weather = _weather_score(provider_weather)
    vegetation_score, vegetation_detail = _vegetation_score(crop_profile, selected_apiary, forage_zones)
    activity_score, sensor_sample_count, activity_detail = _activity_score(sensor_rows, bee_activity_pct)

    base_expected_kg, harvest_count, recent_total_kg, comparable_total = _history_baseline(
        harvests,
        date_from,
        date_to,
        active_hives,
        crop_profile,
    )
    history_score = _history_score(harvest_count, recent_total_kg)

    composite_score = round(
        (vegetation_score * 0.34)
        + (weather_score * 0.24)
        + (activity_score * 0.24)
        + (history_score * 0.18),
        1,
    )

    modifier = (
        0.52
        + (vegetation_score / 100.0) * 0.22
        + (weather_score / 100.0) * 0.14
        + (activity_score / 100.0) * 0.12
        + (history_score / 100.0) * 0.08
    )
    expected_yield_kg = round(max(4.0, base_expected_kg * modifier), 2)

    confidence_pct = round(
        _clamp(
            36.0
            + (18.0 if provider_weather else 0.0)
            + min(18.0, harvest_count * 3.0)
            + min(18.0, sensor_sample_count * 1.2)
            + (10.0 if selected_apiary else 4.0),
            38.0,
            96.0,
        ),
        1,
    )
    uncertainty_band = 0.14 + ((100.0 - confidence_pct) / 150.0)
    low_kg = round(expected_yield_kg * (1.0 - uncertainty_band), 2)
    high_kg = round(expected_yield_kg * (1.0 + uncertainty_band), 2)

    yield_per_hive_kg = round(expected_yield_kg / max(active_hives, 1), 2)
    size_acres = _to_float((selected_apiary or {}).get("size_acres"))
    yield_per_acre_kg = round(expected_yield_kg / size_acres, 2) if size_acres and size_acres > 0 else None
    delta_pct = (
        round(((expected_yield_kg - comparable_total) / comparable_total) * 100.0, 1)
        if comparable_total and comparable_total > 0
        else None
    )

    location_label = _label_for_location(selected_apiary, latitude, longitude)
    recommendations: list[str] = []
    if vegetation_score < 55:
        recommendations.append("Vegetation signal is soft. Tighten forage zoning or narrow the analysis radius to the strongest bloom blocks.")
    if weather_score < 55:
        recommendations.append("Weather is suppressing flight efficiency. Use shorter harvest expectations until wind and humidity normalize.")
    if activity_score < 55:
        recommendations.append("Bee activity is running below target. Check hive entrances, queen performance, and morning forage access.")
    if harvest_count < 3:
        recommendations.append("Forecast confidence is limited by sparse harvest history. Logging more harvest batches will tighten the range.")
    if not recommendations:
        recommendations.append("Signals are aligned. Use the upper band for stretch planning and the central forecast for operational commitments.")

    drivers = [
        {
            "label": f"{vegetation_index.upper()} vegetation signal",
            "impact": _impact(vegetation_score),
            "value": f"{vegetation_score:.0f}/100",
            "detail": vegetation_detail,
        },
        {
            "label": "Weather window",
            "impact": _impact(weather_score),
            "value": weather_status,
            "detail": f"{current_weather.get('condition') or 'Live weather'} at {current_weather.get('temperature_c') or 'n/a'}°C and {current_weather.get('humidity_pct') or 'n/a'}% humidity",
        },
        {
            "label": "Bee activity",
            "impact": _impact(activity_score),
            "value": f"{activity_score:.0f}%",
            "detail": activity_detail,
        },
        {
            "label": "Harvest history",
            "impact": _impact(history_score, positive_threshold=64.0, neutral_threshold=44.0),
            "value": f"{harvest_count} records",
            "detail": f"{recent_total_kg:.1f} kg logged across the last 365 days",
        },
    ]

    source_statuses = [
        {
            "key": "vegetation",
            "label": "Vegetation",
            "status": "available" if forage_zones or selected_apiary else "baseline",
            "detail": vegetation_detail,
        },
        {
            "key": "weather",
            "label": "Weather",
            "status": "available" if provider_weather else "unavailable",
            "detail": f"{(provider_weather or {}).get('provider') or 'open-meteo'} weather feed",
        },
        {
            "key": "activity",
            "label": "Bee activity",
            "status": "available" if bee_activity_pct is not None or sensor_sample_count > 0 else "baseline",
            "detail": activity_detail,
        },
        {
            "key": "history",
            "label": "Harvest history",
            "status": "available" if harvest_count > 0 else "baseline",
            "detail": f"{harvest_count} harvest records in forecast context",
        },
    ]

    return {
        "location": {
            "label": location_label,
            "latitude": round(latitude, 6),
            "longitude": round(longitude, 6),
            "source": "apiary" if apiary_id else "manual",
            "apiary_id": str(selected_apiary["id"]) if selected_apiary else None,
            "apiary_name": selected_apiary.get("name") if selected_apiary else None,
            "nearest_apiary_distance_km": round(nearest_distance_km, 2) if nearest_distance_km is not None else None,
        },
        "analysis_window": {
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "days": max(1, (date_to - date_from).days + 1),
            "radius_m": radius_m,
            "vegetation_index": vegetation_index.upper(),
            "crop_profile": crop_profile,
            "bee_activity_pct": round(_clamp(bee_activity_pct, 0.0, 100.0), 1) if bee_activity_pct is not None else None,
        },
        "forecast": {
            "expected_yield_kg": expected_yield_kg,
            "low_kg": low_kg,
            "high_kg": high_kg,
            "confidence_pct": confidence_pct,
            "yield_per_hive_kg": yield_per_hive_kg,
            "yield_per_acre_kg": yield_per_acre_kg,
            "forecast_score": composite_score,
        },
        "comparisons": {
            "last_period_yield_kg": comparable_total,
            "delta_pct": delta_pct,
            "active_hives": active_hives,
            "harvest_count": harvest_count,
            "sensor_samples": sensor_sample_count,
        },
        "signals": {
            "vegetation_score": vegetation_score,
            "weather_score": weather_score,
            "activity_score": activity_score,
            "history_score": history_score,
            "source_statuses": source_statuses,
        },
        "timeline": _build_timeline(
            date_from=date_from,
            date_to=date_to,
            expected_yield_kg=expected_yield_kg,
            low_kg=low_kg,
            high_kg=high_kg,
            activity_score=activity_score,
            weather_score=weather_score,
            vegetation_score=vegetation_score,
        ),
        "drivers": drivers,
        "recommendations": recommendations,
        "weather": {
            "current": current_weather,
            "status": weather_status,
        },
        "map": {
            "center": {"lat": round(latitude, 6), "lng": round(longitude, 6)},
            "radius_m": radius_m,
        },
    }
