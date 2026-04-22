import { createClient } from '@supabase/supabase-js';

const url = 'https://igbomklgtrhackdiygrl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYm9ta2xndHJoYWNrZGl5Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQzNzUsImV4cCI6MjA4ODQ4MDM3NX0.K7mNrMgJ0EfgZXLGWQsYJJ9S_i5ithbx3B4ydQU-EvQ';
const sb = createClient(url, key);

async function inspect() {
    console.log('\n========== SUPABASE DB INSPECTION ==========\n');

    // 1. Check cms_content slugs
    const { data: cms, error: cmsErr } = await sb.from('cms_content').select('slug, title, body');
    if (cmsErr) {
        console.log('cms_content ERROR:', cmsErr.message);
    } else {
        console.log(`cms_content rows (${cms.length}):`);
        cms.forEach(r => console.log(`  slug="${r.slug}" | title="${r.title}"`));
    }

    // 2. Check rankings
    const { data: rk, error: rkErr } = await sb.from('rankings').select('game_type, player_name, rank, company');
    if (rkErr) {
        console.log('\nrankings ERROR:', rkErr.message);
    } else {
        console.log(`\nrankings rows (${rk.length}):`);
        rk.forEach(r => console.log(`  [${r.game_type}] #${r.rank} ${r.player_name} | company=${r.company}`));
    }

    // 3. Check matches
    const { data: ma, error: maErr } = await sb.from('matches').select('id, tournament_id, round, status, winner_id');
    if (maErr) {
        console.log('\nmatches ERROR:', maErr.message);
    } else {
        console.log(`\nmatches rows (${ma.length}):`);
        ma.forEach(r => console.log(`  round=${r.round} status=${r.status} winner=${r.winner_id ?? 'none'}`));
    }

    // 4. Check tournaments
    const { data: to, error: toErr } = await sb.from('tournaments').select('id, name, game_type, status');
    if (toErr) {
        console.log('\ntournaments ERROR:', toErr.message);
    } else {
        console.log(`\ntournaments rows (${to.length}):`);
        to.forEach(r => console.log(`  [${r.game_type}] "${r.name}" — ${r.status}`));
    }

    // 5. Check profiles
    const { data: pr, error: prErr } = await sb.from('profiles').select('id, full_name, tier');
    if (prErr) {
        console.log('\nprofiles ERROR:', prErr.message);
    } else {
        console.log(`\nprofiles rows (${pr.length}):`);
        pr.forEach(r => console.log(`  ${r.full_name ?? '(unnamed)'} — ${r.tier}`));
    }

    console.log('\n============================================\n');
}

inspect();
