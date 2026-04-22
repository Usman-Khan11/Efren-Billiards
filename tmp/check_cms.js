import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCMS() {
    const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('slug', 'membership-plans')
        .single();

    if (error) {
        console.error('Error fetching CMS content:', error);
        return;
    }

    console.log('Current CMS Content:', JSON.stringify(data.body, null, 2));
}

checkCMS();
