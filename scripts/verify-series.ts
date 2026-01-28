
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db/client';

async function main() {
    console.log('🔍 Checking for event series...');

    try {
        const res = await db.query(`
      SELECT series_id, COUNT(*) as count, MIN(title) as sample_title
      FROM events 
      WHERE series_id IS NOT NULL AND status = 'published'
      GROUP BY series_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);

        if (res.rows.length === 0) {
            console.log('⚠️ No multi-occurrence series found.');
        } else {
            console.log(`✅ Found ${res.rows.length} active series with multiple events:`);
            res.rows.forEach(r => {
                console.log(`- Series ${r.series_id}: ${r.count} events ("${r.sample_title}")`);
            });
        }

        const totalSeries = await db.query('SELECT COUNT(DISTINCT series_id) as count FROM events WHERE series_id IS NOT NULL');
        console.log(`Total unique series IDs: ${totalSeries.rows[0].count}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

main();
