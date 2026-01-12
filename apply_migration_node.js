
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

// Simple .env parser since we can't assume dotenv is installed
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    }
    return {};
}

const env = loadEnv();
const connectionString = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ Error: No Postgres URL found in .env file.");
    process.exit(1);
}

// Fix invalid protocol for pg client if needed
const dbUrl = connectionString.replace("postgres://", "postgresql://");

async function applyMigration() {
    console.log("🚀 Starting Farmer Table Migration via Node...");
    console.log("🔗 Connecting to database...");

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Required for Supabase usually
    });

    try {
        await client.connect();
        console.log("✅ Connected to Postgres.");

        const sqlFile = path.join(__dirname, 'supabase_update_farmers.sql');
        if (!fs.existsSync(sqlFile)) {
            console.error(`❌ File not found: ${sqlFile}`);
            return;
        }

        const sql = fs.readFileSync(sqlFile, 'utf-8');
        console.log(`📜 Applying supabase_update_farmers.sql...`);

        await client.query(sql);
        console.log("✅ Migration applied successfully!");

    } catch (err) {
        console.error("❌ Error applying migration:", err);
    } finally {
        await client.end();
    }
}

applyMigration();
