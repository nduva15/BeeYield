const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/aggym/Downloads/Honey/src/components/beeyield/lovable_ai/LovableIndex.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('import KnowledgeDashboard')) {
    content = content.replace(/import VarroaSimulator from "@\/components\/beeyield\/lovable_ai\/VarroaSimulator";/, 
                            'import VarroaSimulator from "@/components/beeyield/lovable_ai/VarroaSimulator";\nimport KnowledgeDashboard from "@/components/beeyield/lovable_ai/KnowledgeDashboard";');
}

// 2. Replace empty messages area with KnowledgeDashboard
const emptyMessagesRegex = /\{messages\.length === 0 && \([\s\S]+?\}\)/;
const replacement = `{messages.length === 0 && (
          <div className="animate-fade-in max-w-5xl mx-auto w-full">
            <KnowledgeDashboard onAsk={send} />
          </div>
        )}`;

content = content.replace(emptyMessagesRegex, replacement);

fs.writeFileSync(filePath, content);
console.log('Restored Knowledge Hub to LovableIndex.tsx');
