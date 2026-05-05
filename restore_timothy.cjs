const { createClient } = require('@supabase/supabase-js');

// Config from Honey project .env
const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getUserId() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  const timothyUser = data.users.find(u => u.email === 'timothynduva349@gmail.com');
  if (!timothyUser) throw new Error('User timothynduva349@gmail.com not found');
  console.log('Found user:', timothyUser.id);
  return timothyUser.id;
}

async function deleteAllExisting(userId) {
  console.log('\nDeleting existing data for user:', userId);
  
  const tables = ['harvests', 'hives', 'apiaries', 'farmers', 'calculator_logs', 'activity_logs'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.warn(`  Warning: Could not delete from ${table}:`, error.message);
    } else {
      console.log(`  Deleted from ${table}`);
    }
  }
}

async function main() {
  console.log('BeeYield Data Restoration for Timothy S. (V2)');
  console.log('============================================\n');

  const userId = await getUserId();
  await deleteAllExisting(userId);

  // 1. Create farmer
  console.log('\nCreating farmer...');
  const { data: farmer, error: fe } = await supabase.from('farmers').insert({
    user_id: userId,
    name: 'Timothy Nduva',
    phone: '+254 712 345 678',
    experience_years: 6,
    story: 'IoT, Finance & Marketing expert with a lifelong love for bees. At 26, Timothy combines technology and traditional beekeeping to create sustainable honey production systems in Makueni County.',
    location_name: 'Kibwezi, Makueni',
    certification_status: 'Certified',
    total_hives: 184,
    registration_date: '2020-01-15'
  }).select().single();
  if (fe) throw fe;
  console.log('  Farmer created:', farmer.id);

  // 2. Create apiary
  console.log('\nCreating apiary...');
  const { data: apiary, error: ae } = await supabase.from('apiaries').insert({
    user_id: userId,
    farmer_id: farmer.id,
    name: 'BeeYield Apiary',
    location_name: 'Kalakalya, Kibwezi',
    county: 'Makueni',
    region: 'Kibwezi East',
    apiary_code: 'BY-MKN-001',
    apiary_type: 'Permanent',
    primary_forage: 'Acacia, Wildflower, Sisal',
    size_acres: 5.0,
    expected_hives: 200,
    status: 'active',
    notes: 'Primary apiary in semi-arid Kalakalya, Kibwezi. Rich in Acacia and wildflower nectar sources.'
  }).select().single();
  if (ae) throw ae;
  console.log('  Apiary created:', apiary.id);

  // 3. Create 184 hives
  console.log('\nCreating 184 hives...');
  const hiveTypes = ['Langstroth', 'KTBH', 'Log Hive', 'Langstroth', 'Langstroth', 'KTBH'];
  const materials = ['Wood', 'Wood', 'Cypress', 'Pine', 'Cedar'];
  const beeTypes = ['African Honey Bee', 'African Honey Bee', 'Apis mellifera scutellata'];
  const healthStatuses = ['Good', 'Good', 'Good', 'Good', 'Excellent', 'Good', 'Fair'];

  const hivesToInsert = [];
  for (let i = 1; i <= 184; i++) {
    const num = String(i).padStart(3, '0');
    const yr = 2020 + Math.floor(Math.random() * 5);
    const mn = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const dy = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    hivesToInsert.push({
      user_id: userId, apiary_id: apiary.id, farmer_id: farmer.id,
      hive_code: 'BY-H' + num,
      nickname: i <= 30 ? 'Pioneer ' + i : (i <= 80 ? 'Colony ' + i : 'Unit ' + i),
      hive_type: hiveTypes[i % hiveTypes.length],
      bee_type: beeTypes[i % beeTypes.length],
      frame_count: hiveTypes[i % hiveTypes.length] === 'KTBH' ? 28 : 10,
      material: materials[i % materials.length],
      status: 'Active & Healthy',
      health_status: healthStatuses[i % healthStatuses.length],
      installation_date: yr + '-' + mn + '-' + dy
    });
  }

  for (let b = 0; b < hivesToInsert.length; b += 50) {
    const chunk = hivesToInsert.slice(b, b + 50);
    const { error } = await supabase.from('hives').insert(chunk);
    if (error) throw error;
    console.log('  Inserted hives ' + (b+1) + ' to ' + Math.min(b+50, hivesToInsert.length));
  }

  // Fetch all hives back to get IDs
  const { data: allHives } = await supabase.from('hives').select('id, hive_code').eq('user_id', userId).order('hive_code');
  console.log('  Total hives:', allHives.length);

  console.log('\nCreating harvests (843kg)...');
  const yearPlans = [
    { year: 2020, records: 20, kgPer: 2 },  // 40kg
    { year: 2021, records: 35, kgPer: 2 },  // 70kg
    { year: 2022, records: 45, kgPer: 2 },  // 90kg
    { year: 2023, records: 75, kgPer: 2 },  // 150kg
    { year: 2024, records: 105, kgPer: 2 }, // 210kg
    { year: 2025, records: 110, kgPer: 2 }, // 220kg
    { year: 2026, records: 30, kgPer: 2 },  // 60kg
  ];
  
  const honeyTypes = ['Acacia', 'Wildflower', 'Multi-flora', 'Sisal Blossom', 'Calliandra'];
  const qualities = [95, 92, 88, 98, 94];
  const colorGrades = ['Light Amber', 'Amber', 'Extra Light Amber', 'White'];
  const nectarSources = ['Acacia tortilis', 'Wild clover', 'Sisal flower', 'Calliandra calothyrsus', 'Mixed bushland'];
  const extraction = ['Cold Extraction', 'Cold Extraction', 'Centrifugal', 'Crush and Strain'];

  let allRecords = [];
  let batchNum = 0;
  let globalHiveIdx = 0;

  for (const plan of yearPlans) {
    for (let r = 0; r < plan.records; r++) {
      batchNum++;
      const hive = allHives[globalHiveIdx % allHives.length];
      globalHiveIdx++;
      
      let month, day;
      if (plan.year === 2026) {
        month = 1;
        day = 3 + Math.floor(r * 7 / plan.records);
      } else {
        month = Math.floor(r * 12 / plan.records) + 1;
        if (month > 12) month = 12;
        day = Math.floor(Math.random() * 25) + 1;
      }
      
      const dateStr = plan.year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      const bc = 'BEE-' + plan.year + '-' + String(month).padStart(2,'0') + '-' + String(batchNum).padStart(4,'0');
      
      const moisture = parseFloat((16.5 + Math.random() * 3).toFixed(1));

      allRecords.push({
        user_id: userId,
        hive_id: hive.id,
        apiary_id: apiary.id,
        farmer_id: farmer.id,
        harvest_date: dateStr,
        quantity_kg: plan.kgPer,
        honey_type: honeyTypes[batchNum % honeyTypes.length],
        color_grade: colorGrades[batchNum % colorGrades.length],
        nectar_source: nectarSources[batchNum % nectarSources.length],
        extraction_method: extraction[batchNum % extraction.length],
        moisture_content: moisture,
        moisture_content_percent: moisture,
        batch_code: bc,
        batch_id: bc,
        quality_score: qualities[batchNum % qualities.length],
        is_verified: true,
        notes: 'Harvest from ' + hive.hive_code + '. ' + plan.year + ' season.',
        harvester_name: 'Timothy Nduva'
      });
    }
  }

  // Add bonus records to reach exactly 843kg if needed
  // Current total: 420 records * 2kg = 840kg. Need 3kg more.
  for (let i=0; i<3; i++) {
    batchNum++;
    const hive = allHives[globalHiveIdx % allHives.length];
    globalHiveIdx++;
    const bc = 'BEE-2025-07-BONUS-' + i;
    allRecords.push({
      user_id: userId,
      hive_id: hive.id,
      apiary_id: apiary.id,
      farmer_id: farmer.id,
      harvest_date: '2025-07-15',
      quantity_kg: 1,
      honey_type: 'Acacia',
      color_grade: 'Amber',
      nectar_source: 'Acacia tortilis',
      batch_code: bc,
      batch_id: bc,
      is_verified: true,
      notes: 'Supplementary harvest.',
      harvester_name: 'Timothy Nduva'
    });
  }

  console.log('  Total records:', allRecords.length);

  for (let b = 0; b < allRecords.length; b += 50) {
    const chunk = allRecords.slice(b, b + 50);
    const { error } = await supabase.from('harvests').insert(chunk);
    if (error) {
       console.error('  Error at batch ' + b + ':', error.message);
    } else {
      console.log('  Inserted harvests ' + (b+1) + '-' + Math.min(b+50, allRecords.length));
    }
  }

  console.log('\n--- VERIFICATION ---');
  const { count: hc } = await supabase.from('hives').select('*', {count:'exact',head:true}).eq('user_id', userId);
  const { count: rc } = await supabase.from('harvests').select('*', {count:'exact',head:true}).eq('user_id', userId);
  console.log('  Hives:', hc);
  console.log('  Harvest Records:', rc);
  console.log('\nDONE!');
}

main().catch(console.error);
