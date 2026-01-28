
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { normalizeVenueName } from '../lib/ingest/utils';
import { db } from '../lib/db/client';
import { getEvents } from '../lib/db/queries/events';

async function main() {
    console.log('🔍 Testing Venue Normalization...');

    const inputs = [
        { name: 'Rialto', city: 'Limassol' },
        { name: 'Rialto Theatre', city: 'Limassol' },
        { name: 'Municipal Garden', city: 'Limassol' },
        { name: 'Municipal Gardens', city: 'Limassol' },
        { name: 'Pattihio', city: 'Limassol' },
    ];

    inputs.forEach(i => {
        const norm = normalizeVenueName(i.name, i.city);
        console.log(`"${i.name}" -> "${norm}"`);
    });

    console.log('\n🔍 Testing "More at this Venue" Query...');

    // Find a venue with multiple events
    const venueRes = await db.query(`
    SELECT v.slug, v.name, count(e.id) as count 
    FROM venues v
    JOIN events e ON e.venue_id = v.id
    GROUP BY v.slug, v.name
    HAVING count(e.id) > 1
    LIMIT 1
  `);

    if (venueRes.rows.length === 0) {
        console.log('⚠️ No venues with multiple events found.');
    } else {
        const v = venueRes.rows[0];
        console.log(`Found venue: ${v.name} (${v.slug}) with ${v.count} events.`);

        // Simulate component query
        const events = await getEvents({
            venue: v.slug,
            limit: 5,
            date: 'future'
        } as any);

        console.log(`Fetched ${events.length} events for this venue.`);
        events.forEach(e => console.log(` - ${e.title} (${e.start_at.toISOString()})`));
    }

    process.exit(0);
}

main();
