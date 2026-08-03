const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walk(filepath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filepath);
    }
  }
}

walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  if (content.includes('useCallback')) {
    // Get the first few lines of the file (usually contains imports)
    const lines = content.split('\n');
    const importLines = lines.filter(l => l.includes('import') || l.includes('useCallback')).slice(0, 10);
    console.log(`--- File: ${filepath} ---`);
    importLines.forEach(l => console.log('  ', l.trim()));
  }
});
