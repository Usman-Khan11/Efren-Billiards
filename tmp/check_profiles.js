import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igbomklgtrhackdiygrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    try {
        const { data, error } = await supabase.from('profiles').select('id, full_name, tier');
        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log('--- PROFILES ---');
        data.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.full_name}, Tier: ${p.tier}`);
        });
        console.log('--- END ---');
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkProfiles();
