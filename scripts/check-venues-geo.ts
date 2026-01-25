
import { db } from '../lib/db/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkVenues() {
    console.log('Checking venue coordinates...');
    try {
        const total = await db.query('SELECT COUNT(*) FROM venues');
        const missing = await db.query('SELECT COUNT(*) FROM venues WHERE lat IS NULL OR lng IS NULL');
        const withCoords = await db.query('SELECT COUNT(*) FROM venues WHERE lat IS NOT NULL AND lng IS NOT NULL');

        console.log(`Total Venues: ${total.rows[0].count}`);
        console.log(`With Coordinates: ${withCoords.rows[0].count}`);
        console.log(`Missing Coordinates: ${missing.rows[0].count}`);

        if (parseInt(missing.rows[0].count) > 0) {
            console.log('\nSample venues missing coords:');
            const samples = await db.query('SELECT name, city, address FROM venues WHERE lat IS NULL LIMIT 5');
            samples.rows.forEach(r => console.log(`- ${r.name} (${r.city})`));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkVenues();
