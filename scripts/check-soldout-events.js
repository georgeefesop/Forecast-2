
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function check() {
    console.log('--- SoldOut TicketBox Events ---');
    const result = await sql.query(`
    SELECT id, title, start_at, venue_id, 
           (SELECT name FROM venues WHERE id = events.venue_id) as venue_name 
    FROM events 
    WHERE source_name = 'soldout_ticketbox'
    ORDER BY start_at ASC
    LIMIT 5
  `);

    result.rows.forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.title}`);
        console.log(`   Date: ${event.start_at}`);
        console.log(`   Venue: ${event.venue_name || 'NULL'}`);
    });

    const count = await sql.query(`SELECT COUNT(*) FROM events WHERE source_name = 'soldout_ticketbox'`);
    console.log(`\nTotal Events: ${count.rows[0].count}`);
}

check();
