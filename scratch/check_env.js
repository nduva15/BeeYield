import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file does not exist at path:', envPath);
} else {
  console.log('✅ .env file exists. Analyzing variables...');
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      console.log(`⚠️ Line ${index + 1} has invalid format: "${trimmed}"`);
      return;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    console.log(`- ${key}: ${val ? `DEFINED (length: ${val.length})` : 'EMPTY'}`);
  });
}
