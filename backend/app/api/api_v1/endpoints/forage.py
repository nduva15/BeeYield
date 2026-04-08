from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core import security
from app.db.supabase_db import db_delete, db_insert, db_select, db_update
from app.schemas import forage as schemas
from app.services.weather_summary_service import fetch_provider_weather, get_weather_summary_for_apiary

router = APIRouter()


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
    return str(user_id)


def _to_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    if value is None or value == "":
        return default
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if number != number:
        return default
    return number


def _normalize_text(value: Any) -> str:
    return str(value or "").strip()


def _slugify(value: str) -> str:
    return "-".join(part for part in value.lower().replace("/", " ").replace("_", " ").split() if part)


def _status_rank(status_text: str) -> int:
    status_lower = status_text.lower()
    if "critical" in status_lower or "alert" in status_lower:
        return 0
    if "weak" in status_lower or "warning" in status_lower:
        return 1
    if "inactive" in status_lower or "abandoned" in status_lower:
        return 2
    return 3


def _status_intensity(status_text: str) -> float:
    status_lower = status_text.lower()
    if "critical" in status_lower or "alert" in status_lower:
        return 1.0
    if "weak" in status_lower or "warning" in status_lower:
        return 0.82
    if "inactive" in status_lower or "abandoned" in status_lower:
        return 0.42
    return 0.66


def _weather_modifier(temp: float, humidity: float) -> float:
    modifier = 1.0
    if temp < 10:
        modifier = 0.12
    elif temp < 15:
        modifier = 0.55
    elif temp > 35:
        modifier = 0.72

    if humidity > 90:
        modifier *= 0.25
    elif humidity > 80:
        modifier *= 0.4
    elif humidity > 70:
        modifier *= 0.72

    return round(modifier, 4)


def _weather_status_from_modifier(modifier: float) -> str:
    if modifier > 0.8:
        return "Optimal"
    if modifier > 0.4:
        return "Sub-optimal"
    return "Poor"


def _format_location_label(apiary: dict[str, Any]) -> str:
    parts = [
        _normalize_text(apiary.get("location_name")),
        _normalize_text(apiary.get("county")),
        _normalize_text(apiary.get("region")),
        _normalize_text(apiary.get("country")),
    ]
    cleaned = [part for part in parts if part]
    return ", ".join(cleaned) or _normalize_text(apiary.get("name")) or "Unnamed apiary"


def _is_blooming(source: dict[str, Any], month: int) -> bool:
    start = int(_to_float(source.get("bloom_start_month"), 1) or 1)
    end = int(_to_float(source.get("bloom_end_month"), 12) or 12)
    if start <= end:
        return start <= month <= end
    return month >= start or month <= end


def _optional_id(value: Any) -> Optional[str]:
    if value in (None, "", "null"):
        return None
    return str(value)


async def _clear_default_map_views(
    user_id: str,
    scope: dict[str, Any],
    token: Optional[str] = None,
    exclude_id: Optional[str] = None,
) -> None:
    rows = await db_select("map_views", filters={"user_id": user_id}, limit=1000, token=token)
    target_apiary_id = _optional_id(scope.get("apiary_id"))
    target_view_type = _normalize_text(scope.get("view_type") or "general") or "general"

    for row in rows:
        if not row.get("is_default"):
            continue
        if exclude_id and str(row.get("id")) == str(exclude_id):
            continue
        if _optional_id(row.get("apiary_id")) != target_apiary_id:
            continue
        row_view_type = _normalize_text(row.get("view_type") or "general") or "general"
        if row_view_type != target_view_type:
            continue

        await db_update(
            "map_views",
            {
                "is_default": False,
                "updated_at": datetime.utcnow().isoformat(),
            },
            {"id": row.get("id"), "user_id": user_id},
            token=token,
        )


PUBLIC_LIVE_LOCATIONS: dict[str, dict[str, Any]] = {
    "kibwezi-kenya": {
        "id": "public-kibwezi-kenya",
        "name": "Kibwezi Flight Monitor",
        "location_name": "Kibwezi, Makueni County, Kenya",
        "county": "Makueni",
        "region": "Eastern Kenya",
        "country": "Kenya",
        "latitude": -2.4187,
        "longitude": 37.9686,
        "effective_radius_km": 2.4,
        "max_radius_km": 4.8,
        "coverage_radius_m": 2600,
    }
}


def _provider_source_meta(current: dict[str, Any]) -> dict[str, Any]:
    observed_at = current.get("last_observed_at")
    provider = current.get("provider") or "open-meteo"
    keys = (
        "temperature_c",
        "humidity_pct",
        "pressure_hpa",
        "wind_speed_kmh",
        "wind_direction",
        "feels_like_c",
        "condition",
        "cloud_cover_pct",
        "sunrise_at",
        "sunset_at",
        "uv_index",
        "aqi",
        "last_observed_at",
    )
    return {
        key: {"source": "provider", "provider": provider, "observed_at": observed_at} if current.get(key) is not None else {"source": "unavailable"}
        for key in keys
    }


def _build_public_hive_points(center_lat: float, center_lng: float) -> list[dict[str, Any]]:
    return [
        {
            "id": "kbz-north-corridor",
            "hive_code": "KBZ-NORTH",
            "name": "North corridor",
            "status": "Active",
            "latitude": round(center_lat + 0.0105, 6),
            "longitude": round(center_lng + 0.0060, 6),
        },
        {
            "id": "kbz-east-ridge",
            "hive_code": "KBZ-EAST",
            "name": "East ridge",
            "status": "Watch",
            "latitude": round(center_lat + 0.0035, 6),
            "longitude": round(center_lng + 0.0140, 6),
        },
        {
            "id": "kbz-river-belt",
            "hive_code": "KBZ-RIVER",
            "name": "River belt",
            "status": "Active",
            "latitude": round(center_lat - 0.0090, 6),
            "longitude": round(center_lng - 0.0055, 6),
        },
        {
            "id": "kbz-south-field",
            "hive_code": "KBZ-SOUTH",
            "name": "South field",
            "status": "Limited",
            "latitude": round(center_lat - 0.0130, 6),
            "longitude": round(center_lng + 0.0045, 6),
        },
    ]


async def _build_public_live_map_payload(location_slug: str = "kibwezi-kenya") -> dict[str, Any]:
    live_location = PUBLIC_LIVE_LOCATIONS.get(location_slug) or PUBLIC_LIVE_LOCATIONS["kibwezi-kenya"]
    center_lat = float(live_location["latitude"])
    center_lng = float(live_location["longitude"])

    provider_summary = await fetch_provider_weather(center_lat, center_lng)
    current = (provider_summary or {}).get("current") or {}
    weather_summary = {
        "apiary_id": str(live_location["id"]),
        "current": current,
        "hourly_forecast": (provider_summary or {}).get("hourly_forecast") or [],
        "daily_summary": (provider_summary or {}).get("daily_summary") or {},
        "source_meta": _provider_source_meta(current),
        "linked_device_meta": [],
    }

    temperature = _to_float(current.get("temperature_c"), 22.0) or 22.0
    humidity = _to_float(current.get("humidity_pct"), 58.0) or 58.0
    modifier = _weather_modifier(temperature, humidity)

    active_sources = [
        {"name": "Acacia corridor", "potential": round(0.82 * modifier, 4), "is_optimal": modifier > 0.6},
        {"name": "Smallholder orchard belt", "potential": round(0.74 * modifier, 4), "is_optimal": modifier > 0.5},
        {"name": "Riverine bloom edge", "potential": round(0.68 * modifier, 4), "is_optimal": modifier > 0.45},
    ]
    score = round(min(96.0, ((sum(source["potential"] for source in active_sources) / len(active_sources)) * 100.0)), 1)
    land_types = [
        {
            "id": f"public-land-type-{index + 1}",
            "name": source["name"],
            "share_pct": round((source["potential"] / max(sum(item["potential"] for item in active_sources), 0.01)) * 100.0, 1),
            "nectar_score": round(source["potential"] * 100.0, 1),
            "is_blooming": source["is_optimal"],
        }
        for index, source in enumerate(active_sources)
    ]

    hives = _build_public_hive_points(center_lat, center_lng)
    route_points = [{"lat": center_lat, "lng": center_lng}] + [
        {"lat": float(hive["latitude"]), "lng": float(hive["longitude"])} for hive in hives
    ]

    recommendation = (
        "Live weather around Kibwezi supports a strong forage window."
        if score >= 70
        else "Kibwezi conditions are usable, but routes should be checked during the next weather refresh."
        if score >= 40
        else "Current Kibwezi conditions limit long foraging flights."
    )

    return {
        "site_mode": "public-live",
        "source_label": "Live public map for Kibwezi, Kenya",
        "apiary": {
            "id": str(live_location["id"]),
            "name": str(live_location["name"]),
            "location_name": str(live_location["location_name"]),
            "county": str(live_location["county"]),
            "region": str(live_location["region"]),
            "country": str(live_location["country"]),
            "latitude": center_lat,
            "longitude": center_lng,
            "status": "live",
            "hive_count": len(hives),
            "effective_radius_km": float(live_location["effective_radius_km"]),
            "max_radius_km": float(live_location["max_radius_km"]),
        },
        "hives": hives,
        "route_points": route_points,
        "coverage_radius_m": int(live_location["coverage_radius_m"]),
        "land_types": land_types,
        "flight_potential": {
            "score": score,
            "status": _weather_status_from_modifier(modifier),
            "recommendation": recommendation,
            "active_sources": active_sources,
        },
        "weather_summary": weather_summary,
    }


async def _get_relevant_user_ids(user_id: str, token: Optional[str]) -> list[str]:
    relevant = [user_id]
    try:
        farmers = await db_select("farmers", filters={"user_id": user_id}, limit=1, token=token)
        if farmers and farmers[0].get("id"):
            relevant.append(str(farmers[0]["id"]))
    except Exception:
        pass
    return list(dict.fromkeys(relevant))


async def _get_accessible_apiaries(user_id: str, token: Optional[str]) -> list[dict[str, Any]]:
    relevant_ids = await _get_relevant_user_ids(user_id, token)
    owned = await db_select("apiaries", filters={"user_id": relevant_ids}, order_by="created_at", ascending=False, token=token)

    if not owned and len(relevant_ids) > 1:
        try:
            owned = await db_select("apiaries", filters={"farmer_id": relevant_ids[1]}, order_by="created_at", ascending=False, token=token)
        except Exception:
            owned = []

    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
    shared_ids = [str(row["apiary_id"]) for row in shares if row.get("apiary_id")]
    shared = await db_select("apiaries", filters={"id": shared_ids}, token=token) if shared_ids else []

    combined: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in [*(owned or []), *(shared or [])]:
        row_id = str(row.get("id") or "")
        if not row_id or row_id in seen:
            continue
        seen.add(row_id)
        row["status"] = row.get("status") or ("active" if row.get("is_active", True) else "inactive")
        combined.append(row)
    return combined


def _build_weather_payload(summary: Optional[dict[str, Any]], location_label: str) -> dict[str, Any]:
    current = (summary or {}).get("current") or {}
    has_weather = any(
        current.get(key) is not None
        for key in ("temperature_c", "humidity_pct", "uv_index", "wind_speed_kmh", "condition")
    )
    return {
        "available": has_weather,
        "message": None if has_weather else f"Did not find weather for {location_label}.",
        "current": current,
    }


def _build_land_types(
    apiary: dict[str, Any],
    active_sources: list[dict[str, Any]],
    forage_zones: list[dict[str, Any]],
    requested_land_type: Optional[str],
) -> tuple[list[dict[str, Any]], dict[str, Any], Optional[dict[str, Any]]]:
    weights: dict[str, float] = {}
    labels: dict[str, str] = {}

    primary_forage = _normalize_text(apiary.get("primary_forage") or apiary.get("forage_type"))
    if primary_forage:
        key = _slugify(primary_forage)
        labels[key] = primary_forage
        weights[key] = weights.get(key, 0.0) + 0.45

    for zone in forage_zones:
        label = _normalize_text(zone.get("flora_type") or zone.get("zone_name"))
        if not label:
            continue
        key = _slugify(label)
        labels[key] = label
        weights[key] = weights.get(key, 0.0) + (_to_float(zone.get("density_score"), 0.35) or 0.35)

    active_by_key: dict[str, dict[str, Any]] = {}
    for source in active_sources:
        label = _normalize_text(source.get("name"))
        if not label:
            continue
        key = _slugify(label)
        labels[key] = label
        active_by_key[key] = source
        weights[key] = weights.get(key, 0.0) + ((_to_float(source.get("potential"), 0.4) or 0.4) * 1.2)

    if not weights:
        fallback = primary_forage or "Multifloral"
        key = _slugify(fallback)
        labels[key] = fallback
        weights[key] = 1.0

    total_weight = sum(weights.values()) or 1.0
    land_types = []
    for key, weight in sorted(weights.items(), key=lambda item: item[1], reverse=True):
        share_pct = round((weight / total_weight) * 100, 1)
        source = active_by_key.get(key)
        land_types.append(
            {
                "id": key,
                "name": labels[key],
                "share_pct": share_pct,
                "nectar_score": round((_to_float((source or {}).get("potential"), 0.45) or 0.45) * 100, 1),
                "is_blooming": bool((source or {}).get("is_optimal", source is not None)),
            }
        )

    requested_key = _slugify(requested_land_type) if requested_land_type else ""
    selected = next((item for item in land_types if item["id"] == requested_key), None) or land_types[0]
    selected_source = active_by_key.get(selected["id"])
    return land_types, selected, selected_source


def _build_education_panel(effective_radius_km: float, max_radius_km: float) -> list[str]:
    effective_upper = max(1, round(effective_radius_km))
    costly_threshold = max(3, round(max_radius_km - 2))
    return [
        f"Effective bee flight radius: 1-{effective_upper} km",
        "Most foraging comes from the nearest area",
        f"Flights above {costly_threshold} km are energetically costly",
    ]


async def _build_flight_area_payload(
    apiary_id: str,
    user_id: str,
    token: Optional[str],
    land_type: Optional[str] = None,
) -> dict[str, Any]:
    accessible_apiaries = await _get_accessible_apiaries(user_id, token)
    selected_apiary = next((row for row in accessible_apiaries if str(row.get("id")) == str(apiary_id)), None)
    if not selected_apiary:
        raise HTTPException(status_code=404, detail="Apiary not found")

    apiary_location_label = _format_location_label(selected_apiary)
    apiary_lat = _to_float(selected_apiary.get("latitude"), 0.0) or 0.0
    apiary_lng = _to_float(selected_apiary.get("longitude"), 0.0) or 0.0

    infrastructure_rows = await db_select(
        "infrastructure_registry",
        filters={"apiary_id": str(selected_apiary["id"])},
        order_by="created_at",
        ascending=False,
        limit=20,
        token=token,
    )
    infrastructure = infrastructure_rows[0] if infrastructure_rows else {}

    try:
        forage_zones = await db_select(
            "forage_zones",
            filters={"apiary_id": str(selected_apiary["id"]), "user_id": user_id},
            order_by="created_at",
            ascending=False,
            limit=200,
            token=token,
        )
    except Exception:
        forage_zones = []

    try:
        flower_sources = await db_select("flower_sources", limit=500, token=token)
    except Exception:
        flower_sources = []

    hives = await db_select(
        "hives",
        filters={"apiary_id": str(selected_apiary["id"])},
        order_by="created_at",
        ascending=False,
        limit=1000,
        token=token,
    )

    all_apiary_ids = [str(row["id"]) for row in accessible_apiaries if row.get("id")]
    all_infrastructure_rows = (
        await db_select(
            "infrastructure_registry",
            filters={"apiary_id": all_apiary_ids},
            order_by="created_at",
            ascending=False,
            limit=500,
            token=token,
        )
        if all_apiary_ids
        else []
    )
    infrastructure_by_apiary: dict[str, dict[str, Any]] = {}
    for row in all_infrastructure_rows:
        aid = str(row.get("apiary_id") or "")
        if aid and aid not in infrastructure_by_apiary:
            infrastructure_by_apiary[aid] = row

    all_hives = await db_select("hives", filters={"apiary_id": all_apiary_ids}, limit=2000, token=token) if all_apiary_ids else []
    hive_count_by_apiary: dict[str, int] = {}
    for hive in all_hives:
        aid = str(hive.get("apiary_id") or "")
        hive_count_by_apiary[aid] = hive_count_by_apiary.get(aid, 0) + 1

    summary: Optional[dict[str, Any]]
    try:
        summary = await get_weather_summary_for_apiary(apiary_id, user_id, token=token)
    except (ValueError, PermissionError):
        summary = None
    except Exception:
        summary = None

    weather_payload = _build_weather_payload(summary, apiary_location_label)
    weather_current = weather_payload["current"]
    temperature = _to_float(weather_current.get("temperature_c"), 20.0) or 20.0
    humidity = _to_float(weather_current.get("humidity_pct"), 50.0) or 50.0
    modifier = _weather_modifier(temperature, humidity)
    current_month = datetime.utcnow().month

    active_sources: list[dict[str, Any]] = []
    for source in flower_sources:
        if not _is_blooming(source, current_month):
            continue
        flower_name = _normalize_text(source.get("name") or source.get("flora_type") or "Local forage")
        flower_potential = _to_float(source.get("nectar_potential"), 0.5) or 0.5
        optimal_min = _to_float(source.get("optimal_temp_min"), 15.0) or 15.0
        optimal_max = _to_float(source.get("optimal_temp_max"), 30.0) or 30.0
        is_optimal = optimal_min <= temperature <= optimal_max
        adjusted_potential = flower_potential if is_optimal else round(flower_potential * 0.6, 4)
        active_sources.append(
            {
                "name": flower_name,
                "potential": round(adjusted_potential, 4),
                "is_optimal": is_optimal,
            }
        )

    active_sources.sort(key=lambda item: item["potential"], reverse=True)
    land_types, selected_land_type_row, selected_source = _build_land_types(selected_apiary, active_sources, forage_zones, land_type)

    selected_source_potential = _to_float((selected_source or {}).get("potential"), 0.45) or 0.45
    estimated_share_pct = selected_land_type_row["share_pct"]
    potential_score = round(
        min(95.0, ((selected_source_potential * 0.65) + ((estimated_share_pct / 100.0) * 0.35)) * modifier * 100.0),
        2,
    )

    effective_radius_km = _to_float(infrastructure.get("radius_km"), None)
    if effective_radius_km is None and forage_zones:
        effective_radius_km = max((_to_float(zone.get("radius_km"), 0.0) or 0.0) for zone in forage_zones) or 2.0
    effective_radius_km = max(0.5, effective_radius_km or 2.0)

    max_radius_km = _to_float(infrastructure.get("max_radius_km"), None) or max(5.0, effective_radius_km + 2.0)
    max_radius_km = max(max_radius_km, effective_radius_km)

    route_candidates = []
    heatmap_points = []
    status_summary: dict[str, int] = {}
    for hive in hives:
        status_text = _normalize_text(hive.get("status") or "Active")
        hive_lat = _to_float(hive.get("latitude"), apiary_lat) or apiary_lat
        hive_lng = _to_float(hive.get("longitude"), apiary_lng) or apiary_lng
        candidate = {
            "id": str(hive.get("id")),
            "name": _normalize_text(hive.get("hive_code") or hive.get("hive_name") or "Hive"),
            "status": status_text,
            "latitude": hive_lat,
            "longitude": hive_lng,
            "priority": _status_rank(status_text),
        }
        route_candidates.append(candidate)
        heatmap_points.append(
            {
                "id": candidate["id"],
                "name": candidate["name"],
                "lat": hive_lat,
                "lng": hive_lng,
                "intensity": _status_intensity(status_text),
                "status": status_text,
            }
        )
        status_summary[status_text] = status_summary.get(status_text, 0) + 1

    route_candidates.sort(key=lambda item: (item["priority"], item["name"]))
    for item in route_candidates:
        item.pop("priority", None)

    selected_location_options = []
    for apiary in accessible_apiaries:
        location_label = _format_location_label(apiary)
        device = infrastructure_by_apiary.get(str(apiary.get("id")))
        selected_location_options.append(
            {
                "id": str(apiary["id"]),
                "name": _normalize_text(apiary.get("name") or "Unnamed apiary"),
                "label": f"{apiary.get('name')} - {location_label}",
                "location_name": location_label,
                "latitude": _to_float(apiary.get("latitude"), 0.0) or 0.0,
                "longitude": _to_float(apiary.get("longitude"), 0.0) or 0.0,
                "effective_radius_km": _to_float((device or {}).get("radius_km"), effective_radius_km) or effective_radius_km,
                "max_radius_km": _to_float((device or {}).get("max_radius_km"), max_radius_km) or max_radius_km,
                "hive_count": hive_count_by_apiary.get(str(apiary["id"]), 0),
            }
        )

    all_apiaries_map = [
        {
            "id": str(apiary["id"]),
            "name": _normalize_text(apiary.get("name") or "Unnamed apiary"),
            "location_name": _format_location_label(apiary),
            "latitude": _to_float(apiary.get("latitude"), 0.0) or 0.0,
            "longitude": _to_float(apiary.get("longitude"), 0.0) or 0.0,
            "hive_count": hive_count_by_apiary.get(str(apiary["id"]), 0),
            "effective_radius_km": next(
                (
                    _to_float(location["effective_radius_km"], 2.0) or 2.0
                    for location in selected_location_options
                    if location["id"] == str(apiary["id"])
                ),
                2.0,
            ),
        }
        for apiary in accessible_apiaries
        if _to_float(apiary.get("latitude"), None) is not None and _to_float(apiary.get("longitude"), None) is not None
    ]

    recommendation = (
        "High forage activity expected."
        if potential_score > 70
        else "Normal activity."
        if potential_score > 35
        else "Forage activity limited by environment."
    )

    return {
        "apiary": {
            "id": str(selected_apiary["id"]),
            "name": _normalize_text(selected_apiary.get("name") or "Unnamed apiary"),
            "location_name": apiary_location_label,
            "latitude": apiary_lat,
            "longitude": apiary_lng,
            "primary_forage": _normalize_text(selected_apiary.get("primary_forage") or selected_apiary.get("forage_type") or ""),
            "effective_radius_km": round(effective_radius_km, 2),
            "max_radius_km": round(max_radius_km, 2),
        },
        "controls": {
            "locations": selected_location_options,
            "land_types": land_types,
            "selected_land_type": selected_land_type_row["name"],
            "selected_land_type_id": selected_land_type_row["id"],
        },
        "forage": {
            "potential_pct": potential_score,
            "estimated_share_pct": estimated_share_pct,
            "weather_modifier": modifier,
            "weather_status": _weather_status_from_modifier(modifier),
            "active_sources": active_sources[:8],
            "recommendation": recommendation,
        },
        "weather": weather_payload,
        "education_panel": _build_education_panel(effective_radius_km, max_radius_km),
        "route_planner": {
            "start_options": selected_location_options,
            "suggested_hives": route_candidates[:12],
            "status_summary": status_summary,
            "helper_text": "Choose a start point and hive status to build a simple visit order.",
        },
        "map": {
            "center": {"lat": apiary_lat, "lng": apiary_lng},
            "effective_radius_m": int(round(effective_radius_km * 1000)),
            "maximum_radius_m": int(round(max_radius_km * 1000)),
            "heatmap_points": heatmap_points,
            "forage_zone_points": [
                {
                    "id": str(zone.get("id") or f"zone-{index}"),
                    "name": _normalize_text(zone.get("zone_name") or zone.get("flora_type") or "Forage zone"),
                    "flora_type": _normalize_text(zone.get("flora_type") or ""),
                    "lat": _to_float(zone.get("latitude"), apiary_lat) or apiary_lat,
                    "lng": _to_float(zone.get("longitude"), apiary_lng) or apiary_lng,
                    "radius_m": int(round((_to_float(zone.get("radius_km"), effective_radius_km) or effective_radius_km) * 1000)),
                    "density_score": _to_float(zone.get("density_score"), 0.5) or 0.5,
                }
                for index, zone in enumerate(forage_zones)
            ],
            "all_apiaries": all_apiaries_map,
        },
    }


# ============================================
# FORAGE ZONES (CRUD)
# ============================================


@router.get("/zones", response_model=list[schemas.ForageZone])
async def list_forage_zones(
    apiary_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    return await db_select("forage_zones", filters=filters, order_by="created_at", ascending=False, limit=1000, token=token)


@router.get("/zones/{zone_id}", response_model=schemas.ForageZone)
async def get_forage_zone(
    zone_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Forage zone not found")
    return rows[0]


@router.post("/zones", response_model=schemas.ForageZone, status_code=status.HTTP_201_CREATED)
async def create_forage_zone(
    body: schemas.ForageZoneCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump(mode="json")
    payload["user_id"] = user_id
    res = await db_insert("forage_zones", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create forage zone"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/zones/{zone_id}", response_model=schemas.ForageZone)
async def update_forage_zone(
    zone_id: str,
    body: schemas.ForageZoneUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Forage zone not found")

    patch = body.model_dump(exclude_unset=True, mode="json")
    if not patch:
        return existing[0]
    patch["updated_at"] = datetime.utcnow().isoformat()

    res = await db_update("forage_zones", patch, {"id": zone_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update forage zone"))
    rows = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    return rows[0] if rows else {**existing[0], **patch}


@router.delete("/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forage_zone(
    zone_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Forage zone not found")

    res = await db_delete("forage_zones", {"id": zone_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete forage zone"))
    return None


# ============================================
# ORCHARDS (CRUD)
# ============================================


@router.get("/orchards", response_model=list[schemas.Orchard])
async def list_orchards(
    apiary_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"grower_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    return await db_select("orchards", filters=filters, order_by="created_at", ascending=False, limit=1000, token=token)


@router.get("/orchards/{orchard_id}", response_model=schemas.Orchard)
async def get_orchard(
    orchard_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("orchards", filters={"id": orchard_id, "grower_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Orchard not found")
    return rows[0]


@router.post("/orchards", response_model=schemas.Orchard, status_code=status.HTTP_201_CREATED)
async def create_orchard(
    body: schemas.OrchardCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump(mode="json")
    payload["grower_id"] = user_id
    res = await db_insert("orchards", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create orchard"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/orchards/{orchard_id}", response_model=schemas.Orchard)
async def update_orchard(
    orchard_id: str,
    body: schemas.OrchardUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("orchards", filters={"id": orchard_id, "grower_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Orchard not found")

    patch = body.model_dump(exclude_unset=True, mode="json")
    if not patch:
        return existing[0]
    patch["updated_at"] = datetime.utcnow().isoformat()

    res = await db_update("orchards", patch, {"id": orchard_id, "grower_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update orchard"))
    rows = await db_select("orchards", filters={"id": orchard_id, "grower_id": user_id}, limit=1, token=token)
    return rows[0] if rows else {**existing[0], **patch}


@router.delete("/orchards/{orchard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_orchard(
    orchard_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("orchards", filters={"id": orchard_id, "grower_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Orchard not found")

    res = await db_delete("orchards", {"id": orchard_id, "grower_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete orchard"))
    return None


# ============================================
# GEOFENCES (CRUD)
# ============================================


@router.get("/geofences", response_model=list[schemas.Geofence])
async def list_geofences(
    apiary_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    return await db_select("geofences", filters=filters, order_by="created_at", ascending=False, limit=1000, token=token)


@router.get("/geofences/{geofence_id}", response_model=schemas.Geofence)
async def get_geofence(
    geofence_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("geofences", filters={"id": geofence_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Geofence not found")
    return rows[0]


@router.post("/geofences", response_model=schemas.Geofence, status_code=status.HTTP_201_CREATED)
async def create_geofence(
    body: schemas.GeofenceCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump(mode="json")
    payload["user_id"] = user_id
    res = await db_insert("geofences", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create geofence"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/geofences/{geofence_id}", response_model=schemas.Geofence)
async def update_geofence(
    geofence_id: str,
    body: schemas.GeofenceUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("geofences", filters={"id": geofence_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Geofence not found")

    patch = body.model_dump(exclude_unset=True, mode="json")
    if not patch:
        return existing[0]
    patch["updated_at"] = datetime.utcnow().isoformat()

    res = await db_update("geofences", patch, {"id": geofence_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update geofence"))
    rows = await db_select("geofences", filters={"id": geofence_id, "user_id": user_id}, limit=1, token=token)
    return rows[0] if rows else {**existing[0], **patch}


@router.delete("/geofences/{geofence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_geofence(
    geofence_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("geofences", filters={"id": geofence_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Geofence not found")

    res = await db_delete("geofences", {"id": geofence_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete geofence"))
    return None


# ============================================
# MAP VIEWS (CRUD)
# ============================================


@router.get("/map-views", response_model=list[schemas.MapView])
async def list_map_views(
    apiary_id: Optional[str] = None,
    view_type: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if view_type:
        filters["view_type"] = view_type
    return await db_select("map_views", filters=filters, order_by="created_at", ascending=False, limit=1000, token=token)


@router.get("/map-views/{map_view_id}", response_model=schemas.MapView)
async def get_map_view(
    map_view_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("map_views", filters={"id": map_view_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Map view not found")
    return rows[0]


@router.post("/map-views", response_model=schemas.MapView, status_code=status.HTTP_201_CREATED)
async def create_map_view(
    body: schemas.MapViewCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump(mode="json")
    payload["user_id"] = user_id

    if payload.get("is_default"):
        await _clear_default_map_views(user_id, payload, token=token)

    res = await db_insert("map_views", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create map view"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/map-views/{map_view_id}", response_model=schemas.MapView)
async def update_map_view(
    map_view_id: str,
    body: schemas.MapViewUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("map_views", filters={"id": map_view_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Map view not found")

    patch = body.model_dump(exclude_unset=True, mode="json")
    if not patch:
        return existing[0]

    merged_scope = {
        "apiary_id": patch.get("apiary_id", existing[0].get("apiary_id")),
        "view_type": patch.get("view_type", existing[0].get("view_type")),
    }
    if patch.get("is_default"):
        await _clear_default_map_views(user_id, merged_scope, token=token, exclude_id=map_view_id)

    patch["updated_at"] = datetime.utcnow().isoformat()
    res = await db_update("map_views", patch, {"id": map_view_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update map view"))
    rows = await db_select("map_views", filters={"id": map_view_id, "user_id": user_id}, limit=1, token=token)
    return rows[0] if rows else {**existing[0], **patch}


@router.delete("/map-views/{map_view_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_map_view(
    map_view_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("map_views", filters={"id": map_view_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Map view not found")

    res = await db_delete("map_views", {"id": map_view_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete map view"))
    return None


@router.get("/flight-area")
async def get_flight_area_dashboard(
    apiary_id: str = Query(..., description="Target apiary ID"),
    land_type: Optional[str] = Query(None, description="Selected land type filter"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _build_flight_area_payload(apiary_id=apiary_id, user_id=user_id, token=token, land_type=land_type)


@router.get("/potential")
async def get_flight_potential(
    apiary_id: str = Query(..., description="Target apiary ID"),
    land_type: Optional[str] = Query(None, description="Selected land type filter"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = await _build_flight_area_payload(apiary_id=apiary_id, user_id=user_id, token=token, land_type=land_type)
    weather_current = payload["weather"]["current"]
    return {
        "score": payload["forage"]["potential_pct"],
        "weather": {
            "temp": _to_float(weather_current.get("temperature_c"), 20.0) or 20.0,
            "humidity": _to_float(weather_current.get("humidity_pct"), 50.0) or 50.0,
            "status": payload["forage"]["weather_status"],
        },
        "active_sources": payload["forage"]["active_sources"],
        "recommendation": payload["forage"]["recommendation"],
        "land_type": payload["controls"]["selected_land_type"],
        "estimated_share_pct": payload["forage"]["estimated_share_pct"],
    }


@router.get("/public-live-map")
async def get_public_live_map(
    location_slug: str = Query("kibwezi-kenya", description="Public live map location"),
):
    return await _build_public_live_map_payload(location_slug=location_slug)


@router.get("/weather")
async def get_realtime_weather(
    lat: float,
    lng: float,
    current_user: dict = Depends(security.get_current_user),
):
    provider = await fetch_provider_weather(lat, lng)
    if not provider:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")

    current = provider.get("current") or {}
    return {
        "temperature": current.get("temperature_c"),
        "humidity": current.get("humidity_pct"),
        "solar_pressure": current.get("uv_index"),
        "wind_speed": current.get("wind_speed_kmh"),
        "description": current.get("condition"),
        "bee_flight_status": "Enabled"
        if (current.get("temperature_c") or 0) > 12 and (current.get("humidity_pct") or 100) < 85
        else "Disabled",
        "pressure_hpa": current.get("pressure_hpa"),
        "feels_like_c": current.get("feels_like_c"),
        "cloud_cover_pct": current.get("cloud_cover_pct"),
        "sunrise_at": current.get("sunrise_at"),
        "sunset_at": current.get("sunset_at"),
        "aqi": current.get("aqi"),
    }


@router.get("/weather-summary", response_model=schemas.WeatherSummary)
async def get_apiary_weather_summary(
    apiary_id: str = Query(..., description="Target apiary ID"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    try:
        return await get_weather_summary_for_apiary(apiary_id, user_id, token=token)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
