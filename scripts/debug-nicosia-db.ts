
import { db } from '@/lib/db/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkNicosia() {
    console.log('--- Checking Nicosia Events in DB ---');

    // 1. Count events by source
    const sourceCounts = await db.query(`
    SELECT source_name, count(*), count(CASE WHEN status = 'published' THEN 1 END) as published_count 
    FROM events 
    WHERE source_name = 'nicosia_for_art'
    GROUP BY source_name
  `);
    console.log('Source Counts:', sourceCounts.rows);

    if (sourceCounts.rows.length === 0) {
        console.log('⚠️ No events found for source "nicosia_for_art"');
    } else {
        // 2. Check City and fields for a sample
        const sample = await db.query(`
        SELECT id, title, city, venue_id, start_at, is_primary_occurrence 
        FROM events 
        WHERE source_name = 'nicosia_for_art' 
        LIMIT 5
      `);
        console.log('Sample Events:', sample.rows);
    }

    // 3. Check invalid cities generally
    const unknownCities = await db.query(`
     SELECT city, count(*) 
     FROM events 
     WHERE source_name = 'nicosia_for_art'
     GROUP BY city
  `);
    console.log('Cities for Source:', unknownCities.rows);

    process.exit(0);
}

checkNicosia().catch(e => {
    console.error(e);
    process.exit(1);
});
