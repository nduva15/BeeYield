const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai/LovableIndex.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/flex flex-col w-full bg-background honeycomb-bg overflow-hidden/, 
                        'flex flex-col w-full bg-background honeycomb-bg overflow-hidden relative');

fs.writeFileSync(filePath, content);
console.log('Added relative to LovableIndex.tsx');
