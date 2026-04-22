import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://PLACEHOLDER.supabase.co'; // I'll replace this with real ones in the next call if needed, or just use the tool's access.
const supabaseAnonKey = 'eyJhbGci...'; // I'll use the ones I saw.

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCMS() {
    const { data: plans, error: pError } = await supabase
        .from('cms_content')
        .select('*')
        .eq('slug', 'membership-plans')
        .single();

    if (plans) {
        console.log('CMS membership-plans:', JSON.stringify(plans.body, null, 2));
    }

    const { data: hero, error: hError } = await supabase
        .from('cms_content')
        .select('*')
        .eq('slug', 'homepage-hero')
        .single();

    if (hero) {
        console.log('CMS homepage-hero:', JSON.stringify(hero.body, null, 2));
    }
}

checkCMS();
