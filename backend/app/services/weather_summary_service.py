from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

import httpx

from app.db.supabase_db import db_select


WEATHER_CODE_MAP = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm",
}

CURRENT_FIELDS = (
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


def _to_float(value: Any) -> Optional[float]:
    if value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number != number:
        return None
    return number


def _to_int(value: Any) -> Optional[int]:
    number = _to_float(value)
    if number is None:
        return None
    return int(round(number))


def _to_iso(value: Any) -> Optional[str]:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    text = str(value).strip()
    if not text:
        return None
    return text


def _parse_dt(value: Any) -> Optional[datetime]:
    text = _to_iso(value)
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


def _condition_from_code(code: Any) -> Optional[str]:
    as_int = _to_int(code)
    if as_int is None:
        return None
    return WEATHER_CODE_MAP.get(as_int, "Unknown")


def _pick_first(source: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        value = source.get(key)
        if value not in (None, ""):
            return value
    return None


def _normalize_direction(value: Any) -> Optional[str]:
    if value in (None, ""):
        return None
    if isinstance(value, str):
        return value.strip() or None
    degrees = _to_float(value)
    if degrees is None:
        return None
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = int((degrees % 360) / 45 + 0.5) % 8
    return directions[index]


def _normalize_reading_payload(row: dict[str, Any]) -> dict[str, Any]:
    readings = row.get("readings") if isinstance(row.get("readings"), dict) else {}
    merged = {**readings, **row}
    observed_at = (
        row.get("timestamp")
        or row.get("recorded_at")
        or row.get("created_at")
        or row.get("updated_at")
    )
    return {
        "device_id": row.get("device_id"),
        "last_observed_at": _to_iso(observed_at),
        "temperature_c": _to_float(
            _pick_first(
                merged,
                [
                    "temperature_c",
                    "temperature",
                    "temp_external",
                    "temp_internal",
                    "ambient_temperature",
                    "air_temperature",
                    "internal_temp",
                ],
            )
        ),
        "humidity_pct": _to_float(
            _pick_first(
                merged,
                [
                    "humidity_pct",
                    "humidity",
                    "humidity_external",
                    "humidity_internal",
                    "relative_humidity",
                ],
            )
        ),
        "pressure_hpa": _to_float(
            _pick_first(
                merged,
                [
                    "pressure_hpa",
                    "pressure",
                    "barometric_pressure",
                    "pressure_msl",
                    "air_pressure",
                ],
            )
        ),
        "wind_speed_kmh": _to_float(
            _pick_first(merged, ["wind_speed_kmh", "wind_speed", "wind_kmh"])
        ),
        "wind_direction": _normalize_direction(
            _pick_first(merged, ["wind_direction", "wind_direction_deg", "wind_bearing"])
        ),
        "feels_like_c": _to_float(
            _pick_first(merged, ["feels_like_c", "apparent_temperature", "real_feel_c"])
        ),
        "condition": _pick_first(merged, ["condition", "weather_description", "summary", "status"]),
        "cloud_cover_pct": _to_float(_pick_first(merged, ["cloud_cover_pct", "cloud_cover"])),
        "uv_index": _to_float(_pick_first(merged, ["uv_index", "uv"])),
        "aqi": _to_int(_pick_first(merged, ["aqi", "us_aqi"])),
    }


def merge_current_weather(
    device_current: dict[str, Any],
    provider_current: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    merged: dict[str, Any] = {}
    source_meta: dict[str, dict[str, Any]] = {}

    for field in CURRENT_FIELDS:
        device_value = device_current.get(field)
        provider_value = provider_current.get(field)
        if device_value is not None:
            merged[field] = device_value
            meta: dict[str, Any] = {"source": "device"}
            if device_current.get("device_id"):
                meta["device_id"] = device_current.get("device_id")
            if device_current.get("last_observed_at"):
                meta["observed_at"] = device_current.get("last_observed_at")
            source_meta[field] = meta
        elif provider_value is not None:
            merged[field] = provider_value
            meta = {"source": "provider"}
            if provider_current.get("provider"):
                meta["provider"] = provider_current.get("provider")
            if provider_current.get("last_observed_at"):
                meta["observed_at"] = provider_current.get("last_observed_at")
            source_meta[field] = meta
        else:
            merged[field] = None
            source_meta[field] = {"source": "unavailable"}

    if merged.get("last_observed_at") is None:
        merged["last_observed_at"] = provider_current.get("last_observed_at") or device_current.get("last_observed_at")

    return merged, source_meta


async def fetch_provider_weather(latitude: float, longitude: float) -> Optional[dict[str, Any]]:
    weather_url = "https://api.open-meteo.com/v1/forecast"
    air_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "forecast_days": 2,
        "current": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "pressure_msl",
                "cloud_cover",
                "wind_speed_10m",
                "wind_direction_10m",
                "weather_code",
            ]
        ),
        "hourly": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "pressure_msl",
                "wind_speed_10m",
                "weather_code",
                "uv_index",
            ]
        ),
        "daily": ",".join(
            [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "sunrise",
                "sunset",
                "uv_index_max",
            ]
        ),
    }
    air_params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "forecast_days": 2,
        "hourly": "us_aqi",
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            weather_response, air_response = await client.get(weather_url, params=weather_params), await client.get(
                air_url, params=air_params
            )
            weather_response.raise_for_status()
            air_response.raise_for_status()
    except Exception:
        return None

    weather_data = weather_response.json()
    air_data = air_response.json()

    current = weather_data.get("current") or {}
    daily = weather_data.get("daily") or {}
    hourly = weather_data.get("hourly") or {}
    current_time = _to_iso(current.get("time"))

    air_times = air_data.get("hourly", {}).get("time") or []
    air_values = air_data.get("hourly", {}).get("us_aqi") or []
    current_aqi = None
    if current_time and air_times and air_values:
        try:
            air_index = air_times.index(current_time)
            current_aqi = _to_int(air_values[air_index] if air_index < len(air_values) else None)
        except ValueError:
            current_aqi = _to_int(air_values[0]) if air_values else None

    sunrise_at = (daily.get("sunrise") or [None])[0]
    sunset_at = (daily.get("sunset") or [None])[0]
    uv_index_max = (daily.get("uv_index_max") or [None])[0]
    daily_code = (daily.get("weather_code") or [None])[0]

    hourly_forecast: list[dict[str, Any]] = []
    hourly_times = hourly.get("time") or []
    for index, timestamp in enumerate(hourly_times[:12]):
        hourly_forecast.append(
            {
                "timestamp": _to_iso(timestamp),
                "temperature_c": _to_float((hourly.get("temperature_2m") or [None])[index]),
                "humidity_pct": _to_float((hourly.get("relative_humidity_2m") or [None])[index]),
                "pressure_hpa": _to_float((hourly.get("pressure_msl") or [None])[index]),
                "wind_speed_kmh": _to_float((hourly.get("wind_speed_10m") or [None])[index]),
                "condition": _condition_from_code((hourly.get("weather_code") or [None])[index]),
                "uv_index": _to_float((hourly.get("uv_index") or [None])[index]),
            }
        )

    return {
        "provider": "open-meteo",
        "current": {
            "provider": "open-meteo",
            "temperature_c": _to_float(current.get("temperature_2m")),
            "humidity_pct": _to_float(current.get("relative_humidity_2m")),
            "pressure_hpa": _to_float(current.get("pressure_msl")),
            "wind_speed_kmh": _to_float(current.get("wind_speed_10m")),
            "wind_direction": _normalize_direction(current.get("wind_direction_10m")),
            "feels_like_c": _to_float(current.get("apparent_temperature")),
            "condition": _condition_from_code(current.get("weather_code")),
            "cloud_cover_pct": _to_float(current.get("cloud_cover")),
            "sunrise_at": _to_iso(sunrise_at),
            "sunset_at": _to_iso(sunset_at),
            "uv_index": _to_float(uv_index_max),
            "aqi": current_aqi,
            "last_observed_at": _to_iso(current_time),
        },
        "hourly_forecast": hourly_forecast,
        "daily_summary": {
            "date": _to_iso((daily.get("time") or [None])[0]),
            "condition": _condition_from_code(daily_code),
            "temp_max_c": _to_float((daily.get("temperature_2m_max") or [None])[0]),
            "temp_min_c": _to_float((daily.get("temperature_2m_min") or [None])[0]),
            "sunrise_at": _to_iso(sunrise_at),
            "sunset_at": _to_iso(sunset_at),
            "uv_index_max": _to_float(uv_index_max),
            "aqi": current_aqi,
        },
    }


async def _get_apiary(apiary_id: str, user_id: str, token: Optional[str]) -> dict[str, Any]:
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, limit=1, token=token)
    if not apiaries:
        raise ValueError("Apiary not found")

    apiary = apiaries[0]
    owner_user_id = str(apiary.get("user_id") or "")
    farmer_id = str(apiary.get("farmer_id") or "")
    if owner_user_id == user_id or farmer_id == user_id:
        return apiary

    shares = await db_select(
        "apiary_shares",
        filters={"apiary_id": apiary_id, "shared_with_user_id": user_id},
        limit=1,
        token=token,
    )
    if shares:
        return apiary

    farmers = await db_select("farmers", filters={"user_id": user_id}, limit=1, token=token)
    current_farmer_id = str((farmers[0] or {}).get("id") or "") if farmers else ""
    if current_farmer_id and farmer_id == current_farmer_id:
        return apiary

    raise PermissionError("You do not have access to this apiary")


async def _get_linked_devices(apiary_id: str, token: Optional[str]) -> list[dict[str, Any]]:
    direct = await db_select("iot_devices", filters={"apiary_id": apiary_id}, limit=200, token=token)
    linked = await db_select("iot_devices", filters={"linked_apiary_id": apiary_id}, limit=200, token=token)
    combined: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in [*(direct or []), *(linked or [])]:
        row_id = str(row.get("id") or "")
        if not row_id or row_id in seen:
            continue
        seen.add(row_id)
        combined.append(row)
    return combined


async def _get_recent_readings(device_ids: list[str], token: Optional[str]) -> list[dict[str, Any]]:
    if not device_ids:
        return []
    rows = await db_select(
        "sensor_readings",
        filters={"device_id": device_ids},
        order_by="created_at",
        ascending=False,
        limit=400,
        token=token,
    )
    if rows:
        return rows
    return await db_select(
        "sensor_readings",
        filters={"device_id": device_ids},
        order_by="timestamp",
        ascending=False,
        limit=400,
        token=token,
    )


def _build_device_weather(readings: list[dict[str, Any]]) -> tuple[dict[str, Any], dict[str, str]]:
    normalized = [_normalize_reading_payload(row) for row in readings]
    normalized.sort(key=lambda item: _parse_dt(item.get("last_observed_at")) or datetime.min, reverse=True)

    device_current: dict[str, Any] = {}
    field_device_ids: dict[str, str] = {}
    latest_seen = None

    for reading in normalized:
        if latest_seen is None and reading.get("last_observed_at"):
            latest_seen = reading["last_observed_at"]
        for field in CURRENT_FIELDS:
            if field == "last_observed_at":
                continue
            if device_current.get(field) is None and reading.get(field) is not None:
                device_current[field] = reading[field]
                if reading.get("device_id"):
                    field_device_ids[field] = str(reading["device_id"])

    device_current["last_observed_at"] = latest_seen
    if field_device_ids:
        device_current["device_id"] = next(iter(field_device_ids.values()))
    return device_current, field_device_ids


def _build_linked_device_meta(devices: list[dict[str, Any]], readings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    latest_by_device: dict[str, str] = {}
    for row in readings:
        device_id = str(row.get("device_id") or "")
        observed_at = _to_iso(row.get("timestamp") or row.get("recorded_at") or row.get("created_at"))
        if not device_id or not observed_at:
            continue
        existing = latest_by_device.get(device_id)
        if existing is None or (_parse_dt(observed_at) or datetime.min) > (_parse_dt(existing) or datetime.min):
            latest_by_device[device_id] = observed_at

    return [
        {
            "device_id": str(device.get("id") or ""),
            "device_name": device.get("device_name") or device.get("device_code") or "Unnamed device",
            "device_type": device.get("device_type"),
            "status": device.get("status"),
            "last_ping": _to_iso(device.get("last_ping")),
            "last_observed_at": latest_by_device.get(str(device.get("id") or "")),
        }
        for device in devices
    ]


async def get_weather_summary_for_apiary(
    apiary_id: str,
    user_id: str,
    token: Optional[str] = None,
) -> dict[str, Any]:
    apiary = await _get_apiary(apiary_id, user_id, token)
    devices = await _get_linked_devices(apiary_id, token)
    device_ids = [str(device.get("id")) for device in devices if device.get("id")]
    readings = await _get_recent_readings(device_ids, token)
    device_current, field_device_ids = _build_device_weather(readings)

    latitude = _to_float(apiary.get("latitude"))
    longitude = _to_float(apiary.get("longitude"))
    provider_summary = None
    if latitude is not None and longitude is not None:
        provider_summary = await fetch_provider_weather(latitude, longitude)

    provider_current = (provider_summary or {}).get("current") or {}
    merged_current, source_meta = merge_current_weather(device_current, provider_current)

    for field, device_id in field_device_ids.items():
        if source_meta.get(field, {}).get("source") == "device":
            source_meta[field]["device_id"] = device_id

    return {
        "apiary_id": str(apiary.get("id") or apiary_id),
        "current": merged_current,
        "hourly_forecast": (provider_summary or {}).get("hourly_forecast") or [],
        "daily_summary": (provider_summary or {}).get("daily_summary") or {},
        "source_meta": source_meta,
        "linked_device_meta": _build_linked_device_meta(devices, readings),
    }
