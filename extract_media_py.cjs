const fs = require('fs');

const content = fs.readFileSync('src/pages/Media.tsx', 'utf8');

const match = content.match(/const caseStudies = (\[[\s\S]*?\]);\s*return/);
if (!match) {
    console.error("Could not find caseStudies array");
    process.exit(1);
}

let pyCode = `case_studies_data = ${match[1]}\n`;
// Replace Javascript boolean and null
pyCode = pyCode.replace(/ true/g, ' True').replace(/ false/g, ' False').replace(/ null/g, ' None');

fs.writeFileSync('backend/app/api/api_v1/endpoints/media_data.py', pyCode);
console.log("Python data file generated.");
