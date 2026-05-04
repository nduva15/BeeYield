const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        // exclude ui folders
        if (!file.includes(path.sep + 'ui' + path.sep) && !file.endsWith(path.sep + 'ui')) {
            results = results.concat(walk(file));
        }
      } else if (file.endsWith('.tsx') && !file.includes(path.sep + 'ui' + path.sep)) {
        results.push(file);
      }
    });
  } catch(e) {}
  return results;
}

const files = [...walk('src/pages'), ...walk('src/components/beeyield')];
const results = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Check if it imports any backend service or uses query/supabase
  const hasService = /from ['"](\.\.\/)*.*(services|api|supabase)['"]/i.test(content) || /from ['"]@\/(services|api|supabase)/i.test(content) || /useQuery/i.test(content) || /useMutation/i.test(content) || /supabase/i.test(content);
  // Check if it has mock data definitions
  const hasMockData = /const [a-zA-Z0-9_]+ = \[\s*\{/i.test(content) || /MOCK|DUMMY/i.test(content) || /placeholder/i.test(content) || /TODO.*backend/i.test(content) || /TODO.*API/i.test(content);
  // Check for specific TODOs indicating missing features
  const hasMissingFeatures = /TODO.*feature/i.test(content) || /TODO.*implement/i.test(content) || /Coming soon/i.test(content);

  // We consider a page "no working backend" if it has Mock Data OR explicitly has Missing Features
  // and we also want to flag pages that have NO service imports at all.
  if ((!hasService && content.length > 500) || hasMockData || hasMissingFeatures) {
    results.push({ 
        file: file.replace(/\\/g, '/'), 
        noService: !hasService, 
        hasMockData, 
        hasMissingFeatures 
    });
  }
}

// Print cleanly
results.forEach(r => {
    console.log(`- **${r.file}**: ${r.noService ? 'No Backend Service' : 'Has Backend Service'}, ${r.hasMockData ? 'Contains Mock Data' : 'No Mock Data'}, ${r.hasMissingFeatures ? 'Missing Features Flagged' : 'No Missing Features Flagged'}`);
});
