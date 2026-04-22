import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igbomklgtrhackdiygrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRankings() {
    try {
        console.log('Checking rankings table...');
        const { data, error } = await supabase
            .from('rankings')
            .select('*');

        if (error) {
            console.error('Error fetching rankings:', error.message);
            if (error.message.includes('relation "public.rankings" does not exist')) {
                console.log('RANKINGS_TABLE_MISSING');
            }
        } else {
            console.log('Rankings found:', data.length);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkRankings();
