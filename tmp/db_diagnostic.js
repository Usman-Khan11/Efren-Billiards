import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igbomklgtrhackdiygrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableInfo() {
    try {
        // Query to get table information (PostgreSQL specific via RPC or just a select on an empty set)
        const { data, error } = await supabase.from('rankings').select('*').limit(1);

        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        console.log('Sample Data:', JSON.stringify(data[0]));

        // Let's also check if the table exists by trying to select from it
        const { data: allData, error: allErr } = await supabase.from('rankings').select('*');
        if (allErr) {
            console.error('Error fetching all data:', allErr.message);
        } else {
            console.log('Total Records:', allData.length);
            console.log('Full Data:', JSON.stringify(allData, null, 2));
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkTableInfo();
