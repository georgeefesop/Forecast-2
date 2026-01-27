
import { db } from '../lib/db/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkIngestionStats() {
    console.log('🔍 Checking Event Stats...');

    try {
        // 1. Total Count
        const totalResult = await db.query('SELECT COUNT(*) FROM events');
        const total = parseInt(totalResult.rows[0].count);
        console.log(`Total Events in DB: ${total}`);

        // 2. Status Breakdown
        const statusResult = await db.query('SELECT status, COUNT(*) FROM events GROUP BY status');
        console.log('\n📊 Status Breakdown:');
        statusResult.rows.forEach(row => {
            console.log(`- ${row.status}: ${row.count}`);
        });

        // 3. Date Breakdown (Future vs Past)
        const futureResult = await db.query("SELECT COUNT(*) FROM events WHERE start_at >= NOW()");
        const future = parseInt(futureResult.rows[0].count);
        console.log(`\n📅 Future Events (start_at >= NOW()): ${future}`);
        console.log(`   Past Events: ${total - future}`);

        // 4. Future Published
        const visibleResult = await db.query("SELECT COUNT(*) FROM events WHERE status = 'published' AND start_at >= NOW()");
        const visible = parseInt(visibleResult.rows[0].count);
        console.log(`\n✅ Visible Events (published + future): ${visible}`);

        // 5. Check for primary occurrences (if applicable)
        // The homepage filters by primaryOnly: true
        const primaryResult = await db.query("SELECT COUNT(*) FROM events WHERE status = 'published' AND start_at >= NOW() AND is_primary_occurrence = TRUE");
        const primary = parseInt(primaryResult.rows[0].count);
        console.log(`\n🏠 Homepage Candidates (published + future + primary): ${primary}`);

        // 6. Check for low quality images (homepage filter)
        const hqResult = await db.query("SELECT COUNT(*) FROM events WHERE status = 'published' AND start_at >= NOW() AND is_primary_occurrence = TRUE AND (image_size_kb IS NULL OR image_size_kb >= 20)");
        const hq = parseInt(hqResult.rows[0].count);
        console.log(`\n🖼️  High Quality Candidates (passing image size check > 20kb or null): ${hq}`);

        // 7. Series Breakdown
        const seriesResult = await db.query("SELECT COUNT(*) FROM events WHERE series_id IS NOT NULL");
        console.log(`\n🔄 Events part of a series: ${seriesResult.rows[0].count}`);

        // Inspect some "missing" events (e.g. published, future, but not primary?)
        const hiddenSeriesOccurrences = await db.query("SELECT COUNT(*) FROM events WHERE status = 'published' AND start_at >= NOW() AND is_primary_occurrence = FALSE");
        console.log(`\n❌ Hidden Series Occurrences (future + published but NOT primary): ${hiddenSeriesOccurrences.rows[0].count}`);

        // User mentioned "ingest over 100". Let's check ingestion logs if possible, or just deduce from above.
        // If total (100+) > visible (~52), finding where the gap is.
        // Gap 1: Past events
        // Gap 2: Unpublished/Pending
        // Gap 3: Non-primary series occurrences
        // Gap 4: Image quality filter

    } catch (error) {
        console.error('Error checking stats:', error);
    }
    process.exit(0);
}

checkIngestionStats();
