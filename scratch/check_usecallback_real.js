const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.venv') {
        walk(filepath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filepath);
    }
  }
}

const issues = [];

walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  
  // Check if bare `useCallback` is used
  // We match `useCallback` but make sure it is not preceded by a dot
  // We can do this by matching all occurrences of `useCallback` and checking their context
  const bareUseCallbackRegex = /\buseCallback\b/g;
  let match;
  let hasBareUsage = false;
  
  while ((match = bareUseCallbackRegex.exec(content)) !== null) {
    const index = match.index;
    // Check character before match (ignoring whitespace)
    let isDot = false;
    let i = index - 1;
    while (i >= 0 && /\s/.test(content[i])) {
      i--;
    }
    if (i >= 0 && content[i] === '.') {
      isDot = true;
    }
    
    // Check if it is part of an import statement
    // Simple check: is it in a line starting with `import`?
    // Let's find the start of the line
    let lineStart = index;
    while (lineStart >= 0 && content[lineStart] !== '\n') {
      lineStart--;
    }
    const line = content.substring(lineStart + 1, index + 20);
    const isImport = /import\s/.test(content.substring(lineStart + 1, index));
    
    if (!isDot && !isImport) {
      hasBareUsage = true;
      break;
    }
  }
  
  if (hasBareUsage) {
    // Check if `useCallback` is imported from 'react'
    // Let's look at all imports from 'react'
    // To handle multi-line imports, we find all instances of import {...} from 'react'
    // Let's use a regex that matches react imports:
    const reactImportRegex = /import\s+([\s\S]*?)\s+from\s+['"]react['"]/g;
    let isImported = false;
    let importMatch;
    
    while ((importMatch = reactImportRegex.exec(content)) !== null) {
      const importClause = importMatch[1];
      // Check if `useCallback` is inside the curly braces of the import clause
      const curlyMatch = importClause.match(/\{([^}]+)\}/);
      if (curlyMatch) {
        const imports = curlyMatch[1].split(',').map(s => s.trim());
        if (imports.includes('useCallback')) {
          isImported = true;
          break;
        }
      }
    }
    
    if (!isImported) {
      issues.push(filepath);
    }
  }
});

console.log("=== Real useCallback Issues ===");
console.log(issues);
