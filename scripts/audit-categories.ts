
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from "@/lib/db/client";

async function main() {
    console.log("--- Category Data Quality Audit ---");

    // 1. Get all active categories (from column and tags)
    // We'll mimic the UI logic: valid categories are those attached to future published events
    const categoryQuery = `
    WITH expanded AS (
      SELECT id, category as label, city, source_name FROM events 
      WHERE status = 'published' AND start_at >= NOW() AND category IS NOT NULL AND is_primary_occurrence = TRUE
      UNION ALL
      SELECT id, unnest(tags) as label, city, source_name FROM events
      WHERE status = 'published' AND start_at >= NOW() AND tags IS NOT NULL AND is_primary_occurrence = TRUE
    )
    SELECT 
        label as category, 
        COUNT(DISTINCT id) as total_events,
        COUNT(DISTINCT CASE WHEN city = 'Cyprus' THEN id END) as cyprus_city_count,
        COUNT(DISTINCT CASE WHEN city IS NULL OR city = '' THEN id END) as missing_city_count,
        ARRAY_AGG(DISTINCT CASE WHEN city = 'Cyprus' OR city IS NULL OR city = '' THEN source_name END) as problem_sources
    FROM expanded
    GROUP BY label
    HAVING COUNT(DISTINCT id) > 0
    ORDER BY (COUNT(DISTINCT CASE WHEN city = 'Cyprus' THEN id END) + COUNT(DISTINCT CASE WHEN city IS NULL OR city = '' THEN id END)) DESC, total_events DESC;
  `;

    try {
        const res = await db.query(categoryQuery);

        console.table(res.rows.map(r => ({
            Category: r.category,
            Total: r.total_events,
            'City="Cyprus"': r.cyprus_city_count,
            'City=Missing': r.missing_city_count,
            'Sources': r.problem_sources ? r.problem_sources.filter(Boolean).join(', ') : ''
        })));

        // 2. Drill down into specific problem areas if needed
        // Let's grab a sample of "bad" events for the top problematic category
        const topProblem = res.rows.find(r => parseInt(r.cyprus_city_count) > 0 || parseInt(r.missing_city_count) > 0);

        if (topProblem) {
            console.log(`\n--- Sampling issues for top category: '${topProblem.category}' ---`);
            const sampleQuery = `
            SELECT title, city, source_name, source_url 
            FROM events 
            WHERE (category = $1 OR $1 = ANY(tags))
            AND (city = 'Cyprus' OR city IS NULL OR city = '')
            AND status = 'published' AND start_at >= NOW()
            LIMIT 5
        `;
            const samples = await db.query(sampleQuery, [topProblem.category]);
            samples.rows.forEach(r => {
                console.log(`[${r.city || 'NULL'}] ${r.title} (${r.source_name})`);
                console.log(`   -> ${r.source_url}`);
            });
        }

    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);
