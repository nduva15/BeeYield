const fs = require('fs');
const s = fs.readFileSync('scratch_index.js', 'utf8');
const pos = s.indexOf('children:v.jsx(Nh,{})');
console.log('pos:', pos);
const chunkImports = s.match(/\.\/[A-Za-z0-9_-]+\.js/g) || [];
console.log('All unique chunk imports:', [...new Set(chunkImports)].filter(c => c.includes('BeeYield') || c.includes('Measure') || c.includes('Dashboard')));
