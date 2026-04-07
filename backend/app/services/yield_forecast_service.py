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


def _vegetation_context(
    crop_profile: str,
    radius_m: int,
    apiary: Optional[dict[str, Any]],
    forage_zones: list[dict[str, Any]],
) -> tuple[float, str]:
    crop = CROP_BASELINES[crop_profile]
    densities = [
        density
        for density in (_normalize_density_score(zone.get("density_score")) for zone in forage_zones)
        if density is not None
    ]
    zone_radius_ratios = [
        _clamp((_to_float(zone.get("radius_km"), 0.0) or 0.0) * 1000.0 / max(radius_m, 1), 0.0, 1.2)
        for zone in forage_zones
    ]
    density_component = mean(densities) if densities else crop["vegetation_bias"]
    coverage_component = mean(zone_radius_ratios) if zone_radius_ratios else 0.58
    radius_penalty = _clamp((radius_m - 2200) / 12000.0, 0.0, 0.16)

    forage_name = str((apiary or {}).get("primary_forage") or (apiary or {}).get("forage_type") or "").lower()
    crop_match_bonus = 0.08 if forage_name and crop_profile in forage_name else 0.0
    diversity_bonus = min(len(densities), 5) * 0.018

    normalized = (
        density_component * 0.52
        + crop["vegetation_bias"] * 0.25
        + coverage_component * 0.17
        + crop_match_bonus
        + diversity_bonus
        - radius_penalty
    )
    score = round(_clamp(normalized * 100.0, 30.0, 96.0), 1)
    detail = (
        f"{len(forage_zones)} forage zones, crop profile {crop_profile.upper()}, and radius dilution modeled together"
        if forage_zones
        else f"{crop_profile.upper()} crop baseline used with radius-adjusted vegetation prior"
    )
    return score, detail


def _activity_context(sensor_rows: list[dict[str, Any]], manual_activity_pct: Optional[float]) -> tuple[float, float, int, str]:
    if manual_activity_pct is not None:
        score = round(_clamp(manual_activity_pct, 0.0, 100.0), 1)
        return score, 0.0, 0, "Manual bee activity override supplied by operator"

    scored_rows: list[tuple[datetime, float]] = []
    for row in sensor_rows:
        timestamp = _to_datetime(row.get("timestamp") or row.get("recorded_at") or row.get("created_at"))
        score = _pick_activity_value(row)
        if timestamp and score is not None:
            scored_rows.append((timestamp, score))

    if not scored_rows:
        return 55.0, 0.0, 0, "No recent activity packets were available; baseline apiary flight activity used"

    scored_rows.sort(key=lambda item: item[0])
    latest = scored_rows[-1][0]
    weighted_pairs: list[tuple[float, float]] = []
    for timestamp, score in scored_rows[-180:]:
        age_hours = max(0.0, (latest - timestamp).total_seconds() / 3600.0)
        weight = math.exp(-age_hours / 72.0)
        weighted_pairs.append((score, weight))

    weighted_score = round(_weighted_mean(weighted_pairs, default=55.0), 1)
    recent_values = [value for _, value in scored_rows[-24:]]
    early_values = [value for _, value in scored_rows[-48:-24]]
    recent_avg = mean(recent_values) if recent_values else weighted_score
    early_avg = mean(early_values) if early_values else recent_avg
    trend = round(recent_avg - early_avg, 2)
    volatility = _stddev(recent_values) if len(recent_values) > 2 else 0.0
    trend_adjusted = round(_clamp(weighted_score + (trend * 0.35) - (volatility * 0.15), 12.0, 98.0), 1)

    detail = f"{len(scored_rows)} activity packets with recency weighting, trend, and volatility controls"
    return trend_adjusted, trend, len(scored_rows), detail


def _build_monthly_series(harvest_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    month_totals: dict[tuple[int, int], float] = defaultdict(float)
    for row in harvest_rows:
        harvest_date = _to_date(row.get("harvest_date") or row.get("date"))
        quantity_kg = _to_float(row.get("quantity_kg"), 0.0) or 0.0
        if not harvest_date or quantity_kg <= 0:
            continue
        month_totals[(harvest_date.year, harvest_date.month)] += quantity_kg

    if not month_totals:
        return []

    keys = sorted(month_totals.keys())
    cursor = date(keys[0][0], keys[0][1], 1)
    end = date(keys[-1][0], keys[-1][1], 1)
    series: list[dict[str, Any]] = []
    while cursor <= end:
        series.append({"date": cursor, "yield_kg": round(month_totals.get((cursor.year, cursor.month), 0.0), 3)})
        if cursor.month == 12:
            cursor = date(cursor.year + 1, 1, 1)
        else:
            cursor = date(cursor.year, cursor.month + 1, 1)
    return series


def _history_context(
    harvest_rows: list[dict[str, Any]],
    date_from: date,
    date_to: date,
    active_hives: int,
    crop_profile: str,
) -> dict[str, Any]:
    window_days = max(1, (date_to - date_from).days + 1)
    harvest_points: list[tuple[date, float]] = []
    for row in harvest_rows:
        harvest_date = _to_date(row.get("harvest_date") or row.get("date"))
        quantity_kg = _to_float(row.get("quantity_kg"), 0.0) or 0.0
        if harvest_date and quantity_kg > 0:
            harvest_points.append((harvest_date, quantity_kg))

    harvest_points.sort(key=lambda item: item[0])
    monthly_series = _build_monthly_series(harvest_rows)
    harvest_count = len(harvest_points)
    recent_cutoff = date.today() - timedelta(days=365)
    recent_total_kg = round(sum(quantity for harvest_date, quantity in harvest_points if harvest_date >= recent_cutoff), 2)

    crop_base = CROP_BASELINES[crop_profile]["kg_per_hive_day"] * active_hives * window_days
    if harvest_points:
        observed_days = max(365, (harvest_points[-1][0] - harvest_points[0][0]).days + 1)
        annualized = max(recent_total_kg, (sum(quantity for _, quantity in harvest_points) / observed_days) * 365.0)
        baseline = round((annualized / 365.0) * window_days, 2)
    else:
        baseline = round(crop_base, 2)

    analogues: list[tuple[float, float]] = []
    for year in {harvest_date.year for harvest_date, _ in harvest_points if harvest_date.year < date_from.year}:
        shifted_start = date(year, date_from.month, min(date_from.day, 28))
        shifted_end = shifted_start + timedelta(days=window_days - 1)
        total = sum(quantity for harvest_date, quantity in harvest_points if shifted_start <= harvest_date <= shifted_end)
        if total > 0:
            recency_weight = 1.0 / max(1, date_from.year - year)
            analogues.append((round(total, 2), recency_weight))
    seasonal_analogue = round(_weighted_mean(analogues, default=baseline), 2) if analogues else None

    regression_estimate = None
    if len(monthly_series) >= 6:
        yields = [point["yield_kg"] for point in monthly_series]
        max_target = max(max(yields), 1.0)
        train_x: list[list[float]] = []
        train_y: list[float] = []
        weights: list[float] = []
        total_points = len(monthly_series)
        for index, point in enumerate(monthly_series):
            lag1 = yields[index - 1] / max_target if index >= 1 else 0.0
            lag3 = mean(yields[max(0, index - 3):index]) / max_target if index >= 1 else 0.0
            train_x.append(_month_features(point["date"], index / max(total_points - 1, 1), lag1, lag3))
            train_y.append(point["yield_kg"])
            weights.append(0.6 + ((index + 1) / total_points) * 0.8)

        coefficients = _ridge_regression(train_x, train_y, weights)
        midpoint = date_from + timedelta(days=max(0, (date_to - date_from).days // 2))
        lag1 = yields[-1] / max_target if yields else 0.0
        lag3 = mean(yields[-3:]) / max_target if len(yields) >= 3 else lag1
        predicted_month = max(0.0, _dot(_month_features(midpoint, 1.05, lag1, lag3), coefficients))
        regression_estimate = round((predicted_month / 30.0) * window_days, 2)

    history_score = round(_clamp(34.0 + min(26.0, harvest_count * 4.2) + min(30.0, recent_total_kg * 0.15), 20.0, 94.0), 1)

    return {
        "baseline_kg": baseline,
        "seasonal_analogue_kg": seasonal_analogue,
        "regression_kg": regression_estimate,
        "harvest_count": harvest_count,
        "recent_total_kg": recent_total_kg,
        "history_score": history_score,
    }


def _ensemble_forecast(
    *,
    baseline_kg: float,
    crop_profile: str,
    active_hives: int,
    window_days: int,
    radius_m: int,
    vegetation_score: float,
    weather_score: float,
    activity_score: float,
    activity_trend: float,
    history_context: dict[str, Any],
) -> dict[str, Any]:
    crop = CROP_BASELINES[crop_profile]
    radius_factor = _clamp(1.03 - max(radius_m - 1800, 0) / 20000.0, 0.82, 1.06)
    vegetation_factor = _clamp(0.76 + (vegetation_score / 100.0) * 0.48, 0.72, 1.22)
    weather_factor = _clamp(0.74 + (weather_score / 100.0) * 0.46, 0.70, 1.20)
    activity_factor = _clamp(0.72 + (activity_score / 100.0) * 0.44 + (activity_trend / 100.0) * 0.12, 0.68, 1.18)
    maturity_factor = _clamp(0.88 + min(history_context["harvest_count"], 10) * 0.018, 0.88, 1.08)
    seasonal_factor = _clamp(0.78 + crop["seasonality"] * 0.34, 0.86, 1.12)

    expert_prior = round(baseline_kg * vegetation_factor * weather_factor * activity_factor * radius_factor * maturity_factor * seasonal_factor, 2)
    crop_floor = round(crop["kg_per_hive_day"] * active_hives * window_days * 0.82, 2)
    expert_prior = max(expert_prior, crop_floor)

    components: list[dict[str, Any]] = [
        {"key": "expert", "label": "Expert prior", "value_kg": expert_prior, "weight": 0.0, "detail": "Crop, radius, vegetation, weather, and activity multipliers"}
    ]
    if history_context["seasonal_analogue_kg"] is not None:
        components.append({"key": "seasonal", "label": "Seasonal analogue", "value_kg": history_context["seasonal_analogue_kg"], "weight": 0.0, "detail": "Same-window yields from previous years with recency weighting"})
    if history_context["regression_kg"] is not None:
        components.append({"key": "regression", "label": "ML regression", "value_kg": history_context["regression_kg"], "weight": 0.0, "detail": "Ridge regression over monthly harvest seasonality and trend features"})

    data_strength = _clamp(history_context["harvest_count"] / 10.0, 0.0, 1.0)
    weights = {
        "expert": 0.55 - (data_strength * 0.2),
        "seasonal": 0.25 + (0.18 if history_context["seasonal_analogue_kg"] is not None else 0.0),
        "regression": 0.20 + (0.16 if history_context["regression_kg"] is not None else 0.0),
    }
    total = sum(weights.get(component["key"], 0.0) for component in components) or 1.0
    for component in components:
        component["weight"] = round((weights.get(component["key"], 0.0) / total) * 100.0, 1)

    expected = round(sum(component["value_kg"] * (component["weight"] / 100.0) for component in components), 2)
    disagreement = _stddev([component["value_kg"] for component in components])
    return {"expected_kg": expected, "components": components, "disagreement": disagreement}


def _build_timeline(
    *,
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
        raw_weights = []
        for index in range(point_count):
            position = index / (point_count - 1)
            wave = 0.92 + 0.14 * math.sin(position * math.pi) + 0.06 * math.cos(position * math.pi * 2)
            raw_weights.append(max(0.25, wave))
        total_weight = sum(raw_weights) or 1.0
        weights = [weight / total_weight for weight in raw_weights]

    step_days = max(1, round(total_days / point_count))
    timeline: list[dict[str, Any]] = []
    for index, weight in enumerate(weights):
        drift = (index - ((point_count - 1) / 2.0)) * 1.4
        point_date = min(date_to, date_from + timedelta(days=index * step_days))
        timeline.append(
            {
                "date": point_date.isoformat(),
                "yield_kg": round(expected_yield_kg * weight, 2),
                "lower_kg": round(low_kg * weight, 2),
                "upper_kg": round(high_kg * weight, 2),
                "activity_index": round(_clamp(activity_score + drift + 1.5, 0.0, 100.0), 1),
                "weather_index": round(_clamp(weather_score - (abs(drift) * 0.7), 0.0, 100.0), 1),
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
    sensor_rows = await db_select("sensor_readings", filters={"hive_id": hive_ids}, limit=600, order_by="timestamp", ascending=False, token=token) if hive_ids else []

    active_hives = len([hive for hive in hives if "inactive" not in str(hive.get("status") or "").lower()])
    if active_hives <= 0:
        active_hives = int(_to_float((selected_apiary or {}).get("expected_hives"), 0.0) or 0)
    if active_hives <= 0:
        active_hives = 12

    provider_weather = await fetch_provider_weather(latitude, longitude)
    weather_score, weather_status, current_weather, weather_detail = _weather_context(provider_weather, date_from, date_to, latitude)
    vegetation_score, vegetation_detail = _vegetation_context(crop_profile, radius_m, selected_apiary, forage_zones)
    activity_score, activity_trend, sensor_sample_count, activity_detail = _activity_context(sensor_rows, bee_activity_pct)

    window_days = max(1, (date_to - date_from).days + 1)
    history = _history_context(harvests, date_from, date_to, active_hives, crop_profile)
    ensemble = _ensemble_forecast(
        baseline_kg=history["baseline_kg"],
        crop_profile=crop_profile,
        active_hives=active_hives,
        window_days=window_days,
        radius_m=radius_m,
        vegetation_score=vegetation_score,
        weather_score=weather_score,
        activity_score=activity_score,
        activity_trend=activity_trend,
        history_context=history,
    )
