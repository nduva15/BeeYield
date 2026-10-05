const fs = require('fs');
const s = fs.readFileSync('scratch_remote_chunk.js', 'utf8');
console.log('length:', s.length);
const matches = s.match(/[a-zA-Z0-9_$]*validateSensor[a-zA-Z0-9_$]*/gi) || [];
console.log('Matches for validateSensor:', matches);
const m2 = s.match(/[a-zA-Z0-9_$]*DeviceSerial[a-zA-Z0-9_$]*/gi) || [];
console.log('Matches for DeviceSerial:', m2);
