const fs = require('fs');

const content = fs.readFileSync('src/pages/Media.tsx', 'utf8');

// Extract the caseStudies array
const match = content.match(/const caseStudies = (\[[\s\S]*?\]);\s*return/);
if (!match) {
    console.error("Could not find caseStudies array");
    process.exit(1);
}

// Convert string to actual JS object
// Since it contains unquoted keys and single quotes, evaluating it is easiest
let caseStudies = [];
try {
    const fn = new Function('return ' + match[1] + ';');
    caseStudies = fn();
} catch (e) {
    console.error("Failed to parse array", e);
    process.exit(1);
}

let sql = `
-- Create Tables
CREATE TABLE IF NOT EXISTS public.case_study_categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.case_study_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.case_study_categories(id) ON DELETE CASCADE,
    farmer TEXT NOT NULL,
    location TEXT NOT NULL,
    role TEXT NOT NULL,
    acres INTEGER NOT NULL,
    description TEXT NOT NULL,
    quote TEXT,
    image_url TEXT,
    stats_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.case_study_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_stories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view case study categories" ON public.case_study_categories;
CREATE POLICY "Public can view case study categories" ON public.case_study_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view case study stories" ON public.case_study_stories;
CREATE POLICY "Public can view case study stories" ON public.case_study_stories FOR SELECT USING (true);

-- Insert Data
`;

for (const cat of caseStudies) {
    sql += `INSERT INTO public.case_study_categories (id, title, category_name) VALUES ('${cat.id.replace(/'/g, "''")}', '${cat.title.replace(/'/g, "''")}', '${cat.category.replace(/'/g, "''")}') ON CONFLICT (id) DO NOTHING;\n`;
    
    for (const story of cat.stories) {
        const statsJson = JSON.stringify(story.stats).replace(/'/g, "''");
        const farmer = story.farmer.replace(/'/g, "''");
        const location = story.location.replace(/'/g, "''");
        const role = story.role.replace(/'/g, "''");
        const desc = story.description.replace(/'/g, "''");
        const quote = story.quote ? `'${story.quote.replace(/'/g, "''")}'` : 'NULL';
        const image = story.image ? `'${story.image.replace(/'/g, "''")}'` : 'NULL';
        
        sql += `INSERT INTO public.case_study_stories (category_id, farmer, location, role, acres, description, quote, image_url, stats_json) VALUES ('${cat.id.replace(/'/g, "''")}', '${farmer}', '${location}', '${role}', ${story.acres}, '${desc}', ${quote}, ${image}, '${statsJson}'::jsonb);\n`;
    }
}

fs.writeFileSync('supabase/migrations/20260504_media_case_studies.sql', sql);
console.log("Migration generated successfully.");
