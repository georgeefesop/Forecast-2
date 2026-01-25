/**
 * Script to check if there are events in the database
 * Run with: node scripts/check-events.js
 */

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkEvents() {
  try {
    console.log("Checking database for events...\n");

    // Check total events count
    const totalResult = await sql.query("SELECT COUNT(*) as count FROM events");
    const totalCount = parseInt(totalResult.rows[0].count);
    console.log(`Total events in database: ${totalCount}`);

    // Check published events count
    const publishedResult = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published'"
    );
    const publishedCount = parseInt(publishedResult.rows[0].count);
    console.log(`Published events: ${publishedCount}`);

    // Check future events count
    const futureResult = await sql.query(
      "SELECT COUNT(*) as count FROM events WHERE status = 'published' AND start_at >= NOW()"
    );
    const futureCount = parseInt(futureResult.rows[0].count);
    console.log(`Future published events: ${futureCount}`);

    // Get sample of events with their details
    if (totalCount > 0) {
      console.log("\n--- Sample Events ---");
      const sampleResult = await sql.query(`
        SELECT 
          id,
          title,
          city,
          category,
          status,
          start_at,
          created_at
        FROM events 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      sampleResult.rows.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   City: ${event.city || "N/A"}`);
        console.log(`   Category: ${event.category || "N/A"}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   Start: ${new Date(event.start_at).toLocaleString()}`);
        console.log(`   Created: ${new Date(event.created_at).toLocaleString()}`);
      });

      // Check cities distribution
      console.log("\n--- Cities Distribution ---");
      const citiesResult = await sql.query(`
        SELECT city, COUNT(*) as count 
        FROM events 
        WHERE status = 'published'
        GROUP BY city 
        ORDER BY count DESC
      `);
      citiesResult.rows.forEach((row) => {
        console.log(`  ${row.city}: ${row.count} events`);
      });

      // Check categories distribution
      console.log("\n--- Categories Distribution ---");
      const categoriesResult = await sql.query(`
        SELECT category, COUNT(*) as count 
        FROM events 
        WHERE status = 'published' AND category IS NOT NULL
        GROUP BY category 
        ORDER BY count DESC
      `);
      if (categoriesResult.rows.length > 0) {
        categoriesResult.rows.forEach((row) => {
          console.log(`  ${row.category}: ${row.count} events`);
        });
      } else {
        console.log("  No events with categories");
      }
    } else {
      console.log("\n⚠️  No events found in the database!");
      console.log("   You may need to:");
      console.log("   - Run the ingest script to import events");
      console.log("   - Submit events through the /submit page");
      console.log("   - Check if events are in 'pending' status");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking events:", error);
    process.exit(1);
  }
}

checkEvents();
