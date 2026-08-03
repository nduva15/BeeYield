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

console.log("Starting missing import scan...");
walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  if (content.includes('useCallback')) {
    // Check if the file imports useCallback
    const hasImport = content.includes('useCallback') && (
      content.match(/import\s+{[^}]*useCallback[^}]*}\s+from\s+['"]react['"]/) ||
      content.match(/import\s+React\b/) ||
      content.match(/React\.useCallback/)
    );
    
    // Let's do a stricter check. If it uses bare `useCallback`, it MUST have it in the react import.
    // Let's check if the bare word `useCallback` is used.
    // Bare word means not preceded by `.` or is React.useCallback
    const usesBareuseCallback = /\buseCallback\b/.test(content) && !/\.useCallback\b/.test(content);
    const importsBareuseCallback = /import\s+{[^}]*\buseCallback\b[^}]*}\s+from\s+['"]react['"]/.test(content);
    
    if (usesBareuseCallback && !importsBareuseCallback) {
      console.log(`Potential issue in ${filepath}: uses bare useCallback but does not import it.`);
    }
  }
});
console.log("Scan complete.");
