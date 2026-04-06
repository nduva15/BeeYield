from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.db.supabase_db import db_select


WEATHER_CODE_LABELS = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
}

COMPASS_POINTS = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
]


def _to_float(value: Any) -> Optional[float]:
    if value is None or value == "":
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


def _parse_dt(value: Any) -> Optional[str]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    text = str(value)
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).isoformat()
    except ValueError:
        return text


def _wind_direction_label(value: Any) -> Optional[str]:
    degrees = _to_float(value)
    if degrees is None:
        return None
    index = round(degrees / 22.5) % len(COMPASS_POINTS)
    return COMPASS_POINTS[index]


def _weather_code_label(value: Any) -> Optional[str]:
    code = _to_int(value)
    if code is None:
        return None
    return WEATHER_CODE_LABELS.get(code, f"Code {code}")


def _pick_first(record: dict[str, Any], *keys: str) -> Optional[float]:
    readings = record.get("readings") if isinstance(record.get("readings"), dict) else {}
    for key in keys:
        if key in record:
            value = _to_float(record.get(key))
            if value is not None:
                return value
        if key in readings:
            value = _to_float(readings.get(key))
            if value is not None:
                return value
    return None


def _pick_timestamp(record: dict[str, Any]) -> Optional[str]:
    for key in ("recorded_at", "timestamp", "created_at"):
        value = _parse_dt(record.get(key))
        if value:
            return value
    return None


def merge_current_weather(
    device_current: Optional[dict[str, Any]],
    provider_current: Optional[dict[str, Any]],
) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    device_current = device_current or {}
    provider_current = provider_current or {}

    provider_source = {
        "source": "provider",
        "provider": "open-meteo",
        "observed_at": provider_current.get("last_observed_at"),
    }
    default_device_source = {
        "source": "device",
        "provider": None,
        "device_id": device_current.get("device_id"),
        "observed_at": device_current.get("last_observed_at"),
    }

    field_precedence = {
        "temperature_c": ("device", "provider"),
        "humidity_pct": ("device", "provider"),
        "pressure_hpa": ("device", "provider"),
        "wind_speed_kmh": ("device", "provider"),
        "wind_direction": ("device", "provider"),
        "feels_like_c": ("provider", "device"),
        "condition": ("device", "provider"),
        "cloud_cover_pct": ("provider", "device"),
        "sunrise_at": ("provider",),
        "sunset_at": ("provider",),
        "uv_index": ("provider", "device"),
        "aqi": ("provider",),
        "last_observed_at": ("device", "provider"),
    }

    merged: dict[str, Any] = {}
    source_meta: dict[str, dict[str, Any]] = {}

    for field, precedence in field_precedence.items():
        value = None
        source = {"source": "unavailable", "provider": None, "device_id": None, "observed_at": None}
        for candidate in precedence:
            payload = device_current if candidate == "device" else provider_current
            candidate_value = payload.get(field)
            if candidate_value is None:
                continue
            value = candidate_value
            source = default_device_source.copy() if candidate == "device" else provider_source.copy()
            break
        merged[field] = value
        source_meta[field] = source

    return merged, source_meta


def _normalize_device_current(readings: list[dict[str, Any]], devices: list[dict[str, Any]]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    latest_by_device: dict[str, dict[str, Any]] = {}
    current: dict[str, Any] = {}

    for row in readings:
        device_id = str(row.get("device_id") or "")
        if device_id and device_id not in latest_by_device:
            latest_by_device[device_id] = row

    for row in readings:
        recorded_at = _pick_timestamp(row)
        current.setdefault("last_observed_at", recorded_at)

        if current.get("temperature_c") is None:
            current["temperature_c"] = _pick_first(row, "temperature", "temp_external", "temp_internal", "internal_temp")
        if current.get("humidity_pct") is None:
            current["humidity_pct"] = _pick_first(row, "humidity", "humidity_external", "humidity_internal")
        if current.get("pressure_hpa") is None:
            current["pressure_hpa"] = _pick_first(row, "pressure_hpa", "pressure_mbar", "pressure", "pressure_msl")
        if current.get("wind_speed_kmh") is None:
            current["wind_speed_kmh"] = _pick_first(row, "wind_speed_kmh", "wind_speed", "windspeed_10m")
        if current.get("uv_index") is None:
            current["uv_index"] = _pick_first(row, "uv_index", "uv")
        if current.get("cloud_cover_pct") is None:
            current["cloud_cover_pct"] = _pick_first(row, "cloud_cover_percent", "cloud_cover")
        if current.get("feels_like_c") is None:
            current["feels_like_c"] = _pick_first(row, "feels_like_c", "apparent_temperature", "heat_index")
        if current.get("aqi") is None:
            current["aqi"] = _to_int(_pick_first(row, "aqi", "us_aqi"))

        if current.get("wind_direction") is None:
            direction_value = _pick_first(row, "wind_direction", "wind_direction_10m")
            current["wind_direction"] = _wind_direction_label(direction_value)

        if current.get("condition") is None:
            weather_code = _pick_first(row, "weather_code")
            raw_condition = row.get("condition") or row.get("weather_condition")
            current["condition"] = raw_condition or _weather_code_label(weather_code)

        if current.get("device_id") is None and row.get("device_id"):
            current["device_id"] = str(row.get("device_id"))

    linked_meta: list[dict[str, Any]] = []
    for device in devices:
        row = latest_by_device.get(str(device.get("id")))
        linked_meta.append(
            {
                "device_id": str(device.get("id")),
                "device_name": device.get("device_name"),
                "device_code": device.get("device_code"),
                "device_type": device.get("device_type"),
                "last_ping": _parse_dt(device.get("last_ping")),
                "last_reading_at": _pick_timestamp(row or {}),
            }
        )

    return current, linked_meta


async def _fetch_provider_payload(latitude: float, longitude: float) -> tuple[dict[str, Any], dict[str, Any]]:
    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
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
                "uv_index",
            ]
        ),
        "hourly": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "pressure_msl",
                "wind_speed_10m",
                "wind_direction_10m",
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
        "forecast_days": 3,
    }
    air_quality_params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "current": "us_aqi",
        "hourly": "us_aqi",
        "forecast_days": 3,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        weather_response, air_quality_response = await asyncio.gather(
            client.get(settings.OPEN_METEO_BASE_URL, params=weather_params),
            client.get(settings.OPEN_METEO_AIR_QUALITY_URL, params=air_quality_params),
        )
        weather_response.raise_for_status()
        air_quality_response.raise_for_status()
        return weather_response.json(), air_quality_response.json()


async def fetch_provider_weather(latitude: Optional[float], longitude: Optional[float]) -> Optional[dict[str, Any]]:
    if latitude is None or longitude is None:
        return None

    try:
        weather_payload, air_quality_payload = await _fetch_provider_payload(latitude, longitude)
    except Exception as exc:
        print(f"[weather-summary] provider fetch failed: {exc}")
        return None

    current_weather = weather_payload.get("current") or {}
    current_air = air_quality_payload.get("current") or {}
    current = {
        "temperature_c": _to_float(current_weather.get("temperature_2m")),
        "humidity_pct": _to_float(current_weather.get("relative_humidity_2m")),
        "pressure_hpa": _to_float(current_weather.get("pressure_msl")),
        "wind_speed_kmh": _to_float(current_weather.get("wind_speed_10m")),
        "wind_direction": _wind_direction_label(current_weather.get("wind_direction_10m")),
        "feels_like_c": _to_float(current_weather.get("apparent_temperature")),
        "condition": _weather_code_label(current_weather.get("weather_code")),
        "cloud_cover_pct": _to_float(current_weather.get("cloud_cover")),
        "sunrise_at": None,
        "sunset_at": None,
        "uv_index": _to_float(current_weather.get("uv_index")),
        "aqi": _to_int(current_air.get("us_aqi")),
        "last_observed_at": _parse_dt(current_weather.get("time")),
    }

    hourly_time = weather_payload.get("hourly", {}).get("time") or []
    hourly_temp = weather_payload.get("hourly", {}).get("temperature_2m") or []
    hourly_humidity = weather_payload.get("hourly", {}).get("relative_humidity_2m") or []
    hourly_pressure = weather_payload.get("hourly", {}).get("pressure_msl") or []
    hourly_wind = weather_payload.get("hourly", {}).get("wind_speed_10m") or []
    hourly_uv = weather_payload.get("hourly", {}).get("uv_index") or []
    hourly_code = weather_payload.get("hourly", {}).get("weather_code") or []
    hourly_aqi = air_quality_payload.get("hourly", {}).get("us_aqi") or []

    hourly_forecast: list[dict[str, Any]] = []
    for idx, time_value in enumerate(hourly_time[:12]):
        hourly_forecast.append(
            {
                "time": _parse_dt(time_value),
                "temperature_c": _to_float(hourly_temp[idx]) if idx < len(hourly_temp) else None,
                "humidity_pct": _to_float(hourly_humidity[idx]) if idx < len(hourly_humidity) else None,
                "pressure_hpa": _to_float(hourly_pressure[idx]) if idx < len(hourly_pressure) else None,
                "wind_speed_kmh": _to_float(hourly_wind[idx]) if idx < len(hourly_wind) else None,
                "condition": _weather_code_label(hourly_code[idx]) if idx < len(hourly_code) else None,
                "uv_index": _to_float(hourly_uv[idx]) if idx < len(hourly_uv) else None,
                "aqi": _to_int(hourly_aqi[idx]) if idx < len(hourly_aqi) else None,
            }
        )

    daily = weather_payload.get("daily") or {}
    dates = daily.get("time") or []
    current["sunrise_at"] = _parse_dt((daily.get("sunrise") or [None])[0])
    current["sunset_at"] = _parse_dt((daily.get("sunset") or [None])[0])

    daily_summary: list[dict[str, Any]] = []
    daily_aqi = air_quality_payload.get("hourly", {}).get("us_aqi") or []
    air_times = air_quality_payload.get("hourly", {}).get("time") or []
    aqi_by_date: dict[str, list[int]] = {}
    for idx, time_value in enumerate(air_times):
        aqi = _to_int(daily_aqi[idx]) if idx < len(daily_aqi) else None
        if aqi is None:
            continue
        key = str(time_value).split("T")[0]
        aqi_by_date.setdefault(key, []).append(aqi)

    for idx, date_value in enumerate(dates[:3]):
        key = str(date_value).split("T")[0]
        daily_summary.append(
            {
                "date": _parse_dt(date_value),
                "min_temperature_c": _to_float((daily.get("temperature_2m_min") or [None])[idx]),
                "max_temperature_c": _to_float((daily.get("temperature_2m_max") or [None])[idx]),
                "sunrise_at": _parse_dt((daily.get("sunrise") or [None])[idx]),
                "sunset_at": _parse_dt((daily.get("sunset") or [None])[idx]),
                "uv_index_max": _to_float((daily.get("uv_index_max") or [None])[idx]),
                "max_aqi": max(aqi_by_date.get(key, [])) if aqi_by_date.get(key) else None,
                "condition": _weather_code_label((daily.get("weather_code") or [None])[idx]),
            }
        )

    return {
        "current": current,
        "hourly_forecast": hourly_forecast,
        "daily_summary": daily_summary,
    }


def _build_device_hourly(readings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    points: list[dict[str, Any]] = []
    for row in readings[:12]:
        timestamp = _pick_timestamp(row)
        if not timestamp:
            continue
        points.append(
            {
                "time": timestamp,
                "temperature_c": _pick_first(row, "temperature", "temp_external", "temp_internal", "internal_temp"),
                "humidity_pct": _pick_first(row, "humidity", "humidity_external", "humidity_internal"),
                "pressure_hpa": _pick_first(row, "pressure_hpa", "pressure_mbar", "pressure", "pressure_msl"),
                "wind_speed_kmh": _pick_first(row, "wind_speed_kmh", "wind_speed"),
                "condition": row.get("condition") or row.get("weather_condition"),
                "uv_index": _pick_first(row, "uv_index", "uv"),
            }
        )
    return list(reversed(points))


async def get_weather_summary_for_apiary(apiary_id: str, user_id: str, token: Optional[str] = None) -> dict[str, Any]:
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, limit=1, token=token)
    if not apiaries:
        raise ValueError("Apiary not found")

    apiary = apiaries[0]
    if apiary.get("user_id") != user_id:
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, limit=1, token=token)
        if not shares:
            raise PermissionError("Access denied")

    devices = await db_select("iot_devices", filters={"apiary_id": apiary_id}, limit=1000, token=token)
    linked_devices = await db_select("iot_devices", filters={"linked_apiary_id": apiary_id}, limit=1000, token=token)
    device_map = {str(device.get("id")): device for device in [*devices, *linked_devices] if device.get("id")}
    devices = list(device_map.values())

    hives = await db_select("hives", filters={"apiary_id": apiary_id}, limit=1000, token=token)
    hive_ids = [str(hive.get("id")) for hive in hives if hive.get("id")]

    readings: list[dict[str, Any]] = []
    if hive_ids:
        readings = await db_select("sensor_readings", filters={"hive_id": hive_ids}, limit=240, order_by="recorded_at", ascending=False, token=token)
    if not readings:
        readings = await db_select("sensor_readings", filters={"apiary_id": apiary_id}, limit=240, order_by="recorded_at", ascending=False, token=token)
    if not readings and devices:
        device_ids = [str(device.get("id")) for device in devices if device.get("id")]
        if device_ids:
            readings = await db_select("sensor_readings", filters={"device_id": device_ids}, limit=240, order_by="recorded_at", ascending=False, token=token)

    device_current, linked_device_meta = _normalize_device_current(readings, devices)
    provider_payload = await fetch_provider_weather(_to_float(apiary.get("latitude")), _to_float(apiary.get("longitude")))
    provider_current = (provider_payload or {}).get("current") or {}
    current, source_meta = merge_current_weather(device_current, provider_current)

    hourly_forecast = (provider_payload or {}).get("hourly_forecast") or _build_device_hourly(readings)
    daily_summary = (provider_payload or {}).get("daily_summary") or []

    return {
        "apiary_id": apiary_id,
        "apiary_name": apiary.get("name"),
        "current": current,
        "hourly_forecast": hourly_forecast,
        "daily_summary": daily_summary,
        "source_meta": source_meta,
        "linked_device_meta": linked_device_meta,
    }
