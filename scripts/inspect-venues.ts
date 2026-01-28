
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db/client';

async function main() {
    console.log('🔍 Inspecting Venues...');

    // 1. Check for Limassol Marina
    const marinaRes = await db.query("SELECT * FROM venues WHERE name ILIKE '%Marina%'");
    console.log('\n--- Venues matching "Marina" ---');
    marinaRes.rows.forEach(v => {
        console.log(`[${v.id}] ${v.name} (slug: ${v.slug}, city: ${v.city})`);
        console.log(`   Events count: (checking...)`);
    });

    for (const v of marinaRes.rows) {
        const countRes = await db.query('SELECT COUNT(*) FROM events WHERE venue_id = $1', [v.id]);
        console.log(`   -> Events for "${v.name}": ${countRes.rows[0].count}`);
    }

    // 2. Check for "Multiple Venues"
    const mvRes = await db.query("SELECT * FROM venues WHERE name ILIKE '%Multiple Venues%'");
    console.log('\n--- Venues matching "Multiple Venues" ---');
    mvRes.rows.forEach(v => console.log(`[${v.id}] ${v.name} (slug: ${v.slug})`));

    for (const v of mvRes.rows) {
        const eventsRes = await db.query('SELECT id, title, source_url FROM events WHERE venue_id = $1 LIMIT 5', [v.id]);
        console.log(`   -> Sample events for "${v.name}":`);
        eventsRes.rows.forEach(e => console.log(`      - ${e.title} (${e.source_url})`));
    }

    process.exit(0);
}

main();
