const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const repoDir = process.cwd();
const trackedFiles = cp.execSync('git ls-files', { cwd: repoDir }).toString().split(/\r?\n/).filter(Boolean);
const trackedSet = new Set(trackedFiles);

const lowerToExact = {};
trackedFiles.forEach(f => { lowerToExact[f.toLowerCase()] = f; });

function checkImports() {
    let mismatches = 0;
    trackedFiles.forEach(f => {
        if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
        const fullPath = path.join(repoDir, f);
        if (!fs.existsSync(fullPath)) return;
        const content = fs.readFileSync(fullPath, 'utf8');
        
        const importRegex = /from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            if (importPath.startsWith('.') || importPath.startsWith('@/')) {
                let resolvedRel;
                if (importPath.startsWith('@/')) {
                    resolvedRel = 'src/' + importPath.substring(2);
                } else {
                    const dir = path.dirname(f);
                    resolvedRel = path.join(dir, importPath).replace(/\\/g, '/');
                }
                
                const exts = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
                let foundExact = false;
                let actualCasing = null;
                
                for (const ext of exts) {
                    const candidate = resolvedRel + ext;
                    if (trackedSet.has(candidate)) {
                        foundExact = true;
                        break;
                    }
                    if (lowerToExact[candidate.toLowerCase()]) {
                        actualCasing = lowerToExact[candidate.toLowerCase()];
                    }
                }
                
                if (!foundExact && actualCasing) {
                    console.log('CASE MISMATCH in ' + f + '\n  Imports: ' + importPath + '\n  Actual:  ' + actualCasing);
                    mismatches++;
                }
            }
        }
    });
    if (mismatches === 0) console.log('All tracked imports match actual file casing exactly!');
}
checkImports();
