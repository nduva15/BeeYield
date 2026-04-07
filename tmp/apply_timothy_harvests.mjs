import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

const env = {
  ...parseEnvFile(path.join(cwd, ".env")),
  ...parseEnvFile(path.join(cwd, "backend", ".env")),
  ...process.env,
};

const baseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const timothyEmail = "timothynduva349@gmail.com";

if (!baseUrl || !serviceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

function headers(prefer = "return=representation") {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

async function request(method, table, { query, body, prefer } = {}) {
  const url = new URL(`/rest/v1/${table}`, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers: headers(prefer),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${url}: ${res.status} ${text}`);
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function getOne(table, query) {
  const rows = await request("GET", table, { query });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function getMany(table, query) {
  const rows = await request("GET", table, { query });
  return Array.isArray(rows) ? rows : [];
}

async function insert(table, body, prefer = "return=representation") {
  return request("POST", table, { body, prefer });
}

async function patch(table, query, body, prefer = "return=representation") {
  return request("PATCH", table, { query, body, prefer });
}

async function del(table, query) {
  return request("DELETE", table, { query, prefer: "return=minimal" });
}

function yearPlans() {
  return [
    { year: 2020, totalKg: 13, start: "2020-06-15", end: "2020-12-15", honeyType: "Wildflower", nectarSource: "Wildflower", colorGrade: "Amber" },
    { year: 2021, totalKg: 60, start: "2021-06-15", end: "2021-12-15", honeyType: "Wildflower", nectarSource: "Wildflower", colorGrade: "Light Amber" },
    { year: 2022, totalKg: 55, start: "2022-06-15", end: "2022-12-15", honeyType: "Forest", nectarSource: "Acacia", colorGrade: "Amber" },
    { year: 2023, totalKg: 105, start: "2023-06-15", end: "2023-12-15", honeyType: "Wildflower", nectarSource: "Wildflower", colorGrade: "Water White" },
    { year: 2024, totalKg: 250, start: "2024-06-15", end: "2024-12-15", honeyType: "Wildflower", nectarSource: "Acacia", colorGrade: "Extra White" },
    { year: 2025, totalKg: 300, start: "2025-06-15", end: "2025-12-15", honeyType: "Forest", nectarSource: "Forest", colorGrade: "Dark Amber" },
    { year: 2026, totalKg: 60, start: "2026-01-03", end: "2026-01-10", honeyType: "Early Spring", nectarSource: "Flowers", colorGrade: "Extra Light Amber" },
  ];
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daySpan(start, end) {
  const ms = new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`);
  return Math.floor(ms / 86400000) + 1;
}

function batchCodeFor(date, hiveCode) {
  const suffix = hiveCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(-4);
  return `BY-${date.replaceAll("-", "")}-${suffix}`;
}

function batchIdFor(date, seq) {
  const [year, month] = date.split("-");
  return `BEE-${year}-${month}-${String(seq).padStart(3, "0")}`;
}

function buildHarvestRecords(userId, farmerId, apiaryId, hives) {
  const records = [];
  for (const plan of yearPlans()) {
    const fullBatches = Math.floor(plan.totalKg / 2);
    const remainderKg = plan.totalKg - fullBatches * 2;
    const totalBatches = fullBatches + (remainderKg > 0 ? 1 : 0);
    const span = daySpan(plan.start, plan.end);

    for (let seq = 1; seq <= totalBatches; seq += 1) {
      const quantity = seq <= fullBatches ? 2 : remainderKg;
      const harvestDate = addDays(plan.start, (seq - 1) % span);
      const hiveIndex = plan.year === 2026 ? seq - 1 : (((plan.year - 2020) * 31) + (seq - 1)) % hives.length;
      const hive = hives[hiveIndex];
      const batchCode = batchCodeFor(harvestDate, hive.hive_code);
      const batchId = batchIdFor(harvestDate, seq);

      records.push({
        user_id: userId,
        farmer_id: farmerId,
        apiary_id: apiaryId,
        hive_id: hive.id,
        quantity_kg: quantity,
        harvest_date: harvestDate,
        nectar_source: plan.nectarSource,
        honey_type: plan.honeyType,
        notes: plan.year === 2026
          ? `Current Year - Jan Harvest Window batch ${seq} of ${totalBatches} (2kg per batch)`
          : `Legacy Sync - ${plan.year} batch ${seq} of ${totalBatches} (2kg per batch)`,
        batch_code: batchCode,
        batch_id: batchId,
        is_verified: true,
        moisture_content_percent: 17.5,
        color_grade: plan.colorGrade,
      });
    }
  }
  return records;
}

async function main() {
  let profile = await getOne("profiles", {
    select: "id,email,full_name,first_name,last_name,phone",
    email: `eq.${timothyEmail}`,
    limit: "1",
  });

  if (!profile) {
    profile = await getOne("beeyield_profiles", {
      select: "id,email,phone,first_name,last_name",
      email: `eq.${timothyEmail}`,
      limit: "1",
    });
  }

  if (!profile?.id) {
    throw new Error(`No profile found for ${timothyEmail}`);
  }

  const userId = profile.id;
  const farmerName = "Timothy Nduva";
  const phone = profile.phone || null;

  let farmer = await getOne("farmers", {
    select: "*",
    user_id: `eq.${userId}`,
    limit: "1",
  });

  if (!farmer) {
    const created = await insert("farmers", {
      user_id: userId,
      name: farmerName,
      location_name: "Kibwezi",
      phone,
    });
    farmer = Array.isArray(created) ? created[0] : created;
  } else {
    const updated = await patch("farmers", { id: `eq.${farmer.id}` }, {
      user_id: userId,
      name: farmerName,
      location_name: farmer.location_name || "Kibwezi",
      phone: farmer.phone || phone,
    });
    farmer = Array.isArray(updated) ? updated[0] : updated;
  }

  let apiary = await getOne("apiaries", {
    select: "*",
    user_id: `eq.${userId}`,
    name: "eq.Kibwezi Main Apiary",
    limit: "1",
  });

  if (!apiary) {
    apiary = await getOne("apiaries", {
      select: "*",
      user_id: `eq.${userId}`,
      order: "created_at.asc",
      limit: "1",
    });
  }

  if (!apiary) {
    const created = await insert("apiaries", {
      user_id: userId,
      farmer_id: farmer.id,
      name: "Kibwezi Main Apiary",
      location_name: "Kibwezi",
      apiary_type: "Permanent",
      primary_forage: "Acacia",
      status: "active",
    });
    apiary = Array.isArray(created) ? created[0] : created;
  } else {
    const updated = await patch("apiaries", { id: `eq.${apiary.id}` }, {
      user_id: userId,
      farmer_id: farmer.id,
      name: "Kibwezi Main Apiary",
      location_name: apiary.location_name || "Kibwezi",
    });
    apiary = Array.isArray(updated) ? updated[0] : updated;
  }

  let hives = await getMany("hives", {
    select: "id,hive_code,apiary_id,user_id,farmer_id",
    apiary_id: `eq.${apiary.id}`,
    order: "hive_code.asc",
    limit: "500",
  });

  const targetHives = 184;
  if (hives.length < targetHives) {
    const toCreate = [];
    for (let i = hives.length + 1; i <= targetHives; i += 1) {
      toCreate.push({
        hive_code: `KBZ-${String(i).padStart(3, "0")}`,
        apiary_id: apiary.id,
        user_id: userId,
        farmer_id: farmer.id,
        status: "ACTIVE",
        health_status: "Good",
        hive_type: "Langstroth",
      });
    }
    await insert("hives", toCreate, "return=minimal");
    hives = await getMany("hives", {
      select: "id,hive_code,apiary_id,user_id,farmer_id",
      apiary_id: `eq.${apiary.id}`,
      order: "hive_code.asc",
      limit: "500",
    });
  }

  for (const hive of hives) {
    if (hive.user_id !== userId || hive.farmer_id !== farmer.id || hive.apiary_id !== apiary.id) {
      await patch("hives", { id: `eq.${hive.id}` }, {
        user_id: userId,
        farmer_id: farmer.id,
        apiary_id: apiary.id,
      }, "return=minimal");
    }
  }

  hives = hives.sort((a, b) => String(a.hive_code).localeCompare(String(b.hive_code)));

  await del("harvests", {
    user_id: `eq.${userId}`,
    harvest_date: "gte.2020-01-01",
    and: "(harvest_date.lt.2027-01-01)",
  });

  const harvestRecords = buildHarvestRecords(userId, farmer.id, apiary.id, hives);
  for (let i = 0; i < harvestRecords.length; i += 100) {
    await insert("harvests", harvestRecords.slice(i, i + 100), "return=minimal");
  }

  let batchTableAvailable = true;
  try {
    await getMany("honey_batches", { select: "batch_code", limit: "1" });
  } catch {
    batchTableAvailable = false;
  }

  let insertedHarvests = await getMany("harvests", {
    select: "id,batch_code,hive_id,apiary_id,farmer_id,harvest_date,honey_type,quantity_kg,color_grade",
    user_id: `eq.${userId}`,
    harvest_date: "gte.2020-01-01",
    order: "harvest_date.asc",
    limit: "1000",
  });

  if (batchTableAvailable) {
    const allCodes = insertedHarvests.map((row) => row.batch_code).filter(Boolean);
    for (let i = 0; i < allCodes.length; i += 100) {
      const chunk = allCodes.slice(i, i + 100).map((code) => `"${code}"`).join(",");
      await del("honey_batches", {
        batch_code: `in.(${chunk})`,
      }).catch(() => null);
    }

    const batchRecords = insertedHarvests.map((row) => ({
      batch_code: row.batch_code,
      harvest_id: row.id,
      hive_id: row.hive_id,
      apiary_id: row.apiary_id,
      farmer_id: row.farmer_id,
      user_id: userId,
      harvest_date: row.harvest_date,
      honey_type: row.honey_type,
      quantity_kg: row.quantity_kg,
      processing_method: "Cold Extraction",
      farmer_name: farmerName,
      beekeeper_name: farmerName,
      beekeeper_id: farmer.id,
      apiary_name: "Kibwezi Main Apiary",
      quality_grade: "GRADE A",
      moisture_content: 17.5,
      color_grade: row.color_grade,
      status: "ready",
    }));

    for (let i = 0; i < batchRecords.length; i += 100) {
      await insert("honey_batches", batchRecords.slice(i, i + 100), "return=minimal").catch(() => null);
    }
  }

  const totalKg = harvestRecords.reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0);
  const jan2026 = harvestRecords.filter((row) => row.harvest_date >= "2026-01-03" && row.harvest_date <= "2026-01-10");

  console.log(JSON.stringify({
    userId,
    farmerId: farmer.id,
    apiaryId: apiary.id,
    hiveCount: hives.length,
    harvestRecordCount: harvestRecords.length,
    totalKg,
    jan2026Kg: jan2026.reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0),
    jan2026BatchRecords: jan2026.length,
    honeyBatchesAttempted: batchTableAvailable ? insertedHarvests.length : 0,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
