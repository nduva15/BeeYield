const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    if (file === 'LovableIndex.tsx' || file === 'ChatHistory.tsx' || file === 'AboutModal.tsx') return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Ensure ArrowLeft is imported
    if (!content.includes('ArrowLeft')) {
        const lucideImport = /import \{ ([^}]*) \} from "lucide-react";/;
        content = content.replace(lucideImport, (match, p1) => {
            if (!p1.includes('ArrowLeft')) return `import { ${p1.trim()}, ArrowLeft } from "lucide-react";`;
            return match;
        });
        changed = true;
    }

    // 2. Fix containerClasses - ensure absolute inset-0 z-40 for embedded
    const containerRegex = /const containerClasses = embedded\s*\?\s*"[^"]*"\s*:\s*"fixed inset-0 z-\[[^\]]*\][^"]*";/g;
    const containerReplacement = 'const containerClasses = embedded \n    ? "absolute inset-0 z-40 bg-background overflow-y-auto custom-scroll" \n    : "fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll";';
    
    if (content.match(containerRegex)) {
        content = content.replace(containerRegex, containerReplacement);
        changed = true;
    }

    // 3. Add Back button at the top of contentClasses div
    // We look for <div className={contentClasses}> and insert the button immediately after
    const contentDivRegex = /(<div className=\{contentClasses\}>)/;
    const backButton = `$1\n        <button onClick={onClose} className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3 h-3" /> Back to Chat</button>`;
    
    if (content.match(contentDivRegex) && !content.includes('Back to Chat')) {
        content = content.replace(contentDivRegex, backButton);
        changed = true;
    }

    // 4. Remove any duplicate Back buttons that might have been added by previous scripts
    content = content.replace(/<button onClick=\{onClose\} className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3 h-3" \/> Back<\/button>/g, '');

    if (changed) {
        console.log(`Updating ${file}...`);
        fs.writeFileSync(filePath, content);
    }
});
