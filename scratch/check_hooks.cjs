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

const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];

console.log("Starting full hook import validation scan...");
walk('src', (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  
  // Find React imports
  // We want to extract what's imported from 'react'
  // e.g. import React, { useState, useEffect } from 'react';
  // or import { useState } from 'react';
  // or import * as React from 'react';
  const reactImportRegex = /import\s+([\w*,\s{}]+)\s+from\s+['"]react['"]/g;
  let match;
  let importedNames = new Set();
  let importsReactNamespace = false;
  
  while ((match = reactImportRegex.exec(content)) !== null) {
    const importSpec = match[1];
    // check if it's namespace or default
    if (importSpec.includes('* as React') || importSpec.includes('React')) {
      importsReactNamespace = true;
    }
    // extract curly braces
    const curlies = importSpec.match(/\{([^}]+)\}/);
    if (curlies) {
      const names = curlies[1].split(',').map(n => n.trim());
      names.forEach(name => {
        // handle 'useState as state'
        const parts = name.split(/\s+as\s+/);
        importedNames.add(parts[0]);
      });
    }
  }
  
  hooks.forEach(hook => {
    // Check if the bare hook name is used in the code (word boundary, not preceded by a dot)
    // Avoid matching hook definitions or comments if possible, but a regex is fine for now
    const hookUsageRegex = new RegExp(`(?<!\\.)\\b${hook}\\b`, 'g');
    const hasUsage = hookUsageRegex.test(content);
    
    if (hasUsage) {
      // It is used. Is it imported?
      const isImported = importedNames.has(hook);
      // Or is it used as React.useState?
      const isUsedAsNamespace = new RegExp(`React\\.${hook}\\b`).test(content);
      
      if (!isImported && !isUsedAsNamespace) {
        // Let's verify it's not in a comment or string (simple check: if it's on a line that starts with // or * it might be a comment)
        // Let's find the lines using it
        const lines = content.split('\n');
        const usageLines = [];
        lines.forEach((line, idx) => {
          if (hookUsageRegex.test(line) && !new RegExp(`React\\.${hook}\\b`).test(line)) {
            // Ensure not a comment line
            const trimmed = line.trim();
            if (!trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
              usageLines.push({ lineNum: idx + 1, content: trimmed });
            }
          }
        });
        
        if (usageLines.length > 0) {
          console.log(`\n[ALERT] Missing hook import in ${filepath}:`);
          console.log(`  Hook: ${hook}`);
          usageLines.forEach(ul => {
            console.log(`  Line ${ul.lineNum}: ${ul.content}`);
          });
        }
      }
    }
  });
});
console.log("\nScan complete.");
