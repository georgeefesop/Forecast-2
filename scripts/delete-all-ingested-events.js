#!/usr/bin/env node

/**
 * Delete all ingested events (events with source_name)
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function deleteAll() {
  try {
    console.log("🗑️  Deleting all ingested events...\n");

    // Count first
    const count = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE source_name IS NOT NULL"
    );
    const eventCount = parseInt(count.rows[0].count);
    
    console.log(`Found ${eventCount} ingested events to delete\n`);

    if (eventCount === 0) {
      console.log("✅ No ingested events to delete!");
      return;
    }

    // Delete related data
    await sql.query(
      `DELETE FROM event_actions WHERE event_id IN (
        SELECT id FROM events WHERE source_name IS NOT NULL
      )`
    );
    
    await sql.query(
      `DELETE FROM comments WHERE event_id IN (
        SELECT id FROM events WHERE source_name IS NOT NULL
      )`
    );
    
    await sql.query(
      `DELETE FROM event_counters WHERE event_id IN (
        SELECT id FROM events WHERE source_name IS NOT NULL
      )`
    );
    
    await sql.query(
      `DELETE FROM vibe_checks WHERE event_id IN (
        SELECT id FROM events WHERE source_name IS NOT NULL
      )`
    );

    // Delete the events
    const result = await sql.query(
      "DELETE FROM events WHERE source_name IS NOT NULL RETURNING id, title, source_name"
    );
    
    console.log(`✅ Deleted ${result.rows.length} ingested events`);
    console.log(`\nSample deleted events:`);
    result.rows.slice(0, 5).forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.title} (${event.source_name})`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

deleteAll();
