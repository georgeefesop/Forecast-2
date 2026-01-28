

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from "@/lib/db/client";

async function main() {
    console.log("--- Investigating 'Techno' ---");
    const technoResult = await db.query(`
    SELECT city, COUNT(*) as cnt
    FROM events
    WHERE (
        LOWER(category) = 'techno' 
        OR 'techno' = ANY(SELECT LOWER(unnest(tags)))
    )
    AND start_at >= NOW()
    AND status = 'published'
    AND is_primary_occurrence = TRUE
    GROUP BY city
  `);
    console.table(technoResult.rows);

    console.log("\n--- Investigating 'Theatre' ---");
    const theatreResult = await db.query(`
    SELECT city, COUNT(*) as cnt
    FROM events
    WHERE (
        LOWER(category) = 'theatre' 
        OR 'theatre' = ANY(SELECT LOWER(unnest(tags)))
    )
    AND start_at >= NOW()
    AND status = 'published'
    AND is_primary_occurrence = TRUE
    GROUP BY city
  `);
    console.table(theatreResult.rows);

    console.log("\n--- 'Theatre' events with NULL or Empty city ---");
    const theatreBadCity = await db.query(`
    SELECT id, title, city, venue_id
    FROM events
    WHERE (
        LOWER(category) = 'theatre' 
        OR 'theatre' = ANY(SELECT LOWER(unnest(tags)))
    )
    AND start_at >= NOW()
    AND status = 'published'
    AND is_primary_occurrence = TRUE
    AND (city IS NULL OR city = '')
  `);
    console.table(theatreBadCity.rows);

    console.log("\n--- Investigating 'Techno' events with city='Cyprus' ---");
    const technoCyprus = await db.query(`
    SELECT id, title, start_at, venue_id, address_text, source_url, description
    FROM events
    WHERE (
        LOWER(category) = 'techno' 
        OR 'techno' = ANY(SELECT LOWER(unnest(tags)))
    )
    AND start_at >= NOW()
    AND status = 'published'
    AND is_primary_occurrence = TRUE
    AND city = 'Cyprus'
  `);
    technoCyprus.rows.forEach(r => {
        console.log(`\nTitle: ${r.title}`);
        console.log(`Address: ${r.address_text}`);
        console.log(`Source: ${r.source_url}`);
        console.log(`Desc Sample: ${r.description?.substring(0, 50)}`);
    });
}

main().catch(console.error);
