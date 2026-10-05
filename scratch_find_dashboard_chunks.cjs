const fs = require('fs');
const s = fs.readFileSync('scratch_prod_dashboard.js', 'utf8');
const chunkImports = s.match(/\.\/[A-Za-z0-9_-]+\.js/g) || [];
console.log('All unique chunk imports in dashboard:', [...new Set(chunkImports)]);
