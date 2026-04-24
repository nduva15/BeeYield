// import dotenv removed
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."; 

// Using the actual environment variables from the BeeYield project.
const url =  process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing supabase URL or KEY");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testSignup() {
    console.log("Testing signup with a random test user...");
    const email = `test_user_${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
        email,
        password: 'Password123!',
        options: {
            data: {}
        }
    });

    if (error) {
        console.error("SignUp Error:", error);
    } else {
        console.log("SignUp Success! User ID:", data.user?.id);
    }
}

testSignup();
