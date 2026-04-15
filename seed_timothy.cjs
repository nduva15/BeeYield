const { createClient } = require('@supabase/supabase-js');

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

async function deleteAllExisting() {
  console.log('\nDeleting all existing data...');
  await supabase.from('harvests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  Harvests deleted');
  await supabase.from('honey_batches').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(() => console.log('  honey_batches deleted')).catch(() => console.log('  honey_batches table may not exist'));
  await supabase.from('hives').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  Hives deleted');
  await supabase.from('apiaries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  Apiaries deleted');
  await supabase.from('farmers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  Farmers deleted');
}

async function main() {
  console.log('BeeYield Data Seed Script');
  console.log('========================\n');

  const userId = await getUserId();
  await deleteAllExisting();

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
    apiary_code: 'BEE-MKN-001',
    apiary_type: 'Permanent',
    primary_forage: 'Acacia, Wildflower, Sisal',
    size_acres: 5.0,
    expected_hives: 200,
    status: 'Active',
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
      hive_code: 'BEE-H' + num,
      nickname: i <= 30 ? 'Pioneer ' + i : (i <= 80 ? 'Colony ' + i : 'Unit ' + i),
      hive_type: hiveTypes[i % hiveTypes.length],
      bee_type: beeTypes[i % beeTypes.length],
      frame_count: hiveTypes[i % hiveTypes.length] === 'KTBH' ? 28 : 10,
      material: materials[i % materials.length],
      status: 'ACTIVE',
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
  const qualities = [95, 92, 88, 98, 94]; // numerical quality_score for harvests
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
        // Jan 3-10
        month = 1;
        day = 3 + Math.floor(r * 7 / plan.records);
      } else {
        month = Math.floor(r * 12 / plan.records) + 1;
        if (month > 12) month = 12;
        day = Math.floor(Math.random() * 25) + 1;
      }
      
      const dateStr = plan.year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      const bc = 'BEE-' + plan.year + '-' + String(month).padStart(2,'0') + '-' + String(batchNum).padStart(4,'0');
      
      allRecords.push({
        user_id: userId,
        hive_id: hive.id,
        farmer_id: farmer.id,
        harvest_date: dateStr,
        quantity_kg: plan.kgPer,
        quality_score: qualities[batchNum % qualities.length], // integer
        honey_type: honeyTypes[batchNum % honeyTypes.length],
        color_grade: colorGrades[batchNum % colorGrades.length],
        nectar_source: nectarSources[batchNum % nectarSources.length],
        extraction_method: extraction[batchNum % extraction.length],
        moisture_content_percent: parseFloat((16.5 + Math.random() * 3).toFixed(1)),
        batch_code: bc,
        batch_id: bc,
        is_verified: true,
        notes: 'Harvest from ' + hive.hive_code + '. ' + plan.year + ' season.',
        harvester_name: 'Timothy Nduva'
        // farmer_name is removed since it does not exist in harvests schema
      });
    }
  }

  // Add 3 extra 1kg records to reach 843kg total
  const bonusYears = [2023, 2024, 2025];
  for (const by of bonusYears) {
    batchNum++;
    const hive = allHives[globalHiveIdx % allHives.length];
    globalHiveIdx++;
    const bc = 'BEE-' + by + '-07-' + String(batchNum).padStart(4,'0');
    allRecords.push({
      user_id: userId,
      hive_id: hive.id,
      farmer_id: farmer.id,
      harvest_date: by + '-07-15',
      quantity_kg: 1,
      quality_score: 95,
      honey_type: 'Acacia',
      color_grade: 'Amber',
      nectar_source: 'Acacia tortilis',
      extraction_method: 'Cold Extraction',
      moisture_content_percent: 17.0,
      batch_code: bc,
      batch_id: bc,
      is_verified: true,
      notes: 'Supplementary harvest, ' + by + ' season.',
      harvester_name: 'Timothy Nduva'
    });
  }

  const totalKg = allRecords.reduce((s, r) => s + r.quantity_kg, 0);
  console.log('  Total records:', allRecords.length, '| Total KG:', totalKg);

  for (let b = 0; b < allRecords.length; b += 50) {
    const chunk = allRecords.slice(b, b + 50);
    const { error } = await supabase.from('harvests').insert(chunk);
    if (error) {
      console.error('  Error at batch ' + b + ':', error.message);
      // Try individually
      for (const rec of chunk) {
        const { error: se } = await supabase.from('harvests').insert(rec);
        if (se) console.error('  Single fail ' + rec.batch_code + ':', se.message);
      }
    } else {
      console.log('  Inserted harvests ' + (b+1) + '-' + Math.min(b+50, allRecords.length));
    }
  }

  // 5. Create honey_batches (traceability tab)
  console.log('\nCreating honey_batches for traceability...');
  const honeyBatches = allRecords.map(h => {
    // Determine the letter grade since quality_score is integer in harvests
    let grade = 'A';
    if(h.quality_score < 90) grade = 'B';
    
    return {
      batch_code: h.batch_code,
      honey_type: h.honey_type,
      harvest_date: h.harvest_date,
      packaged_date: h.harvest_date,
      quantity_kg: h.quantity_kg,
      processing_method: h.extraction_method,
      farmer_name: 'Timothy Nduva', // honey_batches has farmer_name
      farmer_phone: '+254 712 345 678',
      beekeeper_name: 'Timothy Nduva',
      beekeeper_id: 'BK-MKN-001',
      apiary_name: 'BeeYield Apiary',
      location_county: 'Makueni',
      location_region: 'Kibwezi East',
      latitude: -2.365 + Math.random() * 0.01,
      longitude: 37.93 + Math.random() * 0.01,
      quality_grade: grade, // Assuming text grade
      moisture_content: h.moisture_content_percent, // mapped from moisture_content_percent
      color_grade: h.color_grade,
      status: 'verified',
      block_hash: '0x' + Array.from({length:40}, ()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('')
    }
  });

  let batchCreated = false;
  for (let b = 0; b < honeyBatches.length; b += 50) {
    const chunk = honeyBatches.slice(b, b + 50);
    const { error } = await supabase.from('honey_batches').insert(chunk);
    if (error) {
      console.warn('  honey_batches failed (probably column mismatch):', error.message);
      for (const rec of chunk) {
        const { error: se } = await supabase.from('honey_batches').insert(rec);
        if (se) console.error('  Single fail batches ' + rec.batch_code + ':', se.message);
      }
      break;
    } else {
      batchCreated = true;
      console.log('  Inserted honey_batches ' + (b+1) + '-' + Math.min(b+50, honeyBatches.length));
    }
  }

  // 6. Verify
  console.log('\n--- VERIFICATION ---');
  const { count: fc } = await supabase.from('farmers').select('*', {count:'exact',head:true}).eq('user_id', userId);
  const { count: ac } = await supabase.from('apiaries').select('*', {count:'exact',head:true}).eq('user_id', userId);
  const { count: hc } = await supabase.from('hives').select('*', {count:'exact',head:true}).eq('user_id', userId);
  const { count: rc } = await supabase.from('harvests').select('*', {count:'exact',head:true}).eq('user_id', userId);
  const { count: bc } = await supabase.from('honey_batches').select('*', {count:'exact',head:true});
  const { data: wdata } = await supabase.from('harvests').select('harvest_date, quantity_kg').eq('user_id', userId);
  const yearTotals = {};
  let totalW = 0;
  wdata?.forEach(h => {
    const yr = h.harvest_date.substring(0,4);
    yearTotals[yr] = (yearTotals[yr]||0) + Number(h.quantity_kg);
    totalW += Number(h.quantity_kg);
  });

  console.log('  Farmers:', fc);
  console.log('  Apiaries:', ac);
  console.log('  Hives:', hc);
  console.log('  Harvest Records:', rc);
  console.log('  Honey Batches:', bc);
  console.log('  Total Weight:', totalW + ' kg');
  console.log('  Per Year:', JSON.stringify(yearTotals));
  console.log('\nDONE!');
}

main().catch(console.error);
