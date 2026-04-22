import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igbomklgtrhackdiygrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRankings() {
    try {
        const { data, error } = await supabase.from('rankings').select('game_type, player_name');
        if (error) {
            console.error('Error:', error.message);
        } else {
            const counts = {};
            data.forEach(r => {
                counts[r.game_type] = (counts[r.game_type] || 0) + 1;
            });
            console.log('RANKING_STATS:', JSON.stringify(counts));
            console.log('ALL_RANKINGS:', JSON.stringify(data));
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkRankings();
