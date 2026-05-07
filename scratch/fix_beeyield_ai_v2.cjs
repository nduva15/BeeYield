const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Fix containerClasses
    // Matches patterns like: const containerClasses = embedded ? "relative w-full h-full" : "fixed inset-0 z-50 ...";
    const containerRegex = /const containerClasses = embedded\s*\?\s*"relative w-full h-full"\s*:\s*"fixed inset-0 z-50[^"]*";/g;
    const containerReplacement = 'const containerClasses = embedded \n    ? "relative w-full h-full overflow-y-auto custom-scroll bg-background" \n    : "fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll";';
    
    if (content.match(containerRegex)) {
        content = content.replace(containerRegex, containerReplacement);
        changed = true;
    }

    // 2. Fix contentClasses
    const contentRegex = /const contentClasses = embedded\s*\?\s*"w-full[^"]*"\s*:\s*"[^"]*max-w-6xl[^"]*";/g;
    const contentReplacement = 'const contentClasses = embedded \n    ? "w-full p-0" \n    : "max-w-6xl mx-auto p-6";';
    
    if (content.match(contentRegex)) {
        content = content.replace(contentRegex, contentReplacement);
        changed = true;
    }

    // 3. Remove X button - Generic match for buttons containing <X ... /> and calling onClose
    const xButtonRegex = /<button[^>]*onClick=\{onClose\}[^>]*>\s*<X[^>]*\/>\s*<\/button>/g;
    if (content.match(xButtonRegex)) {
        content = content.replace(xButtonRegex, '');
        changed = true;
    }

    if (changed) {
        console.log(`Updating ${file}...`);
        fs.writeFileSync(filePath, content);
    }
});
