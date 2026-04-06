import { format, subHours } from 'date-fns';

import { CROP_PROFILES } from '@/lib/apicultureModels';
import type {
  Apiary,
  CropPollinationRequirement,
  Hive,
  IoTDevice,
  SensorAlert,
  SensorReading,
  Task,
} from '@/services/beeyieldService';

const ACTIVE_HIVE_STATUSES = new Set(['active', 'healthy', 'ok']);

const normalizeCropName = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const firstFinite = (...values: Array<number | string | null | undefined>) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

export const isHiveActive = (status?: string | null) =>
  ACTIVE_HIVE_STATUSES.has(String(status || '').toLowerCase());

export const extractReadingTimestamp = (reading: SensorReading) => {
  const raw = (reading as any).recorded_at || reading.timestamp || (reading as any).created_at;
  if (!raw) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const extractReadingTemperature = (reading: SensorReading) =>
  firstFinite(
    reading.temperature,
    (reading.readings as any)?.temperature,
    (reading.readings as any)?.temp_c,
    (reading.readings as any)?.temp,
  );

export const extractReadingHumidity = (reading: SensorReading) =>
  firstFinite(
    reading.humidity,
    (reading.readings as any)?.humidity,
    (reading.readings as any)?.humidity_pct,
  );

export const extractReadingBattery = (reading: SensorReading) =>
  firstFinite(
    reading.battery_level,
    (reading.readings as any)?.battery_level,
    (reading.readings as any)?.battery_voltage,
  );

export const extractReadingActivity = (reading: SensorReading) => {
  const direct = firstFinite(
    (reading as any).vpm,
    (reading as any).visits_per_minute,
    (reading as any).activity_vpm,
    (reading.readings as any)?.bee_activity,
    (reading.readings as any)?.foraging_rate,
    (reading.readings as any)?.activity,
  );
  if (direct !== null) {
    return Math.max(0, Math.min(100, direct));
  }

  const deltaWeight = Math.abs(
    firstFinite(reading.delta_w, (reading.readings as any)?.delta_w, (reading.readings as any)?.weight_delta) || 0,
  );
  if (deltaWeight > 0) {
    return Math.max(0, Math.min(100, deltaWeight * 25));
  }

  const signalStrength = firstFinite(reading.signal_strength, reading.signal_dbm, (reading.readings as any)?.signal_strength);
  if (signalStrength !== null) {
    return Math.max(0, Math.min(100, signalStrength > 0 ? signalStrength : 110 + signalStrength));
  }

  return 0;
};

export function resolveTargetFpa(
  forageType?: string | null,
  cropRequirements: CropPollinationRequirement[] = [],
) {
  const normalized = normalizeCropName(forageType);
  const matchedRequirement = cropRequirements.find((crop) => normalizeCropName(crop.crop_name) === normalized);
  const requirementFpa = Number(matchedRequirement?.target_fpa);
  if (Number.isFinite(requirementFpa) && requirementFpa > 0) return requirementFpa;

  const matchedProfile = Object.entries(CROP_PROFILES).find(([name]) => normalizeCropName(name) === normalized);
  const profileFpa = matchedProfile?.[1]?.recommendedFPA;
  if (Number.isFinite(profileFpa) && profileFpa > 0) return profileFpa;

  const defaultProfile =
    CROP_PROFILES.Maize
    || Object.values(CROP_PROFILES).find((profile) => Number.isFinite(profile?.recommendedFPA) && profile.recommendedFPA > 0);

  return defaultProfile?.recommendedFPA ?? 8;
}

export function filterHivesByApiary(hives: Hive[], apiaryId?: string | null) {
  if (!apiaryId) return [];
  return hives.filter((hive) => hive.apiary_id === apiaryId);
}

export function filterDevicesByApiary(devices: IoTDevice[], apiaryId?: string | null, hives: Hive[] = []) {
  if (!apiaryId) return [];
  const hiveIds = new Set(hives.map((hive) => hive.id));
  return devices.filter((device) => device.apiary_id === apiaryId || device.linked_apiary_id === apiaryId || (device.hive_id && hiveIds.has(device.hive_id)));
}

export function filterReadingsByApiary(readings: SensorReading[], hives: Hive[] = [], devices: IoTDevice[] = []) {
  const hiveIds = new Set(hives.map((hive) => hive.id));
  const deviceIds = new Set(devices.map((device) => device.id));

  return readings.filter((reading) => {
    if (reading.hive_id && hiveIds.has(reading.hive_id)) return true;
    if (deviceIds.has(reading.device_id)) return true;
    return false;
  });
}

export function filterAlertsByApiary(alerts: SensorAlert[], apiaryId?: string | null, hives: Hive[] = []) {
  if (!apiaryId) return [];
  const hiveIds = new Set(hives.map((hive) => hive.id));
  return alerts.filter((alert) => alert.apiary_id === apiaryId || hiveIds.has(alert.hive_id));
}

export function filterTasksByApiary(tasks: Task[], apiaryId?: string | null, hives: Hive[] = []) {
  if (!apiaryId) return [];
  const hiveIds = new Set(hives.map((hive) => hive.id));
  return tasks.filter((task) => task.apiary_id === apiaryId || (task.hive_id ? hiveIds.has(task.hive_id) : false));
}

export function buildTelemetrySeries(readings: SensorReading[], bucketCount = 8, windowHours = 24) {
  if (!bucketCount || windowHours <= 0) return [];

  const now = new Date();
  const start = subHours(now, windowHours);
  const bucketMs = (windowHours * 60 * 60 * 1000) / bucketCount;

  return Array.from({ length: bucketCount }).map((_, index) => {
    const bucketStart = new Date(start.getTime() + index * bucketMs);
    const bucketEnd = new Date(bucketStart.getTime() + bucketMs);
    const bucketReadings = readings.filter((reading) => {
      const timestamp = extractReadingTimestamp(reading);
      return timestamp && timestamp >= bucketStart && timestamp < bucketEnd;
    });

    const avg = (values: number[]) =>
      values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

    const activity = avg(bucketReadings.map(extractReadingActivity).filter((value) => value > 0));
    const temperature = avg(
      bucketReadings
        .map(extractReadingTemperature)
        .filter((value): value is number => value !== null),
    );
    const humidity = avg(
      bucketReadings
        .map(extractReadingHumidity)
        .filter((value): value is number => value !== null),
    );

    const tempComfort = temperature === null ? 55 : Math.max(0, 100 - Math.abs(temperature - 24) * 6);
    const humidityComfort = humidity === null ? 55 : Math.max(0, 100 - Math.abs(humidity - 60) * 1.8);
    const probability = Math.round(
      Math.max(0, Math.min(100, (activity || 0) * 0.6 + tempComfort * 0.25 + humidityComfort * 0.15)),
    );

    return {
      time: format(bucketEnd, 'HH:mm'),
      activity: Math.round(activity || 0),
      temp: Math.round(temperature || 0),
      humidity: Math.round(humidity || 0),
      prob: probability,
      sampleCount: bucketReadings.length,
    };
  });
}

export function deriveCoverageMetrics(
  apiary: Apiary | null | undefined,
  hives: Hive[],
  alerts: SensorAlert[] = [],
  cropRequirements: CropPollinationRequirement[] = [],
) {
  const acreage = Math.max(1, Number(apiary?.size_acres || 0) || 1);
  const totalHives = hives.length;
  const activeHives = hives.filter((hive) => isHiveActive(hive.status)).length;
  const totalFrames = hives.reduce((sum, hive) => sum + (Number(hive.frame_count) || 8), 0);
  const activeFrames = hives
    .filter((hive) => isHiveActive(hive.status))
    .reduce((sum, hive) => sum + (Number(hive.frame_count) || 8), 0);
  const avgFramesPerHive = totalHives ? totalFrames / totalHives : 0;
  const targetFpa = resolveTargetFpa(apiary?.forage_type, cropRequirements);
  const currentFpa = totalFrames / acreage;
  const activeFpa = activeFrames / acreage;
  const coveragePercent = Math.max(0, Math.min(100, (activeFpa / targetFpa) * 100));
  const coverageGapPercent = Math.max(0, 100 - coveragePercent);
  const requiredHives = Math.max(1, Math.ceil((acreage * targetFpa) / Math.max(1, avgFramesPerHive || 8)));
  const openAlerts = alerts.filter((alert) => !alert.resolved).length;
  const criticalAlerts = alerts.filter((alert) => !alert.resolved && alert.severity === 'critical').length;

  return {
    acreage,
    totalHives,
    activeHives,
    totalFrames,
    activeFrames,
    avgFramesPerHive,
    targetFpa,
    currentFpa,
    activeFpa,
    coveragePercent,
    coverageGapPercent,
    requiredHives,
    nodeEfficiency: totalHives ? (activeHives / totalHives) * 100 : 0,
    overlapRating: requiredHives ? Math.min(1.2, totalHives / requiredHives) : 0,
    openAlerts,
    criticalAlerts,
  };
}

export function describeCoverageAction(metrics: ReturnType<typeof deriveCoverageMetrics>) {
  if (!metrics.totalHives) {
    return 'No hives are assigned to this apiary yet. Add hive records to generate a coverage map.';
  }

  if (metrics.coverageGapPercent > 35) {
    return `Coverage is below target by ${metrics.coverageGapPercent.toFixed(0)}%. Add or reactivate hives before bloom peak.`;
  }

  if (metrics.openAlerts > 0) {
    return `${metrics.openAlerts} open alert${metrics.openAlerts === 1 ? '' : 's'} are reducing effective pollination coverage.`;
  }

  if (metrics.overlapRating > 1) {
    return 'Coverage is at or above target. Review hive spacing to reduce overlap and improve efficiency.';
  }

  return 'Coverage is tracking close to target. Keep monitoring live telemetry during the bloom window.';
}
