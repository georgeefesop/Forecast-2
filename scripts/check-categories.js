#!/usr/bin/env node

const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkCategories() {
  try {
    // Check categories
    const categories = await sql.query(
      `SELECT category, COUNT(*) as count 
       FROM events 
       WHERE status='published' AND source_name IS NOT NULL 
       GROUP BY category 
       ORDER BY count DESC`
    );
    
    console.log("Events by category:");
    categories.rows.forEach((row) => {
      console.log(`  ${row.category || "NULL"}: ${row.count}`);
    });

    // Show sample events
    const events = await sql.query(
      `SELECT title, category, start_at 
       FROM events 
       WHERE status='published' AND source_name IS NOT NULL AND start_at >= NOW() 
       ORDER BY start_at 
       LIMIT 10`
    );
    
    console.log("\nFirst 10 future events:");
    events.rows.forEach((event) => {
      console.log(
        `  - ${event.title.substring(0, 40)} (${event.category || "no category"}) - ${event.start_at.toISOString().split("T")[0]}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkCategories();
