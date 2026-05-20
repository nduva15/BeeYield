const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v5: uuidv5 } = require('uuid');

function getEnvValue(keyName, defaultValue = '') {
  if (process.env[keyName]) return process.env[keyName];
  let dir = __dirname;
  while (dir) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      try {
        const envData = fs.readFileSync(envPath, 'utf8');
        for (const line of envData.split('\n')) {
          const parts = line.split('=');
          if (parts.length >= 2 && parts[0].trim() === keyName) {
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            return val;
          }
        }
      } catch (e) {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return defaultValue;
}

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL_BEEYIELD') || getEnvValue('VITE_SUPABASE_URL') || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD environment variable is missing.');
}
const CANONICAL_DATA_PATH = path.join(
  __dirname,
  'data',
  'canonical_traceability_records.txt'
);

const NAMESPACE = '7d119d09-7623-4171-a4e8-5716b4dbcf12';
const CANONICAL_USER_EMAIL = 'timothynduva349@gmail.com';
const CANONICAL_FARMER_PHONE = '0742004187';
const CANONICAL_FARMER_NAME = 'Timothy Nduva';
const CANONICAL_APIARY_NAME = 'BeeYield Canonical Traceability Apiary';
const CANONICAL_LOCATION_NAME = 'Kibwezi Sanctuary';
const CANONICAL_HIVE_CODE = 'N/A';
const TRACE_SOURCE = 'seed_import';
const DEVICE_TYPE = 'system_import';
const PROCESSING_METHOD = 'Raw Cold Extraction';
const PRODUCT_IDS = {
  acacia: 'e8a9f7d2-4b2a-4a2a-8b2a-4a2a4a2a4a2a',
  premium: 'f1b1a1a1-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
};

const MONTHS = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function stableId(scope, value) {
  return uuidv5(`${scope}:${value}`, NAMESPACE);
}

function parseHumanDate(value) {
  const match = String(value || '')
    .trim()
    .match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);

  if (!match) {
    throw new Error(`Unsupported date format: ${value}`);
  }

  const [, monthName, day, year] = match;
  const month = MONTHS[monthName];
  if (!month) {
    throw new Error(`Unsupported month: ${monthName}`);
  }

  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function parseQuantityKg(value) {
  const numeric = Number.parseFloat(String(value || '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric)) {
    throw new Error(`Could not parse quantity from "${value}"`);
  }
  return numeric;
}

function normalizeGrade(value) {
  const cleaned = String(value || '').trim();
  const match = cleaned.match(/^GRADE\s+(.+)$/i);
  return (match ? match[1] : cleaned).trim() || 'A';
}

function parseCanonicalRecords(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const records = [];

  for (let index = 0; index < lines.length; index += 1) {
    const recordLine = lines[index];
    if (!/^(BEE|BY)-/.test(recordLine)) {
      continue;
    }

    const cols = recordLine.split(/\t+/).map((part) => part.trim());
    if (cols.length < 6) {
      throw new Error(`Malformed canonical record line: ${recordLine}`);
    }

    const blockchainHash = lines[index + 1] && lines[index + 1].startsWith('0x')
      ? lines[++index].trim()
      : '';
    const normalizedHash = /^0x\.{3,}$/i.test(blockchainHash)
      ? null
      : (blockchainHash || null);

    const [batchCode, hiveCode, harvestDate, honeyType, netKg, grade] = cols;

    records.push({
      batch_code: batchCode,
      hive_code: hiveCode || CANONICAL_HIVE_CODE,
      harvest_date: parseHumanDate(harvestDate),
      honey_type: honeyType,
      quantity_kg: parseQuantityKg(netKg),
      grade: normalizeGrade(grade),
      blockchain_hash: normalizedHash,
    });
  }

  return records;
}

function buildSeedRows(records, ids, userId) {
  const harvestRows = [];
  const batchRows = [];
  const traceRows = [];

  for (const record of records) {
    const harvestId = stableId('harvest', record.batch_code);
    const batchId = stableId('batch', record.batch_code);
    const traceId = stableId('trace', record.batch_code);
    const traceCreatedAt = `${record.harvest_date}T08:00:00.000Z`;
    const isPremium = /premium/i.test(record.honey_type);
    const status = record.blockchain_hash ? 'verified' : 'recorded';

    harvestRows.push({
      id: harvestId,
      user_id: userId,
      hive_id: ids.hiveId,
      apiary_id: ids.apiaryId,
      farmer_id: ids.farmerId,
      date: record.harvest_date,
      weight_kg: record.quantity_kg,
      quantity_left_for_bees_kg: 0,
      honey_type: record.honey_type,
      batch_code: record.batch_code,
      color_grade: record.grade,
      quality: `Grade ${record.grade}`,
      is_verified: Boolean(record.blockchain_hash),
      blockchain_hash: record.blockchain_hash,
      notes: 'Canonical BeeYield traceability import',
      extraction_method: PROCESSING_METHOD,
      floral_source: 'Acacia',
      weather_conditions: 'Captured from canonical record import',
      created_at: traceCreatedAt,
      updated_at: traceCreatedAt,
      farmer_name: CANONICAL_FARMER_NAME,
      batch_id: record.batch_code,
      florage_type: isPremium ? 'Premium Acacia' : 'Acacia',
      qr_code_url: `/traceability?code=${encodeURIComponent(record.batch_code)}`,
    });

    batchRows.push({
      id: batchId,
      batch_code: record.batch_code,
      honey_type: record.honey_type,
      harvest_date: record.harvest_date,
      quantity_kg: record.quantity_kg,
      processing_method: PROCESSING_METHOD,
      block_hash: record.blockchain_hash,
      farmer_name: CANONICAL_FARMER_NAME,
      farmer_phone: CANONICAL_FARMER_PHONE,
      beekeeper_name: CANONICAL_FARMER_NAME,
      beekeeper_id: ids.farmerId,
      apiary_name: CANONICAL_APIARY_NAME,
      location_county: 'Makueni',
      location_region: 'Eastern',
      latitude: -2.41,
      longitude: 37.97,
      quality_grade: record.grade,
      color_grade: record.grade,
      status,
      created_at: traceCreatedAt,
    });

    traceRows.push({
      id: traceId,
      batch_code: record.batch_code,
      batch_id: harvestId,
      honey_type: record.honey_type,
      farmer_name: CANONICAL_FARMER_NAME,
      apiary_name: CANONICAL_APIARY_NAME,
      traced_by_email: CANONICAL_USER_EMAIL,
      traced_by_name: CANONICAL_FARMER_NAME,
      trace_source: TRACE_SOURCE,
      device_type: DEVICE_TYPE,
      device_info: 'backend/final_seed_traceability.cjs',
      is_authenticated: true,
      created_at: traceCreatedAt,
    });
  }

  return { harvestRows, batchRows, traceRows };
}

async function upsertChunked(table, rows, options = {}, chunkSize = 100) {
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, options);
    if (error) {
      throw new Error(`Failed to upsert ${table} rows ${start}-${start + chunk.length - 1}: ${error.message}`);
    }
  }
}

async function ensureCanonicalEntities(userId) {
  const farmerId = stableId('farmer', CANONICAL_FARMER_NAME);
  const apiaryId = stableId('apiary', CANONICAL_APIARY_NAME);
  const hiveId = stableId('hive', `${CANONICAL_APIARY_NAME}:${CANONICAL_HIVE_CODE}`);

  await upsertChunked('farmers', [
    {
      id: farmerId,
      farmer_id: farmerId,
      name: CANONICAL_FARMER_NAME,
      phone: CANONICAL_FARMER_PHONE,
      experience_years: 15,
      story: 'Canonical BeeYield traceability farmer record used to preserve the historical batch ledger.',
      location_name: CANONICAL_LOCATION_NAME,
      county: 'Makueni',
      region: 'Eastern',
      latitude: -2.41,
      longitude: 37.97,
      status: 'active',
    },
  ], { onConflict: 'id' });

  await upsertChunked('apiaries', [
    {
      id: apiaryId,
      name: CANONICAL_APIARY_NAME,
      location_name: CANONICAL_LOCATION_NAME,
      county: 'Makueni',
      region: 'Eastern',
      latitude: -2.41,
      longitude: 37.97,
      farmer_id: farmerId,
      status: 'active',
    },
  ], { onConflict: 'id' });

  await upsertChunked('hives', [
    {
      id: hiveId,
      hive_code: CANONICAL_HIVE_CODE,
      apiary_id: apiaryId,
      type: 'Traceability Placeholder',
      installation_date: '2020-01-01',
      status: 'active',
      notes: 'Used to anchor historical and retail traceability records where the source hive was not captured.',
    },
  ], { onConflict: 'id' });

  return { farmerId, apiaryId, hiveId };
}

async function resolveCanonicalUserId() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  const user = data.users.find((entry) => entry.email === CANONICAL_USER_EMAIL);
  if (!user) {
    throw new Error(`User ${CANONICAL_USER_EMAIL} not found.`);
  }

  return user.id;
}

async function linkShopVariants() {
  const updates = [
    { productId: PRODUCT_IDS.acacia, batchCode: 'BY-AC-24-002' },
    { productId: PRODUCT_IDS.premium, batchCode: 'BY-PR-24-002' },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('product_variants')
      .update({ batch_code: update.batchCode })
      .eq('product_id', update.productId);

    if (error) {
      throw new Error(`Failed to link product ${update.productId} to ${update.batchCode}: ${error.message}`);
    }
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = fs.readFileSync(CANONICAL_DATA_PATH, 'utf8');
  const records = parseCanonicalRecords(raw);

  if (records.length === 0) {
    throw new Error('No canonical traceability records were parsed.');
  }

  console.log(`Parsed ${records.length} canonical traceability records.`);
  console.log(`First batch: ${records[0].batch_code}`);
  console.log(`Last batch: ${records[records.length - 1].batch_code}`);

  if (dryRun) {
    return;
  }

  const userId = await resolveCanonicalUserId();
  const ids = await ensureCanonicalEntities(userId);
  const { harvestRows, batchRows, traceRows } = buildSeedRows(records, ids, userId);

  await upsertChunked('harvests', harvestRows, { onConflict: 'id' });
  await upsertChunked('honey_batches', batchRows, { onConflict: 'id' });
  await upsertChunked('tracing_history', traceRows, { onConflict: 'id' });
  await linkShopVariants();

  console.log('Canonical harvest, batch, and tracing history records have been seeded.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
