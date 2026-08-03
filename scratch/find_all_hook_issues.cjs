const fs = require('fs');
const path = require('path');

const HOOKS = ['useCallback', 'useState', 'useEffect', 'useMemo', 'useRef', 'useContext', 'useReducer', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore', 'useInsertionEffect'];

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

let issues = [];

walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  // Gather all imports from 'react' - handle multi-line imports
  let reactImports = new Set();
  let hasReactDefaultImport = false;

  // Join all import lines from react into one string
  let inReactImport = false;
  let reactImportBlock = '';
  for (const line of lines) {
    if (inReactImport) {
      reactImportBlock += ' ' + line.trim();
      if (line.includes('}') || line.includes(';') || line.includes("from")) {
        inReactImport = false;
      }
    } else if (/import\s/.test(line) && /from\s+['"]react['"]/.test(line)) {
      reactImportBlock += ' ' + line.trim();
    } else if (/import\s/.test(line) && /['"]react['"]/.test(line)) {
      reactImportBlock += ' ' + line.trim();
    } else if (/import\s+\{/.test(line) && !line.includes('from') && !line.includes(';')) {
      // Might be the start of a multi-line import, check following lines
      // Actually let's handle this differently
    }
  }

  // Also try to match multi-line imports more robustly
  const fullContent = content.replace(/\r\n/g, '\n');
  const importRegex = /import\s+([\s\S]*?)\s+from\s+['"]react['"]/g;
  let match;
  while ((match = importRegex.exec(fullContent)) !== null) {
    const importClause = match[1];
    // Check for default import (React)
    if (/\bReact\b/.test(importClause)) {
      hasReactDefaultImport = true;
    }
    // Extract named imports
    const namedMatch = importClause.match(/\{([^}]*)\}/);
    if (namedMatch) {
      const names = namedMatch[1].split(',').map(n => n.trim()).filter(Boolean);
      names.forEach(n => reactImports.add(n));
    }
  }

  // Now check each hook for bare usage without import
  for (const hook of HOOKS) {
    // Check if the hook is used as a bare identifier (not React.hook, not .hook, not in import, not in string/comment)
    // Simple approach: check if `hook(` appears NOT preceded by a dot
    const bareUsageRegex = new RegExp(`(?<!\\.)\\b${hook}\\s*\\(`, 'g');
    const usages = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip import lines
      if (/^\s*import\s/.test(line)) continue;
      // Skip comment lines
      if (/^\s*\/\//.test(line)) continue;
      if (/^\s*\*/.test(line)) continue;
      
      if (bareUsageRegex.test(line)) {
        usages.push({ lineNum: i + 1, line: line.trim() });
      }
      bareUsageRegex.lastIndex = 0;
    }

    if (usages.length > 0) {
      // Check if the hook is imported
      const isImported = reactImports.has(hook);
      if (!isImported) {
        issues.push({
          file: filepath,
          hook,
          hasReactDefault: hasReactDefaultImport,
          usages,
        });
      }
    }
  }
});

console.log(`\n=== Hook Import Analysis ===\n`);
if (issues.length === 0) {
  console.log('No issues found! All hooks are properly imported.');
} else {
  console.log(`Found ${issues.length} potential issue(s):\n`);
  for (const issue of issues) {
    if (issue.hasReactDefault) {
      // Using React.useCallback is fine, skip false positives
      // But check if ANY usage is truly bare (not React.hook)
      const trueBareUsages = issue.usages.filter(u => {
        return !u.line.includes(`React.${issue.hook}`);
      });
      if (trueBareUsages.length > 0) {
        console.log(`❌ ${issue.file}`);
        console.log(`   Hook: ${issue.hook} — NOT in named imports, but used as bare identifier`);
        console.log(`   (Has React default import — but bare usage found)`);
        trueBareUsages.forEach(u => {
          console.log(`   Line ${u.lineNum}: ${u.line}`);
        });
        console.log('');
      }
    } else {
      console.log(`❌ ${issue.file}`);
      console.log(`   Hook: ${issue.hook} — NOT imported from 'react' at all!`);
      issue.usages.forEach(u => {
        console.log(`   Line ${u.lineNum}: ${u.line}`);
      });
      console.log('');
    }
  }
}
