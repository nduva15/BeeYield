const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Update containerClasses for embedded mode to be absolute inset-0
    const containerRegex = /const containerClasses = embedded\s*\?\s*"[^"]*"\s*:\s*"fixed inset-0 z-\[60\] bg-background\/95 backdrop-blur-sm overflow-y-auto custom-scroll";/g;
    const containerReplacement = 'const containerClasses = embedded \n    ? "absolute inset-0 z-40 bg-background overflow-y-auto custom-scroll" \n    : "fixed inset-0 z-[60] bg-background\/95 backdrop-blur-sm overflow-y-auto custom-scroll";';
    
    if (content.match(containerRegex)) {
        content = content.replace(containerRegex, containerReplacement);
        changed = true;
    }

    // 2. Ensure we have a Back button if embedded and no close button
    // We look for where the header title is and prepend a Back button
    if (content.includes('embedded') && !content.includes('ArrowLeft')) {
        // Add ArrowLeft to lucide-react imports if not there
        const lucideImport = /import \{ ([^}]*) \} from "lucide-react";/;
        const match = content.match(lucideImport);
        if (match && !match[1].includes('ArrowLeft')) {
            content = content.replace(lucideImport, `import { ${match[1]}, ArrowLeft } from "lucide-react";`);
            changed = true;
        }

        // Add the Back button in the header
        // This is tricky as header structures vary. We'll look for the first <h1> or <h2> in the header
        const headerRegex = /(<h[12][^>]*>)/;
        const backButton = '<button onClick={onClose} className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3 h-3" /> Back</button>\n            $1';
        
        if (content.match(headerRegex) && !content.includes('onClick={onClose}')) {
             // Only add if it's within the {!embedded && ...} or equivalent or if we want it in embedded too
             // The user wants to remove the X button, so we provide a "Back" link instead.
             content = content.replace(headerRegex, backButton);
             changed = true;
        }
    }

    if (changed) {
        console.log(`Updating ${file}...`);
        fs.writeFileSync(filePath, content);
    }
});
