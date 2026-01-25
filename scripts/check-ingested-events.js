#!/usr/bin/env node

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkEvents() {
  try {
    console.log("Checking ingested events in database...\n");

    // Count all published events
    const allPublished = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published'"
    );
    console.log(`Total published events: ${allPublished.rows[0].count}`);

    // Count ingested events
    const ingested = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published' AND source_name IS NOT NULL"
    );
    console.log(`Ingested events (with source_name): ${ingested.rows[0].count}`);

    // Count future events
    const future = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published' AND start_at >= NOW()"
    );
    console.log(`Future events (start_at >= NOW()): ${future.rows[0].count}`);

    // Count future ingested events
    const futureIngested = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published' AND source_name IS NOT NULL AND start_at >= NOW()"
    );
    console.log(`Future ingested events: ${futureIngested.rows[0].count}\n`);

    // Show sample of events
    const sample = await sql.query(
      `SELECT title, source_name, start_at, city, status 
       FROM events 
       WHERE status = 'published' 
       ORDER BY start_at 
       LIMIT 20`
    );

    console.log("Sample of published events:");
    sample.rows.forEach((event, i) => {
      const isFuture = new Date(event.start_at) >= new Date();
      const futureMark = isFuture ? "✓" : "✗";
      console.log(
        `${i + 1}. ${futureMark} ${event.title} (${event.source_name || "manual"}) - ${event.start_at}`
      );
    });

    // Check for events with past dates
    const past = await sql.query(
      `SELECT COUNT(*) as count, 
              MIN(start_at) as earliest,
              MAX(start_at) as latest
       FROM events 
       WHERE status = 'published' AND start_at < NOW()`
    );
    console.log(`\nPast events: ${past.rows[0].count}`);
    if (past.rows[0].count > 0) {
      console.log(`  Earliest: ${past.rows[0].earliest}`);
      console.log(`  Latest: ${past.rows[0].latest}`);
    }

    // Check by source
    const bySource = await sql.query(
      `SELECT source_name, COUNT(*) as count 
       FROM events 
       WHERE status = 'published' AND source_name IS NOT NULL
       GROUP BY source_name`
    );
    console.log("\nEvents by source:");
    bySource.rows.forEach((row) => {
      console.log(`  ${row.source_name}: ${row.count}`);
    });

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEvents();
