import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// VITE_ prefixed vars are automatically exposed via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Warn in console if not configured — won't crash the app at startup,
// but auth calls will fail with network errors displayed to the user.
if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    console.warn(
        '[Supabase] No credentials configured. ' +
        'Copy .env.example to .env and add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
        'Auth features will not work until configured.'
    );
}

export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
        auth: {
            // Persist session in localStorage for SPA reload resilience
            persistSession: true,
            autoRefreshToken: true,
            // Detect session from URL hash (needed for OAuth redirect)
            detectSessionInUrl: true,
        },
    }
);
