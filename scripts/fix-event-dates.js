#!/usr/bin/env node

/**
 * Fix event dates that were parsed incorrectly (e.g., 2001 instead of 2025/2026)
 * Re-parses dates from source data or fixes them based on current year
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixDates() {
  try {
    console.log("🔧 Fixing event dates...\n");

    // Get all events with dates before 2020
    const events = await sql.query(
      `SELECT id, title, source_name, source_url, start_at, source_external_id
       FROM events 
       WHERE status = 'published' 
       AND EXTRACT(YEAR FROM start_at) < 2020
       ORDER BY start_at`
    );

    console.log(`Found ${events.rows.length} events with incorrect dates\n`);

    if (events.rows.length === 0) {
      console.log("✅ No events need fixing!");
      return;
    }

    let fixed = 0;
    let failed = 0;

    for (const event of events.rows) {
      try {
        // Try to re-fetch the event detail to get the original date string
        // For now, we'll try to fix based on the month/day and assume current/next year
        const oldDate = new Date(event.start_at);
        const oldYear = oldDate.getFullYear();
        const month = oldDate.getMonth();
        const day = oldDate.getDate();

        // If year is before 2020, fix it
        if (oldYear < 2020) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          const currentDay = now.getDate();

          // If month/day is in the past, assume next year
          let newYear = currentYear;
          if (month < currentMonth || (month === currentMonth && day < currentDay)) {
            newYear = currentYear + 1;
          }

          const newDate = new Date(newYear, month, day);

          // Update the event
          await sql.query(
            `UPDATE events SET start_at = $1 WHERE id = $2`,
            [newDate.toISOString(), event.id]
          );

          console.log(
            `✓ Fixed: "${event.title.substring(0, 40)}" - ${oldDate.toISOString().split('T')[0]} → ${newDate.toISOString().split('T')[0]}`
          );
          fixed++;
        }
      } catch (error) {
        console.error(`✗ Failed to fix event ${event.id}: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} events`);
    if (failed > 0) {
      console.log(`⚠️  Failed to fix ${failed} events`);
    }

    // Show summary
    const futureCount = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published' AND start_at >= NOW()"
    );
    console.log(`\n📊 Future events now: ${futureCount.rows[0].count}`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixDates();
