#!/usr/bin/env node

/**
 * Fix event titles that are date ranges (e.g., "26 - 28", "22 - 23")
 * Attempts to extract proper titles from source URLs or marks for re-ingestion
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Pattern to detect date-range titles
const DATE_RANGE_PATTERN = /^\d{1,2}\s*[-–]\s*\d{1,2}(\s+\w+)?$/;

async function fixTitles() {
  try {
    console.log("🔧 Fixing event titles...\n");

    // Find events with date-range titles
    const events = await sql.query(
      `SELECT id, title, source_name, source_url, description
       FROM events 
       WHERE status = 'published' 
       AND (title ~ '^\\d{1,2}\\s*[-–]\\s*\\d{1,2}' OR title = 'Agenda' OR title = 'Events')
       ORDER BY created_at DESC`
    );

    console.log(`Found ${events.rows.length} events with problematic titles\n`);

    if (events.rows.length === 0) {
      console.log("✅ No events need fixing!");
      return;
    }

    let fixed = 0;
    let needsReingestion = 0;

    for (const event of events.rows) {
      try {
        // Try to extract a better title from description
        let newTitle = null;

        // Check if description has useful content
        if (event.description && event.description.length > 10) {
          // Try to find a title-like pattern in description
          // Skip date patterns and generic text
          const lines = event.description.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
          for (const line of lines) {
            // Look for lines that:
            // - Are 10-80 chars (reasonable title length)
            // - Start with capital letter
            // - Don't match date patterns
            // - Don't contain common description words
            if (line.length >= 10 && line.length <= 80 &&
                line[0] === line[0].toUpperCase() &&
                !line.match(DATE_RANGE_PATTERN) &&
                !line.match(/^(the|a|an|this|that|these|those|when|where|what|how|why|join|come|visit|discover|explore|experience|enjoy|celebrate|welcome|featuring|presented|organized|hosted|located|situated|during|throughout|from|until|starting|beginning|ending|finishing)/i) &&
                !line.match(/^\d{1,2}[\/\-]\d{1,2}/) && // No date at start
                line.split(' ').length >= 2) { // At least 2 words
              newTitle = line;
              break;
            }
          }
        }

        // If we found a better title, use it
        if (newTitle) {
          await sql.query(
            `UPDATE events SET title = $1 WHERE id = $2`,
            [newTitle, event.id]
          );
          console.log(`✓ Fixed: "${event.title.substring(0, 30)}" → "${newTitle.substring(0, 50)}"`);
          fixed++;
        } else {
          // Mark for re-ingestion by clearing last_seen_at (will be re-fetched)
          await sql.query(
            `UPDATE events SET last_seen_at = NULL WHERE id = $1`,
            [event.id]
          );
          console.log(`⚠ Marked for re-ingestion: "${event.title}" (${event.source_name})`);
          needsReingestion++;
        }
      } catch (error) {
        console.error(`✗ Failed to fix event ${event.id}: ${error.message}`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} titles from descriptions`);
    console.log(`⚠️  ${needsReingestion} events marked for re-ingestion`);
    console.log(`\n💡 Run ingestion again to fetch proper titles for marked events`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixTitles();
