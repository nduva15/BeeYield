import { createClient } from '@supabase/supabase-js';
// No dotenv needed, we'll use --env-file


const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const email = 'timothynduva349@gmail.com';
const password = '123456';

async function setupUser() {
    console.log(`Setting up user: ${email}`);

    // 1. Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log(`User exists (ID: ${existingUser.id}). Updating password and metadata...`);
        const { data, error } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                password: password,
                user_metadata: { ...existingUser.user_metadata, beeyield_active: true, role: 'admin' },
                email_confirm: true
            }
        );

        if (error) {
            console.error('Error updating user:', error);
        } else {
            console.log('User updated successfully!');
        }
    } else {
        console.log('User does not exist. Creating new user...');
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { beeyield_active: true, role: 'admin' },
            email_confirm: true
        });

        if (error) {
            console.error('Error creating user:', error);
        } else {
            console.log('User created successfully!', data.user.id);
        }
    }
}

setupUser();
