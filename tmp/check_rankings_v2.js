import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igbomklgtrhackdiygrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRankings() {
    try {
        const { data, error } = await supabase.from('rankings').select('*');
        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log('--- RANKINGS DATA ---');
        data.forEach(r => {
            console.log(`Game: ${r.game_type}, Player: ${r.player_name}, Rank: ${r.rank}, Score: ${r.score}, Company: ${r.company}`);
        });
        console.log('--- END ---');
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkRankings();
