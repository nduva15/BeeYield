const fs = require('fs');
const s = fs.readFileSync('scratch_prod_dashboard.js', 'utf8');
const pos = s.indexOf('validateSensorDeviceSerial');
console.log('validateSensorDeviceSerial in BeeYieldDashboard:', pos);
if (pos !== -1) {
  console.log(s.slice(Math.max(0, pos - 100), pos + 100));
}
