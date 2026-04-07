from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
import math
from statistics import mean
from typing import Any, Optional

from app.db.supabase_db import db_select
from app.services.weather_summary_service import fetch_provider_weather


CROP_BASELINES: dict[str, dict[str, float]] = {
    "general": {"kg_per_hive_day": 0.045, "vegetation_bias": 0.60, "seasonality": 0.72},
    "acacia": {"kg_per_hive_day": 0.055, "vegetation_bias": 0.71, "seasonality": 0.78},
    "avocado": {"kg_per_hive_day": 0.061, "vegetation_bias": 0.74, "seasonality": 0.82},
    "coffee": {"kg_per_hive_day": 0.058, "vegetation_bias": 0.68, "seasonality": 0.79},
    "citrus": {"kg_per_hive_day": 0.056, "vegetation_bias": 0.70, "seasonality": 0.76},
    "macadamia": {"kg_per_hive_day": 0.064, "vegetation_bias": 0.75, "seasonality": 0.84},
    "sunflower": {"kg_per_hive_day": 0.052, "vegetation_bias": 0.66, "seasonality": 0.74},
    "wildflower": {"kg_per_hive_day": 0.048, "vegetation_bias": 0.65, "seasonality": 0.73},
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


def _to_datetime(value: Any) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
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
    crop = str(value or "general").strip().lower()
    return crop if crop in CROP_BASELINES else "general"


def _normalize_density_score(value: Any) -> Optional[float]:
    score = _to_float(value)
    if score is None:
        return None
    if score <= 1:
        return _clamp(score, 0.0, 1.0)
    return _clamp(score / 100.0, 0.0, 1.0)


def _weighted_mean(pairs: list[tuple[float, float]], default: float = 0.0) -> float:
    if not pairs:
        return default
    total_weight = sum(weight for _, weight in pairs)
    if total_weight <= 0:
        return default
    return sum(value * weight for value, weight in pairs) / total_weight


def _stddev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    avg = sum(values) / len(values)
    variance = sum((value - avg) ** 2 for value in values) / (len(values) - 1)
    return math.sqrt(max(variance, 0.0))


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


def _month_features(point_date: date, trend_index: float, lag1: float, lag3: float) -> list[float]:
    phase = ((point_date.month - 1) / 12.0) * math.tau
    return [1.0, math.sin(phase), math.cos(phase), trend_index, lag1, lag3]


def _solve_linear_system(matrix: list[list[float]], vector: list[float]) -> list[float]:
    n = len(vector)
    augmented = [row[:] + [vector[index]] for index, row in enumerate(matrix)]

    for column in range(n):
        pivot_row = max(range(column, n), key=lambda row: abs(augmented[row][column]))
        pivot_value = augmented[pivot_row][column]
        if abs(pivot_value) < 1e-9:
            continue
        if pivot_row != column:
            augmented[column], augmented[pivot_row] = augmented[pivot_row], augmented[column]

        pivot = augmented[column][column]
        for current_column in range(column, n + 1):
            augmented[column][current_column] /= pivot

        for row in range(n):
            if row == column:
                continue
            factor = augmented[row][column]
            if abs(factor) < 1e-12:
                continue
            for current_column in range(column, n + 1):
                augmented[row][current_column] -= factor * augmented[column][current_column]

    return [augmented[row][n] for row in range(n)]


def _ridge_regression(train_x: list[list[float]], train_y: list[float], weights: list[float], ridge_lambda: float = 0.45) -> list[float]:
    if not train_x:
        return []

    feature_count = len(train_x[0])
    xtwx = [[0.0 for _ in range(feature_count)] for _ in range(feature_count)]
    xtwy = [0.0 for _ in range(feature_count)]

    for row, target, weight in zip(train_x, train_y, weights):
        for i in range(feature_count):
            xtwy[i] += row[i] * target * weight
            for j in range(feature_count):
                xtwx[i][j] += row[i] * row[j] * weight

    for index in range(feature_count):
        xtwx[index][index] += ridge_lambda if index > 0 else ridge_lambda * 0.2

    return _solve_linear_system(xtwx, xtwy)


def _dot(row: list[float], coefficients: list[float]) -> float:
    return sum(a * b for a, b in zip(row, coefficients))


def _pick_activity_value(row: dict[str, Any]) -> Optional[float]:
    readings = row.get("readings") if isinstance(row.get("readings"), dict) else {}
    merged = {**readings, **row}

    for key in ("bee_activity_pct", "activity_pct", "bee_activity", "activity"):
        value = _to_float(merged.get(key))
        if value is None:
            continue
        if 0 <= value <= 1:
            return value * 100.0
        if 0 <= value <= 100:
            return value

    for key in ("vpm", "visits_per_minute", "activity_vpm"):
        value = _to_float(merged.get(key))
        if value is None:
            continue
        return _clamp(value * 3.1, 0.0, 100.0)

    return None


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
    closest_distance: Optional[float] = None
    for apiary in accessible_apiaries:
        apiary_lat = _to_float(apiary.get("latitude"))
        apiary_lng = _to_float(apiary.get("longitude"))
        if apiary_lat is None or apiary_lng is None:
            continue
        distance = _haversine_km(latitude, longitude, apiary_lat, apiary_lng)
        if closest_distance is None or distance < closest_distance:
            closest_apiary = apiary
            closest_distance = distance

    if closest_apiary and closest_distance is not None and closest_distance <= 25:
        return closest_apiary, closest_distance
    return None, closest_distance


def _format_location_label(apiary: Optional[dict[str, Any]], latitude: float, longitude: float) -> str:
    if apiary:
        name = str(apiary.get("name") or "Apiary").strip()
        location_name = str(apiary.get("location_name") or "").strip()
        return f"{name} - {location_name}" if location_name else name
    return f"{latitude:.5f}, {longitude:.5f}"


def _climatology_weather_score(target_date: date, latitude: float) -> float:
    season_wave = math.cos((((target_date.month - 1) / 12.0) * math.tau) - (math.pi / 2))
    hemisphere_sign = -1 if latitude < 0 else 1
    seasonal_bonus = season_wave * 12.0 * hemisphere_sign
    latitude_penalty = min(abs(latitude), 50.0) * 0.35
    return _clamp(74.0 + seasonal_bonus - latitude_penalty, 42.0, 86.0)


def _flight_weather_score(temp_c: Optional[float], humidity_pct: Optional[float], wind_kmh: Optional[float], cloud_cover_pct: Optional[float]) -> float:
    temp_score = 58.0 if temp_c is None else _clamp(100.0 - abs(temp_c - 26.0) * 6.0, 15.0, 100.0)
    humidity_score = 64.0 if humidity_pct is None else _clamp(100.0 - abs(humidity_pct - 58.0) * 2.0, 20.0, 100.0)
    wind_score = 70.0 if wind_kmh is None else _clamp(100.0 - max(0.0, wind_kmh - 8.0) * 4.2, 16.0, 100.0)
    cloud_score = 74.0 if cloud_cover_pct is None else _clamp(100.0 - max(0.0, cloud_cover_pct - 55.0) * 0.85, 34.0, 100.0)
    return round((temp_score * 0.38) + (humidity_score * 0.24) + (wind_score * 0.26) + (cloud_score * 0.12), 1)


def _weather_context(provider_weather: Optional[dict[str, Any]], date_from: date, date_to: date, latitude: float) -> tuple[float, str, dict[str, Any], str]:
    current = (provider_weather or {}).get("current") or {}
    hourly = (provider_weather or {}).get("hourly_forecast") or []

    hourly_scores: list[float] = []
    for point in hourly:
        timestamp = _to_datetime(point.get("timestamp"))
        if not timestamp:
            continue
        if not (date_from <= timestamp.date() <= date_to):
            continue
        hourly_scores.append(
            _flight_weather_score(
                _to_float(point.get("temperature_c")),
                _to_float(point.get("humidity_pct")),
                _to_float(point.get("wind_speed_kmh")),
                _to_float(point.get("cloud_cover_pct")),
            )
        )

    if hourly_scores:
        score = round(sum(hourly_scores) / len(hourly_scores), 1)
        detail = f"{len(hourly_scores)} hourly weather points blended from live provider data"
    elif current:
        score = _flight_weather_score(
            _to_float(current.get("temperature_c")),
            _to_float(current.get("humidity_pct")),
            _to_float(current.get("wind_speed_kmh")),
            _to_float(current.get("cloud_cover_pct")),
        )
        detail = "Current provider weather used as the nearest flight-condition proxy"
    else:
        midpoint = date_from + timedelta(days=max(0, (date_to - date_from).days // 2))
        score = round(_climatology_weather_score(midpoint, latitude), 1)
        detail = "Seasonal climatology prior used because no provider weather was available"

    if score >= 72:
        status = "Optimal"
    elif score >= 55:
        status = "Watch"
    else:
        status = "Constrained"

    return score, status, current, detail
