import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key. Check your .env file.");
    // Alert the user so they know why it's white screen
    if (typeof window !== 'undefined') {
        alert("CRITICAL ERROR: Supabase credentials missing! Please check your .env file.");
    }
    throw new Error("Missing Supabase Credentials");
}

export const supabase = createClient(supabaseUrl, supabaseKey)