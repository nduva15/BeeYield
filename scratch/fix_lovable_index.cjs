const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai/LovableIndex.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix height
content = content.replace(/embedded \? "h-full min-h-\[calc\(100vh-12rem\)\] rounded-xl border border-border" : "h-screen"/, 
                        'embedded ? "h-[calc(100vh-140px)] rounded-xl border border-border" : "h-screen"');

// 2. Remove broken back button
content = content.replace(/<button onClick=\{onClose\} className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3 h-3" \/> Back<\/button>/, '');

fs.writeFileSync(filePath, content);
console.log('Fixed LovableIndex.tsx');
